import { createFileRoute, redirect } from "@tanstack/react-router";

/** Alias so /account/reset-password lands on the real password reset flow. */
export const Route = createFileRoute("/account_/reset-password")({
  beforeLoad: () => {
    throw redirect({ to: "/reset-password", replace: true });
  },
});
