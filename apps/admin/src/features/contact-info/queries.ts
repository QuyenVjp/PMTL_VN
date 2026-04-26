import { queryOptions } from "@tanstack/react-query";
import { adminClient } from "@/lib/api/admin-client.js";

export interface ContactInfo {
  publicId: string;
  title: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  socialLinks: Record<string, string> | null;
}

export const contactInfoKeys = {
  all: ["admin-contact-info"] as const,
  lists: () => [...contactInfoKeys.all, "list"] as const,
  list: () => [...contactInfoKeys.lists()] as const,
  details: () => [...contactInfoKeys.all, "detail"] as const,
  detail: () => [...contactInfoKeys.details(), "singleton"] as const,
};

export function contactInfoOptions() {
  return queryOptions({
    queryKey: contactInfoKeys.detail(),
    queryFn: () => adminClient.get<ContactInfo>("/admin/contact-info"),
  });
}
