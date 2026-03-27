export type NotificationType =
  | "comment_reply"
  | "post_approved"
  | "post_rejected"
  | "new_event"
  | "vow_reminder"
  | "system_announcement";

export type Notification = {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  isRead: boolean;
  linkTo?: string;
  createdAt: string;
};
