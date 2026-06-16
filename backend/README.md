# Backend

ProcureGrid currently uses TanStack Start server capabilities and Supabase rather than a standalone
backend service.

Future privileged business logic may be introduced here when it cannot safely or cleanly live in
the web application, Supabase database functions, or edge functions. Do not duplicate authentication,
authorization, or tenant rules across services without an explicit architecture decision.
