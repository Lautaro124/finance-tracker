export type Category = {
  id: number;
  created_at: string;
  Name: string;
  Type: string; // ID que referencia a un registro en la tabla Types
};

export type Transaction = {
  id: number;
  amount: number;
  category: string;
  type: string;
  date: string;
  user_id: string;
};

export type TransactionWithCategory = Transaction & {
  categoryName?: string;
};

export enum TransactionType {
  INCOME = "Ingreso",
  EXPENSE = "Gasto",
}

// Tipo para representar los registros de la tabla Types
export type TypeRecord = {
  id: number;
  name: string; // Nombre del tipo (probablemente "income" o "expense")
};
