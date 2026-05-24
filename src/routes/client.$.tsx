import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/client/$")({
  loader: ({ params }) => {
    const splat = params._splat;
    throw redirect({ to: `/${splat}` as any, replace: true });
  },
});
