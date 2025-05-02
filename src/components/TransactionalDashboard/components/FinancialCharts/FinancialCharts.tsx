'use client"';
import { Transaction, Category } from "@/lib/types";
import { formStyles } from "@/lib/styles";
import { BarChart } from "./charts/BarChart";
import CakeChart from "./charts/cakeChart";
import { useState } from "react";

interface FinancialChartsProps {
  transactions: Transaction[];
  categories?: Category[];
}

enum ChartType {
  BAR = "Historial de gastos",
  CAKE = "Gastos por categoría",
}

export function FinancialCharts({
  transactions,
  categories = [],
}: FinancialChartsProps) {
  const [chartSelected, setChartSelected] = useState<ChartType>(ChartType.CAKE);

  const charts = {
    [ChartType.BAR]: <BarChart transactions={transactions} />,
    [ChartType.CAKE]: (
      <CakeChart transactions={transactions} categories={categories} />
    ),
  };

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedChart = e.target.value as ChartType;
    setChartSelected(selectedChart);
  };

  return (
    <div className={formStyles.container}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-900 ">
          Gráficos financieros
        </h2>
        <div className="flex items-center w-fit">
          <select
            className={formStyles.select}
            value={chartSelected}
            onChange={handleChange}
          >
            {Object.keys(charts).map((chart) => (
              <option key={chart} value={chart}>
                {chart}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="max-h-64">
        {charts[chartSelected]}
      </div>
    </div>
  );
}
