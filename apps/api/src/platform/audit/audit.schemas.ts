import { z } from "zod";

export const auditActionSchema = z.enum([
  // Auth actions
  "auth.login",
  "auth.logout",
  "auth.logout_all",
  "auth.refresh",
  "auth.password_reset_request",
  "auth.password_reset_complete",
  "auth.email_verify",
  
  // User actions
  "user.create",
  "user.update",
  "user.suspend",
  "user.reactivate",
  "user.delete",
  
  // Content actions
  "content.create",
  "content.update",
  "content.publish",
  "content.archive",
  "content.delete",
  
  // Media actions
  "media.upload",
  "media.delete",
  
  // Admin actions
  "admin.feature_flag.update",
  "admin.user.role_change",
  "admin.user.status_change",

  // Calendar admin actions
  "admin.calendar_event.create",
  "admin.calendar_event.update",
  "admin.calendar_event.delete",
  "admin.calendar_event.publish",

  // Community actions
  "admin.community_post.update",
  "admin.community_post.delete",
  "admin.guestbook.create",
  "admin.guestbook.update",
  "admin.guestbook.delete",

  // Notification actions
  "admin.push_job.create",
  "admin.push_job.redrive",
  "admin.push_job.delete",

  // Volunteer/contact actions
  "admin.volunteer.create",
  "admin.volunteer.update",
  "admin.volunteer.delete",
  "admin.contact_info.update",

  // Download actions
  "admin.download.create",
  "admin.download.update",
  "admin.download.delete",
  "admin.download.publish",

  // Guide actions
  "admin.guide.create",
  "admin.guide.update",
  "admin.guide.publish",

  // Vow / merit actions
  "admin.vow.create",
  "admin.vow.update",
  "admin.life_release.create",
]);

export const auditActorTypeSchema = z.enum([
  "user",
  "admin",
  "system",
  "anonymous",
]);

export const createAuditLogSchema = z.object({
  actorId: z.string().optional(),
  actorType: auditActorTypeSchema,
  action: auditActionSchema,
  resource: z.string(),
  resourceId: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
});

export type AuditAction = z.infer<typeof auditActionSchema>;
export type AuditActorType = z.infer<typeof auditActorTypeSchema>;
export type CreateAuditLogInput = z.infer<typeof createAuditLogSchema>;
