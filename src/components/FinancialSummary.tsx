"use client";

import { useMemo } from "react";
import { Transaction } from "@/lib/types";

interface FinancialSummaryProps {
  transactions: Transaction[];
}

export function FinancialSummary({ transactions }: FinancialSummaryProps) {
  const summary = useMemo(() => {
    const result = {
      totalBalance: 0,
      totalIncome: 0,
      totalExpense: 0,
      categorySummary: {} as Record<string, number>,
    };

    transactions.forEach((transaction) => {
      const amount = Number(transaction.amount);

      // Actualizar balance total
      result.totalBalance += amount;

      // Actualizar ingresos o gastos
      if (amount > 0) {
        result.totalIncome += amount;
      } else {
        result.totalExpense += Math.abs(amount);
      }

      // Actualizar gastos por categoría (solo para gastos)
      if (amount < 0) {
        if (!result.categorySummary[transaction.category]) {
          result.categorySummary[transaction.category] = 0;
        }
        result.categorySummary[transaction.category] += Math.abs(amount);
      }
    });

    return result;
  }, [transactions]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Ordenar las categorías de gastos por monto (de mayor a menor)
  const topCategories = useMemo(() => {
    return Object.entries(summary.categorySummary)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }, [summary.categorySummary]);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-6">Resumen financiero</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="p-4 rounded-lg bg-gray-50 border">
          <p className="text-sm text-gray-500 mb-1">Balance total</p>
          <p
            className={`text-2xl font-bold ${
              summary.totalBalance >= 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            {formatCurrency(summary.totalBalance)}
          </p>
        </div>

        <div className="p-4 rounded-lg bg-gray-50 border">
          <p className="text-sm text-gray-500 mb-1">Ingresos</p>
          <p className="text-2xl font-bold text-green-600">
            {formatCurrency(summary.totalIncome)}
          </p>
        </div>

        <div className="p-4 rounded-lg bg-gray-50 border">
          <p className="text-sm text-gray-500 mb-1">Gastos</p>
          <p className="text-2xl font-bold text-red-600">
            {formatCurrency(summary.totalExpense)}
          </p>
        </div>
      </div>

      {topCategories.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">
            Principales categorías de gastos
          </h3>
          <div className="space-y-3">
            {topCategories.map(([category, amount]) => (
              <div key={category} className="flex items-center">
                <div className="w-36 truncate pr-2">{category}</div>
                <div className="flex-1">
                  <div className="h-7 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{
                        width: `${(amount / summary.totalExpense) * 100}%`,
                      }}
                    />
                  </div>
                </div>
                <div className="w-24 text-right font-medium">
                  {formatCurrency(amount)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
