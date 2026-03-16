# Obsidian CLI Command Reference

Reference for Obsidian CLI in terminal workflows.

> Compatibility note: command availability can vary by Obsidian version/config.
> Always validate locally with `obsidian help` and `obsidian help <command>`.

---

## 1) Setup & Verification (run first)

```bash
obsidian version
obsidian help
obsidian vault
```

---

## 2) Stable Core Command Set

These are the most common note-management operations.

### Files

```bash
obsidian files
obsidian files folder=Projects/
obsidian files total
obsidian read file="Note Name"
obsidian read path="folder/note.md"
obsidian create name="New Note"
obsidian create path="projects/new-note.md" content="# Title"
obsidian append file="New Note" content="\n- update"
obsidian prepend file="New Note" content="# Header\n"
obsidian move file="Old Name" destination="Archive/Old Name"
obsidian delete file="Temp Note"
```

### Daily notes

```bash
obsidian daily
obsidian daily:read
obsidian daily:path
obsidian daily:append content="- [ ] New task"
obsidian daily:prepend content="# Top priorities\n"
```

### Search / organization

```bash
obsidian search query="project status"
obsidian search query="tag:#important"
obsidian search query="path:Projects/"
obsidian templates
obsidian tags
obsidian tasks
```

### Properties (if available in local help)

```bash
obsidian property:get file="Note" name="status"
obsidian property:set file="Note" name="status" value="active"
obsidian property:delete file="Note" name="old-prop"
```

---

## 3) Optional/Version-Dependent Commands

Use these only if present in local `obsidian help` output.

```bash
obsidian links
obsidian bookmarks
obsidian plugins
obsidian themes
obsidian plugin:install <id>
obsidian plugin:enable <id>
obsidian plugin:disable <id>
```

If a command is missing locally, do not assume it exists.

---

## 4) Query operators (search)

| Operator | Example |
|---|---|
| `tag:#name` | `obsidian search query="tag:#todo"` |
| `path:folder/` | `obsidian search query="path:Projects/"` |
| `file:name` | `obsidian search query="file:meeting"` |
| `line:(...)` | `obsidian search query="line:(blocker)"` |

---

## 5) Content escaping

| Character | Escape |
|---|---|
| newline | `\n` |
| tab | `\t` |
| quote | `\"` |
| backslash | `\\` |

Example:

```bash
obsidian append file="Note" content="## Heading\n\n- Item 1\n- Item 2"
```

---

## 6) Safety checklist

Before destructive operations:

1. Resolve target by `read` or `files` first.
2. Confirm name/path ambiguity (`file=` vs `path=`).
3. Prefer one-note trial before bulk loops.

---

For the authoritative command list in the current environment, run:

```bash
obsidian help
```
