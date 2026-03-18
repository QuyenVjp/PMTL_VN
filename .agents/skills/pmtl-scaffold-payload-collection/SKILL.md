---
name: pmtl-scaffold-payload-collection
description: Payload collection scaffolding for PMTL_VN. Use when creating a new collection so the repo-aligned five-file structure is generated consistently with index, fields, access, hooks, and service split from day one.
---

# PMTL Scaffold Payload Collection

## Goal

Create a new collection folder with the exact PMTL split:

- `index.ts`
- `fields.ts`
- `access.ts`
- `hooks.ts`
- `service.ts`

## Script

Run `scripts/scaffold_collection.py <CollectionName>`.

```bash
python .agents/skills/pmtl-scaffold-payload-collection/scripts/scaffold_collection.py DharmaTopics
```

## After scaffolding

- Fill in fields and access rules intentionally.
- Keep business logic in `service.ts`.
- Register the collection in the Payload config using existing local patterns.
