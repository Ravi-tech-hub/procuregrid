import type { SupabaseClient } from "@supabase/supabase-js";
import { createSupabaseEphemeralClient } from "@/lib/supabase";

type EmailAuthMode = "signup" | "login";

type PendingEmailSignup = {
  email: string;
  fullName: string;
  password: string;
};

const PENDING_EMAIL_SIGNUP_KEY = "procuregrid.pendingEmailSignup";

function getStorage() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.sessionStorage;
}

function storePendingEmailSignup(payload: PendingEmailSignup) {
  const storage = getStorage();
  storage?.setItem(PENDING_EMAIL_SIGNUP_KEY, JSON.stringify(payload));
}

export function getPendingEmailSignup() {
  const storage = getStorage();
  const rawValue = storage?.getItem(PENDING_EMAIL_SIGNUP_KEY);

  if (!rawValue) {
    return null;
  }

  try {
    const parsed = JSON.parse(rawValue) as Partial<PendingEmailSignup>;
    if (
      typeof parsed.email !== "string" ||
      typeof parsed.fullName !== "string" ||
      typeof parsed.password !== "string"
    ) {
      return null;
    }

    return parsed as PendingEmailSignup;
  } catch {
    return null;
  }
}

export function clearPendingEmailSignup() {
  const storage = getStorage();
  storage?.removeItem(PENDING_EMAIL_SIGNUP_KEY);
}

export async function beginEmailAuth({
  supabase,
  email,
  fullName,
  password,
  mode,
}: {
  supabase: SupabaseClient;
  email: string;
  fullName?: string;
  password?: string;
  mode: EmailAuthMode;
}) {
  if (mode === "signup") {
    if (!fullName || !password) {
      return {
        error: new Error("Missing full name or password for email signup."),
      };
    }

    storePendingEmailSignup({ email, fullName, password });
  } else {
    const verificationClient = createSupabaseEphemeralClient();
    const { error: signInError } = await verificationClient.auth.signInWithPassword({
      email,
      password: password ?? "",
    });

    if (signInError) {
      return { error: signInError };
    }

    await verificationClient.auth.signOut();
  }

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: mode === "signup",
      ...(mode === "signup"
        ? {
            data: {
              full_name: fullName,
              auth_identifier_type: "email",
            },
          }
        : {}),
    },
  });

  if (error && mode === "signup") {
    clearPendingEmailSignup();
  }

  return { error };
}

export async function verifyEmailAuth({
  supabase,
  email,
  code,
  mode,
}: {
  supabase: SupabaseClient;
  email: string;
  code: string;
  mode: EmailAuthMode;
}) {
  const { error } = await supabase.auth.verifyOtp({
    email,
    token: code,
    type: "email",
  });

  if (error) {
    return { error };
  }

  if (mode !== "signup") {
    return { error: null };
  }

  const pendingSignup = getPendingEmailSignup();
  if (!pendingSignup || pendingSignup.email !== email) {
    return {
      error: new Error("Email signup details expired. Please start account creation again."),
    };
  }

  const { error: updateUserError } = await supabase.auth.updateUser({
    password: pendingSignup.password,
    data: {
      full_name: pendingSignup.fullName,
      auth_identifier_type: "email",
    },
  });

  if (updateUserError) {
    return { error: updateUserError };
  }

  clearPendingEmailSignup();

  return { error: null, fullName: pendingSignup.fullName };
}
