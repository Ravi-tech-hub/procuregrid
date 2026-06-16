import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { getSupabaseBrowserClient } from "@/lib/supabase";

type CompanyRecord = {
  id: string;
  name: string;
  company_type: "buyer" | "supplier" | "hybrid";
  gst_number: string | null;
  pan_number: string | null;
  industry_category: string | null;
};

type MembershipRecord = {
  id: string;
  company_id: string;
  user_id: string;
  role: "company_admin" | "buyer_procurement" | "buyer_finance" | "supplier_operator";
  status: "invited" | "active" | "disabled";
  company: CompanyRecord | CompanyRecord[] | null;
};

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  membership: MembershipRecord | null;
  company: CompanyRecord | null;
  loading: boolean;
  refreshMembership: () => Promise<{
    membership: MembershipRecord | null;
    company: CompanyRecord | null;
  }>;
  refreshSession: () => Promise<{
    session: Session | null;
    user: User | null;
  }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function normalizeCompany(company: MembershipRecord["company"]): CompanyRecord | null {
  if (!company) return null;
  return Array.isArray(company) ? (company[0] ?? null) : company;
}

function withTimeout<T>(promise: PromiseLike<T>, ms: number, message: string) {
  return new Promise<T>((resolve, reject) => {
    const timeoutId = window.setTimeout(() => reject(new Error(message)), ms);

    Promise.resolve(promise)
      .then((value) => {
        window.clearTimeout(timeoutId);
        resolve(value);
      })
      .catch((error) => {
        window.clearTimeout(timeoutId);
        reject(error);
      });
  });
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [membership, setMembership] = useState<MembershipRecord | null>(null);
  const [company, setCompany] = useState<CompanyRecord | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadMembership(nextUser: User | null) {
    if (!nextUser) {
      return { membership: null, company: null };
    }

    const supabase = getSupabaseBrowserClient();

    const { data, error } = await withTimeout(
      supabase
        .from("company_memberships")
        .select("id, company_id, user_id, role, status")
        .eq("user_id", nextUser.id)
        .eq("status", "active")
        .limit(1),
      10000,
      "Membership lookup timed out.",
    );

    if (error || !data?.length) {
      return { membership: null, company: null };
    }

    const nextMembership = data[0] as MembershipRecord;

    const { data: companyData, error: companyError } = await withTimeout(
      supabase.from("companies").select("*").eq("id", nextMembership.company_id).limit(1),
      10000,
      "Company lookup timed out.",
    );

    const nextCompany =
      companyError || !companyData?.length ? null : (companyData[0] as CompanyRecord);
    return { membership: nextMembership, company: nextCompany };
  }

  async function refreshMembership() {
    const nextState = await loadMembership(user);
    setMembership(nextState.membership);
    setCompany(nextState.company);
    return nextState;
  }

  function setAuthSession(nextSession: Session | null) {
    setSession(nextSession);
    setUser(nextSession?.user ?? null);

    if (!nextSession?.user) {
      setMembership(null);
      setCompany(null);
    }
  }

  async function refreshSession() {
    const supabase = getSupabaseBrowserClient();
    const {
      data: { session: currentSession },
    } = await supabase.auth.getSession();

    setAuthSession(currentSession);

    return {
      session: currentSession,
      user: currentSession?.user ?? null,
    };
  }

  async function signOut() {
    const supabase = getSupabaseBrowserClient();
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setMembership(null);
    setCompany(null);
  }

  useEffect(() => {
    let mounted = true;

    async function bootstrap() {
      try {
        if (!mounted) return;
        const supabase = getSupabaseBrowserClient();
        const {
          data: { session: currentSession },
        } = await supabase.auth.getSession();

        if (!mounted) return;
        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        if (!currentSession?.user) {
          setMembership(null);
          setCompany(null);
        }
      } catch (_error) {
        if (!mounted) return;
        setSession(null);
        setUser(null);
        setMembership(null);
        setCompany(null);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    bootstrap();

    const supabase = getSupabaseBrowserClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!mounted) return;

      setAuthSession(nextSession);
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function syncMembershipFromUser() {
      if (!user) {
        setMembership(null);
        setCompany(null);
        return;
      }

      try {
        const nextState = await loadMembership(user);
        if (cancelled) return;

        setMembership(nextState.membership);
        setCompany(nextState.company);
      } catch (_error) {
        if (cancelled) return;
        setMembership(null);
        setCompany(null);
      }
    }

    syncMembershipFromUser();

    return () => {
      cancelled = true;
    };
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        membership,
        company,
        loading,
        refreshMembership,
        refreshSession,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
