"use client";

import { useMemo } from "react";
import { Transaction } from "@/lib/types";
import { formStyles } from "@/lib/styles";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

interface FinancialChartsProps {
  transactions: Transaction[];
}

export function FinancialCharts({ transactions }: FinancialChartsProps) {
  // Calcular datos para los gráficos
  const chartData = useMemo(() => {
    // Objeto para almacenar gastos por categoría
    const expensesByCategory: Record<string, number> = {};

    // Objeto para almacenar transacciones por mes (últimos 6 meses)
    const monthlyData: Record<string, { income: number; expense: number }> = {};

    // Configurar los últimos 6 meses
    const today = new Date();
    for (let i = 5; i >= 0; i--) {
      const month = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthKey = month.toLocaleDateString("es-AR", {
        month: "short",
        year: "numeric",
      });
      monthlyData[monthKey] = { income: 0, expense: 0 };
    }

    // Procesar transacciones
    transactions.forEach((transaction) => {
      const amount = Number(transaction.amount);
      const date = new Date(transaction.date);

      // Para el gráfico de categorías (solo gastos)
      if (amount < 0) {
        if (!expensesByCategory[transaction.category]) {
          expensesByCategory[transaction.category] = 0;
        }
        expensesByCategory[transaction.category] += Math.abs(amount);
      }

      // Para el gráfico mensual
      const monthKey = date.toLocaleDateString("es-AR", {
        month: "short",
        year: "numeric",
      });

      // Solo procesar si está dentro de los últimos 6 meses
      if (monthlyData[monthKey]) {
        if (amount > 0) {
          monthlyData[monthKey].income += amount;
        } else {
          monthlyData[monthKey].expense += Math.abs(amount);
        }
      }
    });

    // Preparar datos para el gráfico de categorías
    const categories = Object.keys(expensesByCategory);
    const categoryValues = Object.values(expensesByCategory);

    // Generar colores para el gráfico circular
    const backgroundColors = [
      "#FF6384",
      "#36A2EB",
      "#FFCE56",
      "#4BC0C0",
      "#9966FF",
      "#FF9F40",
      "#8AC146",
      "#EA526F",
      "#25CCF7",
      "#FD7272",
    ];

    // Datos para el gráfico de barras mensual
    const months = Object.keys(monthlyData);
    const incomeData = months.map((month) => monthlyData[month].income);
    const expenseData = months.map((month) => monthlyData[month].expense);

    return {
      pieData: {
        labels: categories,
        datasets: [
          {
            data: categoryValues,
            backgroundColor: backgroundColors.slice(0, categories.length),
            borderWidth: 1,
          },
        ],
      },
      barData: {
        labels: months,
        datasets: [
          {
            label: "Ingresos",
            data: incomeData,
            backgroundColor: "rgba(75, 192, 192, 0.6)",
            borderColor: "rgba(75, 192, 192, 1)",
            borderWidth: 1,
          },
          {
            label: "Gastos",
            data: expenseData,
            backgroundColor: "rgba(255, 99, 132, 0.6)",
            borderColor: "rgba(255, 99, 132, 1)",
            borderWidth: 1,
          },
        ],
      },
      totalByCategory: expensesByCategory,
    };
  }, [transactions]);

  const barOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Ingresos vs. Gastos (últimos 6 meses)",
        font: {
          size: 16,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div className={formStyles.container}>
      <h2 className={formStyles.text.title}>Gráficos financieros</h2>
      <div>
        <div className="h-64">
          <Bar data={chartData.barData} options={barOptions} />
        </div>
      </div>
    </div>
  );
}
