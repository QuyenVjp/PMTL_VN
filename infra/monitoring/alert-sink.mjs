import { createServer } from "node:http";

let lastPayload = null;

function writeJson(response, statusCode, body) {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  response.end(JSON.stringify(body));
}

const server = createServer((request, response) => {
  if (request.method === "GET" && request.url === "/health") {
    writeJson(response, 200, { ok: true });
    return;
  }

  if (request.method === "GET" && request.url === "/last") {
    if (!lastPayload) {
      writeJson(response, 404, { ok: false, error: "No alerts received yet." });
      return;
    }

    writeJson(response, 200, lastPayload);
    return;
  }

  if (request.method === "DELETE" && request.url === "/alerts") {
    lastPayload = null;
    writeJson(response, 200, { ok: true, cleared: true });
    return;
  }

  if (request.method === "POST" && request.url === "/alerts") {
    const chunks = [];

    request.on("data", (chunk) => {
      chunks.push(chunk);
    });

    request.on("end", () => {
      const raw = Buffer.concat(chunks).toString("utf8");

      try {
        const parsed = JSON.parse(raw);
        lastPayload = {
          ...(typeof parsed === "object" && parsed ? parsed : { payload: parsed }),
          receivedAt: new Date().toISOString(),
        };
        writeJson(response, 200, { ok: true });
      } catch (error) {
        writeJson(response, 400, {
          ok: false,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    });

    return;
  }

  writeJson(response, 404, { ok: false, error: "Not found" });
});

server.listen(8080, "0.0.0.0", () => {
  console.log(JSON.stringify({ ok: true, service: "alert-sink", port: 8080 }));
});
