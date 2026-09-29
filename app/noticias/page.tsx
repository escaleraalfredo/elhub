// app/noticias/page.tsx
"use client";

import { useMemo, useState } from "react";
import { Bookmark, Heart, RefreshCw, Share2 } from "lucide-react";
import { toast } from "sonner";
import { Card, Chips, EmptyState, Notice, PageContent, Skeleton } from "@/components/ui/Page";
import SafeImg from "@/components/ui/SafeImg";
import { CommentButton, CommentsSheet } from "@/components/comments/Comments";
import { NEWS_SOURCES, sourceById } from "@/lib/news/sources";
import type { NewsItem, NewsResponse } from "@/lib/news/types";
import { useFetchJson } from "@/lib/useFetchJson";
import { useGamification } from "@/lib/gamificationContext";
import { timeAgo } from "@/lib/time";
import { cn } from "@/lib/utils";

const ALL = "Todas";

function SourceBadge({ item }: { item: NewsItem }) {
  const src = sourceById(item.sourceId);
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-200">
      <span className={cn("w-4 h-4 rounded-[5px] text-[9px] font-black flex items-center justify-center text-white", src?.color ?? "bg-zinc-700")}>
        {item.sourceName.charAt(0)}
      </span>
      {item.sourceName}
    </span>
  );
}

function Actions({
  item,
  liked,
  saved,
  onLike,
  onSave,
  onComments,
}: {
  item: NewsItem;
  liked: boolean;
  saved: boolean;
  onLike: () => void;
  onSave: () => void;
  onComments: () => void;
}) {
  const share = async () => {
    try {
      if (navigator.share) await navigator.share({ title: item.title, url: item.link });
      else {
        await navigator.clipboard.writeText(item.link);
        toast.success("Enlace copiado");
      }
    } catch {
      // user cancelled share sheet
    }
  };
  return (
    <div className="flex items-center gap-6 text-zinc-400 mt-3">
      <button onClick={onLike} aria-label="Me gusta" className={cn("transition-colors", liked ? "text-red-500" : "hover:text-white")}>
        <Heart className={cn("w-5 h-5", liked && "fill-current")} />
      </button>
      <CommentButton threadId={`news:${item.id}`} onClick={onComments} />
      <button onClick={share} aria-label="Compartir" className="hover:text-white">
        <Share2 className="w-5 h-5" />
      </button>
      <button onClick={onSave} aria-label="Guardar" className={cn("ml-auto transition-colors", saved ? "text-white" : "hover:text-white")}>
        <Bookmark className={cn("w-5 h-5", saved && "fill-current")} />
      </button>
    </div>
  );
}

export default function NoticiasPage() {
  const { data, loading, error, refresh } = useFetchJson<NewsResponse>("/api/news", 5 * 60_000);
  const { addPoints } = useGamification();
  const [filter, setFilter] = useState<string>(ALL);
  const [liked, setLiked] = useState<Record<string, boolean>>({});
  const [saved, setSaved] = useState<Record<string, boolean>>({});
  const [commentsFor, setCommentsFor] = useState<string | null>(null);

  const sourceNames = useMemo(() => [ALL, ...NEWS_SOURCES.map((s) => s.name)], []);
  const items = useMemo(() => {
    const all = data?.items ?? [];
    return filter === ALL ? all : all.filter((n) => n.sourceName === filter);
  }, [data, filter]);

  const [hero, ...rest] = items;

  const like = (id: string) => {
    setLiked((l) => ({ ...l, [id]: !l[id] }));
    if (!liked[id]) addPoints(2, "Like noticia");
  };
  const save = (id: string) => {
    setSaved((s) => ({ ...s, [id]: !s[id] }));
    toast.success(saved[id] ? "Quitado de guardados" : "Guardado");
  };
  const actions = (item: NewsItem) => (
    <Actions
      item={item}
      liked={!!liked[item.id]}
      saved={!!saved[item.id]}
      onLike={() => like(item.id)}
      onSave={() => save(item.id)}
      onComments={() => setCommentsFor(item.id)}
    />
  );

  return (
    <>
      <Chips options={sourceNames} active={filter} onChange={setFilter} className="pb-0" />

      <PageContent>
        <div className="flex items-center justify-between px-1 text-xs text-zinc-500">
          <span>
            {data ? `Actualizado ${new Date(data.updatedAt).toLocaleTimeString("es-PR", { hour: "numeric", minute: "2-digit" })}` : "Cargando titulares..."}
          </span>
          <button onClick={refresh} className="flex items-center gap-1 hover:text-white" aria-label="Actualizar">
            <RefreshCw className={cn("w-3.5 h-3.5", loading && "animate-spin")} /> Actualizar
          </button>
        </div>

        {data?.sample && (
          <Notice>
            No se pudo conectar a las fuentes de noticias. Estos son titulares de ejemplo; se reemplazan solos cuando vuelva la conexión.
          </Notice>
        )}
        {error && !data && <Notice>No se pudieron cargar las noticias ({error}).</Notice>}

        {loading && !data && (
          <div className="space-y-3">
            <Skeleton className="h-64" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
          </div>
        )}

        {data && items.length === 0 && (
          <EmptyState icon="📰" title="Sin titulares" subtitle={`No hay noticias recientes de ${filter}.`} />
        )}

        {hero && (
          <Card>
            <a href={hero.link} target="_blank" rel="noopener noreferrer" className="block">
              <SafeImg src={hero.image} alt="" className="w-full aspect-[16/9] object-cover" />
              <div className="p-4 pb-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-pr-red text-white px-2 py-0.5 rounded">Lo último</span>
                  <SourceBadge item={hero} />
                  <span className="text-xs text-zinc-500">· {timeAgo(hero.publishedAt)}</span>
                </div>
                <h2 className="mt-2 text-xl font-bold leading-snug text-white">{hero.title}</h2>
                {hero.excerpt && <p className="mt-1.5 text-sm text-zinc-400 line-clamp-3">{hero.excerpt}</p>}
              </div>
            </a>
            <div className="px-4 pb-4">{actions(hero)}</div>
          </Card>
        )}

        {rest.length > 0 && (
          <Card className="divide-y divide-zinc-800">
            {rest.map((item) => (
              <article key={item.id} className="p-4">
                <a href={item.link} target="_blank" rel="noopener noreferrer" className="flex gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <SourceBadge item={item} />
                      <span className="text-xs text-zinc-500">· {timeAgo(item.publishedAt)}</span>
                    </div>
                    <h3 className="mt-1.5 text-[15px] font-semibold leading-snug text-white line-clamp-3">{item.title}</h3>
                  </div>
                  <SafeImg src={item.image} alt="" className="w-20 h-20 rounded-2xl object-cover shrink-0" />
                </a>
                {actions(item)}
              </article>
            ))}
          </Card>
        )}
      </PageContent>

      <CommentsSheet
        open={commentsFor !== null}
        onClose={() => setCommentsFor(null)}
        threadId={`news:${commentsFor ?? ""}`}
      />
    </>
  );
}
