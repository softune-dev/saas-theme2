import type { IconType } from "react-icons";
import {
  FaFacebook,
  FaInstagram,
  FaLinkedinIn,
  FaTelegram,
  FaTiktok,
  FaWhatsapp,
  FaXTwitter,
  FaYoutube,
} from "react-icons/fa6";
import { HiOutlineGlobeAlt } from "react-icons/hi2";

const SOCIAL_ICONS: Record<string, IconType> = {
  facebook: FaFacebook,
  instagram: FaInstagram,
  tiktok: FaTiktok,
  youtube: FaYoutube,
  x: FaXTwitter,
  linkedin: FaLinkedinIn,
  whatsapp: FaWhatsapp,
  telegram: FaTelegram,
  other: HiOutlineGlobeAlt,
};

export function SocialLinks({
  socials,
  className = "flex items-center justify-center gap-4 sm:justify-start",
  iconClassName = "size-5",
}: {
  socials?: Record<string, string> | string[] | null;
  className?: string;
  iconClassName?: string;
}) {
  const entries = socials
    ? Array.isArray(socials)
      ? []
      : Object.entries(socials).filter(([, url]) => url)
    : [];

  if (entries.length === 0) return null;

  return (
    <div className={className}>
      {entries.map(([platform, url]) => {
        const Icon = SOCIAL_ICONS[platform] ?? SOCIAL_ICONS.other;
        return (
          <a
            key={platform}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--muted-foreground)] transition-colors hover:text-[var(--brand)]"
            aria-label={platform}
          >
            <Icon className={iconClassName} aria-hidden />
          </a>
        );
      })}
    </div>
  );
}
