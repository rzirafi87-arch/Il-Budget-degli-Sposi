"use client";
import React, { ReactNode, useEffect } from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  widthClass?: string;
}

const Modal: React.FC<ModalProps> = ({ open, onClose, title, children, widthClass = "max-w-lg" }) => {
  useEffect(() => {
    if (!open) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className={`bg-white rounded-lg shadow-lg w-full ${widthClass} relative animate-fade-in`}>
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-2xl font-bold focus:outline-none"
          onClick={onClose}
          aria-label="Chiudi"
        >
          ×
        </button>
        {title && <div className="px-6 pt-6 pb-2 text-lg font-semibold text-gray-800">{title}</div>}
        <div className="px-6 pb-6 pt-2">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
