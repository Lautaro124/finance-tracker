import { createSSRClient } from "./server.lib";
import { Category, Transaction } from "../types";

export async function getCategories(): Promise<Category[]> {
  const supabase = await createSSRClient();
  const { data, error } = await supabase
    .from("Categorys")
    .select("*")
    .order("Name");

  if (error) {
    console.error("Error fetching categories:", error);
    return [];
  }

  return data || [];
}

export async function getUserTransactions(
  userId: string
): Promise<Transaction[]> {
  const supabase = await createSSRClient();
  const { data, error } = await supabase
    .from("Transactions")
    .select("*")
    .eq("user_id", userId)
    .order("date", { ascending: false });

  if (error) {
    console.error("Error fetching transactions:", error);
    return [];
  }

  return data || [];
}

export async function addTransaction(transaction: Omit<Transaction, "id">) {
  const supabase = await createSSRClient();

  // Verificar que user_id esté presente
  if (!transaction.user_id) {
    throw new Error("ID de usuario no proporcionado");
  }

  const { data, error } = await supabase
    .from("Transactions")
    .insert(transaction)
    .select()
    .single();

  if (error) {
    console.error("Error adding transaction:", error);
    throw new Error(error.message);
  }

  return data;
}

export async function addCategory(categoryName: string) {
  const supabase = await createSSRClient();

  // Verificar que el nombre de la categoría no esté vacío
  if (!categoryName || categoryName.trim() === "") {
    throw new Error("El nombre de la categoría no puede estar vacío");
  }

  const { data, error } = await supabase
    .from("Categorys")
    .insert({ Name: categoryName })
    .select()
    .single();

  if (error) {
    console.error("Error adding category:", error);
    throw new Error(error.message);
  }

  return data;
}

export async function deleteTransaction(id: number, userId: string) {
  const supabase = await createSSRClient();
  const { error } = await supabase
    .from("Transactions")
    .delete()
    .eq("id", id)
    .eq("user_id", userId); // Asegurarse de que el usuario solo elimine sus propias transacciones

  if (error) {
    console.error("Error deleting transaction:", error);
    throw new Error(error.message);
  }
}

export async function getCurrentUser() {
  const supabase = await createSSRClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    console.error("Error getting current user:", error);
    return null;
  }

  return user;
}

export async function formatCurrency(amount: number): Promise<string> {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(amount);
}
