from __future__ import annotations

import argparse
from pathlib import Path


ROOT = Path(__file__).resolve().parents[4]
COLLECTIONS_DIR = ROOT / "apps" / "cms" / "src" / "collections"


def to_slug(name: str) -> str:
    result = []
    for index, char in enumerate(name):
        if char.isupper() and index > 0:
            result.append("-")
        result.append(char.lower())
    return "".join(result)


def write_file(path: Path, content: str) -> None:
    path.write_text(content, encoding="utf-8")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("name")
    args = parser.parse_args()

    collection_name = args.name
    collection_dir = COLLECTIONS_DIR / collection_name
    collection_dir.mkdir(parents=True, exist_ok=False)
    slug = to_slug(collection_name)

    write_file(collection_dir / "fields.ts", "import type { Field } from \"payload\";\n\nexport const fields: Field[] = [];\n")
    write_file(
        collection_dir / "access.ts",
        "import type { CollectionConfig } from \"payload\";\n\n"
        "export const access: CollectionConfig[\"access\"] = {\n"
        "  read: () => true,\n"
        "  create: ({ req }) => Boolean(req.user),\n"
        "  update: ({ req }) => Boolean(req.user),\n"
        "  delete: ({ req }) => Boolean(req.user),\n"
        "};\n",
    )
    write_file(
        collection_dir / "hooks.ts",
        "import type { CollectionConfig } from \"payload\";\n\nexport const hooks: CollectionConfig[\"hooks\"] = {};\n",
    )
    write_file(
        collection_dir / "service.ts",
        f"export function get{collection_name}CollectionSlug() {{\n  return \"{slug}\";\n}}\n",
    )
    write_file(
        collection_dir / "index.ts",
        "import type { CollectionConfig } from \"payload\";\n\n"
        "import { access } from \"./access\";\n"
        "import { fields } from \"./fields\";\n"
        "import { hooks } from \"./hooks\";\n\n"
        f"export const {collection_name}: CollectionConfig = {{\n"
        f"  slug: \"{slug}\",\n"
        "  admin: {\n"
        "    useAsTitle: \"id\",\n"
        "  },\n"
        "  access,\n"
        "  fields,\n"
        "  hooks,\n"
        "};\n",
    )
    print(collection_dir)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
