function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function buildEmailShell(input: {
  title: string;
  eyebrow: string;
  bodyHtml: string;
  footer?: string;
}) {
  return `
    <div style="margin:0;padding:24px;background:#f5f3ef;font-family:Arial,sans-serif;color:#1f2937;">
      <div style="max-width:640px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e5e7eb;">
        <div style="padding:24px 28px;background:linear-gradient(135deg,#0f766e,#134e4a);color:#f8fafc;">
          <div style="font-size:12px;letter-spacing:0.16em;text-transform:uppercase;opacity:0.88;">${escapeHtml(input.eyebrow)}</div>
          <h1 style="margin:10px 0 0;font-size:24px;line-height:1.3;">${escapeHtml(input.title)}</h1>
        </div>
        <div style="padding:28px;line-height:1.7;font-size:15px;color:#374151;">
          ${input.bodyHtml}
        </div>
        <div style="padding:18px 28px;border-top:1px solid #e5e7eb;font-size:13px;color:#6b7280;background:#fafaf9;">
          ${escapeHtml(input.footer ?? "PMTL_VN")}
        </div>
      </div>
    </div>
  `;
}

export function buildPasswordResetEmail(resetUrl: string) {
  const safeUrl = escapeHtml(resetUrl);

  return buildEmailShell({
    eyebrow: "Bảo mật tài khoản",
    title: "Đặt lại mật khẩu PMTL_VN",
    bodyHtml: `
      <p>Anh/Chị chỉ cần bấm vào nút bên dưới để tạo mật khẩu mới.</p>
      <p style="margin:24px 0;">
        <a href="${safeUrl}" style="display:inline-block;padding:12px 18px;border-radius:10px;background:#0f766e;color:#ffffff;text-decoration:none;font-weight:700;">
          Đặt lại mật khẩu
        </a>
      </p>
      <p>Nếu nút không mở được, hãy copy link này:</p>
      <p><a href="${safeUrl}" style="color:#0f766e;">${safeUrl}</a></p>
      <p>Nếu anh/chị không yêu cầu đặt lại mật khẩu, chỉ cần bỏ qua email này.</p>
    `,
    footer: "Email tự động từ PMTL_VN. Vui lòng không trả lời trực tiếp vào hộp thư này.",
  });
}

export function buildModerationEmail(input: { subject: string; message: string; actionUrl?: string | null }) {
  const safeActionUrl = input.actionUrl ? escapeHtml(input.actionUrl) : null;

  return buildEmailShell({
    eyebrow: "Thông báo hệ thống",
    title: input.subject,
    bodyHtml: `
      <p>${escapeHtml(input.message)}</p>
      ${
        safeActionUrl
          ? `<p style="margin:24px 0;"><a href="${safeActionUrl}" style="display:inline-block;padding:12px 18px;border-radius:10px;background:#0f766e;color:#ffffff;text-decoration:none;font-weight:700;">Xem chi tiet</a></p>`
          : ""
      }
    `,
    footer: "PMTL_VN CMS",
  });
}
