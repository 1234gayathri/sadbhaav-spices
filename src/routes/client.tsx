import { createFileRoute, Outlet } from "@tanstack/react-router";
import { ClientNav, ClientFooter } from "@/components/client/Nav";

export const Route = createFileRoute("/client")({
  component: ClientLayout,
});

function ClientLayout() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <ClientNav />
      <main className="flex-1">
        <Outlet />
      </main>
      <ClientFooter />
    </div>
  );
}
