# Batch drain report — 2026-11-19
Phase 1 Cursor pass: **inventory all tips** + delete empty Listening / empty closed shells.
## Inventory
- **georgia:** `{"path": "/home/ari/dev/myproblem-tickets/regions/georgia", "count": 21, "deleted": 21, "kept": 0}`
- **israel:** `{"path": "/home/ari/dev/myproblem-tickets/regions/israel", "count": 7, "deleted": 7, "kept": 0}`
- **fixit:** `{"path": "/home/ari/dev/myproblem-tickets/regions/fixit", "count": 0, "deleted": 0, "kept": 0}`
- **quizgate_users:** `{"found": 0, "users": []}`
- **clevertree:** `{"checkout": "/home/ari/dev/clevertree-chat-comments", "page_json_count": 0}`

## Deleted (28)
- `georgia/06962717-5068-474e-b7d7-a1da9d2d1c96` status=open intake=listening jobs_removed=0
- `georgia/0c017ff6-91ba-4743-b1d5-c104b6a98884` status=open intake=listening jobs_removed=0
- `georgia/0e32954e-e8f9-4fc3-ab6b-83e0ad8ed5e5` status=open intake=listening jobs_removed=0
- `georgia/1531a1ca-437c-4d96-afab-87ad71d0a2ce` status=open intake=listening jobs_removed=1
- `georgia/283ac007-3871-4ed9-bc8b-c4f2e3ce40ee` status=open intake=listening jobs_removed=1
- `georgia/3d15d907-adad-448e-af69-4e227ee7a01f` status=open intake=listening jobs_removed=0
- `georgia/3ed7c0d3-31d6-4150-91b3-7326785e5a16` status=open intake=listening jobs_removed=0
- `georgia/41fb15c4-8842-4b3c-9d03-520e5fead53c` status=open intake=listening jobs_removed=0
- `georgia/47356b88-e0b5-4017-8fad-1adbefbff779` status=open intake=listening jobs_removed=1
- `georgia/603c9ddf-3966-4896-8b09-500867b6ef87` status=open intake=listening jobs_removed=0
- `georgia/6993d85d-4ca8-4fc2-bf82-c99c9449fbc6` status=open intake=listening jobs_removed=1
- `georgia/9febe3d3-a12b-4b4d-9c30-983a6c649aaa` status=open intake=listening jobs_removed=0
- `georgia/b01c4053-5e37-42f8-b3d2-eee5d8471d30` status=open intake=listening jobs_removed=0
- `georgia/c86fcf96-7809-4d46-85bd-c1748bbb6e3d` status=open intake=listening jobs_removed=0
- `georgia/cb2516af-1576-45fc-83b6-0dc20892f925` status=open intake=listening jobs_removed=0
- `georgia/d868cb78-6078-4123-a4f0-2799e1b9296a` status=open intake=listening jobs_removed=1
- `georgia/ed873e38-5899-4b67-9df9-eca502570116` status=open intake=listening jobs_removed=1
- `georgia/edfcb9fa-e3ed-4a88-861f-70208d646da2` status=open intake=listening jobs_removed=0
- `georgia/f3ea6eb0-6437-4466-986c-da5c8d806978` status=open intake=listening jobs_removed=1
- `georgia/fa074eaf-dabb-4483-9df6-8fdb97fd9af1` status=open intake=listening jobs_removed=0
- `georgia/faa8ea68-a1ce-4097-8ad5-3c9d982fb7ff` status=open intake=listening jobs_removed=0
- `israel/07b8559c-50a0-4142-b33b-d41d15ba1868` status=closed intake=listening jobs_removed=0
- `israel/16c93651-5f51-43a1-b58d-fe270c96efcb` status=closed intake=listening jobs_removed=0
- `israel/50ecba9b-7d54-466d-84cb-fb34ce6258e2` status=closed intake=listening jobs_removed=0
- `israel/67ffb6fb-30e0-4dbc-a6fe-25e0dde54205` status=closed intake=listening jobs_removed=0
- `israel/b42de790-a238-4cd8-9511-0030b3bf053e` status=closed intake=listening jobs_removed=0
- `israel/d7b3eee4-5c4e-4679-babe-efd7c0680d7b` status=closed intake=listening jobs_removed=0
- `israel/d8d1f5f0-9f48-4e2a-a669-8a9272eb69e1` status=closed intake=listening jobs_removed=0

## Kept (0)
- _(none)_

## Human review (0)
- _(none)_

## Notes
- fixit: no tickets/ dir
- fixit: stub only (media-upload.json present; 0 tips) — no mint this pass
- quizgate: no users/ visible from this shell (check iad1 PVC); queue pending was 0 earlier

## Operator confidence
`{"correct": 0.85, "accurate": 0.8, "fast": 0.9, "notes": "Inventory+delete-only pass; no ASR/Whisper invoked"}`

Playbook: [`../cursor-batch-playbook.md`](../cursor-batch-playbook.md). JSON: [`batch-drain-2026-11-19.json`](./batch-drain-2026-11-19.json).

## Clevertree topics (no mass delete)

Inventoried **43** pages under `clevertree-chat-comments/pages/` (e.g. 5g, censorship, chronology, communism, controlled-opposition, cosmology, deep-state, development…). UUID-binding rule documented; no deletes this pass.

## Git commits

- `myproblem-tickets` regions/georgia + regions/israel — tip stub purge committed locally (not pushed).
