import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Mail, MapPin, Phone } from "lucide-react";
import { Stagger, StaggerItem } from "@/components/ui/reveal";
import { formatTime } from "@/lib/format";
import { DIRECTIONS_URL } from "@/lib/location";
import type { HoursSettings, SiteSettings } from "@/lib/types";

const PLACEHOLDER = "To be added by the showroom";
const DAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;
const DAY_NAME: Record<(typeof DAYS)[number], string> = { mon: "Monday", tue: "Tuesday", wed: "Wednesday", thu: "Thursday", fri: "Friday", sat: "Saturday", sun: "Sunday" };

/** Groups consecutive days with identical hours, e.g. "Monday - Saturday: 9:00 AM - 9:00 PM". */
export function groupHours(hours: HoursSettings): { label: string; value: string }[] {
  const out: { from: number; to: number; key: string }[] = [];
  DAYS.forEach((d, i) => {
    const w = hours.days[d];
    const key = w ? `${w[0]}-${w[1]}` : "closed";
    const last = out[out.length - 1];
    if (last && last.key === key) last.to = i;
    else out.push({ from: i, to: i, key });
  });
  return out.map((g) => {
    const label = g.from === g.to ? DAY_NAME[DAYS[g.from]] : `${DAY_NAME[DAYS[g.from]]} - ${DAY_NAME[DAYS[g.to]]}`;
    const w = hours.days[DAYS[g.from]];
    return { label, value: w ? `${formatTime(w[0])} - ${formatTime(w[1])}` : "Closed" };
  });
}

export function Footer({ settings }: { settings: SiteSettings }) {
  const { business, social, hours } = settings;
  const phones = business.phone.split("|").map((p) => p.trim()).filter(Boolean);
  const socials = [["Instagram", social.instagram], ["Facebook", social.facebook], ["YouTube", social.youtube]].filter(([, url]) => url);
  const missing = (what: string) => <span className="italic text-ivory/50">{what}: {PLACEHOLDER}</span>;

  return (
    <footer className="bg-emerald-950 text-ivory">
      <Stagger className="mx-auto grid max-w-7xl items-start gap-x-10 gap-y-12 px-5 py-16 md:grid-cols-2 lg:grid-cols-[1.15fr_0.7fr_0.8fr_1.6fr_1fr] lg:px-8">
        <StaggerItem className="foot-col">
          <Image src="/brand/vespa-logo-red.png" alt="Vespa" width={800} height={291} className="foot-logo h-14 w-auto" />
          <p className="mt-5 max-w-xs text-sm leading-6 text-ivory/70">Iconic design. Timeless freedom. Scooters, accessories and a more personal way to ride.</p>
          {socials.length > 0 && (
            <ul className="mt-6 flex gap-4 text-xs uppercase tracking-widest">
              {socials.map(([name, url]) => <li key={name}><a href={url} target="_blank" rel="noopener noreferrer" className="foot-link">{name}</a></li>)}
            </ul>
          )}
        </StaggerItem>

        <FooterCol title="Explore" links={[["Scooters", "/scooters"], ["Accessories", "/accessories"], ["Compare bikes", "/compare"], ["Specifications", "/specifications"], ["About us", "/about"]]} />
        <FooterCol title="Customers" links={[["Book a test ride", "/book-test-ride"], ["Contact & enquiries", "/contact"], ["My account", "/account"], ["My orders", "/orders"]]} />

        <StaggerItem className="foot-col">
          <h3 className="eyebrow foot-head !font-sans">Address</h3>
          <address className="mt-5 space-y-3 text-sm leading-6 not-italic text-ivory/85">
            <p className="foot-row flex gap-3"><MapPin size={16} className="mt-1 shrink-0 text-gold" aria-hidden />{business.address ? <span>{business.address}</span> : missing("Address")}</p>
            <p className="foot-row flex gap-3"><Phone size={16} className="mt-1 shrink-0 text-gold" aria-hidden />
              {phones.length ? (
                <span>{phones.map((p, i) => (
                  <span key={p}>{i > 0 && <span className="text-ivory/40"> | </span>}<a href={`tel:${p.replace(/[^+\d]/g, "")}`} className="foot-link">{p}</a></span>
                ))}</span>
              ) : missing("Phone")}
            </p>
            <p className="foot-row flex gap-3"><Mail size={16} className="mt-1 shrink-0 text-gold" aria-hidden />
              {business.email ? <a href={`mailto:${business.email}`} className="foot-link [overflow-wrap:anywhere]">{business.email}</a> : missing("Email")}
            </p>
          </address>
          <a href={DIRECTIONS_URL} target="_blank" rel="noopener noreferrer" className="foot-directions mt-6 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-gold hover:text-gold-light">Get directions <ArrowRight size={14} aria-hidden /></a>
        </StaggerItem>

        <StaggerItem className="foot-col">
          <h3 className="eyebrow foot-head !font-sans">Opening</h3>
          <dl className="mt-5 space-y-3 text-sm leading-6 text-ivory/85">
            {groupHours(hours).map((g) => <div key={g.label} className="foot-row"><dt>{g.label}</dt><dd className="text-ivory/60">{g.value}</dd></div>)}
          </dl>
        </StaggerItem>
      </Stagger>
      <div className="border-t border-ivory/10 px-5 py-6 text-center text-xs text-ivory/50">
        <p>© {new Date().getFullYear()} {business.name}. Vespa® is a registered trademark of Piaggio &amp; C. S.p.A.</p>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <StaggerItem className="foot-col">
      <h3 className="eyebrow foot-head !font-sans">{title}</h3>
      <ul className="mt-5 space-y-3 text-sm leading-6 text-ivory/80">
        {links.map(([label, href]) => <li key={href}><Link href={href} className="foot-link">{label}</Link></li>)}
      </ul>
    </StaggerItem>
  );
}
