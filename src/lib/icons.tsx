"use client";

import {
  IconArrowLeft,
  IconArrowRight,
  IconBolt,
  IconBrandFacebook,
  IconBrandInstagram,
  IconBrandLinkedin,
  IconBrandTiktok,
  IconBriefcase,
  IconBuildingBank,
  IconBulb,
  IconCalculator,
  IconCar,
  IconChartPie,
  IconCheck,
  IconChevronRight,
  IconCircleCheck,
  IconClockHour3,
  IconCoin,
  IconFileText,
  IconFileTypePdf,
  IconHeartHandshake,
  IconHome,
  IconHomeShield,
  IconMail,
  IconMapPin,
  IconPhone,
  IconPhoneCall,
  IconPhoto,
  IconShieldCheck,
  IconStar,
  IconStethoscope,
  IconUserCircle,
  IconUsersGroup,
  type Icon as TablerIcon,
} from "@tabler/icons-react";

/**
 * Registr ikon.
 *
 * Obsah webu je uložený v JSON souborech, které edituje klient přes CMS –
 * a do JSONu nejde uložit React komponenta. Proto se v obsahu ukládá jen
 * název ikony (např. "ShieldCheck") a tady se převádí na skutečnou ikonu.
 *
 * Když se přidá nová ikona sem, je potřeba ji přidat i do seznamu
 * v `public/admin/config.yml`, aby se objevila v nabídce v administraci.
 */
export const iconRegistry = {
  ArrowLeft: IconArrowLeft,
  ArrowRight: IconArrowRight,
  Bolt: IconBolt,
  BrandFacebook: IconBrandFacebook,
  BrandInstagram: IconBrandInstagram,
  BrandLinkedin: IconBrandLinkedin,
  BrandTiktok: IconBrandTiktok,
  Briefcase: IconBriefcase,
  BuildingBank: IconBuildingBank,
  Bulb: IconBulb,
  Calculator: IconCalculator,
  Car: IconCar,
  ChartPie: IconChartPie,
  Check: IconCheck,
  ChevronRight: IconChevronRight,
  CircleCheck: IconCircleCheck,
  ClockHour3: IconClockHour3,
  Coin: IconCoin,
  FileText: IconFileText,
  FileTypePdf: IconFileTypePdf,
  HeartHandshake: IconHeartHandshake,
  Home: IconHome,
  HomeShield: IconHomeShield,
  Mail: IconMail,
  MapPin: IconMapPin,
  Phone: IconPhone,
  PhoneCall: IconPhoneCall,
  Photo: IconPhoto,
  ShieldCheck: IconShieldCheck,
  Star: IconStar,
  Stethoscope: IconStethoscope,
  UserCircle: IconUserCircle,
  UsersGroup: IconUsersGroup,
} satisfies Record<string, TablerIcon>;

export type IconName = keyof typeof iconRegistry;

export const iconNames = Object.keys(iconRegistry) as IconName[];

export function isIconName(value: string): value is IconName {
  return value in iconRegistry;
}

type IconProps = {
  name: string;
  size?: number;
  strokeWidth?: number;
  className?: string;
  "aria-hidden"?: boolean;
};

/**
 * Vykreslí ikonu podle názvu z obsahu. Neznámý název tiše nevykreslí nic,
 * aby překlep v administraci nikdy neshodil celou stránku.
 */
export function Icon({
  name,
  size = 24,
  strokeWidth = 1.5,
  className,
  "aria-hidden": ariaHidden = true,
}: IconProps) {
  if (!isIconName(name)) {
    return null;
  }

  const Component = iconRegistry[name];

  return (
    <Component
      size={size}
      strokeWidth={strokeWidth}
      className={className}
      aria-hidden={ariaHidden}
    />
  );
}
