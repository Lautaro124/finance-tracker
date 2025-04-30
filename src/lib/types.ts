export type Category = {
  id: number;
  created_at: string;
  Name: string;
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
  INCOME = "income",
  EXPENSE = "expense",
}
