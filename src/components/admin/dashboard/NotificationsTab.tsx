import { Bell, CheckCheck, Trash2, ShoppingBag, AlertTriangle, Star, Info } from "lucide-react";
import { useBakeryStore, type DashboardNotification } from "@/context/BakeryStoreContext";
import { Button } from "@/components/ui/button";

interface NotificationsTabProps {
  onNavigateTab: (tab: string) => void;
}

export function NotificationsTab({ onNavigateTab }: NotificationsTabProps) {
  const { notifications, markNotificationAsRead, markAllNotificationsAsRead, clearNotifications } =
    useBakeryStore();

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getIcon = (type: DashboardNotification["type"]) => {
    switch (type) {
      case "order":
        return <ShoppingBag className="h-4 w-4 text-rose" />;
      case "inventory":
        return <AlertTriangle className="h-4 w-4 text-amber-600" />;
      case "review":
        return <Star className="h-4 w-4 text-purple-600" />;
      default:
        return <Info className="h-4 w-4 text-blue-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-[#1A100C]">Bakery Alerts & Notifications</h2>
          <p className="text-xs text-[#8C7A70]">Stay informed of incoming orders, ingredient shortages and new reviews</p>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={markAllNotificationsAsRead}
              className="text-xs font-semibold gap-1.5 border-[#EFE4DB] hover:bg-[#FAF7F2]"
            >
              <CheckCheck className="h-3.5 w-3.5" /> Mark All as Read
            </Button>
          )}
          {notifications.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearNotifications}
              className="text-xs font-semibold text-[#8C7A70] hover:text-red-600"
            >
              Clear All
            </Button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <div className="rounded-3xl border border-[#EFE4DB] bg-white p-6 shadow-card divide-y divide-[#F2EBE5]">
        {notifications.length === 0 ? (
          <div className="py-16 text-center">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-[#FAF7F2] text-[#8C7A70]">
              <Bell className="h-6 w-6" />
            </div>
            <p className="mt-3 text-sm font-bold text-[#1A100C]">All Caught Up!</p>
            <p className="text-xs text-[#8C7A70]">No new notifications at this time.</p>
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => {
                markNotificationAsRead(n.id);
                if (n.link) onNavigateTab(n.link);
              }}
              className={`flex items-start justify-between gap-4 py-4 px-2 cursor-pointer transition-colors rounded-2xl ${
                n.read ? "hover:bg-[#FAF7F2]/50 opacity-80" : "bg-rose/5 hover:bg-rose/10"
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white border border-[#EFE4DB] shadow-sm mt-0.5">
                  {getIcon(n.type)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className={`text-xs font-bold text-[#1A100C] ${!n.read && "text-rose"}`}>{n.title}</p>
                    {!n.read && (
                      <span className="h-2 w-2 rounded-full bg-rose inline-block" />
                    )}
                  </div>
                  <p className="text-xs text-[#5C4D44] mt-0.5 leading-relaxed">{n.message}</p>
                  <span className="text-[0.68rem] text-[#8C7A70] block mt-1">{n.timestamp}</span>
                </div>
              </div>

              {n.link && (
                <Button variant="ghost" size="sm" className="text-xs font-bold text-rose hover:bg-rose/10 shrink-0">
                  View →
                </Button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
