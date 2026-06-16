import type { User } from "@supabase/supabase-js";
import { getSupabaseBrowserClient } from "@/lib/supabase";

export async function upsertProfileForUser(
  user: User,
  profile:
    | {
        fullName: string | null;
        authIdentifierType: "email";
        contactEmail: string;
        contactPhoneE164: null;
      }
    | {
        fullName: string | null;
        authIdentifierType: "phone";
        contactEmail: null;
        contactPhoneE164: string;
      },
) {
  const supabase = getSupabaseBrowserClient();

  return supabase.from("profiles").upsert({
    id: user.id,
    full_name: profile.fullName,
    auth_identifier_type: profile.authIdentifierType,
    contact_email: profile.contactEmail,
    contact_phone_e164: profile.contactPhoneE164,
  });
}
