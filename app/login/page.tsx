// app/login/page.tsx
// Sign in with Google, Facebook or phone (SMS code) through Supabase Auth.
// Works once NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY are set
// and the providers are enabled in the Supabase dashboard.
"use client";

import { useState } from "react";
import { Phone } from "lucide-react";
import { toast } from "sonner";
import { Card, Notice, PageContent, PageHeader, PageShell } from "@/components/ui/Page";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [sent, setSent] = useState(false);
  const ready = !!supabase;

  const oauth = async (provider: "google" | "facebook") => {
    if (!supabase) return;
    const { error } = await supabase.auth.signInWithOAuth({ provider, options: { redirectTo: window.location.origin } });
    if (error) toast.error(error.message);
  };

  const e164 = () => {
    const digits = phone.replace(/\D/g, "");
    return digits.length === 10 ? `+1${digits}` : `+${digits}`;
  };

  const sendCode = async () => {
    if (!supabase) return;
    const { error } = await supabase.auth.signInWithOtp({ phone: e164() });
    if (error) return toast.error(error.message);
    setSent(true);
    toast.success("Te enviamos un código por SMS");
  };

  const verify = async () => {
    if (!supabase) return;
    const { error } = await supabase.auth.verifyOtp({ phone: e164(), token: code, type: "sms" });
    if (error) return toast.error(error.message);
    toast.success("¡Bienvenido a ElHub!");
    window.location.href = "/";
  };

  const btn = "w-full flex items-center justify-center gap-3 rounded-lg py-3.5 font-semibold disabled:opacity-50";

  return (
    <PageShell>
      <PageHeader title="Entrar a ElHub" back />
      <PageContent className="space-y-4">
        <p className="text-sm text-zinc-400 px-1">
          Con una cuenta tus comentarios, puntos y equipos se guardan en todos tus dispositivos y la comunidad puede verte.
        </p>
        {!ready && <Notice>Las cuentas se activan cuando se conecte Supabase (Google, Facebook y SMS). Por ahora todo se guarda en este teléfono.</Notice>}
        <Card className="p-4 space-y-3">
          <button disabled={!ready} onClick={() => oauth("google")} className={cn(btn, "bg-white text-zinc-900 border border-zinc-300")}>
            <span className="font-bold text-lg">G</span> Continuar con Google
          </button>
          <button disabled={!ready} onClick={() => oauth("facebook")} className={cn(btn, "bg-[#1877F2] text-white")}>
            <span className="font-bold text-lg">f</span> Continuar con Facebook
          </button>
        </Card>
        <Card className="p-4 space-y-3">
          <p className="flex items-center gap-2 text-sm font-semibold"><Phone className="w-4 h-4" /> Con tu número de teléfono</p>
          <input
            type="tel"
            inputMode="tel"
            placeholder="(787) 555-1234"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 focus:outline-none focus:border-brand"
          />
          {sent && (
            <input
              inputMode="numeric"
              placeholder="Código de 6 dígitos"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 tracking-widest focus:outline-none focus:border-brand"
            />
          )}
          <button
            disabled={!ready || phone.replace(/\D/g, "").length < 10 || (sent && code.length < 6)}
            onClick={sent ? verify : sendCode}
            className={cn(btn, "bg-accent-gradient text-white")}
          >
            {sent ? "Verificar código" : "Enviar código por SMS"}
          </button>
        </Card>
        <p className="text-[11px] text-zinc-500 px-1">Al continuar aceptas las reglas de la comunidad: respeto, nada de odio ni spam.</p>
      </PageContent>
    </PageShell>
  );
}
