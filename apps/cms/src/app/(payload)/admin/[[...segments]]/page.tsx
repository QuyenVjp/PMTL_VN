import configPromise from "@payload-config";
import { RootPage, generatePageMetadata } from "@payloadcms/next/views";

import { importMap } from "../importMap";

type PayloadPageParams = {
  segments?: string[];
};

type PayloadSearchParams = Record<string, string | string[]>;

type PageProps = {
  params: Promise<PayloadPageParams>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function normalizeParams(paramsPromise: Promise<PayloadPageParams>): Promise<{ segments: string[] }> {
  return paramsPromise.then((params) => ({
    segments: Array.isArray(params.segments) ? params.segments : [],
  }));
}

function normalizeSearchParams(
  searchParamsPromise: Promise<Record<string, string | string[] | undefined>>,
): Promise<PayloadSearchParams> {
  return searchParamsPromise.then((searchParams) =>
    Object.fromEntries(
      Object.entries(searchParams).filter(
        (entry): entry is [string, string | string[]] => entry[1] !== undefined,
      ),
    ),
  );
}

export const generateMetadata = ({ params, searchParams }: PageProps) =>
  generatePageMetadata({
    config: configPromise,
    params,
    searchParams: normalizeSearchParams(searchParams),
  });

export default function PayloadAdminPage({ params, searchParams }: PageProps) {
  return RootPage({
    config: configPromise,
    importMap,
    params: normalizeParams(params),
    searchParams: normalizeSearchParams(searchParams),
  });
}
