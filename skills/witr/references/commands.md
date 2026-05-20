# Witr Command Reference

This reference is a compact cookbook derived from local `witr --help` output.

## Canonical Preflight

```bash
command -v witr
witr --version
witr --help
```

## Usage Shape

```bash
witr [process name...] [flags]
```

## Examples by Target Type

### Process name

```bash
witr nginx
witr bun --exact
witr docker --warnings
witr mysql --verbose
```

### PID

```bash
witr --pid 1234
witr --pid 1234 --json
witr --pid 1234 --tree
```

### Port

```bash
witr --port 5432
witr --port 8080 --env --json
witr --port 3000 --tree
```

### File path / lock file

```bash
witr --file /var/lib/dpkg/lock
witr --file /tmp/app.sock
```

### Container

```bash
witr --container redis
witr --container postgres --tree
```

## Output / Filter Flags

| Flag | Meaning |
|---|---|
| `--exact` | Exact name match instead of substring search |
| `--env` | Show environment variables |
| `--json` | Emit machine-readable JSON |
| `--no-color` | Disable ANSI color output |
| `--short` | Show ancestry only in compact form |
| `--tree` | Show ancestry as a tree |
| `--verbose` | Show extended process information |
| `--warnings` | Show only warnings |
| `--interactive` | Launch TUI mode |

## Repeatable Inputs

These can be passed multiple times:

- `--pid`
- `--port`
- `--file`
- `--container`

Examples:

```bash
witr --pid 1234 --pid 5678
witr --port 8080 --port 3000
witr --file /tmp/a.lock --file /tmp/b.lock
witr --container redis --container postgres
```

## Mixed Queries

```bash
witr nginx --pid 1234 --port 8080
witr node --port 3000 --warnings
witr redis --container redis --json
```

## Recommended Patterns

### For automation

```bash
witr --port 8080 --json --no-color
```

### For incident debugging

```bash
witr postgres --tree --verbose
```

### For suspicious-only review

```bash
witr node --warnings
```

### For ambiguous names

```bash
witr bun --exact
```

## Selection Heuristics

- Start with `--port` when debugging “address already in use”.
- Start with `--file` for lock-file or “resource busy” issues.
- Start with `--pid` when another tool already gave you the exact PID.
- Use process names for quick exploratory lookup.
- Add `--exact` when name-based matching is too broad.
- Add `--json` when the result will be parsed by another tool or script.
