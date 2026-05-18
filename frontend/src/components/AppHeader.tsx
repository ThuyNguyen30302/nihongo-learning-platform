"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";

type HeaderTab = "home" | "search" | "favorites" | "flashcards";

interface AppHeaderProps {
  active: HeaderTab;
  backHref?: string;
  actions?: ReactNode;
}

const navItems: Array<{
  href: string;
  label: string;
  key: HeaderTab;
}> = [
  { href: "/", label: "Home", key: "home" },
  { href: "/search", label: "Dictionary", key: "search" },
  { href: "/favorites", label: "Favorites", key: "favorites" },
  { href: "/flashcards", label: "Flashcards", key: "flashcards" },
];

export default function AppHeader({
  active,
  backHref,
  actions,
}: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-outline-variant bg-surface/95 backdrop-blur supports-[backdrop-filter]:bg-surface/90">
      <div className="max-w-[1100px] mx-auto px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            {backHref ? (
              <Link
                href={backHref}
                className="p-2 rounded-lg hover:bg-surface-container-low transition-colors"
                aria-label="Go back"
              >
                <ArrowLeft className="w-5 h-5 text-muted-foreground" />
              </Link>
            ) : null}
            <Link
              href="/"
              className="font-headline-md text-headline-md font-bold text-primary tracking-tight"
            >
              Carrot
            </Link>
          </div>

          <nav className="hidden md:flex gap-8 items-center">
            {navItems.map((item) =>
              item.key === active ? (
                <span
                  key={item.key}
                  className="text-primary border-b-2 border-primary pb-1 font-body-md text-body-md font-medium"
                >
                  {item.label}
                </span>
              ) : (
                <Link
                  key={item.key}
                  href={item.href}
                  className="text-muted-foreground pb-1 font-body-md text-body-md font-medium hover:text-primary transition-colors"
                >
                  {item.label}
                </Link>
              ),
            )}
          </nav>

          <div className="flex items-center gap-2 shrink-0">{actions}</div>
        </div>
      </div>
    </header>
  );
}
