"use client";
import { useState } from "react";
import { X, MapPin } from "lucide-react";

export default function AddSpotModal({ isOpen, onClose }: any) {
  const [name, setName] = useState("");
  const [existingSpots] = useState(["La Factoría", "Jungle Bird", "El Patio de Choco"]);

  if (!isOpen) return null;

  const checkDuplicate = () => {
    const match = existingSpots.find(spot => spot.toLowerCase().includes(name.toLowerCase()));
    if (match) {
      alert(`⚠️ Este lugar ya existe: ${match}\n¿Quieres verlo en Descubre?`);
      return true;
    }
    return false;
  };

  const handleSubmit = () => {
    if (!name) return;
    if (checkDuplicate()) return;
    alert("✅ Spot añadido correctamente (en versión real se guardaría en Supabase)");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-zinc-800 rounded-3xl w-full max-w-md p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold">Añadir Nuevo Spot</h2>
          <button onClick={onClose}><X className="w-8 h-8" /></button>
        </div>

        <input
          type="text"
          placeholder="Nombre del lugar (ej: La Placita Rooftop)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-3xl px-6 py-5 text-lg outline-none"
        />

        <button
          onClick={handleSubmit}
          className="mt-8 w-full bg-emerald-400 text-black py-5 rounded-3xl font-semibold text-xl"
        >
          Añadir Spot
        </button>

        <p className="text-center text-xs text-zinc-500 mt-6">
          Se revisará para evitar duplicados
        </p>
      </div>
    </div>
  );
}
