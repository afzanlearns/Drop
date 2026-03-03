import { randomBytes } from "crypto";

// Exclude ambiguous characters: 0, O, I, l, 1
const CHARSET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789abcdefghjkmnpqrstuvwxyz";
const CODE_LENGTH = 8;

export function generateRoomCode(): string {
  const bytes = randomBytes(CODE_LENGTH * 2);
  let code = "";
  for (let i = 0; i < bytes.length && code.length < CODE_LENGTH; i++) {
    const byte = bytes[i];
    const index = byte % CHARSET.length;
    // Skip if byte would create bias (values above largest multiple of CHARSET.length)
    if (byte < Math.floor(256 / CHARSET.length) * CHARSET.length) {
      code += CHARSET[index];
    }
  }
  // Fallback: pad if needed
  while (code.length < CODE_LENGTH) {
    const extra = randomBytes(4);
    for (const b of extra) {
      if (code.length < CODE_LENGTH && b < Math.floor(256 / CHARSET.length) * CHARSET.length) {
        code += CHARSET[b % CHARSET.length];
      }
    }
  }
  return code;
}

export function validateRoomCode(code: string): boolean {
  if (code.length !== CODE_LENGTH) return false;
  return [...code].every((c) => CHARSET.includes(c));
}
