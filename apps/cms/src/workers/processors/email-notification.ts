import type { EmailNotificationJob } from "@pmtl/shared";
import type { Payload } from "payload";
import nodemailer from "nodemailer";

function buildTransport() {
  const host = process.env.SMTP_HOST?.trim();
  const port = Number(process.env.SMTP_PORT ?? "587");

  if (!host || !port) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: process.env.SMTP_SECURE === "true",
    ...(process.env.SMTP_USER
      ? {
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD ?? "",
          },
        }
      : {}),
  });
}

function uniqueStrings(values: Array<string | null | undefined>) {
  return Array.from(new Set(values.map((value) => value?.trim()).filter((value): value is string => Boolean(value))));
}

async function resolveRoleRecipients(payload: Payload, job: EmailNotificationJob) {
  if (!job.recipientRoles?.length) {
    return [];
  }

  const result = await payload.find({
    collection: "users",
    depth: 0,
    limit: 200,
    overrideAccess: true,
    where: {
      role: {
        in: job.recipientRoles,
      },
      isBlocked: {
        not_equals: true,
      },
    },
  });

  const excludedIds = new Set((job.excludeUserIds ?? []).map((value) => String(value)));

  return result.docs
    .filter((user) => !excludedIds.has(String(user.id)))
    .map((user) => user.email)
    .filter((email): email is string => Boolean(email?.trim()));
}

export async function runEmailNotificationJob(payload: Payload, input: EmailNotificationJob) {
  const transport = buildTransport();

  if (!transport) {
    return { skipped: true, reason: "smtp-not-configured" };
  }

  const recipients = uniqueStrings([...(input.to ?? []), ...(await resolveRoleRecipients(payload, input))]);

  if (!recipients.length) {
    return { skipped: true, reason: "no-recipients" };
  }

  const fromEmail = process.env.SMTP_FROM_EMAIL?.trim() || process.env.SMTP_USER?.trim();

  if (!fromEmail) {
    return { skipped: true, reason: "smtp-from-missing" };
  }

  const fromName = process.env.SMTP_FROM_NAME?.trim() || "PMTL_VN";

  await transport.sendMail({
    from: `${fromName} <${fromEmail}>`,
    to: recipients.join(", "),
    subject: input.subject,
    text: input.text,
    ...(input.html ? { html: input.html } : {}),
  });

  return {
    sent: true,
    recipients: recipients.length,
  };
}
