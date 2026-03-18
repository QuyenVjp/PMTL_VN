import path from "node:path";

import { getEnvValue, isPlaceholderEnvValue, parseSimpleEnvFile } from "./env-utils";

const rootDir = process.cwd();
const envFile = process.env.MONITORING_ENV_FILE ?? path.join(rootDir, "infra/docker/.env.prod");
const envFileValues = parseSimpleEnvFile(envFile);
const botToken = getEnvValue("ALERT_TELEGRAM_BOT_TOKEN", envFileValues, "");
const chatId = getEnvValue("ALERT_TELEGRAM_CHAT_ID", envFileValues, "");
const message =
  process.env.TELEGRAM_TEST_MESSAGE
  ?? `PMTL kiểm tra gửi cảnh báo Telegram lúc ${new Date().toISOString()}`;

async function main() {
  if (isPlaceholderEnvValue(botToken) || isPlaceholderEnvValue(chatId)) {
    throw new Error("Telegram bot token/chat id are not configured with real values.");
  }

  const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      chat_id: chatId,
      text: message,
      parse_mode: "HTML",
      disable_web_page_preview: true,
    }),
  });

  const body = (await response.json().catch(() => ({}))) as Record<string, unknown>;

  if (!response.ok || body.ok !== true) {
    throw new Error(`Telegram test failed (${response.status}): ${JSON.stringify(body)}`);
  }

  console.log(
    JSON.stringify(
      {
        ok: true,
        chatId,
        messageId:
          typeof body.result === "object" && body.result && typeof (body.result as Record<string, unknown>).message_id === "number"
            ? (body.result as Record<string, unknown>).message_id
            : null,
      },
      null,
      2,
    ),
  );
}

void main().catch((error) => {
  console.error(
    JSON.stringify(
      {
        ok: false,
        error: error instanceof Error ? error.message : String(error),
      },
      null,
      2,
    ),
  );
  process.exit(1);
});
