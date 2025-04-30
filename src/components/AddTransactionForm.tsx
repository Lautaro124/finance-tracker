"use client";

import { useState } from "react";
import { Category, Transaction, TransactionType } from "@/lib/types";
import { formStyles } from "@/lib/styles";

interface AddTransactionFormProps {
  categories: Category[];
  onAddTransaction: (transaction: Omit<Transaction, "id">) => Promise<void>;
  onAddCategory: (name: string) => Promise<Category | null>;
  userId: string;
}

export function AddTransactionForm({
  categories,
  onAddTransaction,
  onAddCategory,
  userId,
}: AddTransactionFormProps) {
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [type, setType] = useState<TransactionType>(TransactionType.EXPENSE);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [newCategory, setNewCategory] = useState("");
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount || !category || !date) {
      alert("Por favor completa todos los campos obligatorios");
      return;
    }

    setIsSubmitting(true);

    try {
      await onAddTransaction({
        amount:
          type === TransactionType.INCOME
            ? parseFloat(amount)
            : -parseFloat(amount),
        category,
        type,
        date,
        user_id: userId,
      });

      // Resetear el formulario
      setAmount("");
      setCategory("");
      setType(TransactionType.EXPENSE);
      setDate(new Date().toISOString().split("T")[0]);
    } catch (error) {
      console.error("Error al agregar transacción:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newCategory) return;

    const category = await onAddCategory(newCategory);
    if (category) {
      setCategory(category.Name);
      setNewCategory("");
      setShowAddCategory(false);
    }
  };

  return (
    <div className={formStyles.container}>
      <h2 className={formStyles.text.title}>Agregar transacción</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-4 mb-4">
          <button
            type="button"
            className={`flex-1 py-2 px-4 rounded-md ${
              type === TransactionType.EXPENSE
                ? "bg-red-600 text-white font-medium"
                : "bg-gray-200 text-gray-800 font-medium"
            }`}
            onClick={() => setType(TransactionType.EXPENSE)}
          >
            Gasto
          </button>
          <button
            type="button"
            className={`flex-1 py-2 px-4 rounded-md ${
              type === TransactionType.INCOME
                ? "bg-green-600 text-white font-medium"
                : "bg-gray-200 text-gray-800 font-medium"
            }`}
            onClick={() => setType(TransactionType.INCOME)}
          >
            Ingreso
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className={formStyles.label}>Monto (ARS)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className={formStyles.input}
              placeholder="0"
              min="0"
              step="0.01"
              required
            />
          </div>

          {!showAddCategory ? (
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className={formStyles.label}>Categoría</label>
                <button
                  type="button"
                  className="text-sm text-blue-700 hover:text-blue-900 font-medium"
                  onClick={() => setShowAddCategory(true)}
                >
                  + Nueva categoría
                </button>
              </div>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={formStyles.select}
                required
              >
                <option value="">Seleccionar categoría</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.Name}>
                    {cat.Name}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div>
              <label className={formStyles.label}>Nueva categoría</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className={formStyles.input}
                  placeholder="Nombre de la categoría"
                />
                <button
                  type="button"
                  onClick={handleAddCategory}
                  className={formStyles.button.primary}
                >
                  Agregar
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddCategory(false)}
                  className={formStyles.button.secondary}
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}

          <div>
            <label className={formStyles.label}>Fecha</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={formStyles.input}
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full ${formStyles.button.primary} ${
            isSubmitting ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {isSubmitting ? "Guardando..." : "Guardar transacción"}
        </button>
      </form>
    </div>
  );
}
