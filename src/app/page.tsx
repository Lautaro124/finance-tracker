import { TransactionsDashboard } from "@/components/TransactionsDashboard";
import { getCurrentUser } from "@/lib/supabase/queries";
import { redirect } from "next/navigation";

export default async function Home() {
  const user = await getCurrentUser();

  if (!user) {
    return redirect("/auth");
  }

  return (
    <main className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-8 text-center text-black">
        Control de Finanzas Personales
      </h1>
      <TransactionsDashboard userId={user.id} />
    </main>
  );
}
