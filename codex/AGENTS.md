## Worktrees (Mergepond)

This repository uses Mergepond's `mergepond` MCP server for git worktrees.

- At the start of a session, call `worktree_policy`. If it isn't decided, ask me once whether you should always work in a new worktree, only when I ask, or ask before each task, then save my answer with `worktree_policy`. Follow it from then on.
- To start a task in a worktree, call `create_worktree` with `task` set to a few words about it, then work only in the folder it returns. If setup is still running, call `worktree_status` with `wait_seconds`.
- When you start working in a worktree after a message from me, call `mark_worktree` with state `working`. When you finish a turn with something for me to look at, call `mark_worktree` with state `review` and a one-line note.
- Don't remove worktrees; I do that.
