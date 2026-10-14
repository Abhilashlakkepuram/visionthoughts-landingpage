import Image from "next/image";
import { site } from "@/lib/site";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      data-chapter="footer"
      className="relative px-5 pb-8 pt-12 md:px-10 md:pb-10"
    >
      <div className="relative z-10 mx-auto w-full max-w-[1600px]">
        <div className="hairline mb-8" aria-hidden="true" />

        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div className="flex flex-col gap-3">
            <Image
              src="/logo-lockup-dark.png"
              alt={site.name}
              width={640}
              height={466}
              className="h-auto w-[clamp(11rem,26vw,17rem)]"
            />
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-mute-dim">
              {site.location} · {site.hours}
            </p>
          </div>

          <address className="flex flex-col gap-2 not-italic font-mono text-[11px] uppercase tracking-[0.2em] text-mute md:items-end">
            <a
              href={`mailto:${site.email}`}
              className="transition-colors duration-300 hover:text-ember"
            >
              {site.email}
            </a>
            <a
              href={`tel:${site.phoneHref}`}
              className="transition-colors duration-300 hover:text-ember"
            >
              {site.phone}
            </a>
          </address>
        </div>

        <p className="mt-10 font-mono text-[10px] uppercase tracking-[0.18em] text-mute-dim">
          © {year} Vision Thoughts. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
