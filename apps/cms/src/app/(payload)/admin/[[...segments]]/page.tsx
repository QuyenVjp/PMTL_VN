import configPromise from "@payload-config";
import { RootPage, generatePageMetadata } from "@payloadcms/next/views";

import { importMap } from "../importMap";

type PageProps = {
  params: Promise<{
    segments?: string[];
  }>;
  searchParams: Promise<{
    [key: string]: string | string[] | undefined;
  }>;
};

function asPayloadParams(params: PageProps["params"]): Promise<{ segments: string[] }> {
  return params as Promise<{ segments: string[] }>;
}

function asPayloadSearchParams(
  searchParams: PageProps["searchParams"],
): Promise<Record<string, string | string[]>> {
  return searchParams as Promise<Record<string, string | string[]>>;
}

export const generateMetadata = ({ params, searchParams }: PageProps) =>
  generatePageMetadata({
    config: configPromise,
    params: asPayloadParams(params),
    searchParams: asPayloadSearchParams(searchParams),
  });

export default function PayloadAdminPage({ params, searchParams }: PageProps) {
  return RootPage({
    config: configPromise,
    importMap,
    params: asPayloadParams(params),
    searchParams: asPayloadSearchParams(searchParams),
  });
}
