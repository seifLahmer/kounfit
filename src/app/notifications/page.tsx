
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MainLayout } from "@/components/main-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Bell, ChevronLeft, Check, Frown } from "lucide-react";
import { auth } from "@/lib/firebase";
import { getUserNotifications, markAllNotificationsAsRead,cleanupOldNotifications } from "@/lib/services/notificationService";
import type { Notification } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setLoading(true);
        try {
          const userNotifications = await getUserNotifications(user.uid);
          setNotifications(userNotifications);
        } catch (error) {
          toast({
            title: "Erreur",
            description: "Impossible de charger les notifications.",
            variant: "destructive",
          });
        } finally {
          setLoading(false);
        }
      } else {
        router.replace("/login");
      }
    });

    return () => unsubscribe();
  }, [router, toast]);

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markAllNotificationsAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n))
      );
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de marquer la notification comme lue.",
        variant: "destructive",
      });
    }
    //nettoyer la page de notification 
    await cleanupOldNotifications();
  };

  return (
    <MainLayout>
      <div className="p-4 space-y-4">
        <header className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ChevronLeft />
          </Button>
          <h1 className="text-2xl font-bold font-heading flex items-center gap-2">
            <Bell className="text-primary" /> Notifications
          </h1>
        </header>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
          </div>
        ) : notifications.length > 0 ? (
          <div className="space-y-3">
            {notifications.map((notif) => (
              <Card
                key={notif.id}
                className={cn(
                  "transition-colors",
                  notif.isRead ? "bg-card" : "bg-primary/10"
                )}
              >
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="flex-1">
                    <p className="text-sm">{notif.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(notif.createdAt, {
                        addSuffix: true,
                        locale: fr,
                      })}
                    </p>
                  </div>
                  {!notif.isRead && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleMarkAsRead(notif.id)}
                      className="flex items-center gap-1"
                    >
                      <Check className="w-4 h-4" />
                      Marquer comme lu
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center text-muted-foreground pt-16">
            <Frown className="w-16 h-16 mb-4" />
            <h2 className="text-xl font-semibold">Aucune notification</h2>
            <p>Vos nouvelles alertes apparaîtront ici.</p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}

