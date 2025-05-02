import { TransactionsDashboard } from "@/components/TransactionalDashboard/TransactionsDashboard";
import { getCurrentUser } from "@/lib/supabase/queries";
import { redirect } from "next/navigation";

export default async function Home() {
  const user = await getCurrentUser();

  if (!user) {
    return redirect("/auth");
  }

  return (
    <main className="container mx-auto p-4 md:p-8">
      <TransactionsDashboard userId={user.id} />
    </main>
  );
}
