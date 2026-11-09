# COP31 choice experiment – Qualtrics set-up

Files in this repository:

| File | What it is |
|---|---|
| `choice_experiment_setup.js` | JavaScript that randomises the packages. Goes on the scenario screen. |
| `choice_task_question.html` | HTML for the question text of the looped choice task. |
| `loop_and_merge_table.csv` | The six rows and six fields to enter in the Loop & Merge table. |
| `embedded_data_fields.txt` | The 87 embedded data fields to declare in the Survey Flow. |

## 1. Survey Flow

1. At the very top of the Survey Flow (before any block), add an **Embedded Data** element.
2. Add every field name from `embedded_data_fields.txt`, leaving the values empty.
   All names start with `__js_`. Fields that are not declared here are **not saved** in the data.
   Tip: the "Add a new field" box accepts one name at a time; Qualtrics also lets you paste
   several names if you use "Add Multiple Fields" in newer interfaces.
3. The easiest way to do this is to create an embedded data block for all the variables containing
   task1 data, then duplicate it six times and only change the numbers. The block for the general
   variables must be created separately at the top (order, row names and descriptions, etc.). 

## 2. Scenario screen (block before the choice tasks)

1. Create a Text/Graphic question with the scenario text:
   *"Imagine a large high-income country setting its budget for 2027–2031. Its total budget is fixed,
   so any increase must be paid for by savings elsewhere. It is choosing between two packages.
   Which would you prefer it to adopt?"*
2. Open **JavaScript** on this question and paste `choice_experiment_setup.js`, replacing the default code.

The script must run on a page **before** the first choice task. Embedded data set on a page can only be
piped into later pages.

## 3. Choice-task block

1. Create one block with one **Multiple Choice** question:
   - Question text: switch to **HTML View** and paste `choice_task_question.html`.
   - Answer options: `Package A`, `Package B`.
   - Turn on **Force Response**. (Respondents can still leave the survey at any time.)
   - Leave answer order fixed (A above B).
2. Block options → **Loop & Merge** → turn on, set to **6 rows** and **6 fields**.
3. Fill the table from `loop_and_merge_table.csv`: row *i* contains `${e://Field/__js_task<i>_row<r>_<A|B>}`.
4. Leave loop order **not randomised**, so the task number shown matches the task stored in the data.

## 4. What ends up in the data

| Field | Meaning |
|---|---|
| `__js_attr_order` | Order of the three rows for this respondent, e.g. `priority\|finance\|size` |
| `__js_task<i>_<attribute>_<A\|B>_code` | Level shown, by attribute (use these for analysis) |
| `__js_task<i>_row<r>_<A\|B>` | Text shown in each table cell (for checking only) |
| `__js_task<i>_redraws` | How many times package B was redrawn to avoid an identical pair |
| Choice question, loop *i* | Qualtrics exports it as `<i>_Q<id>`: 1 = Package A, 2 = Package B |

Attribute codes:

- `finance`: `cut25`, `keep`, `inc25`
- `priority`: `defence`, `growth`, `energy`, `food_water`, `health`
- `size`: `0.5`, `1.0`, `1.5`

For analysis, reshape to one row per respondent × task × package (12 rows per respondent), with
`chosen = 1` for the selected package, and regress `chosen` on the attribute codes with standard errors
clustered by respondent.

## 5. Before going live

- Preview the survey several times and check that the table changes between previews and that
  task numbers run 1/6 to 6/6.
- Complete a test response, export it, and check that all `__js_` fields are filled.
- Preview on a tablet and a phone.
