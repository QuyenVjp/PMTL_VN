export type ContactSubject = "general" | "feedback" | "support" | "partnership" | "report";
export type ContactStatus = "new" | "in_progress" | "resolved" | "closed";

export type ContactEntry = {
  id: string;
  name: string;
  email: string;
  subject: ContactSubject;
  message: string;
  status: ContactStatus;
  createdAt: string;
  resolvedAt?: string;
};
