---
name: worktrees
description: Work on coding tasks in git worktrees made with Mergepond, following the user's choice for this repository, and keep their worktree board up to date. Use at the start of work in a git repository, before changing code, when asked to work on a branch, a pull request or several things in parallel, and when finishing a piece of work.
---

# Working in Mergepond worktrees

Mergepond's tools (the `mergepond` MCP server, or `pond` in a shell) make a git worktree for a task, set it up the way this repository needs, and show it on the user's worktree board.

## First: what does the user want here?

Call `worktree_policy` once at the start of work in a repository.

- **Not decided**: before changing any code, ask the user once how you should work in this repository: always in a new worktree, only in a worktree when they ask for one, or ask before each task. Save their answer with `worktree_policy` and `isolation` set to `always`, `when-asked` or `ask`. Don't save a choice they didn't make.
- **always**: start every task that changes code in a new worktree.
- **when-asked**: work in the current folder unless the user asks for a worktree.
- **ask**: before a task that changes code, ask whether to use a new worktree.

## Starting a task in a worktree

1. Call `create_worktree` with `task`, a few words about the task (such as "fix login redirect"), and a one-line `note`. The repository names the branch (`agent/claude-code/fix-login-redirect` by default). To use a particular branch, pass `branch`; for a pull request, `pr`.
2. Do all your work in the `path` it returns: run commands there and edit files there. Don't edit the user's own checkout.
3. If `setup.ok` is false, read the failed step's output and tell the user; the worktree exists anyway. If `setup.done` is false, setup is still running: call `worktree_status` with `wait_seconds` before running the project.

## While working and when done

- Commit as you go, in the worktree.
- The plugin's hooks mark your worktrees "working" when the user sends a message and "review" when you stop, so you don't need to. When something is ready, call `mark_worktree` with `state: "review"` and a `note` saying what's ready; the note shows on the board. Use `"done"` when nothing more is needed.
- `list_worktrees` shows every worktree with its changes, commits ahead and behind, and whether it's merged.
- You can't remove worktrees. When one is finished, tell the user; they remove it on the board or with `pond wt remove`.

## Without the MCP server

The same in a shell: `pond wt policy`, `pond wt new --task "fix login redirect" --note "…"` (prints the folder), `pond wt list`, `pond wt status`, `pond wt mark review --note "…"`. Add `--json` for machine-readable output.
