export const PASSWORD_MIN_LENGTH = 9;
export const PASSWORD_MAX_LENGTH = 128;

export type PasswordRequirement = {
  id: "length" | "uppercase" | "lowercase" | "number" | "special";
  isMet: boolean;
};

export function getPasswordRequirements(password: string): PasswordRequirement[] {
  return [
    {
      id: "length",
      isMet: password.length >= PASSWORD_MIN_LENGTH && password.length <= PASSWORD_MAX_LENGTH,
    },
    { id: "uppercase", isMet: /[A-Z]/.test(password) },
    { id: "lowercase", isMet: /[a-z]/.test(password) },
    { id: "number", isMet: /\d/.test(password) },
    { id: "special", isMet: /[^A-Za-z0-9\s]/.test(password) },
  ];
}

export function isPasswordValid(password: string) {
  return getPasswordRequirements(password).every((requirement) => requirement.isMet);
}
