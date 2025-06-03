// app/components/common/ConfirmDeleteModal.tsx

"use client";

import React from "react";
import { Loader2 } from "lucide-react"; // Import do ícone de carregamento

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  postTitle: string;
  busy?: boolean;
}

const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  postTitle,
  busy = false,
}): JSX.Element | null => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded shadow-lg max-w-sm w-full">
        <h2 className="text-xl font-semibold mb-4">Confirmar Deleção</h2>
        <p>
          Você tem certeza que deseja deletar o post &quot;{postTitle}&quot;?
        </p>
        <div className="flex justify-end mt-6 space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 dark:bg-gray-700 rounded hover:bg-gray-400 dark:hover:bg-gray-600 transition"
            disabled={busy}
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition flex items-center space-x-2"
            disabled={busy}
          >
            {busy && (
              <Loader2 className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
            )}
            <span>Deletar</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteModal;
