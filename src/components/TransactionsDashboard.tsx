"use client";

import { useEffect, useState } from "react";
import { Transaction, Category } from "@/lib/types";
import { createClient } from "@/lib/supabase/client.lib";
import { FinancialSummary } from "./FinancialSummary";
import { AddTransactionForm } from "./AddTransactionForm";
import { TransactionsList } from "./TransactionsList";

export function TransactionsDashboard({ userId }: { userId: string }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        // Cargar categorías
        const { data: categoriesData, error: categoriesError } = await supabase
          .from("Categorys")
          .select("*")
          .order("Name");

        if (categoriesError) throw categoriesError;
        setCategories(categoriesData || []);

        // Cargar transacciones
        const { data: transactionsData, error: transactionsError } =
          await supabase
            .from("Transactions")
            .select("*")
            .eq("user_id", userId)
            .order("date", { ascending: false });

        if (transactionsError) throw transactionsError;
        setTransactions(transactionsData || []);
      } catch (error) {
        console.error("Error cargando datos:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();

    // Suscribirse a cambios en la tabla de transacciones
    const transactionsSubscription = supabase
      .channel("transactions-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "Transactions",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setTransactions((prev) => [payload.new as Transaction, ...prev]);
          } else if (payload.eventType === "DELETE") {
            setTransactions((prev) =>
              prev.filter((t) => t.id !== payload.old.id)
            );
          } else if (payload.eventType === "UPDATE") {
            setTransactions((prev) =>
              prev.map((t) =>
                t.id === payload.new.id ? (payload.new as Transaction) : t
              )
            );
          }
        }
      )
      .subscribe();

    // Suscribirse a cambios en la tabla de categorías
    const categoriesSubscription = supabase
      .channel("categories-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "Categorys",
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setCategories((prev) =>
              [...prev, payload.new as Category].sort((a, b) =>
                a.Name.localeCompare(b.Name)
              )
            );
          } else if (payload.eventType === "DELETE") {
            setCategories((prev) =>
              prev.filter((c) => c.id !== payload.old.id)
            );
          } else if (payload.eventType === "UPDATE") {
            setCategories((prev) =>
              prev
                .map((c) =>
                  c.id === payload.new.id ? (payload.new as Category) : c
                )
                .sort((a, b) => a.Name.localeCompare(b.Name))
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(transactionsSubscription);
      supabase.removeChannel(categoriesSubscription);
    };
  }, [userId, supabase]);

  const handleAddTransaction = async (transaction: Omit<Transaction, "id">) => {
    try {
      const { error } = await supabase.from("Transactions").insert(transaction);

      if (error) throw error;
    } catch (error) {
      console.error("Error al agregar transacción:", error);
      alert("Error al agregar la transacción. Por favor, intenta nuevamente.");
    }
  };

  const handleDeleteTransaction = async (id: number) => {
    try {
      const { error } = await supabase
        .from("Transactions")
        .delete()
        .eq("id", id);

      if (error) throw error;
    } catch (error) {
      console.error("Error al eliminar transacción:", error);
      alert("Error al eliminar la transacción. Por favor, intenta nuevamente.");
    }
  };

  const handleAddCategory = async (name: string) => {
    try {
      // Validar que el nombre de la categoría no esté vacío
      if (!name || name.trim() === "") {
        throw new Error("El nombre de la categoría no puede estar vacío");
      }

      const { data, error } = await supabase
        .from("Categorys")
        .insert({ Name: name })
        .select()
        .single();

      if (error) {
        console.error("Error de Supabase:", error);
        throw new Error(error.message || "Error al agregar la categoría");
      }

      if (!data) {
        throw new Error("No se pudo crear la categoría");
      }

      setCategories([...categories, data]);
      return data;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Error al agregar la categoría";
      console.error("Error al agregar categoría:", error);
      alert(errorMessage);
      return null;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-7 space-y-6">
        <FinancialSummary transactions={transactions} />
        <AddTransactionForm
          categories={categories}
          onAddTransaction={handleAddTransaction}
          onAddCategory={handleAddCategory}
          userId={userId}
        />
      </div>
      <div className="lg:col-span-5">
        <TransactionsList
          transactions={transactions}
          categories={categories}
          onDeleteTransaction={handleDeleteTransaction}
        />
      </div>
    </div>
  );
}
