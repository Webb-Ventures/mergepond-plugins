// mergepond-opencode 1.0.0
//
// Mergepond for OpenCode: marks the worktrees an OpenCode session works in "working" when you send
// a message and "review" when it finishes, on Mergepond's worktree board. Copy it to
// ~/.config/opencode/plugins/ (or a repository's .opencode/plugins/). Needs pond, which comes with
// Mergepond; https://mergepond.dev/docs/coding-agents has the rest of the setup.
//
// The first line is the version Mergepond's setup sheet reads to offer an update.

import { spawn } from "node:child_process";
import { existsSync } from "node:fs";

const POND_HOOK =
  'p=$(command -v pond 2>/dev/null || echo /Applications/Mergepond.app/Contents/Resources/agents/pond); if [ -x "$p" ]; then "$p" hook opencode; fi; exit 0';
const TIMEOUT_MS = 10_000;

/** Runs `pond hook opencode`. Never throws and never takes longer than TIMEOUT_MS. */
function runHook(event, sessionID, cwd) {
  return new Promise((resolve) => {
    let child;
    try {
      child = spawn("sh", ["-c", POND_HOOK], {
        cwd: cwd && existsSync(cwd) ? cwd : undefined,
        stdio: ["pipe", "ignore", "ignore"],
        // Its own process group, so a stop still lands when `opencode run` exits right after.
        detached: true,
      });
    } catch {
      resolve();
      return;
    }
    const timer = setTimeout(() => child.kill("SIGTERM"), TIMEOUT_MS);
    const done = () => {
      clearTimeout(timer);
      resolve();
    };
    child.on("error", done);
    child.on("close", done);
    child.stdin.on("error", () => {});
    child.stdin.end(JSON.stringify({ event, sessionID, cwd }));
  });
}

/** Each session's folder, and its hooks run one after another so a stop never overtakes a prompt. */
function tracker(fallbackDirectory) {
  const folders = new Map();
  let queue = Promise.resolve();
  return {
    folder(sessionID, directory) {
      if (sessionID && directory) folders.set(sessionID, directory);
    },
    hook(event, sessionID) {
      const cwd = folders.get(sessionID) ?? fallbackDirectory;
      queue = queue.then(() => runHook(event, sessionID, cwd));
      return queue;
    },
  };
}

export default {
  id: "mergepond",

  // OpenCode 2.
  async setup(ctx) {
    const t = tracker(ctx.location?.directory);
    await ctx.session.hook("prompt", (e) => {
      void t.hook("prompt", e.sessionID);
    });
    const stop = new AbortController();
    void (async () => {
      try {
        for await (const e of ctx.event.subscribe({ signal: stop.signal })) {
          const p = e.properties ?? e.data ?? e;
          if (e.type === "session.created") t.folder(p.sessionID, p.location?.directory);
          else if (e.type === "session.execution.succeeded") void t.hook("stop", p.sessionID);
        }
      } catch {
        // Unsubscribed, or OpenCode is shutting down.
      }
    })();
    return () => stop.abort();
  },

  // OpenCode 1.
  async server(input) {
    const t = tracker(input?.directory);
    return {
      "chat.message": async (msg) => {
        void t.hook("prompt", msg?.sessionID);
      },
      event: async ({ event }) => {
        if (event?.type === "session.idle") void t.hook("stop", event.properties?.sessionID);
      },
    };
  },
};
