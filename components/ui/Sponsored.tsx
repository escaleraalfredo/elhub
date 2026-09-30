// components/ui/Sponsored.tsx
// Ad slot for local sponsors. Until a sponsor is booked it shows a house ad
// inviting businesses to advertise. Always labeled "Patrocinado".
import { Megaphone } from "lucide-react";
import { Card } from "./Page";

export interface Sponsor {
  name: string;
  headline: string;
  cta: string;
  url: string;
  image?: string;
}

const HOUSE_AD: Sponsor = {
  name: "ElHub",
  headline: "¿Tienes un negocio en Puerto Rico? Llega a miles de boricuas aquí.",
  cta: "Anúnciate",
  url: "mailto:publicidad@elhub.app?subject=Quiero%20anunciarme%20en%20ElHub",
};

export default function Sponsored({ sponsor = HOUSE_AD, placement }: { sponsor?: Sponsor; placement: string }) {
  return (
    <Card className="p-4" >
      <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-2">
        <span>Patrocinado</span>
        <span className="normal-case font-medium tracking-normal">{sponsor.name}</span>
      </div>
      <a
        href={sponsor.url}
        target="_blank"
        rel="noopener noreferrer sponsored"
        data-placement={placement}
        className="flex items-center gap-3"
      >
        <span className="w-11 h-11 rounded-2xl bg-brand/15 text-brand flex items-center justify-center shrink-0">
          <Megaphone className="w-5 h-5" />
        </span>
        <span className="flex-1 text-sm font-medium text-zinc-100 leading-snug">{sponsor.headline}</span>
        <span className="shrink-0 text-sm font-semibold text-brand">{sponsor.cta}</span>
      </a>
    </Card>
  );
}
