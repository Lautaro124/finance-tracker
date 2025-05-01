"use client";

import { useEffect, useState } from "react";
import {
  Transaction,
  Category,
  TransactionType,
} from "@/lib/types";
import { createClient } from "@/lib/supabase/client.lib";
import { FinancialSummary } from "./FinancialSummary";
import { AddTransactionForm } from "./AddTransactionForm";
import { TransactionsList } from "./TransactionsList";
import { FinancialCharts } from "./FinancialCharts";
import { Modal } from "./Modal";

export function TransactionsDashboard({ userId }: { userId: string }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const supabase = createClient();

  // Función para cargar datos desde la base de datos
  const loadData = async () => {
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
  };

  useEffect(() => {
    // Carga inicial de datos
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
        (payload: {
          eventType: string;
          new: {
            id: unknown;
            amount?: number;
            category?: string;
            type?: string;
            date?: string;
            user_id?: string;
          };
          old: { id: number };
        }) => {
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
        (payload: {
          eventType: string;
          new: {
            id: unknown;
            created_at?: string;
            Name?: string;
            Type?: number;
          };
          old: { id: number };
        }) => {
          if (payload.eventType === "INSERT") {
            setCategories((prev) =>
              [...prev, payload.new as unknown as Category].sort((a, b) =>
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
                  c.id === payload.new.id ? (payload.new as unknown as Category) : c
                )
                .sort((a, b) => a.Name.localeCompare(b.Name))
            );
          }
        }
      )
      .subscribe();

    // Suscribirse a cambios en la tabla de tipos
    const typesSubscription = supabase
      .channel("types-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "Types",
        },
        () => {
          // Refrescar tipos si hay cambios
          loadData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(transactionsSubscription);
      supabase.removeChannel(categoriesSubscription);
      supabase.removeChannel(typesSubscription);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, supabase]);

  const handleAddTransaction = async (transaction: Omit<Transaction, "id">) => {
    try {
      const { error } = await supabase.from("Transactions").insert(transaction);

      if (error) throw error;

      // Cerrar el modal después de agregar exitosamente
      setIsModalOpen(false);

      // Recargar datos para asegurar que todo esté actualizado
      await loadData();
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
      loadData();
    } catch (error) {
      console.error("Error al eliminar transacción:", error);
      alert("Error al eliminar la transacción. Por favor, intenta nuevamente.");
    }
  };

  const handleAddCategory = async (
    name: string,
    typeName: string = TransactionType.EXPENSE
  ) => {
    try {
      // Validar que el nombre de la categoría no esté vacío
      if (!name || name.trim() === "") {
        throw new Error("El nombre de la categoría no puede estar vacío");
      }

      const { data, error } = await supabase
        .from("Categorys")
        .insert({ Name: name, Type: typeName })
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
    <div className="space-y-6 relative">
      {/* Sección de gráficos financieros */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 space-y-6">
          <FinancialSummary transactions={transactions} />
        </div>
        <div className="lg:col-span-5">
          <FinancialCharts transactions={transactions} />
        </div>
      </div>
      <TransactionsList
        transactions={transactions}
        categories={categories}
        onDeleteTransaction={handleDeleteTransaction}
      />

      {/* Botón flotante para agregar transacción */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-8 right-8 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg z-40"
        aria-label="Agregar nueva transacción"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-8 w-8"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
          />
        </svg>
      </button>

      {/* Modal para agregar transacción */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Agregar Nueva Transacción"
      >
        <AddTransactionForm
          categories={categories}
          onAddTransaction={handleAddTransaction}
          onAddCategory={handleAddCategory}
          userId={userId}
        />
      </Modal>
    </div>
  );
}
