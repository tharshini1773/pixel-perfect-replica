import { Link } from "@tanstack/react-router";
import { Menu, X, Bell, ExternalLink, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SupabaseStatus } from "./SupabaseStatus";

export interface AdminHeaderProps {
  onToggleMobileMenu?: () => void;
  mobileMenuOpen?: boolean;
  unreadNotifsCount?: number;
  onNotificationsClick?: () => void;
  onLogout: () => void | Promise<void>;
  userName?: string;
}

export function AdminHeader({
  onToggleMobileMenu,
  mobileMenuOpen = false,
  unreadNotifsCount = 0,
  onNotificationsClick,
  onLogout,
  userName = "Tharshini",
}: AdminHeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-[#EFE4DB] bg-white/95 px-4 sm:px-8 backdrop-blur-md">
      <div className="flex items-center gap-3">
        {/* Mobile Hamburger */}
        {onToggleMobileMenu && (
          <button
            type="button"
            onClick={onToggleMobileMenu}
            className="rounded-xl border border-[#EFE4DB] p-2 text-[#5C4D44] hover:bg-[#FAF7F2] lg:hidden"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        )}

        {/* Responsive Welcome Banner */}
        <div className="flex items-center gap-2">
          <span className="text-xs sm:text-sm md:text-base font-semibold text-[#8C7A70]">
            Welcome, <span className="font-bold text-rose">{userName}!</span>
          </span>
          <span className="hidden lg:inline-flex">
            <SupabaseStatus compact />
          </span>
        </div>
      </div>

      {/* Header Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Notifications Shortcut */}
        {onNotificationsClick && (
          <button
            type="button"
            onClick={onNotificationsClick}
            className="relative rounded-2xl border border-[#EFE4DB] p-2 sm:p-2.5 text-[#5C4D44] hover:bg-[#FAF7F2] transition-colors"
            title="Notifications"
            aria-label="View notifications"
          >
            <Bell className="h-4 w-4" />
            {unreadNotifsCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose text-[0.6rem] font-bold text-white">
                {unreadNotifsCount}
              </span>
            )}
          </button>
        )}

        {/* View Customer Website Button */}
        <Button
          asChild
          variant="outline"
          size="sm"
          className="hidden sm:inline-flex gap-1.5 border-[#EFE4DB] text-xs font-bold hover:bg-cream"
        >
          <Link to="/" target="_blank">
            <span>View Customer Website</span>
            <ExternalLink className="h-3.5 w-3.5 text-[#8C7A70]" />
          </Link>
        </Button>

        {/* Sign Out Button */}
        <Button
          type="button"
          onClick={onLogout}
          variant="outline"
          size="sm"
          className="gap-1.5 border-rose/30 text-xs font-bold text-rose hover:bg-rose/10 shadow-sm"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span className="hidden xs:inline">Sign Out</span>
        </Button>
      </div>
    </header>
  );
}
