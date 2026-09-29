import { redirect } from "next/navigation";

// Events now live under Trending → Eventos.
export default function EventosPage() {
  redirect("/trending");
}
