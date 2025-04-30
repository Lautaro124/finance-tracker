"use client";

import { useState } from "react";
import { Category, Transaction } from "@/lib/types";
import { formStyles } from "@/lib/styles";

interface TransactionsListProps {
  transactions: Transaction[];
  categories: Category[];
  onDeleteTransaction: (id: number) => Promise<void>;
}

export function TransactionsList({
  transactions,
  onDeleteTransaction,
}: TransactionsListProps) {
  const [filter, setFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-AR", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const filteredTransactions = transactions.filter((transaction) => {
    // Filtrar por tipo (ingreso/gasto/todos)
    if (filter === "income" && transaction.amount <= 0) return false;
    if (filter === "expense" && transaction.amount >= 0) return false;

    // Filtrar por término de búsqueda
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return (
        transaction.category.toLowerCase().includes(search) ||
        formatDate(transaction.date).toLowerCase().includes(search) ||
        formatCurrency(transaction.amount).includes(search)
      );
    }

    return true;
  });

  const handleDelete = async (id: number) => {
    if (
      window.confirm("¿Estás seguro de que deseas eliminar esta transacción?")
    ) {
      await onDeleteTransaction(id);
    }
  };

  return (
    <div className={formStyles.container}>
      <h2 className={formStyles.text.title}>Historial de transacciones</h2>

      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <div className="flex flex-1">
          <button
            className={`px-4 py-2 border-b-2 ${
              filter === "all"
                ? "border-blue-600 text-blue-700 font-medium"
                : "border-transparent text-gray-700"
            }`}
            onClick={() => setFilter("all")}
          >
            Todos
          </button>
          <button
            className={`px-4 py-2 border-b-2 ${
              filter === "income"
                ? "border-blue-600 text-blue-700 font-medium"
                : "border-transparent text-gray-700"
            }`}
            onClick={() => setFilter("income")}
          >
            Ingresos
          </button>
          <button
            className={`px-4 py-2 border-b-2 ${
              filter === "expense"
                ? "border-blue-600 text-blue-700 font-medium"
                : "border-transparent text-gray-700"
            }`}
            onClick={() => setFilter("expense")}
          >
            Gastos
          </button>
        </div>

        <div className="md:w-1/3">
          <input
            type="text"
            placeholder="Buscar..."
            className={formStyles.input}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {filteredTransactions.length === 0 ? (
        <div className="text-center py-8 text-gray-700 font-medium">
          No hay transacciones para mostrar
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-full">
            <thead className="border-b border-gray-300">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                  Categoría
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-800 uppercase tracking-wider">
                  Monto
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-800 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-300">
              {filteredTransactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {formatDate(transaction.date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                    {transaction.category}
                  </td>
                  <td
                    className={`px-6 py-4 whitespace-nowrap text-sm text-right font-bold ${
                      transaction.amount >= 0
                        ? "text-green-700"
                        : "text-red-700"
                    }`}
                  >
                    {formatCurrency(transaction.amount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleDelete(transaction.id)}
                      className="text-red-700 hover:text-red-900"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
