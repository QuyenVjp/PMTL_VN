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
  "auth.email_verification.sent",
  "auth.email_verification.completed",
  
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
  "content.unpublish",
  "content.archive",
  "content.delete",
  
  // Media actions
  "media.upload",
  "media.delete",
  "media.folder.create",
  "media.folder.update",
  "media.folder.delete",
  "media.folder.move_asset",
  
  // Admin actions
  "admin.feature_flag.update",
  "admin.user.role_change",
  "admin.user.status_change",

  // Calendar admin actions
  "admin.calendar_event.create",
  "admin.calendar_event.update",
  "admin.calendar_event.delete",
  "admin.calendar_event.publish",
  "admin.calendar_event.reschedule",
  "admin.calendar_event.cancel",
  "admin.calendar_event.agenda_item.create",
  "admin.calendar_event.agenda_item.update",
  "admin.calendar_event.agenda_item.delete",
  "admin.calendar_event.agenda_item.reorder",

  // Community actions
  "admin.community_post.update",
  "admin.community_post.delete",
  "admin.guestbook.create",
  "admin.guestbook.update",
  "admin.guestbook.delete",

  // Community public social actions
  "community.heart.add",
  "community.heart.remove",
  "community.comment.create",
  "community.report.create",
  "community.guestbook.create",
  "community.testimonial.published",

  // Notification actions
  "admin.push_job.create",
  "admin.push_job.redrive",
  "admin.push_job.delete",

  // Member notification actions
  "member.preferences.update",
  "member.push.subscribe",
  "member.push.unsubscribe",
  "member.practice_reminder.update",
  "member.event_reminder.update",

  // Search actions
  "search.reindex.batch",
  "search.sync.failure",

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
  
  // Wisdom AI assist actions
  "admin.wisdom.ai.slug_suggest",
  "admin.wisdom.ai.translation_draft",
  "admin.wisdom.duplicate_check",
  "admin.wisdom.offline_bundle.rebuild",

  // Practice support actions
  "admin.practice_support.update",
  "admin.self_cultivation.guide.create",
  "admin.self_cultivation.guide.update",
  "admin.self_cultivation.faq.create",
  "admin.self_cultivation.faq.update",
  "admin.self_cultivation.publish",
  "admin.self_cultivation.unpublish",
  "admin.little_house.guide.create",
  "admin.little_house.guide.update",
  "admin.little_house.variant.create",
  "admin.little_house.variant.update",
  "admin.little_house.faq.create",
  "admin.little_house.faq.update",
  "admin.little_house.publish",
  "admin.little_house.unpublish",
  "admin.life_release.guide.create",
  "admin.life_release.guide.update",
  "admin.life_release.variant.create",
  "admin.life_release.variant.update",
  "admin.life_release.faq.create",
  "admin.life_release.faq.update",
  "admin.life_release.publish",
  "admin.life_release.unpublish",

  // Vow / merit actions
  "admin.vow.create",
  "admin.vow.update",
  "admin.vow.progress",
  "vow.create",
  "vow.progress",
  "vow.fulfill",
  "vow.milestone",
  "merit.transfer",
  "admin.life_release.create",
  "member.altar_item.create",
  "admin.altar_item.condition",
  "member.altar_validation.fail",

  // Dharma compliance actions
  "admin.charity.create",
  "admin.charity.status_update",
  "admin.charity.rule.update",
  "admin.fraud_alert.resolve",
  "admin.guidance.respond",
  "charity.content_violation_detected",
  "charity.fraud_escalation_alert",
  "member.vow.register",
  "member.vow.violation",
  "member.vow.repeat_violation_escalate",

  // Buddhist events actions
  "admin.event.create",
  "admin.event.update",
  "member.event.register",
  "member.event.cancel",

  // Life liberation actions
  "admin.life_release.status",
  "member.life_release.create",
  "member.life_release.predatory_blocked",
  "member.life_release.proxy_add",

  // Little house (sớ) actions
  "admin.lh.advance",
  "admin.lh.combust",
  "admin.lh.dotting_start",
  "admin.lh.fraud_flag",
  "admin.lh.fraud_resolve",
  "member.lh.create",
  "member.lh.burn.pre_check_passed",
  "member.lh.burn.completed",

  // Sacred forms actions
  "admin.sacred_form_template.create",
  "admin.sacred_form_template.toggle",
  "admin.sacred_form.review",
  "admin.sacred_form.approve",
  "admin.sacred_form.reject",
  "admin.sacred_form.burn",
  "admin.disposal_polarity.create",
  "member.sacred_form.submit",

  // Moderation actions
  "moderation.report.submitted",
  "moderation.report.resolved",
  "moderation.comment.hidden",
  "moderation.comment.restored",
  "moderation.summary.recomputed",

  // Charity lifecycle actions
  "admin.charity.verify",
  "admin.charity.suspend",
  "admin.charity.revoke",
  "admin.charity.rule.create",
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
