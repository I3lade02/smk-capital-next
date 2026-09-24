"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Logo } from "@/components/ui/Logo";
import { site } from "@/lib/content";
import { Icon } from "@/lib/icons";
import { normalizePath } from "@/lib/paths";

export function Sidebar() {
  const pathname = normalizePath(usePathname());

  return (
    <aside className="sticky top-0 hidden h-screen shrink-0 self-start bg-[#061a34] text-white lg:flex lg:flex-col lg:items-center lg:justify-between">
      <div className="w-full">
        <Link
          href="/"
          className="flex h-59.75 items-center justify-center border-b border-white/10"
        >
          <Logo variant="light" />
        </Link>

        <nav className="mt-8 flex flex-col gap-1 px-6">
          {site.navigation.sidebar.map((item) => {
            const isActive = normalizePath(item.href) === pathname;

            return (
              <Link
                key={item.label}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={`sidebar-link relative flex items-center overflow-hidden rounded-2xl px-4 py-4 text-xs font-semibold whitespace-nowrap transition hover:bg-white/10 ${
                  isActive ? "is-active text-[#f3c77f]" : "text-white/80"
                }`}
              >
                <span className="flex min-w-0 items-center gap-3 whitespace-nowrap">
                  {item.icon ? (
                    <Icon
                      name={item.icon}
                      size={17}
                      className="sidebar-link-icon shrink-0 text-[#d5a660]"
                    />
                  ) : null}

                  <span className="sidebar-link-text relative whitespace-nowrap">
                    {item.label}
                  </span>
                </span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mb-16 flex flex-col items-center">
        <p className="max-w-16 mr-3 text-[10px] uppercase leading-5 tracking-[0.35em] text-white/75">
          {site.slogan}
        </p>
        <div className="mt-8 mr-3 h-px w-12 bg-[#c89750]" />
      </div>
    </aside>
  );
}
