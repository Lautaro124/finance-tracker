"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client.lib";
import { formStyles } from "@/lib/styles";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    const supabase = createClient();

    try {
      if (isSignUp) {
        // Registro
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });

        if (error) throw error;

        alert(
          "¡Registro exitoso! Por favor, revisa tu correo electrónico para verificar tu cuenta."
        );
      } else {
        // Inicio de sesión
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
        if (!data?.session) {
          throw new Error(
            "No se pudo iniciar sesión. Por favor, inténtalo nuevamente."
          );
        }

        router.push("/");
        router.refresh();
      }
    } catch (error: unknown) {
      console.error("Error de autenticación:", error);
      let errorMessage = "Ocurrió un error durante la autenticación";

      if (error instanceof Error) {
        if (error.message.includes("Auth session missing")) {
          errorMessage =
            "Sesión de autenticación no encontrada. Por favor, actualiza la página e inténtalo de nuevo.";
        } else {
          errorMessage = error.message;
        }
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            Control de Finanzas Personales
          </h1>
          <h2 className="mt-6 text-xl font-semibold text-gray-900">
            {isSignUp ? "Crear una cuenta" : "Iniciar sesión"}
          </h2>
        </div>

        <div className={formStyles.container}>
          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded mb-4 text-sm font-medium border border-red-200">
              {error}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className={formStyles.label}>
                Correo electrónico
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={formStyles.input}
              />
            </div>

            <div>
              <label htmlFor="password" className={formStyles.label}>
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete={isSignUp ? "new-password" : "current-password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={formStyles.input}
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  isLoading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {isLoading
                  ? "Procesando..."
                  : isSignUp
                  ? "Registrarse"
                  : "Iniciar sesión"}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <button
              type="button"
              className="w-full text-center text-sm text-blue-700 hover:text-blue-900 font-medium"
              onClick={() => setIsSignUp(!isSignUp)}
            >
              {isSignUp
                ? "¿Ya tienes una cuenta? Inicia sesión"
                : "¿No tienes una cuenta? Regístrate"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
