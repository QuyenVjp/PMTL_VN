const ENCODING = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";

function encodeTimePart(time: number, length: number): string {
  let value = time;
  let output = "";

  for (let index = 0; index < length; index += 1) {
    output = ENCODING[value % 32] + output;
    value = Math.floor(value / 32);
  }

  return output;
}

function encodeRandomPart(length: number): string {
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  let output = "";

  for (const byte of bytes) {
    output += ENCODING[byte % 32];
  }

  return output;
}

export function createPublicId(prefix?: string): string {
  const timestamp = encodeTimePart(Date.now(), 10);
  const random = encodeRandomPart(16);
  const base = `${timestamp}${random}`;

  return prefix ? `${prefix}_${base}` : base;
}
