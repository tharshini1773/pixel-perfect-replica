import { Link } from "@tanstack/react-router";
import { business } from "@/config/business";
import { cn } from "@/lib/utils";

export function Logo({
  light = false,
  className,
  iconOnly = false,
}: {
  light?: boolean;
  className?: string;
  iconOnly?: boolean;
}) {
  return (
    <Link
      to="/"
      className={cn("group flex items-center gap-3 transition-opacity duration-200 hover:opacity-95", className)}
      aria-label={`${business.name} home`}
    >
      {/* Bespoke Artisan Emblem (SVG Vector) */}
      <div className="relative shrink-0">
        <svg
          viewBox="0 0 48 48"
          width="44"
          height="44"
          className="transition-transform duration-500 ease-out group-hover:scale-105 group-hover:rotate-3 shadow-soft rounded-[13px]"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id={`logoBg_${light ? "light" : "dark"}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#E85D75" />
              <stop offset="60%" stop-color="#C23854" />
              <stop offset="100%" stop-color="#8F1D35" />
            </linearGradient>

            <linearGradient id={`goldSpark_${light ? "light" : "dark"}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#FFF0B8" />
              <stop offset="50%" stop-color="#F5C362" />
              <stop offset="100%" stop-color="#D99426" />
            </linearGradient>

            <linearGradient id={`frosting_${light ? "light" : "dark"}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stop-color="#FFFFFF" />
              <stop offset="100%" stop-color="#FFF2EC" />
            </linearGradient>
          </defs>

          {/* Squircle Badge Background */}
          <rect
            x="1"
            y="1"
            width="46"
            height="46"
            rx="13.5"
            fill={`url(#logoBg_${light ? "light" : "dark"})`}
          />
          <rect
            x="1.75"
            y="1.75"
            width="44.5"
            height="44.5"
            rx="12.75"
            fill="none"
            stroke="#FFFFFF"
            strokeOpacity="0.28"
            strokeWidth="1.2"
          />

          {/* Cake Tier Mark */}
          <g>
            {/* Base Tier */}
            <path
              d="M12 32.5 C12 30.5 13.6 29 15.7 29 L32.3 29 C34.4 29 36 30.5 36 32.5 C36 34.5 34.4 36 32.3 36 L15.7 36 C13.6 36 12 34.5 12 32.5 Z"
              fill={`url(#frosting_${light ? "light" : "dark"})`}
            />
            {/* Delicate Piping Swirl */}
            <path
              d="M15.5 32.5 Q20 34 24 32.5 Q28 31 32.5 32.5"
              fill="none"
              stroke="#E85D75"
              strokeWidth="1.2"
              strokeLinecap="round"
              opacity="0.8"
            />

            {/* Top Tier */}
            <path
              d="M16 22.5 C16 20.8 17.4 19.5 19.3 19.5 L28.7 19.5 C30.6 19.5 32 20.8 32 22.5 C32 24.2 30.6 25.5 28.7 25.5 L19.3 25.5 C17.4 25.5 16 24.2 16 22.5 Z"
              fill={`url(#frosting_${light ? "light" : "dark"})`}
            />

            {/* Celebration Flame / Star Spark */}
            <path
              d="M24 7.5 C24 10.5 25.6 12.2 28.5 12.5 C25.6 12.8 24 14.5 24 17.5 C24 14.5 22.4 12.8 19.5 12.5 C22.4 12.2 24 10.5 24 7.5 Z"
              fill={`url(#goldSpark_${light ? "light" : "dark"})`}
            />

            {/* Micro Golden Crumbs */}
            <circle cx="34.5" cy="18" r="1.3" fill={`url(#goldSpark_${light ? "light" : "dark"})`} />
            <circle cx="13.5" cy="20.5" r="1" fill={`url(#goldSpark_${light ? "light" : "dark"})`} opacity="0.85" />
          </g>
        </svg>
      </div>

      {/* Typography Wordmark */}
      {!iconOnly && (
        <span className="flex flex-col leading-none">
          <span
            className={cn(
              "font-display text-xl font-semibold tracking-[-0.02em]",
              light ? "text-white" : "text-primary",
            )}
          >
            {business.shortName}
          </span>
          <span className="mt-1 flex items-center gap-1.5">
            <span
              className={cn(
                "text-[0.62rem] font-bold uppercase tracking-[0.28em]",
                light ? "text-blush" : "text-rose",
              )}
            >
              Artisan Bakery
            </span>
            <span className="h-1 w-1 rounded-full bg-gold inline-block" />
          </span>
        </span>
      )}
    </Link>
  );
}
