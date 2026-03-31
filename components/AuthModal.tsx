"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { X, Mail, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: Props) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  if (!isOpen) return null;

  const handleMagicLink = async () => {
    const trimmed = email.trim();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      toast.error("Ingresa un email válido");
      return;
    }

    if (!supabase) {
      toast.error("Supabase no está configurado. Agrega las env vars primero.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email: trimmed,
      options: {
        emailRedirectTo: typeof window !== "undefined" ? `${window.location.origin}/dashboard` : "/dashboard",
      },
    });
    setLoading(false);

    if (error) {
      toast.error(error.message);
    } else {
      setSent(true);
      toast.success("✉️ Enlace enviado — revisa tu correo");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white dark:bg-zinc-800 rounded-3xl w-full max-w-sm p-8 space-y-6"
      >
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="text-4xl">🇵🇷</span>
            <h2 className="text-2xl font-bold">Entrar a ElHub</h2>
          </div>
          <button onClick={onClose}>
            <X className="w-7 h-7" />
          </button>
        </div>

        {sent ? (
          <div className="text-center space-y-4 py-4">
            <div className="text-6xl">✉️</div>
            <p className="text-xl font-semibold">Revisa tu correo</p>
            <p className="text-zinc-500 text-sm">
              Te enviamos un magic link a <strong>{email}</strong>.<br />
              Haz clic en él para entrar.
            </p>
            <button
              onClick={() => { setSent(false); setEmail(""); }}
              className="text-emerald-500 text-sm underline"
            >
              Usar otro email
            </button>
          </div>
        ) : (
          <>
            <p className="text-zinc-500 text-sm">
              Ingresa con tu email — te enviamos un enlace mágico, sin contraseña.
            </p>

            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleMagicLink()}
                placeholder="tu@email.com"
                className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-3xl pl-12 pr-6 py-4 text-lg outline-none"
              />
            </div>

            <button
              onClick={handleMagicLink}
              disabled={loading}
              className="w-full bg-emerald-400 text-black py-4 rounded-3xl font-semibold text-lg flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
              {loading ? "Enviando…" : "Enviar magic link"}
            </button>

            <p className="text-center text-xs text-zinc-400">
              Sin contraseña • Sin datos personales requeridos
            </p>
          </>
        )}
      </motion.div>
    </div>
  );
}
