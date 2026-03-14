import type { ReactNode } from "react";

import configPromise from "@payload-config";
import { RootLayout, handleServerFunctions, metadata } from "@payloadcms/next/layouts";

import { importMap } from "./admin/importMap";

export { metadata };

async function serverFunction(args: { args: Record<string, unknown>; name: string }) {
  "use server";

  return handleServerFunctions({
    ...args,
    config: configPromise,
    importMap,
  });
}

export default function PayloadAppLayout({ children }: { children: ReactNode }) {
  return RootLayout({
    children,
    config: configPromise,
    importMap,
    serverFunction,
  });
}
