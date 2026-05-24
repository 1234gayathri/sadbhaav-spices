import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/client")({
  loader: () => {
    throw redirect({ to: "/", replace: true });
  },
});
