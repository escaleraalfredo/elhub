"use client";
import { useState } from "react";
import { X } from "lucide-react";
import toast from "react-hot-toast";
import { addSpot } from "@/lib/db";
import type { Spot } from "@/lib/types";

const VIBE_OPTIONS = ["🔥", "🌴", "🍹", "🎶", "🌮", "🍔", "☕", "🌺"];
const PRICE_OPTIONS = ["$", "$$", "$$$", "$$$$"];

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSpotAdded?: (spot: Spot) => void;
  existingNames?: string[];
}

export default function AddSpotModal({ isOpen, onClose, onSpotAdded, existingNames = [] }: Props) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("$$");
  const [vibe, setVibe] = useState("🔥");
  const [open, setOpen] = useState(true);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const reset = () => {
    setName("");
    setCategory("");
    setPrice("$$");
    setVibe("🔥");
    setOpen(true);
  };

  const handleSubmit = async () => {
    if (!name.trim() || !category.trim()) {
      toast.error("Por favor completa el nombre y la categoría");
      return;
    }

    const duplicate = existingNames.find((n) =>
      n.toLowerCase().includes(name.trim().toLowerCase())
    );
    if (duplicate) {
      toast.error(`⚠️ Este lugar ya existe: ${duplicate}`);
      return;
    }

    setLoading(true);
    const newSpotData: Omit<Spot, "id" | "created_at"> = {
      name: name.trim(),
      category: category.trim(),
      rating: 0,
      reviews: 0,
      price,
      open,
      vibe,
    };

    const saved = await addSpot(newSpotData);

    if (saved) {
      toast.success("✅ Spot añadido correctamente");
      onSpotAdded?.(saved);
    } else {
      // Offline fallback — add to local list with a temporary id
      toast("Spot añadido localmente (sin conexión a BD)", { icon: "💾" });
      onSpotAdded?.({ ...newSpotData, id: Date.now() });
    }

    reset();
    onClose();
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-zinc-800 rounded-3xl w-full max-w-md p-8 space-y-5">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold">Añadir Nuevo Spot</h2>
          <button onClick={onClose}><X className="w-8 h-8" /></button>
        </div>

        <input
          type="text"
          placeholder="Nombre del lugar (ej: La Placita Rooftop)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-3xl px-6 py-4 text-lg outline-none"
        />

        <input
          type="text"
          placeholder="Categoría (ej: Bar • Santurce)"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-3xl px-6 py-4 text-lg outline-none"
        />

        <div>
          <p className="text-sm text-zinc-500 mb-2">Vibe</p>
          <div className="flex gap-3 flex-wrap">
            {VIBE_OPTIONS.map((v) => (
              <button
                key={v}
                onClick={() => setVibe(v)}
                className={`text-3xl p-2 rounded-2xl border-2 transition-all ${vibe === v ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-900" : "border-transparent"}`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm text-zinc-500 mb-2">Precio</p>
          <div className="flex gap-3">
            {PRICE_OPTIONS.map((p) => (
              <button
                key={p}
                onClick={() => setPrice(p)}
                className={`px-4 py-2 rounded-2xl border-2 font-semibold transition-all ${price === p ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-900 text-emerald-600" : "border-zinc-300 dark:border-zinc-600"}`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={open}
            onChange={(e) => setOpen(e.target.checked)}
            className="w-5 h-5 accent-emerald-400"
          />
          <span className="font-medium">Abierto ahora</span>
        </label>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-emerald-400 text-black py-5 rounded-3xl font-semibold text-xl disabled:opacity-50"
        >
          {loading ? "Guardando..." : "Añadir Spot"}
        </button>

        <p className="text-center text-xs text-zinc-500">
          Se revisará para evitar duplicados
        </p>
      </div>
    </div>
  );
}
