"use client";

import { useEffect, useRef } from "react";
import { formStyles } from "@/lib/styles";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleEscapeKey(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    }

    // Prevenir el scroll del body cuando el modal está abierto
    if (isOpen) {
      document.body.style.overflow = "hidden";
      document.addEventListener("keydown", handleEscapeKey);
    }

    return () => {
      document.body.style.overflow = "auto";
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [isOpen, onClose]);

  // Si el modal no está abierto, no renderizar nada
  if (!isOpen) return null;

  // Cerrar el modal si se hace clic fuera del contenido
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div className="w-full h-full bg-black opacity-50 absolute" />
      <div
        ref={modalRef}
        className="relative w-full max-w-lg  rounded-lg bg-white p-6 shadow-xl"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className={formStyles.text.title}>{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-900"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
