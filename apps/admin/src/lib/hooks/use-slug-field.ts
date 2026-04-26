/**
 * useSlugField — Strapi v5-style slug field behaviour.
 *
 * - Auto-generates a slug from `title` as the user types (debounced 600 ms).
 * - Stops auto-generating once the user manually edits the slug directly.
 * - Calls the API to check uniqueness whenever the slug changes (debounced 400 ms).
 * - Returns status: "idle" | "checking" | "available" | "taken".
 *
 * Usage:
 *   const { slug, setSlug, slugStatus, SlugStatusIcon } = useSlugField({
 *     title,
 *     entityType: "WISDOM",        // or "POST" | "GUIDE"
 *     excludePublicId: entry?.publicId,  // omit on create
 *   });
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { adminClient } from "@/lib/api/admin-client";

export type SlugEntityType = "WISDOM" | "POST" | "GUIDE" | "MEDIA_COLLECTION" | "SELF_CULTIVATION_GUIDE";
export type SlugStatus = "idle" | "checking" | "available" | "taken";

interface UseSlugFieldOptions {
  title: string;
  entityType: SlugEntityType;
  excludePublicId?: string;
  /** Initial slug value (edit pages). Passing this also sets manual mode. */
  initialSlug?: string;
}

interface SlugCheckResponse {
  available: boolean;
}

function toSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .substring(0, 80);
}

function slugCheckUrl(slug: string, entityType: SlugEntityType, excludePublicId?: string): string {
  const params = new URLSearchParams({ slug });

  if (entityType === "WISDOM") {
    if (excludePublicId) params.set("excludePublicId", excludePublicId);
    return `/admin/wisdom/entries/slug-check?${params.toString()}`;
  }
  if (entityType === "MEDIA_COLLECTION") {
    if (excludePublicId) params.set("excludePublicId", excludePublicId);
    return `/admin/content/media-library/collections/slug-check?${params.toString()}`;
  }
  if (entityType === "SELF_CULTIVATION_GUIDE") {
    // Self-cultivation uses current slug as excludeSlug (slug is the stable identifier, not publicId)
    if (excludePublicId) params.set("excludeSlug", excludePublicId);
    return `/content/self-cultivation/slug-check?${params.toString()}`;
  }
  // POST | GUIDE
  if (excludePublicId) params.set("excludePublicId", excludePublicId);
  params.set("type", entityType);
  return `/content/admin/slug-check?${params.toString()}`;
}

export function useSlugField({ title, entityType, excludePublicId, initialSlug }: UseSlugFieldOptions) {
  const [slug, setSlugRaw] = useState(initialSlug ?? "");
  // Track whether user manually edited the slug (stops auto-generation)
  const [isManual, setIsManual] = useState(Boolean(initialSlug));
  // Debounced slug sent to the check query
  const [debouncedSlug, setDebouncedSlug] = useState(initialSlug ?? "");
  const lastInitialSlugRef = useRef(initialSlug ?? "");

  useEffect(() => {
    const nextInitialSlug = initialSlug ?? "";
    if (!nextInitialSlug || nextInitialSlug === lastInitialSlugRef.current) return;
    lastInitialSlugRef.current = nextInitialSlug;
    setIsManual(true);
    setSlugRaw(nextInitialSlug);
    setDebouncedSlug(nextInitialSlug);
  }, [initialSlug]);

  // Debounce title → auto-slug (600 ms)
  const titleDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (isManual) return;
    if (titleDebounceRef.current) clearTimeout(titleDebounceRef.current);
    titleDebounceRef.current = setTimeout(() => {
      const generated = toSlug(title);
      setSlugRaw(generated);
    }, 600);
    return () => {
      if (titleDebounceRef.current) clearTimeout(titleDebounceRef.current);
    };
  }, [title, isManual]);

  // Debounce slug → uniqueness check (400 ms)
  const slugDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (slugDebounceRef.current) clearTimeout(slugDebounceRef.current);
    slugDebounceRef.current = setTimeout(() => setDebouncedSlug(slug), 400);
    return () => {
      if (slugDebounceRef.current) clearTimeout(slugDebounceRef.current);
    };
  }, [slug]);

  const { data, isFetching } = useQuery<SlugCheckResponse>({
    queryKey: ["slug-check", entityType, debouncedSlug, excludePublicId],
    queryFn: () => adminClient.get<SlugCheckResponse>(slugCheckUrl(debouncedSlug, entityType, excludePublicId)),
    enabled: debouncedSlug.length >= 2,
    staleTime: 10_000,
    retry: false,
  });

  const isCurrentRecordSlug = Boolean(initialSlug && excludePublicId && debouncedSlug === initialSlug);

  const slugStatus: SlugStatus =
    debouncedSlug.length < 2
      ? "idle"
      : isCurrentRecordSlug
        ? "available"
      : isFetching || slug !== debouncedSlug
        ? "checking"
        : data?.available === true
          ? "available"
          : data?.available === false
            ? "taken"
            : "idle";

  const setSlug = useCallback((value: string) => {
    setIsManual(true);
    setSlugRaw(value);
  }, []);

  /** Call when the form resets (e.g. after save) to restore auto-generate mode. */
  const resetSlug = useCallback(() => {
    setIsManual(false);
    setSlugRaw("");
  }, []);

  return { slug, setSlug, resetSlug, slugStatus };
}
