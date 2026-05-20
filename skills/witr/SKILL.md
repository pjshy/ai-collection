---
name: witr
description: Use Witr CLI to explain why a process, PID, port, file handle, or container is running by tracing process ancestry. Trigger when users ask who is using a port, what started a process, why a service or container is running, to inspect warnings or environment variables for a live process, or explicitly mention `witr`. Do not trigger for generic OS theory, GUI-only process viewers, or unrelated container management.
---

# Witr

Use Witr to answer: **what is running, and who started it?**

## Requirements

- `witr` installed and available on `PATH`
- A live target to inspect:
  - process name
  - PID
  - port
  - file path
  - container name
- For `--interactive`, launch with a TTY

## Trigger Boundaries

### Must trigger

- User explicitly asks to use `witr`
- User asks **why a process is running** or **what parent launched it**
- User asks **who is using a port**
- User asks **which process holds a file/lock open**
- User asks to inspect a running process by **PID** or **container name**
- User asks for Witr output modes like `--tree`, `--json`, `--env`, `--warnings`, or `--verbose`

### Should trigger

- User is debugging a port conflict or background daemon and needs ancestry, not just a PID
- User wants a concise process ancestry summary for automation or incident notes
- User wants suspicious parents / arguments / environment highlighted

### Must NOT trigger

- Generic `ps`, `top`, `htop`, or Activity Monitor questions that do not ask for Witr
- Unrelated Docker/container lifecycle management
- Pure process theory without inspecting a live target

## Preflight (always run first)

```bash
command -v witr
witr --version
witr --help
```

If local help differs from internet examples, **follow local `witr --help` output**.

## Command Reliability Policy

- Treat local `witr --help` as the source of truth.
- Use only flags visible in local help.
- Prefer non-interactive, read-only output modes unless the user explicitly wants TUI mode.
- Do not invent undocumented TUI keybindings; inspect the live interface if interactive behavior matters.

## Query Selection

### Input types

| Target | Use |
|---|---|
| Process name | `witr nginx` |
| Exact process name | `witr bun --exact` |
| PID | `witr --pid 1234` |
| Port | `witr --port 5432` |
| File path / lock file | `witr --file /path/to/file` |
| Container name | `witr --container redis` |

### Matching guidance

- Positional arguments search by process name.
- Name matching is fuzzy/substring by default.
- Add `--exact` when the process name is ambiguous.
- Prefer `--pid`, `--port`, or `--file` when precision matters.
- Inputs are repeatable and can be mixed in one command.

## Quick Start

```bash
# Inspect by process name
witr nginx

# Inspect by PID
witr --pid 1234

# Find what owns a port
witr --port 3000

# Find who holds a file open
witr --file /var/lib/dpkg/lock

# Trace full ancestry only
witr postgres --tree

# Emit machine-readable JSON
witr --port 8080 --json
```

## Output Modes

| Goal | Flag |
|---|---|
| Show only ancestry | `--short` |
| Show ancestry as a tree | `--tree` |
| Show only warnings | `--warnings` |
| Show environment variables | `--env` |
| Show extended process info | `--verbose` |
| Emit JSON | `--json` |
| Disable ANSI colors | `--no-color` |
| Launch TUI | `--interactive` |

## Core Workflows

### Why is this process running?

```bash
witr postgres --tree
witr node --warnings
witr bun --exact --verbose
```

Use `--tree` when the user wants parent/child context. Use `--warnings` when they only want suspicious details.

### Who owns this port?

```bash
witr --port 3000
witr --port 5432 --tree
witr --port 8080 --env --json
```

Prefer `--port` over process-name guessing for port conflicts.

### Which process is holding this file open?

```bash
witr --file /tmp/app.lock
witr --file /var/lib/dpkg/lock --tree
```

Use this for lock files, sockets, or files that cannot be deleted because a process still has them open.

### Inspect a known PID

```bash
witr --pid 1234
witr --pid 1234 --verbose
witr --pid 1234 --json
```

Use PID when a previous tool already identified the exact process.

### Inspect containers

```bash
witr --container redis
witr --container postgres --tree
```

Use container lookup when the user names the container rather than the host-side PID.

### Multiple / mixed inputs

```bash
witr nginx node
witr --pid 1234 --pid 5678
witr --port 8080 --port 3000
witr nginx --pid 1234 --port 8080
```

Use mixed inputs when comparing several possible culprits in one pass.

## Execution Tips

- Prefer `--json` for automation, structured parsing, or follow-on analysis.
- Prefer `--no-color` when piping or capturing output.
- Use `--short` for compact summaries and `--tree` for human debugging.
- Only use `--interactive` with `tty: true`.
- If the query returns nothing, retry with a different identifier type:
  - process name → `--exact` off/on
  - port → PID
  - PID → process name
  - file → exact absolute path

## Troubleshooting

1. **`command not found: witr`**
   - Install Witr or ensure it is on `PATH`.
2. **No matching process or service found**
   - Check that the process is still running.
   - Retry without `--exact`.
   - Switch to `--pid`, `--port`, or `--file` for a more precise lookup.
3. **Output is hard to parse in logs/CI**
   - Add `--no-color` or `--json`.
4. **Interactive mode does not render correctly**
   - Re-run with a TTY.

## Full Command Reference

See `references/commands.md` for a compact flag reference and example cookbook.
