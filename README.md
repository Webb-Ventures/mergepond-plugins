# Mergepond for coding agents

Let Claude Code, Codex, OpenCode, Antigravity and other coding agents set up and manage their own git worktrees with [Mergepond](https://mergepond.dev). One tool call makes a branch for the task, checks it out in its own folder and runs the repository's setup recipe (copy `.env` files, link `node_modules`, install). The worktree shows on Mergepond's worktree board, marked working, ready for review or done.

Everything here runs on `pond`, the command line tool that comes with Mergepond. The `pond wt` commands need the Mergepond release after 1.2; the MCP server and the hooks work with earlier versions too. Mergepond doesn't need to be running. On a machine you reach over SSH, Mergepond installs `pond` the first time it connects. To put `pond` on your `PATH` on a Mac, choose **Mergepond › Set up pond and coding agents…** (**Install command line tool…** before 1.4). The plugins below find the `pond` inside Mergepond.app when it isn't on your `PATH`; the OpenCode and Antigravity hooks need the Mergepond release after 1.4.

## What is Mergepond?

[Mergepond](https://mergepond.dev) is a Git client for the Mac. It keeps all your worktrees, projects and SSH machines in one window:

- **Worktrees:** every worktree of a repository on one board, with branch, changes, ahead and behind, and what its agent is doing.
- **Workspaces:** group repositories by client or project, each with its own commit identity.
- **Remote repositories:** open a repository on a machine you SSH into and use it like a local one. Mergepond uses your SSH login and opens no ports.
- **The everyday Git work:** staging, committing, history, branches, stashes, merges and conflicts, with undo.

Mergepond is free for local repositories. [Download it](https://mergepond.dev) or install it with Homebrew:

```
brew install --cask webb-ventures/tap/mergepond
```

This repository holds what coding agents need to use it. For a step-by-step setup, see the [walkthrough](https://mergepond.dev/guides/coding-agents-plugin); every setting and tool is in the [reference](https://mergepond.dev/docs/coding-agents).

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

## OpenCode

```
opencode mcp add mergepond --global -- pond mcp
```

Then copy [`opencode/mergepond.js`](opencode/mergepond.js) to `~/.config/opencode/plugins/` and [`opencode/skills/worktrees`](opencode/skills/worktrees) to `~/.config/opencode/skills/` (or a repository's `.opencode/plugins/` and `.opencode/skills/`). The plugin marks OpenCode's worktrees "working" when you send a message and "review" when it finishes; the skill tells it when and how to use a worktree.

## Antigravity

Install the plugin in [`antigravity/mergepond`](antigravity/mergepond) with the Antigravity CLI:

```
git clone https://github.com/Webb-Ventures/mergepond-plugins
agy plugin install mergepond-plugins/antigravity/mergepond
```

It adds the `mergepond` MCP server, the worktrees skill, and hooks that mark Antigravity's worktrees "working" when you send a message and "review" once it's idle. In a repository where you haven't chosen how agents use worktrees, the first message of a conversation reminds it to ask you.

## Other agents

Register `pond mcp` as a stdio MCP server, or have the agent run `pond` in a shell. `pond help` lists the commands, and `pond wt` the worktree commands.

## Is the agent meant to use a worktree?

That's up to you, per repository. The first time an agent works in a repository, it asks whether it should:

- **always** work in a new worktree,
- only use one **when asked**, or
- **ask** before each task.

It also asks once where your worktrees should live, such as `~/worktrees` (each goes in `<folder>/<repo>/<branch>`), for this repository or for every repository. Until you've chosen, agents won't make a worktree: Mergepond doesn't put them in its default spot (`../<repo>.worktrees/`) unless you say so. Set it yourself with `pond wt policy --parent ~/worktrees`, adding `--everywhere` for every repository.

Your answers are saved in the repository's `.mergepond.local.toml`, or for every repository in `~/.config/mergepond/config.toml`. Change them with `pond wt policy always`, `pond wt policy when-asked`, `pond wt policy ask` or `pond wt policy clear` (and `pond wt policy --parent <folder>` or `--clear-location`), or in Mergepond's worktree settings.

## Tools

| Tool | What it does |
| --- | --- |
| `worktree_policy` | Whether to use a worktree in this repository, where worktrees go, and what to do. With `isolation`, `parent` or `location` (plus `everywhere`), saves the user's answer. |
| `create_worktree` | Start a task: a new branch named for the `task` (or a given `branch`, or a `pr`) in a new folder, set up by the recipe and marked working. Returns the folder and each setup step's result. |
| `list_worktrees` | Every worktree: branch, folder, changes, ahead and behind, merged, on the remote, and what agents said. |
| `worktree_status` | One worktree, with setup progress. `wait_seconds` waits for setup to finish. |
| `mark_worktree` | `working`, `review` or `done`, with a note, for the board. |

Agents can't remove worktrees. You do that on the board, or with `pond wt remove <branch>`, which refuses a worktree with uncommitted changes or unpushed commits unless you add `--force`.

## Project settings

Mergepond and `pond` read two files at the top of the repository:

- `.mergepond.toml` is committed and shared with your team.
- `.mergepond.local.toml` is yours. Mergepond keeps it out of Git (through `.git/info/exclude`).

A setting in your local file wins over the team's. Anything neither file sets comes from Mergepond's settings.

For every repository, put the folder in `~/.config/mergepond/config.toml` (or under `$XDG_CONFIG_HOME`). It only takes `[worktrees]`, and a repository's own files win over it:

```toml
[worktrees]
parent = "~/worktrees"
```

```toml
workspace = "Acme"                     # the Mergepond workspace this repository belongs to
identity = "Work"                      # the identity profile to commit as, by name

[worktrees]
parent = "~/worktrees"                 # every worktree in ~/worktrees/<repo>/<branch>
# location = "../<repo>.worktrees/<branch>"   # or a full pattern; wins over parent

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

## Releasing

A new plugin version is a `version` bump in `mergepond/.claude-plugin/plugin.json`, merged to `main`. Claude Code installs from `main`, so it's out as soon as it merges. The Antigravity plugin's version is in `antigravity/mergepond/plugin.json`, and the OpenCode plugin's on the first line of `opencode/mergepond.js`. The three copies of the worktrees skill (`mergepond/`, `antigravity/mergepond/` and `opencode/`) must match; CI checks.

The Mergepond app bundles copies of `plugin.json`, `codex/AGENTS.md`, the Antigravity plugin and the OpenCode plugin for its **Set up pond and coding agents** sheet. Their versions are the ones the app installs and updates to. When any of them changes on `main`, the `sync-mergepond` workflow opens a pull request into Mergepond's `staging` with the new copies, or updates the one already open. Users get them with the next Mergepond release. Run it by hand from the Actions tab.

The workflow needs a `MERGEPOND_SYNC_TOKEN` secret: a fine-grained personal access token (or GitHub App token) for Webb-Ventures/mergepond with **Contents** and **Pull requests** set to read and write. It pushes the `sync/mergepond-plugin` branch with that token rather than this repository's own, so Mergepond's required checks run on the pull request.

## Licence

This repository is under the [MIT licence](LICENSE). Mergepond and `pond` are proprietary software from Webb Ventures. `pond` comes free with Mergepond.
