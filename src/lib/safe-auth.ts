import { supabase } from "@/integrations/supabase/client";

/**
 * Safely sign a user in with email + password.
 *
 * Wraps `supabase.auth.signInWithPassword` in try/catch so that
 * network failures don't bubble up as unhandled exceptions.
 *
 * Caller (a Login form) should display `result.error.message` in a banner
 * rather than failing silently.
 */
export async function safeSignInWithPassword(email: string, password: string) {
  try {
    const result = await supabase.auth.signInWithPassword({ email, password });
    if (result.error) {
      return {
        data: { user: result.data.user, session: result.data.session },
        error: { message: humanizeAuthError(result.error.message, "sign in") },
      };
    }
    return { data: result.data, error: null };
  } catch (err: unknown) {
    return {
      data: { user: null, session: null },
      error: {
        message:
          err instanceof Error
            ? `Network error while trying to sign in: ${err.message}`
            : "Unexpected error while signing in. Please try again.",
      },
    };
  }
}

/**
 * Safely sign a user up with email + password (plus optional user metadata).
 * Same error-shape guarantees as `safeSignInWithPassword`.
 */
export async function safeSignUp(
  email: string,
  password: string,
  options?: { fullName?: string; redirectTo?: string },
) {
  try {
    const result = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: options?.fullName ? { full_name: options.fullName } : undefined,
        emailRedirectTo: options?.redirectTo,
      },
    });
    if (result.error) {
      return {
        data: { user: result.data.user, session: result.data.session },
        error: { message: humanizeAuthError(result.error.message, "sign up") },
      };
    }
    return { data: result.data, error: null };
  } catch (err: unknown) {
    return {
      data: { user: null, session: null },
      error: {
        message:
          err instanceof Error
            ? `Network error while trying to sign up: ${err.message}`
            : "Unexpected error while signing up. Please try again.",
      },
    };
  }
}

function humanizeAuthError(raw: string | undefined, action: string): string {
  if (!raw) return `Unable to ${action}. Please try again.`;
  const lower = raw.toLowerCase();
  if (lower.includes("invalid login credentials")) {
    return "Incorrect email or password.";
  }
  if (lower.includes("email not confirmed")) {
    return "Please confirm your email before signing in.";
  }
  if (lower.includes("user already registered")) {
    return "An account with this email already exists. Try signing in instead.";
  }
  if (lower.includes("password") && lower.includes("short")) {
    return "Password is too short. Use at least 8 characters.";
  }
  if (lower.includes("rate limit")) {
    return "Too many attempts. Please wait a moment and try again.";
  }
  return raw;
}
