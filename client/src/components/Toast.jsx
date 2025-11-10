import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';

export default function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-left">
      <div className={`flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl ${
        type === 'success' 
          ? 'bg-green-500 text-white' 
          : 'bg-red-500 text-white'
      }`}>
        {type === 'success' ? (
          <CheckCircle size={24} strokeWidth={2.5} />
        ) : (
          <XCircle size={24} strokeWidth={2.5} />
        )}
        <p className="font-semibold">{message}</p>
        <button onClick={onClose} className="ml-2">
          <X size={20} />
        </button>
      </div>
    </div>
  );
}
