// components/comments/Comments.tsx
// Instagram-style comments used everywhere in the app:
// - username + time, text, "Responder", heart with count on the right
// - one level of replies, collapsed behind "Ver N respuestas"
// - double-tap a comment to like it
// - emoji quick bar and "Respondiendo a ..." banner in the composer
// - delete your own comments
"use client";

import { Fragment, useId, useMemo, useState } from "react";
import { Heart, MessageCircle, X } from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import BottomSheet from "@/components/ui/BottomSheet";
import { award } from "@/lib/points";
import {
  CURRENT_USER,
  useCommentCount,
  useComments,
  type CommentData,
  type SeedComment,
} from "@/lib/comments/store";
import { formatCount, timeAgo } from "@/lib/time";
import { cn } from "@/lib/utils";

const QUICK_EMOJIS = ["❤️", "🙌", "🔥", "👏", "😢", "😍", "😮", "😂", "🇵🇷"];

function renderText(text: string) {
  return text.split(/(@[\w.]+)/g).map((part, i) =>
    part.startsWith("@") ? (
      <span key={i} className="text-sky-400">
        {part}
      </span>
    ) : (
      <Fragment key={i}>{part}</Fragment>
    )
  );
}

function useThread(threadId: string, seed?: SeedComment[]) {
  const thread = useComments(threadId, seed);
  const [draft, setDraft] = useState("");
  const [replyTo, setReplyTo] = useState<{ id: string; author: string } | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const inputId = useId();
  const focusInput = () => requestAnimationFrame(() => document.getElementById(inputId)?.focus());

  const { topLevel, replies } = useMemo(() => {
    const top = thread.comments.filter((c) => !c.parentId);
    const byParent: Record<string, CommentData[]> = {};
    thread.comments.forEach((c) => {
      if (c.parentId) (byParent[c.parentId] ??= []).push(c);
    });
    // Your newest comments first, then everyone else in original order.
    const mine = top.filter((c) => c.mine).reverse();
    const others = top.filter((c) => !c.mine);
    return { topLevel: [...mine, ...others], replies: byParent };
  }, [thread.comments]);

  const startReply = (c: CommentData) => {
    const parent = c.parentId ?? c.id;
    setReplyTo({ id: parent, author: c.author });
    setDraft(c.author === CURRENT_USER ? "" : `@${c.author} `);
    setExpanded((e) => ({ ...e, [parent]: true }));
    focusInput();
  };

  const submit = () => {
    const text = draft.trim();
    if (!text) return;
    thread.add(text, replyTo?.id ?? null);
    if (replyTo) setExpanded((e) => ({ ...e, [replyTo.id]: true }));
    setDraft("");
    setReplyTo(null);
    award("comment");
  };

  return {
    ...thread,
    topLevel,
    replies,
    draft,
    setDraft,
    replyTo,
    setReplyTo,
    expanded,
    setExpanded,
    inputId,
    focusInput,
    startReply,
    submit,
  };
}

type ThreadApi = ReturnType<typeof useThread>;

function CommentRow({
  c,
  api,
  isReply = false,
}: {
  c: CommentData;
  api: ThreadApi;
  isReply?: boolean;
}) {
  const [pop, setPop] = useState(false);
  const like = () => {
    if (!c.liked) {
      setPop(true);
      setTimeout(() => setPop(false), 450);
    }
    api.toggleLike(c.id);
  };
  const when = c.createdAt ? timeAgo(c.createdAt) : c.time;

  return (
    <div className="flex gap-3" onDoubleClick={() => !c.liked && like()}>
      <Avatar name={c.author} src={c.avatar} size={isReply ? 24 : 32} className="mt-0.5" />
      <div className="flex-1 min-w-0 select-none">
        <p className="text-[13px] leading-tight">
          <span className="font-semibold text-ink">{c.author}</span>
          <span className="text-zinc-500 ml-2">{when}</span>
        </p>
        <p className="text-[14px] leading-snug text-zinc-100 mt-0.5 whitespace-pre-wrap break-words">
          {renderText(c.text)}
        </p>
        <div className="flex items-center gap-4 mt-1.5 text-xs font-semibold text-zinc-500">
          <button onClick={() => api.startReply(c)} className="hover:text-zinc-300">
            Responder
          </button>
          {c.mine && (
            <button onClick={() => api.remove(c.id)} className="hover:text-red-400">
              Eliminar
            </button>
          )}
        </div>
      </div>
      <button
        onClick={like}
        aria-label={c.liked ? "Quitar me gusta" : "Me gusta"}
        className="w-7 shrink-0 flex flex-col items-center pt-1 text-zinc-500 hover:text-zinc-300"
      >
        <Heart
          className={cn(
            "w-3.5 h-3.5 transition-transform",
            c.liked && "fill-red-500 text-red-500",
            pop && "scale-150"
          )}
        />
        {c.likes > 0 && <span className="text-[11px] mt-0.5 tabular-nums">{formatCount(c.likes)}</span>}
      </button>
    </div>
  );
}

function CommentList({ api }: { api: ThreadApi }) {
  if (api.topLevel.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-lg font-semibold text-ink">Aún no hay comentarios</p>
        <p className="text-sm text-zinc-500 mt-1">Inicia la conversación.</p>
      </div>
    );
  }
  return (
    <div className="space-y-5">
      {api.topLevel.map((c) => {
        const kids = api.replies[c.id] ?? [];
        const open = api.expanded[c.id];
        return (
          <div key={c.id}>
            <CommentRow c={c} api={api} />
            {kids.length > 0 && (
              <div className="ml-11 mt-3">
                <button
                  onClick={() => api.setExpanded((e) => ({ ...e, [c.id]: !open }))}
                  className="flex items-center gap-3 text-xs font-semibold text-zinc-500 hover:text-zinc-300"
                >
                  <span className="w-6 h-px bg-zinc-600" />
                  {open
                    ? "Ocultar respuestas"
                    : `Ver ${kids.length} ${kids.length === 1 ? "respuesta" : "respuestas"}`}
                </button>
                {open && (
                  <div className="space-y-4 mt-3">
                    {kids.map((r) => (
                      <CommentRow key={r.id} c={r} api={api} isReply />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function Composer({ api }: { api: ThreadApi }) {
  return (
    <div className="px-3 pt-2 pb-3 bg-zinc-900">
      <div className="flex justify-between px-1 pb-2 text-[22px]">
        {QUICK_EMOJIS.map((e) => (
          <button
            key={e}
            onClick={() => {
              api.setDraft((d) => d + e);
              api.focusInput();
            }}
            className="active:scale-90 transition-transform"
          >
            {e}
          </button>
        ))}
      </div>
      {api.replyTo && (
        <div className="flex items-center justify-between text-xs text-zinc-400 bg-zinc-800/70 rounded-xl px-3 py-2 mb-2">
          <span>
            Respondiendo a <span className="font-semibold text-zinc-200">{api.replyTo.author}</span>
          </span>
          <button
            onClick={() => {
              api.setReplyTo(null);
              api.setDraft("");
            }}
            aria-label="Cancelar respuesta"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      <div className="flex items-center gap-3">
        <Avatar name={CURRENT_USER} size={32} />
        <div className="flex-1 flex items-center bg-zinc-800 border border-zinc-700 rounded-full pl-4 pr-1.5 py-1">
          <input
            id={api.inputId}
            value={api.draft}
            onChange={(e) => api.setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && api.submit()}
            placeholder={api.replyTo ? `Responder a ${api.replyTo.author}...` : "Añade un comentario..."}
            className="flex-1 min-w-0 bg-transparent py-1.5 text-[14px] placeholder-zinc-500 focus:outline-none"
          />
          <button
            onClick={api.submit}
            disabled={!api.draft.trim()}
            className="px-3 py-1.5 text-sm font-semibold text-brand disabled:text-zinc-600"
          >
            Publicar
          </button>
        </div>
      </div>
    </div>
  );
}

/** Comments in a bottom sheet (feeds: news, X, sports). */
export function CommentsSheet({
  open,
  onClose,
  threadId,
  seed,
  title = "Comentarios",
  header,
}: {
  open: boolean;
  onClose: () => void;
  threadId: string;
  seed?: SeedComment[];
  title?: string;
  /** Optional content above the comments (game box score, event details...). */
  header?: React.ReactNode;
}) {
  const api = useThread(threadId, seed);
  return (
    <BottomSheet open={open} onClose={onClose} title={title} footer={<Composer api={api} />}>
      {header && <div className="border-b border-zinc-800">{header}</div>}
      <div className="px-4 py-4">
        {header && (
          <h4 className="text-sm font-semibold mb-4">
            Comentarios <span className="text-zinc-500 font-normal">({api.count})</span>
          </h4>
        )}
        <CommentList api={api} />
      </div>
    </BottomSheet>
  );
}

/** Comments inline on a detail page (temas, encuestas) with a composer pinned above the nav. */
export function CommentSection({ threadId, seed }: { threadId: string; seed?: SeedComment[] }) {
  const api = useThread(threadId, seed);
  return (
    <section className="pb-56">
      <h2 className="font-semibold text-[15px] mb-4">
        Comentarios <span className="text-zinc-500 font-normal">({api.count})</span>
      </h2>
      <CommentList api={api} />
      <div className="fixed inset-x-0 bottom-[calc(5.5rem+env(safe-area-inset-bottom))] z-40 px-3">
        <div className="max-w-md mx-auto rounded-3xl overflow-hidden shadow-2xl shadow-black/50 border border-white/5">
          <Composer api={api} />
        </div>
      </div>
    </section>
  );
}

/** Speech-bubble button with the live comment count for a thread. */
export function CommentButton({
  threadId,
  seed,
  onClick,
  className,
}: {
  threadId: string;
  seed?: SeedComment[];
  onClick: () => void;
  className?: string;
}) {
  const count = useCommentCount(threadId, seed);
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={cn("flex items-center gap-1.5 text-zinc-400 hover:text-ink transition-colors", className)}
      aria-label="Comentarios"
    >
      <MessageCircle className="w-5 h-5" />
      <span className="text-sm tabular-nums">{formatCount(count)}</span>
    </button>
  );
}

/** Instagram's "Ver los N comentarios" link under a post. */
export function ViewAllComments({
  threadId,
  seed,
  onClick,
}: {
  threadId: string;
  seed?: SeedComment[];
  onClick: () => void;
}) {
  const count = useCommentCount(threadId, seed);
  if (count === 0) {
    return (
      <button onClick={onClick} className="text-sm text-zinc-500 hover:text-zinc-300">
        Añade un comentario...
      </button>
    );
  }
  return (
    <button onClick={onClick} className="text-sm text-zinc-500 hover:text-zinc-300">
      {count === 1 ? "Ver 1 comentario" : `Ver los ${count} comentarios`}
    </button>
  );
}
