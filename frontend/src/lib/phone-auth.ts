import type { SupabaseClient } from "@supabase/supabase-js";

type PhoneAuthMode = "signup" | "login";

const MANUAL_PHONE_LOGIN_OTP = "246810";
const MANUAL_PHONE_SIGNUP_OTP = "135790";
const MANUAL_PHONE_AUTH_PASSWORD = "ProcureGridPhoneAuth#246810";
const MANUAL_PHONE_AUTH_ENABLED = true;

function getManualPhoneAuthEmail(phone: string) {
  const normalized = phone.replace(/[^\d]/g, "");
  return `phone-${normalized}@phone-auth.procuregrid.local`;
}

export type BeginPhoneAuthParams = {
  supabase: SupabaseClient;
  phone: string;
  fullName?: string | null;
  mode: PhoneAuthMode;
};

export type VerifyPhoneAuthParams = {
  supabase: SupabaseClient;
  phone: string;
  code: string;
  mode: PhoneAuthMode;
};

export type CompletePhoneSignupParams = {
  supabase: SupabaseClient;
  phone: string;
  fullName?: string | null;
};

export function isManualPhoneAuthEnabled() {
  return MANUAL_PHONE_AUTH_ENABLED;
}

function isAlreadyRegisteredError(message: string | undefined) {
  const normalized = message?.toLowerCase() ?? "";
  return (
    normalized.includes("already registered") ||
    normalized.includes("already exists") ||
    normalized.includes("user already registered") ||
    normalized.includes("already been registered")
  );
}

export async function beginPhoneAuth({ supabase, phone, fullName, mode }: BeginPhoneAuthParams) {
  if (MANUAL_PHONE_AUTH_ENABLED) {
    return {
      data: null,
      error: null,
      delivery: "manual" as const,
    };
  }

  const { data, error } = await supabase.auth.signInWithOtp({
    phone,
    options: {
      ...(mode === "signup"
        ? {
            data: {
              ...(fullName ? { full_name: fullName } : {}),
              auth_identifier_type: "phone",
            },
            shouldCreateUser: true,
          }
        : {}),
      channel: "sms",
    },
  });

  return {
    data,
    error,
    delivery: "provider" as const,
  };
}

export async function verifyPhoneAuth({ supabase, phone, code, mode }: VerifyPhoneAuthParams) {
  if (MANUAL_PHONE_AUTH_ENABLED) {
    const expectedCode = mode === "signup" ? MANUAL_PHONE_SIGNUP_OTP : MANUAL_PHONE_LOGIN_OTP;

    if (code !== expectedCode) {
      return {
        error: new Error("Invalid verification code."),
      };
    }

    if (mode === "signup") {
      return { error: null };
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: getManualPhoneAuthEmail(phone),
      password: MANUAL_PHONE_AUTH_PASSWORD,
    });

    return { error };
  }

  const { error } = await supabase.auth.verifyOtp({
    phone,
    token: code,
    type: mode === "signup" ? "sms" : "sms",
  });

  return { error };
}

export async function completePhoneSignup({
  supabase,
  phone,
  fullName,
}: CompletePhoneSignupParams) {
  const email = getManualPhoneAuthEmail(phone);

  const { error: signUpError } = await supabase.auth.signUp({
    email,
    password: MANUAL_PHONE_AUTH_PASSWORD,
    options: {
      data: {
        ...(fullName ? { full_name: fullName } : {}),
        phone,
        auth_identifier_type: "phone",
      },
    },
  });

  if (signUpError) {
    if (!isAlreadyRegisteredError(signUpError.message)) {
      return { error: signUpError };
    }
  }

  const { error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password: MANUAL_PHONE_AUTH_PASSWORD,
  });

  return { error: signInError };
}
