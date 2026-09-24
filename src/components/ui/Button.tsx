"use client";

import { IconArrowRight } from "@tabler/icons-react";
import Link from "next/link";
import type { MouseEventHandler, ReactNode } from "react";

import { cn } from "@/lib/cn";
import { isSectionLink, scrollToSectionFromHref } from "@/lib/sectionLinks";

type ButtonProps = {
  children: ReactNode;
  href?: string;
  variant?: "primary" | "secondary";
  className?: string;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
};

export function Button({
  children,
  href = "#",
  variant = "primary",
  className,
  onClick,
}: ButtonProps) {
  const classNames = cn(
    "inline-flex items-center justify-center gap-3 rounded-full px-7 py-4 text-sm font-semibold transition",
    variant === "primary" &&
      "bg-[#061a34] text-white shadow-[0_18px_45px_rgba(6,26,52,0.18)] hover:bg-[#0b274b]",
    variant === "secondary" &&
      "border border-[#c89750] bg-white/40 text-[#9f7035] hover:bg-white",
    className,
  );

  const content = (
    <>
      {children}
      <IconArrowRight size={17} stroke={1.8} />
    </>
  );

  // Odkazy na sekce (#contact) i externí odkazy zůstávají obyčejné <a>,
  // vnitřní stránky jdou přes <Link>, aby fungovalo předjímané načítání.
  const isInternalPage = href.startsWith("/") && !href.startsWith("//");

  if (isInternalPage) {
    return (
      <Link href={href} onClick={onClick} className={classNames}>
        {content}
      </Link>
    );
  }

  return (
    <a
      href={href}
      onClick={(event) => {
        onClick?.(event);

        if (!event.defaultPrevented && isSectionLink(href)) {
          scrollToSectionFromHref(event, href);
        }
      }}
      className={classNames}
    >
      {content}
    </a>
  );
}
