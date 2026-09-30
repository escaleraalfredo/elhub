// app/noticias/page.tsx
"use client";

import { Fragment, useMemo, useState } from "react";
import { Bookmark, Heart, MapPin, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Card, Chips, EmptyState, Notice, PageContent, Skeleton } from "@/components/ui/Page";
import Artwork, { SECTION_EMOJI } from "@/components/ui/Artwork";
import Sponsored from "@/components/ui/Sponsored";
import ShareButton from "@/components/ui/ShareButton";
import { SECTIONS } from "@/lib/news/classify";
import { PUEBLOS, useProfile } from "@/lib/profile";
import { CommentButton, CommentsSheet } from "@/components/comments/Comments";
import { DIASPORA_FEED, NEWS_SOURCES, sourceById } from "@/lib/news/sources";
import type { NewsItem, NewsResponse } from "@/lib/news/types";
import { useFetchJson } from "@/lib/useFetchJson";
import { award } from "@/lib/points";
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
  return (
    <div className="flex items-center gap-6 text-zinc-400 mt-3">
      <button onClick={onLike} aria-label="Me gusta" className={cn("transition-colors", liked ? "text-red-500" : "hover:text-ink")}>
        <Heart className={cn("w-5 h-5", liked && "fill-current")} />
      </button>
      <CommentButton threadId={`news:${item.id}`} onClick={onComments} />
      <ShareButton title={item.title} text={item.sourceName} url={item.link} pointsKey={`news:${item.id}`} />
      <button onClick={onSave} aria-label="Guardar" className={cn("ml-auto transition-colors", saved ? "text-ink" : "hover:text-ink")}>
        <Bookmark className={cn("w-5 h-5", saved && "fill-current")} />
      </button>
    </div>
  );
}

export default function NoticiasPage() {
  const { data, loading, error, refresh } = useFetchJson<NewsResponse>("/api/news", 5 * 60_000);
  const profile = useProfile();
  const [section, setSection] = useState<string>(ALL);
  const [source, setSource] = useState<string>(ALL);
  const [town, setTown] = useState<string>("");
  const [liked, setLiked] = useState<Record<string, boolean>>({});
  const [saved, setSaved] = useState<Record<string, boolean>>({});
  const [commentsFor, setCommentsFor] = useState<string | null>(null);

  const sections = useMemo(
    () => [ALL, ...(profile.diaspora ? ["Diáspora", ...SECTIONS.filter((x) => x !== "Diáspora")] : SECTIONS)],
    [profile.diaspora]
  );
  const sourceNames = useMemo(() => [ALL, ...NEWS_SOURCES.map((s) => s.name), DIASPORA_FEED.name], []);
  const items = useMemo(
    () =>
      (data?.items ?? [])
        .filter((n) => section === ALL || n.section === section)
        .filter((n) => source === ALL || n.sourceName === source || (source === DIASPORA_FEED.name && n.sourceId === DIASPORA_FEED.id))
        .filter((n) => !town || n.municipios.includes(town)),
    [data, section, source, town]
  );
  const filterLabel = [section !== ALL && section, source !== ALL && source, town].filter(Boolean).join(" · ") || "Todas";

  const [hero, ...rest] = items;

  const like = (id: string) => {
    setLiked((l) => ({ ...l, [id]: !l[id] }));
    if (!liked[id]) award("like", { key: `news:${id}` });
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
      <Chips options={sections} active={section} onChange={setSection} className="pb-0" />
      <div className="max-w-md mx-auto flex gap-2 overflow-x-auto scrollbar-hide px-4 pt-2">
        {profile.pueblo && !profile.pueblo.includes("diáspora") && (
          <button
            onClick={() => setTown(town === profile.pueblo ? "" : profile.pueblo)}
            className={cn(
              "shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold border",
              town === profile.pueblo ? "bg-ink text-zinc-950 border-ink" : "border-transparent bg-zinc-900 text-zinc-300"
            )}
          >
            <MapPin className="w-3.5 h-3.5" /> Mi pueblo
          </button>
        )}
        <select
          value={town}
          onChange={(e) => setTown(e.target.value)}
          className="shrink-0 bg-zinc-900 rounded-full px-3 py-1.5 text-xs focus:outline-none"
          aria-label="Filtrar por municipio"
        >
          <option value="">Todos los pueblos</option>
          {PUEBLOS.filter((p) => !p.includes("diáspora")).map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
        <select
          value={source}
          onChange={(e) => setSource(e.target.value)}
          className="shrink-0 bg-zinc-900 rounded-full px-3 py-1.5 text-xs focus:outline-none"
          aria-label="Filtrar por medio"
        >
          {sourceNames.map((n) => (
            <option key={n} value={n}>{n === ALL ? "Todos los medios" : n}</option>
          ))}
        </select>
      </div>

      <PageContent>
        <div className="flex items-center justify-between px-1 text-xs text-zinc-500">
          <span>
            {data ? `Actualizado ${new Date(data.updatedAt).toLocaleTimeString("es-PR", { hour: "numeric", minute: "2-digit" })}` : "Cargando titulares..."}
          </span>
          <button onClick={refresh} className="flex items-center gap-1 hover:text-ink" aria-label="Actualizar">
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
          <EmptyState icon="📰" title="Sin titulares" subtitle={`No hay noticias recientes para: ${filterLabel}.`} />
        )}

        {hero && (
          <Card>
            <a href={hero.link} target="_blank" rel="noopener noreferrer" onClick={() => award("read_news", { key: hero.id })} className="block">
              <div className="relative w-full aspect-[16/9]"><Artwork seed={hero.id} kind={hero.section} emoji={SECTION_EMOJI[hero.section]} image={hero.image} /></div>
              <div className="p-4 pb-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-accent-gradient text-white px-2 py-0.5 rounded">Lo último</span>
                  <SourceBadge item={hero} />
                  <span className="text-xs text-zinc-500">· {timeAgo(hero.publishedAt)}</span>
                </div>
                <h2 className="mt-2 text-xl font-bold leading-snug text-ink">{hero.title}</h2>
                {hero.excerpt && <p className="mt-1.5 text-sm text-zinc-400 line-clamp-3">{hero.excerpt}</p>}
              </div>
            </a>
            <div className="px-4 pb-4">{actions(hero)}</div>
          </Card>
        )}

        {[rest.slice(0, 4), rest.slice(4)].map((chunk, i) =>
          chunk.length === 0 ? null : (
            <Fragment key={i}>
              {i === 1 && <Sponsored placement="noticias" />}
              <Card className="divide-y divide-zinc-800">
                {chunk.map((item) => (
                  <article key={item.id} className="p-4">
                    <a href={item.link} target="_blank" rel="noopener noreferrer" onClick={() => award("read_news", { key: item.id })} className="flex gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <SourceBadge item={item} />
                          <span className="text-xs text-zinc-500">· {timeAgo(item.publishedAt)}</span>
                        </div>
                        <h3 className="mt-1.5 text-[15px] font-semibold leading-snug text-ink line-clamp-3">{item.title}</h3>
                      </div>
                      <div className="relative w-20 h-20 rounded-2xl overflow-hidden shrink-0"><Artwork seed={item.id} kind={item.section} emoji={SECTION_EMOJI[item.section]} image={item.image} className="[&>span]:text-[56px] [&>span]:-right-2 [&>span]:-bottom-3" /></div>
                    </a>
                    {actions(item)}
                  </article>
                ))}
              </Card>
            </Fragment>
          )
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
