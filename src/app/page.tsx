import { TransactionsDashboard } from "@/components/TransactionsDashboard";
import { getCurrentUser } from "@/lib/supabase/queries";
import { redirect } from "next/navigation";

export default async function Home() {
  const user = await getCurrentUser();

  if (!user) {
    // Si no hay usuario autenticado, redirige a la página de login
    return redirect("/auth");
  }

  return (
    <main className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-8 text-center">
        Control de Finanzas Personales
      </h1>
      <TransactionsDashboard userId={user.id} />
    </main>
  );
}
