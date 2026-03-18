import { existsSync, readFileSync } from "node:fs";

export function parseSimpleEnvFile(filePath: string): Record<string, string> {
  if (!existsSync(filePath)) {
    return {};
  }

  const values: Record<string, string> = {};
  const lines = readFileSync(filePath, "utf8").split(/\r?\n/);

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) {
      continue;
    }

    const separatorIndex = line.indexOf("=");
    if (separatorIndex <= 0) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    const rawValue = line.slice(separatorIndex + 1).trim();
    const value =
      (rawValue.startsWith('"') && rawValue.endsWith('"')) || (rawValue.startsWith("'") && rawValue.endsWith("'"))
        ? rawValue.slice(1, -1)
        : rawValue;

    values[key] = value;
  }

  return values;
}

export function getEnvValue(name: string, envFileValues: Record<string, string>, fallback = ""): string {
  const processValue = process.env[name];
  if (typeof processValue === "string" && processValue.length > 0) {
    return processValue;
  }

  return envFileValues[name] ?? fallback;
}

export function isPlaceholderEnvValue(value: string | null | undefined): boolean {
  if (!value) {
    return true;
  }

  return value.startsWith("replace-with-") || value === "admin@example.com";
}
