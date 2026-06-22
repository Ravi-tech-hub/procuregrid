export type AuthIdentifierType = "email" | "phone";

export type ParsedAuthIdentifier = {
  type: AuthIdentifierType;
  value: string;
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const E164_PHONE_REGEX = /^\+[1-9]\d{7,14}$/;
export const EMAIL_PATTERN = String.raw`^[^\s@]+@[^\s@]+\.[^\s@]+$`;

function cleanPhoneNumber(raw: string) {
  const trimmed = raw.trim();

  if (!trimmed) return "";

  const normalized = trimmed.replace(/[\s()-]/g, "").replace(/^00/, "+");

  return normalized;
}

function normalizeEmail(raw: string) {
  return raw.trim().toLowerCase();
}

export function normalizePhoneNumber(raw: string) {
  const normalized = cleanPhoneNumber(raw);
  return E164_PHONE_REGEX.test(normalized) ? normalized : null;
}

export function buildE164PhoneNumber(
  country: { name: string; dialCode: string; minLength: number; maxLength: number },
  raw: string,
) {
  const trimmed = raw.trim();

  if (!trimmed) {
    return { error: `Enter a phone number for ${country.name}.` } as const;
  }

  if (trimmed.startsWith("+")) {
    const normalized = normalizePhoneNumber(trimmed);
    return normalized
      ? ({ value: normalized } as const)
      : ({ error: "Enter a valid international phone number." } as const);
  }

  const nationalDigits = trimmed.replace(/\D/g, "").replace(/^0+/, "");

  if (!nationalDigits) {
    return { error: `Enter a phone number for ${country.name}.` } as const;
  }

  if (nationalDigits.length < country.minLength || nationalDigits.length > country.maxLength) {
    const expected =
      country.minLength === country.maxLength
        ? `${country.minLength} digits`
        : `${country.minLength}-${country.maxLength} digits`;

    return {
      error: `Phone numbers for ${country.name} must contain ${expected}.`,
    } as const;
  }

  return {
    value: `+${country.dialCode}${nationalDigits}`,
  } as const;
}

export function parseIdentifierByType(
  type: AuthIdentifierType,
  raw: string,
): ParsedAuthIdentifier | null {
  if (type === "email") {
    const normalized = normalizeEmail(raw);
    return EMAIL_REGEX.test(normalized) ? { type, value: normalized } : null;
  }

  const normalized = normalizePhoneNumber(raw);
  return normalized ? { type, value: normalized } : null;
}
