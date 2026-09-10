import { createFileRoute } from "@tanstack/react-router";
import { MizanApp } from "@/components/mizan/mizan-app.tsx";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return <MizanApp />;
}
