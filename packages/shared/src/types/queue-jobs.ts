export type SearchSyncJob = {
  entityType: "post";
  documentId?: string | number | null;
  publicId?: string | null;
  document?: Record<string, unknown> | null;
};

export type PushDispatchJob = {
  pushJobId: string;
};

export type EmailNotificationJob = {
  to?: string[];
  recipientRoles?: string[];
  excludeUserIds?: Array<string | number>;
  subject: string;
  text: string;
  html?: string;
};
