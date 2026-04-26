import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

/* global console, process */

const root = process.cwd();
const srcRoot = join(root, "src");

function walk(dir) {
  const result = [];
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    const stat = statSync(path);
    if (stat.isDirectory()) {
      result.push(...walk(path));
    } else if (path.endsWith(".controller.ts")) {
      result.push(path);
    }
  }
  return result;
}

function rel(path) {
  return relative(srcRoot, path).replaceAll("\\", "/");
}

function normalizePath(path) {
  return path.replace(/^["'`]|["'`]$/g, "").replace(/^\/+|\/+$/g, "");
}

function routeGroup(controllerPath, methodPath) {
  const full = [controllerPath, methodPath].filter(Boolean).join("/");
  const parts = full.split("/").filter(Boolean);
  const adminIndex = parts.indexOf("admin");
  const relevant = adminIndex >= 0 ? parts.slice(adminIndex + 1) : parts;
  const firstDynamic = relevant.findIndex((part) => part.startsWith(":"));
  const stable = firstDynamic >= 0 ? relevant.slice(0, firstDynamic) : relevant;
  return ["admin", ...stable].join("/");
}

function classify(httpMethod, methodPath) {
  const path = normalizePath(methodPath);
  if (httpMethod === "Get" && (!path || !path.includes(":"))) return "list";
  if (httpMethod === "Get" && path.includes(":")) return "detail";
  if (httpMethod === "Post" && !path.includes(":")) return "create";
  if (["Patch", "Put"].includes(httpMethod) && path.includes(":")) {
    if (/(status|publish|unpublish|block|unblock|activate|deactivate|suspend|revoke|resolve|hide|restore|approve|reject|cancel|redrive)/.test(path)) {
      return "status";
    }
    return "update";
  }
  if (httpMethod === "Delete" && path.includes(":")) return "delete";
  if (httpMethod === "Post" && path.includes(":")) return "status";
  return "aux";
}

const groups = new Map();
const controllers = [];

for (const file of walk(srcRoot)) {
  const source = readFileSync(file, "utf8");
  const controllerMatches = [...source.matchAll(/@Controller\(([^)]+)\)/g)];
  if (controllerMatches.length === 0) continue;

  for (let index = 0; index < controllerMatches.length; index++) {
    const controllerMatch = controllerMatches[index];
    const controllerPath = normalizePath(controllerMatch[1]);
    if (!controllerPath.startsWith("admin")) continue;

    const blockStart = controllerMatch.index ?? 0;
    const blockEnd = controllerMatches[index + 1]?.index ?? source.length;
    const block = source.slice(blockStart, blockEnd);
    const routes = [];
    const routePattern = /@(Get|Post|Patch|Put|Delete)\(([^)]*)\)\s*(?:\n\s*@[^\n]+)*\s*\n\s*(?:async\s+)?([A-Za-z0-9_]+)/g;
    for (const match of block.matchAll(routePattern)) {
      const httpMethod = match[1];
      const methodPath = normalizePath(match[2] || "");
      const methodName = match[3];
      const group = routeGroup(controllerPath, methodPath);
      const capability = classify(httpMethod, methodPath);
      const route = {
        httpMethod,
        path: [controllerPath, methodPath].filter(Boolean).join("/"),
        methodName,
        capability,
        file: rel(file),
      };
      routes.push(route);
      const current = groups.get(group) ?? {
        group,
        file: rel(file),
        list: false,
        detail: false,
        create: false,
        update: false,
        delete: false,
        status: false,
        aux: false,
        routes: [],
      };
      current[capability] = true;
      current.routes.push(route);
      groups.set(group, current);
    }

    controllers.push({ file: rel(file), controllerPath, routes: routes.length });
  }
}

const matrix = [...groups.values()].sort((a, b) => a.group.localeCompare(b.group));
const errorFilter = readFileSync(join(srcRoot, "common/errors/global-exception.filter.ts"), "utf8");
const deviations = [];

if (!/traceId/.test(errorFilter) || !/fieldErrors/.test(errorFilter)) {
  deviations.push({
    path: "common/errors/global-exception.filter.ts",
    issue: "Error envelope phải có traceId và details.fieldErrors.",
  });
}

console.log(JSON.stringify({ controllers, matrix, deviations }, null, 2));

if (deviations.length > 0) {
  process.exitCode = 1;
}
