import React from 'react';

export function LoadingState({ message = 'Cargando...' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center">
      <div className="relative w-12 h-12 mb-4">
        <div className="absolute inset-0 rounded-full border-4 border-pink-100 animate-pulse"></div>
        <div className="absolute inset-0 rounded-full border-4 border-pink-500 border-t-transparent animate-spin"></div>
      </div>
      <p className="text-sm font-medium text-gray-500 animate-pulse">{message}</p>
    </div>
  );
}
