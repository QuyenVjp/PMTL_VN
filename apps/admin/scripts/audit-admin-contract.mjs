import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

/* global console, process */

const root = process.cwd();
const srcRoot = join(root, "src");
const featureRoot = join(srcRoot, "features");

const allowedRawTable = [
  "features/dashboard/index.tsx",
  "features/system/health-page.tsx",
];

const allowedNoRowClick = [
  "features/life-liberation/life-liberation-species-summary-page.tsx",
  "features/sacred-forms/disposal-polarity-page.tsx",
  "features/system/audit-logs-page.tsx",
  "features/daily-recitation/admin-tables.tsx",
  "features/self-cultivation/templates-tab.tsx",
  "features/assisted-entry/index.tsx",
];

function walk(dir) {
  const result = [];
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    const stat = statSync(path);
    if (stat.isDirectory()) {
      result.push(...walk(path));
    } else if (path.endsWith(".tsx") || path.endsWith(".ts")) {
      result.push(path);
    }
  }
  return result;
}

function rel(path) {
  return relative(srcRoot, path).replaceAll("\\", "/");
}

function hasRawTable(source) {
  return /<Table(\s|>)/.test(source);
}

function count(source, pattern) {
  return source.match(pattern)?.length ?? 0;
}

const files = walk(featureRoot);
const deviations = [];
const warnings = [];
const stats = {
  featureFiles: files.length,
  workspaceDataTable: 0,
  workspaceRowActions: 0,
  workspaceDetailSheet: 0,
  adminDetailPage: 0,
  mediaPickerField: 0,
};

for (const file of files) {
  const path = rel(file);
  const source = readFileSync(file, "utf8");

  stats.workspaceDataTable += count(source, /\bWorkspaceDataTable\b/g);
  stats.workspaceRowActions += count(source, /\bWorkspaceRowActions\b/g);
  stats.workspaceDetailSheet += count(source, /\bWorkspaceDetailSheet\b/g);
  stats.adminDetailPage += count(source, /\bAdminDetailPage\b/g);
  stats.mediaPickerField += count(source, /\bMediaPickerField\b/g);

  if (/\bImageAssetPicker\b/.test(source)) {
    deviations.push({ path, issue: "Dùng ImageAssetPicker riêng, phải dùng MediaPickerField chung." });
  }

  if (/\bwindow\.(confirm|prompt)\b/.test(source)) {
    deviations.push({ path, issue: "Dùng browser-native confirm/prompt, phải dùng shadcn Dialog/AlertDialog." });
  }

  if (hasRawTable(source) && !allowedRawTable.includes(path)) {
    deviations.push({ path, issue: "Raw <Table> trong feature CRUD, phải dùng WorkspaceDataTable hoặc đưa vào allowlist ops." });
  }

  if (/\bWorkspaceDataTable\b/.test(source) && !/\bonRowClick=/.test(source) && !allowedNoRowClick.includes(path)) {
    warnings.push({ path, issue: "WorkspaceDataTable chưa có onRowClick; cần xác nhận đây là bảng thống kê/read-only." });
  }

  if (/\bWorkspaceDetailSheet\b/.test(source) && !/create-dialog|create-page/.test(path)) {
    const hasStandardSections = /\bWorkspaceDetailStandardSections\b/.test(source);
    for (const section of ["Thông tin", "Biên tập", "Audit"]) {
      if (!hasStandardSections && !source.includes(section)) {
        warnings.push({ path, issue: `Detail sheet chưa thấy section "${section}".` });
      }
    }
  }
}

const queryFiles = files.filter((file) => file.endsWith("queries.ts"));
for (const file of queryFiles) {
  const path = rel(file);
  const source = readFileSync(file, "utf8");
  if (/re-exported from @pmtl\/api-client/.test(source)) {
    continue;
  }
  if (!/\blists?\s*[:(]/.test(source)) {
    warnings.push({ path, issue: "Query key chưa thấy list/lists owner." });
  }
  if (!/\bdetails?\s*[:(]/.test(source)) {
    warnings.push({ path, issue: "Query key chưa thấy detail/details owner." });
  }
}

console.log(JSON.stringify({ stats, deviations, warnings }, null, 2));

if (deviations.length > 0) {
  process.exitCode = 1;
}
