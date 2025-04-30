"use client";

import { useState } from "react";
import { Category, Transaction } from "@/lib/types";

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
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-4">Historial de transacciones</h2>

      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <div className="flex flex-1">
          <button
            className={`px-4 py-2 border-b-2 ${
              filter === "all"
                ? "border-blue-500 text-blue-600"
                : "border-transparent"
            }`}
            onClick={() => setFilter("all")}
          >
            Todos
          </button>
          <button
            className={`px-4 py-2 border-b-2 ${
              filter === "income"
                ? "border-blue-500 text-blue-600"
                : "border-transparent"
            }`}
            onClick={() => setFilter("income")}
          >
            Ingresos
          </button>
          <button
            className={`px-4 py-2 border-b-2 ${
              filter === "expense"
                ? "border-blue-500 text-blue-600"
                : "border-transparent"
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
            className="w-full px-4 py-2 border rounded-md"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {filteredTransactions.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No hay transacciones para mostrar
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-full">
            <thead className="border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Categoría
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Monto
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredTransactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(transaction.date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                    {transaction.category}
                  </td>
                  <td
                    className={`px-6 py-4 whitespace-nowrap text-sm text-right font-medium ${
                      transaction.amount >= 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {formatCurrency(transaction.amount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleDelete(transaction.id)}
                      className="text-red-600 hover:text-red-900"
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
