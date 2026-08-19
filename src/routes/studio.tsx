import { createFileRoute, redirect } from "@tanstack/react-router";

/** Canonical studio URL is /design-studio; /studio is kept as a stable alias. */
export const Route = createFileRoute("/studio")({
  beforeLoad: ({ search }) => {
    throw redirect({ to: "/design-studio", search: search as never, replace: true });
  },
});
