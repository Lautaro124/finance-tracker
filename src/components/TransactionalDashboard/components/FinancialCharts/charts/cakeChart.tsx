/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { Category, Transaction } from "@/lib/types";
import { useMemo } from "react";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartOptions,
} from "chart.js";
import { Pie } from "react-chartjs-2";

// Registramos los componentes necesarios para el gráfico de torta
ChartJS.register(ArcElement, Tooltip, Legend);

interface CakeChartProps {
  transactions: Transaction[];
  categories: Category[];
}

// Corregimos el nombre del componente de BarChart a CakeChart
export const CakeChart = ({ transactions, categories }: CakeChartProps) => {
  // Usamos useMemo para calcular los datos del gráfico solo cuando cambien las transacciones o categorías
  const chartData = useMemo(() => {
    // Creamos un mapa para relacionar los IDs de las categorías con sus nombres
    const categoryMap = new Map(
      categories.map((category) => [category.id.toString(), category.Name])
    );

    // Filtrar solo las transacciones de tipo gasto
    const expenseTransactions = transactions.filter(
      (transaction) => transaction.type === "Gasto"
    );

    // Agrupar transacciones por categoría y sumar los montos
    const categoryAmounts = expenseTransactions.reduce((acc, transaction) => {
      const categoryId = transaction.category;
      if (!acc[categoryId]) {
        acc[categoryId] = 0;
      }
      acc[categoryId] += transaction.amount;
      return acc;
    }, {} as Record<string, number>);

    // Preparar datos para el gráfico
    const labels = Object.keys(categoryAmounts).map(
      (categoryId) => categoryMap.get(categoryId) || `Categoría ${categoryId}`
    );

    const data = Object.values(categoryAmounts);

    // Generar colores aleatorios para cada categoría
    const backgroundColors = labels.map(
      () =>
        `rgba(${Math.floor(Math.random() * 256)}, ${Math.floor(
          Math.random() * 256
        )}, ${Math.floor(Math.random() * 256)}, 0.7)`
    );

    return {
      labels,
      datasets: [
        {
          label: "Gastos por categoría",
          data,
          backgroundColor: backgroundColors,
          borderColor: backgroundColors.map((color) =>
            color.replace("0.7", "1")
          ),
          borderWidth: 1,
        },
      ],
    };
  }, [transactions, categories]);

  // Opciones para el gráfico
  const options: ChartOptions<"pie"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "right" as const,
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            const label = context.label || "";
            const value = context.raw || 0;
            return `${label}: $${value.toFixed(2)}`;
          },
        },
      },
     
    },
  };

  return (
    <div className="w-full min-h-64 flex items-center justify-center">
      <Pie data={chartData} options={options} />
    </div>
  );
};

// Exportamos el componente con el nombre correcto
export default CakeChart;
