# Mergepond for coding agents

Let Claude Code, Codex and other coding agents set up and manage their own git worktrees with [Mergepond](https://mergepond.dev). One tool call makes a branch for the task, checks it out in its own folder and runs the repository's setup recipe (copy `.env` files, link `node_modules`, install). The worktree shows on Mergepond's worktree board, marked working, ready for review or done.

Everything here runs on `pond`, the command line tool that comes with Mergepond. Mergepond doesn't need to be running. On a machine you reach over SSH, Mergepond installs `pond` the first time it connects. To put `pond` on your `PATH` on a Mac, choose **Mergepond › Install Command Line Tool**.

## Claude Code

```
/plugin marketplace add Webb-Ventures/mergepond-plugins
/plugin install mergepond@mergepond
```

The plugin adds:

- the `mergepond` MCP server,
- a skill telling Claude when and how to use a worktree,
- hooks that mark Claude's worktrees "working" when you send a message and "review" when it stops.

## Codex

```
codex mcp add mergepond -- pond mcp
```

Then add [`codex/AGENTS.md`](codex/AGENTS.md) to your `AGENTS.md` (in the repository or `~/.codex/AGENTS.md`). See [`codex/config.toml`](codex/config.toml) for a longer tool timeout, so a big install finishes in one call, and an optional `notify` hook that marks worktrees for review at the end of each turn.

## Other agents

Register `pond mcp` as a stdio MCP server, or have the agent run `pond` in a shell. `pond help` lists the commands.

## Is the agent meant to use a worktree?

That's up to you, per repository. The first time an agent works in a repository, it asks whether it should:

- **always** work in a new worktree,
- only use one **when asked**, or
- **ask** before each task.

Your answer is saved in the repository's `.mergepond.local.toml`. Change it with `pond policy always`, `pond policy when-asked`, `pond policy ask` or `pond policy clear`, or in Mergepond's worktree settings.

## Tools

| Tool | What it does |
| --- | --- |
| `worktree_policy` | Whether to use a worktree in this repository, and what to do. With `isolation`, saves the user's answer. |
| `create_worktree` | Start a task: a new branch named for the `task` (or a given `branch`, or a `pr`) in a new folder, set up by the recipe and marked working. Returns the folder and each setup step's result. |
| `list_worktrees` | Every worktree: branch, folder, changes, ahead and behind, merged, on the remote, and what agents said. |
| `worktree_status` | One worktree, with setup progress. `wait_seconds` waits for setup to finish. |
| `mark_worktree` | `working`, `review` or `done`, with a note, for the board. |

Agents can't remove worktrees. You do that on the board, or with `pond remove <branch>`, which refuses a worktree with uncommitted changes or unpushed commits unless you add `--force`.

## Project settings

Mergepond and `pond` read two files at the top of the repository:

- `.mergepond.toml` is committed and shared with your team.
- `.mergepond.local.toml` is yours. Mergepond keeps it out of Git (through `.git/info/exclude`).

A setting in your local file wins over the team's. Anything neither file sets comes from Mergepond's settings.

```toml
workspace = "Acme"                     # the Mergepond workspace this repository belongs to
identity = "Work"                      # the identity profile to commit as, by name

[worktrees]
location = "../<repo>.worktrees/<branch>"

[setup]
copy = [".env", ".env.local"]          # files that aren't in Git, copied from the main folder
link = ["node_modules"]                # folders shared through a symlink
run = ["pnpm install"]                 # commands run in the new folder, in order

[agents]
isolation = "always"                   # always, when-asked or ask
branch = "agent/<agent>/<task>"        # <agent> is claude-code or codex
```

The team file may only name an identity profile. To spell out a name and email, use your local file:

```toml
[identity]
name = "Ada Lovelace"
email = "ada@example.com"
```

Mergepond's worktree settings save to `.mergepond.local.toml`, or to `.mergepond.toml` with **Share with the team** turned on.
