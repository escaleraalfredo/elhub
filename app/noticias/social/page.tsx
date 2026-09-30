// app/noticias/social/page.tsx
"use client";

import { useState } from "react";
import { BadgeCheck, ExternalLink, Heart, RefreshCw, Repeat2 } from "lucide-react";
import { Card, EmptyState, Notice, PageContent, Skeleton } from "@/components/ui/Page";
import Avatar from "@/components/ui/Avatar";
import SafeImg from "@/components/ui/SafeImg";
import { CommentButton, CommentsSheet } from "@/components/comments/Comments";
import { PR_ACCOUNTS, type XPost, type XResponse } from "@/lib/x/types";
import { useFetchJson } from "@/lib/useFetchJson";
import { award } from "@/lib/points";
import { formatCount, timeAgo } from "@/lib/time";
import { cn } from "@/lib/utils";

function PostText({ text }: { text: string }) {
  return (
    <p className="text-[15px] leading-snug text-zinc-100 whitespace-pre-wrap break-words">
      {text.split(/(\s+)/).map((w, i) =>
        /^(#|@)\w+/.test(w) || /^https?:\/\//.test(w) ? (
          <span key={i} className="text-sky-400">{w}</span>
        ) : (
          w
        )
      )}
    </p>
  );
}

function Post({ post, onComments }: { post: XPost; onComments: () => void }) {
  const [liked, setLiked] = useState(false);
  return (
    <article className="p-4 flex gap-3">
      <Avatar name={post.author.username || post.author.name} src={post.author.avatar} size={40} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1 text-sm min-w-0">
          <span className="font-semibold text-ink truncate">{post.author.name}</span>
          {post.author.verified && <BadgeCheck className="w-4 h-4 text-sky-400 shrink-0" />}
          <span className="text-zinc-500 truncate">@{post.author.username} · {timeAgo(post.createdAt)}</span>
          <a href={post.url} target="_blank" rel="noopener noreferrer" className="ml-auto text-zinc-500 hover:text-ink shrink-0" aria-label="Ver en X">
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
        <div className="mt-1">
          <PostText text={post.text} />
        </div>
        <SafeImg src={post.image} alt="" className="mt-3 w-full max-h-80 object-cover rounded-2xl border border-zinc-800" />
        <div className="flex items-center gap-8 mt-3 text-zinc-400">
          <CommentButton threadId={`x:${post.id}`} onClick={onComments} />
          <a
            href={`https://x.com/intent/retweet?tweet_id=${post.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 hover:text-emerald-400"
          >
            <Repeat2 className="w-5 h-5" />
            <span className="text-sm tabular-nums">{formatCount(post.metrics.reposts)}</span>
          </a>
          <button
            onClick={() => {
              if (!liked) award("like", { key: `x:${post.id}` });
              setLiked(!liked);
            }}
            className={cn("flex items-center gap-1.5", liked ? "text-red-500" : "hover:text-red-400")}
          >
            <Heart className={cn("w-5 h-5", liked && "fill-current")} />
            <span className="text-sm tabular-nums">{formatCount(post.metrics.likes + (liked ? 1 : 0))}</span>
          </button>
        </div>
      </div>
    </article>
  );
}

export default function XFeedPage() {
  const { data, loading, refresh } = useFetchJson<XResponse>("/api/x", 5 * 60_000);
  const [commentsFor, setCommentsFor] = useState<string | null>(null);

  return (
    <>
      <div className="max-w-md mx-auto flex gap-2 overflow-x-auto scrollbar-hide px-4 py-2.5">
        {PR_ACCOUNTS.map((a) => (
          <a
            key={a.username}
            href={`https://x.com/${a.username}`}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-full pl-1 pr-3 py-1 text-sm text-zinc-200 hover:bg-zinc-800"
          >
            <Avatar name={a.username} size={24} />
            {a.name}
          </a>
        ))}
      </div>

      <PageContent>
        <div className="flex items-center justify-between px-1 text-xs text-zinc-500">
          <span>Lo que se habla de Puerto Rico en X</span>
          <button onClick={refresh} className="flex items-center gap-1 hover:text-ink">
            <RefreshCw className={cn("w-3.5 h-3.5", loading && "animate-spin")} /> Actualizar
          </button>
        </div>

        {data?.sample && (
          <Notice>
            {data.reason === "missing_token"
              ? "Posts de ejemplo. Para ver X en vivo, añade X_BEARER_TOKEN (plan de X API con búsqueda) en las variables de entorno de Vercel."
              : "No se pudo conectar a X ahora mismo. Mostrando posts de ejemplo."}
          </Notice>
        )}

        {loading && !data && (
          <div className="space-y-3">
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
          </div>
        )}

        {data && data.posts.length === 0 && <EmptyState icon="𝕏" title="No hay posts recientes" />}

        {data && data.posts.length > 0 && (
          <Card className="divide-y divide-zinc-800">
            {data.posts.map((post) => (
              <Post key={post.id} post={post} onComments={() => setCommentsFor(post.id)} />
            ))}
          </Card>
        )}
      </PageContent>

      <CommentsSheet open={commentsFor !== null} onClose={() => setCommentsFor(null)} threadId={`x:${commentsFor ?? ""}`} />
    </>
  );
}
