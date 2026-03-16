---
name: obsidian-cli
description: Use Obsidian CLI to operate notes in an Obsidian vault from terminal workflows. Trigger when users ask to create/read/update/search notes, manage daily notes, or automate vault operations with CLI commands. Do not trigger for generic writing advice, PKM methodology discussions, or GUI-only Obsidian questions.
---

# Obsidian CLI

Control Obsidian from the terminal.

## Requirements

- Obsidian Desktop v1.12.4+
- Obsidian app running in background
- CLI enabled in `Settings → General → Command line interface`

## Trigger Boundaries

### Must trigger

- User explicitly asks to use `obsidian` command / CLI
- User asks to create/read/search/move/delete notes in a vault
- User asks for daily note automation (`daily`, `daily:append`, etc.)
- User asks for shell-script workflows against Obsidian notes

### Should trigger

- User mentions Obsidian + repeatable terminal workflow
- User asks to batch update notes/todos with shell loops

### Must NOT trigger

- Pure PKM/process advice without CLI execution
- GUI navigation questions (menus, themes UI setup)
- Non-Obsidian Markdown processing unrelated to vault ops

## Preflight (always run first)

```bash
obsidian version
obsidian help
obsidian vault
```

If any preflight command fails, stop and fix setup before write/delete operations.

## Command Reliability Policy

- Treat `obsidian help` as source of truth.
- Use only commands visible in local `obsidian help` output.
- If docs and local help conflict, follow local help and explain the discrepancy.

## Quick Start

```bash
# Read-only checks
obsidian files total
obsidian search query="project"
obsidian read file="Inbox"

# Write operations
obsidian create name="New Note" content="# Title"
obsidian append file="New Note" content="\n- next step"
obsidian daily:append content="- [ ] Follow up"
```

## Parameter Syntax

- Parameters: `key="value"` (example: `name="My Note"`)
- Flags: boolean switches without values (example: `silent`, `overwrite`)
- Escapes in content: `\n`, `\t`, `\"`, `\\`

### File Targeting

| Parameter | Usage |
|---|---|
| `file=<name>` | Wikilink-style resolution (name only) |
| `path=<path>` | Exact path from vault root (`folder/note.md`) |
| `vault=<name>` | Target specific vault (else focused vault) |

## Core Workflows

### Files

```bash
obsidian files
obsidian files folder=Projects/
obsidian read file="Roadmap"
obsidian read path="Projects/roadmap.md"
obsidian create name="Meeting Note"
obsidian create path="projects/feature.md" template=project-template
obsidian append file="Meeting Note" content="\n- action item"
obsidian prepend file="Meeting Note" content="# Meeting Note\n"
obsidian move file="Old Name" destination="Archive/Old Name"
obsidian delete file="Temp Note"
```

### Daily Notes

```bash
obsidian daily
obsidian daily:read
obsidian daily:path
obsidian daily:append content="- [ ] Task"
obsidian daily:prepend content="# Daily Focus\n"
```

### Search / Metadata

```bash
obsidian search query="tag:#important"
obsidian search query="path:Projects/"
obsidian templates
obsidian tags
obsidian tasks
```

## Safety Rules

- For destructive actions (`delete`, `overwrite`), confirm target first.
- Prefer `read`/`search` before `move`/`delete`.
- For bulk edits, run on a small sample note before full loop.

## Troubleshooting

1. `command not found: obsidian`
   - Ensure Obsidian CLI is enabled and app is running.
2. `Vault not found` / wrong vault
   - Check `obsidian vault`; pass `vault="..."` explicitly if needed.
3. Command works in docs but fails locally
   - Re-check `obsidian help` and use only listed commands.
4. Note cannot be resolved by `file=`
   - Use exact `path=`.

## Full Command Reference

See `references/commands.md` for categorized examples.
