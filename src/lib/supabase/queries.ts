import { createSSRClient } from "./server.lib";
import { Category, Transaction, TypeRecord } from "../types";

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

export async function getTypes(): Promise<TypeRecord[]> {
  const supabase = await createSSRClient();
  const { data, error } = await supabase.from("Types").select("*");

  if (error) {
    console.error("Error fetching types:", error);
    return [];
  }

  return data || [];
}

export async function getUserTransactions(
  userId: string
): Promise<Transaction[]> {
  const supabase = await createSSRClient();

  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const startDate = firstDay.toISOString().split("T")[0];
  const endDate = lastDay.toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("Transactions")
    .select("*")
    .eq("user_id", userId)
    .gte("date", startDate)
    .lte("date", endDate)
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

export async function addCategory(
  categoryName: string,
  typeName: string = "expense"
) {
  const supabase = await createSSRClient();

  // Verificar que el nombre de la categoría no esté vacío
  if (!categoryName || categoryName.trim() === "") {
    throw new Error("El nombre de la categoría no puede estar vacío");
  }

  try {
    // Primero, obtener el ID del tipo basado en su nombre
    const { data: typeData, error: typeError } = await supabase
      .from("Types")
      .select("id")
      .eq("name", typeName)
      .single();

    if (typeError || !typeData) {
      console.error("Error getting type ID:", typeError || "No type found");
      throw new Error(`No se encontró el tipo "${typeName}"`);
    }

    // Ahora insertar la categoría con el ID de tipo correcto
    const { data, error } = await supabase
      .from("Categorys")
      .insert({ Name: categoryName, Type: typeData.id })
      .select()
      .single();

    if (error) {
      console.error("Error adding category:", error);
      throw new Error(error.message);
    }

    return data;
  } catch (error) {
    console.error("Error in addCategory:", error);
    throw error;
  }
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
  try {
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
  } catch (error) {
    console.error("Error en getCurrentUser:", error);
    // Si ocurre un AuthSessionMissingError, devuelve null para
    // permitir que la aplicación redirija al usuario a la página de inicio de sesión
    return null;
  }
}

export async function formatCurrency(amount: number): Promise<string> {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(amount);
}
