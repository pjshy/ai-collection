# audit-eval (Obsidian CLI Audit Evaluation Page)

Use this page to manually review `obsidian-cli` routing boundaries: which inputs should be `trigger` vs `no_trigger`.

## File structure

- `index.html`: Page layout (metric cards, filters, case table, details panel)
- `app.js`: Data loading, prediction, scoring, filtering, rendering, review-status persistence
- `styles.css`: Page styles
- `dataset.json`: Structured evaluation dataset (ground truth)

## Local usage

### Option 1: Open directly

Open `index.html` directly in your browser. If your browser blocks local `fetch`, use Option 2.

### Option 2: Run a local static server (recommended)

Start any static server in `skills/obsidian-cli/references/audit-eval/`, for example:

```bash
python3 -m http.server 8080
```

Then visit: `http://localhost:8080`

## `dataset.json` schema

Each record includes:

- `id`: Case ID (for example `OB-01`)
- `title`: Scenario title
- `input`: User input
- `expected`: `trigger` / `no_trigger`
- `priority`: `high` / `medium` / `low`
- `tags`: Tag array for filtering
- `notes`: Audit notes (safety requirements, boundary rationale, etc.)
- `source`: Data source (currently `evaluation-suite.md`)

## Page capabilities

- Table columns: `ID | Scenario Title | User Input | Expected | Predicted | Pass/Fail | Priority | Tags | Review Status`
- Filters:
  - Expected (all / trigger / no_trigger)
  - failed-only
  - keyword (matches id/title/input)
  - tag multi-select
- Metrics:
  - Total
  - Pass / Fail
  - Accuracy
  - Precision (trigger as positive class)
  - Recall (trigger as positive class)
  - F1
- Review status: `unreviewed | approved | needs_fix` (stored in `localStorage`)

## Predictor interface

Single entry point in `app.js`:

```js
predictTrigger(input) // => 'trigger' | 'no_trigger'
```

Current implementation uses explainable heuristic rules. You can replace it with real routing logic later without changing the UI or dataset structure.
