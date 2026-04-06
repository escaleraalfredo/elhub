// app/notifications/page.tsx
"use client";

import { useState, useMemo } from "react";
import { Bell, Heart, MessageCircle, Trophy, UserPlus, Zap, X } from "lucide-react";
import { useGamification } from "@/lib/gamificationContext";
import BottomNav from "@/components/BottomNav";
import { toast } from "sonner";

interface Notification {
  id: number;
  type: "like" | "comment" | "follow" | "badge" | "mention";
  message: string;
  time: string;
  dateGroup: "today" | "yesterday" | "earlier";
  read: boolean;
  icon: React.ReactNode;
  username?: string;
  avatar?: string;
  color: string;
}

export default function NotificationsPage() {
  const { addPoints } = useGamification();

  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 1,
      type: "like",
      message: "Le gustó tu check-in en La Placita",
      time: "hace 2 min",
      dateGroup: "today",
      read: false,
      icon: <Heart className="w-5 h-5" />,
      username: "@sanjuanero",
      avatar: "https://picsum.photos/id/64/128/128",
      color: "text-red-500"
    },
    {
      id: 2,
      type: "comment",
      message: "Comentó: \"¡Qué brutal ese perreo! 🔥\"",
      time: "hace 17 min",
      dateGroup: "today",
      read: false,
      icon: <MessageCircle className="w-5 h-5" />,
      username: "@playero_pr",
      avatar: "https://picsum.photos/id/65/128/128",
      color: "text-blue-500"
    },
    {
      id: 3,
      type: "badge",
      message: "¡Ganaste el badge \"Chinchorro Legend\"!",
      time: "hace 1 hora",
      dateGroup: "today",
      read: true,
      icon: <Trophy className="w-5 h-5" />,
      color: "text-amber-400"
    },
    {
      id: 4,
      type: "follow",
      message: "Empezó a seguirte",
      time: "hace 3 horas",
      dateGroup: "yesterday",
      read: true,
      icon: <UserPlus className="w-5 h-5" />,
      username: "@bayamonesa",
      avatar: "https://picsum.photos/id/66/128/128",
      color: "text-emerald-500"
    },
    {
      id: 5,
      type: "mention",
      message: "Te mencionó en un Reel de Piñones",
      time: "ayer",
      dateGroup: "yesterday",
      read: true,
      icon: <Zap className="w-5 h-5" />,
      username: "@lamofonguera",
      avatar: "https://picsum.photos/id/67/128/128",
      color: "text-purple-500"
    },
    {
      id: 6,
      type: "like",
      message: "Le gustó tu foto en Playa Flamenco",
      time: "hace 2 días",
      dateGroup: "earlier",
      read: true,
      icon: <Heart className="w-5 h-5" />,
      username: "@culebra_vibes",
      avatar: "https://picsum.photos/id/68/128/128",
      color: "text-red-500"
    },
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  // Group notifications by day
  const groupedNotifications = useMemo(() => {
    const groups: Record<string, Notification[]> = {
      today: [],
      yesterday: [],
      earlier: [],
    };

    notifications.forEach(notif => {
      groups[notif.dateGroup].push(notif);
    });

    return groups;
  }, [notifications]);

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    toast.success("Todas las notificaciones marcadas como leídas");
  };

  const deleteNotification = (id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    toast.info("Notificación eliminada");
  };

  return (
    <div className="min-h-screen bg-dark-bg pb-20">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="sticky top-0 bg-zinc-950 border-b border-zinc-800 z-50 px-5 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="w-7 h-7 text-white" />
              <h1 className="text-2xl font-bold text-white">Notificaciones</h1>
            </div>

            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-sm font-medium text-pr-red hover:text-red-400 transition-colors"
              >
                Marcar todo como leído
              </button>
            )}
          </div>
        </div>

        <div className="px-3">
          {/* Today */}
          {groupedNotifications.today.length > 0 && (
            <div className="mt-6">
              <div className="px-3 mb-3 text-xs font-semibold text-zinc-500 tracking-widest">HOY</div>
              {groupedNotifications.today.map((notif) => (
                <NotificationCard key={notif.id} notif={notif} onDelete={deleteNotification} />
              ))}
            </div>
          )}

          {/* Yesterday */}
          {groupedNotifications.yesterday.length > 0 && (
            <div className="mt-8">
              <div className="px-3 mb-3 text-xs font-semibold text-zinc-500 tracking-widest">AYER</div>
              {groupedNotifications.yesterday.map((notif) => (
                <NotificationCard key={notif.id} notif={notif} onDelete={deleteNotification} />
              ))}
            </div>
          )}

          {/* Earlier */}
          {groupedNotifications.earlier.length > 0 && (
            <div className="mt-8">
              <div className="px-3 mb-3 text-xs font-semibold text-zinc-500 tracking-widest">ANTERIOR</div>
              {groupedNotifications.earlier.map((notif) => (
                <NotificationCard key={notif.id} notif={notif} onDelete={deleteNotification} />
              ))}
            </div>
          )}

          {notifications.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <Bell className="w-16 h-16 text-zinc-700 mb-4" />
              <p className="text-zinc-400 text-lg">No tienes notificaciones</p>
              <p className="text-zinc-500 text-sm mt-2">¡Sigue participando para recibir más!</p>
            </div>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}

// Reusable Notification Card Component
function NotificationCard({ 
  notif, 
  onDelete 
}: { 
  notif: Notification; 
  onDelete: (id: number) => void;
}) {
  return (
    <div className={`mx-2 mb-3 bg-zinc-900 rounded-3xl p-5 flex gap-4 relative transition-all hover:bg-zinc-800/90 ${!notif.read ? "border-l-4 border-pr-red" : ""}`}>
      {/* Avatar */}
      {notif.avatar ? (
        <div className="w-11 h-11 rounded-2xl overflow-hidden flex-shrink-0 border border-zinc-700">
          <img src={notif.avatar} alt={notif.username} className="w-full h-full object-cover" />
        </div>
      ) : (
        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center bg-zinc-800 flex-shrink-0 ${notif.color}`}>
          {notif.icon}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="text-[15px] leading-snug text-white">
          {notif.username && <span className="font-semibold text-pr-red">{notif.username} </span>}
          {notif.message}
        </div>
        <p className="text-xs text-zinc-500 mt-1.5">{notif.time}</p>
      </div>

      {/* Delete Button */}
      <button
        onClick={() => onDelete(notif.id)}
        className="absolute top-5 right-5 text-zinc-500 hover:text-zinc-400 p-1 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>

      {/* Unread Indicator */}
      {!notif.read && (
        <div className="absolute top-6 right-6 w-2.5 h-2.5 bg-pr-red rounded-full animate-pulse" />
      )}
    </div>
  );
}