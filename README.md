# ai-collection

A collection of reusable AI agent skills.

## Skills in this repo

- `obsidian-cli`
- `witr`

## Folder structure

- `skills/`: skill definitions and related references

## Install with `npx skills`

This repository is laid out so individual skills can be installed directly from GitHub with `npx skills`.

### List available skills

```bash
npx skills add pjshy/ai-collection --list
```

### Install a specific skill

```bash
npx skills add pjshy/ai-collection --skill obsidian-cli
npx skills add pjshy/ai-collection --skill witr
```

### Install all skills from this repo

```bash
npx skills add pjshy/ai-collection --skill '*'
```

### Optional flags

```bash
# Install globally instead of in the current project
npx skills add pjshy/ai-collection --skill witr -g

# Skip confirmation prompts
npx skills add pjshy/ai-collection --skill witr -y
```

### Install from a local checkout

```bash
npx skills add . --list
npx skills add . --skill witr
```

## Notes

- Skill names come from each skill's `SKILL.md` frontmatter `name`.
- Add new skills under `skills/<skill-name>/SKILL.md` to keep them installable through the same repo flow.
