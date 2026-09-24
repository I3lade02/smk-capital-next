import { IconPhone } from "@tabler/icons-react";
import Link from "next/link";

import { Logo } from "@/components/ui/Logo";
import { site } from "@/lib/content";

export function Header() {
  return (
    <header className="absolute left-0 right-0 top-0 z-30 flex items-center justify-between px-5 py-5 md:px-12 lg:px-16">
      <Link href="/" className="lg:hidden">
        <Logo compact />
      </Link>

      <a
        href={site.phoneHref}
        className="ml-auto hidden items-center gap-3 rounded-full bg-[#c89750] px-8 py-4 text-sm font-semibold text-white shadow-[0_20px_50px_rgba(201,151,80,0.28)] md:flex"
      >
        <IconPhone size={16} stroke={1.8} />
        {site.phone}
      </a>
    </header>
  );
}
