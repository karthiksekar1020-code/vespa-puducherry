"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, ChevronDown, Menu, Search, User, X } from "lucide-react";

type NavItem = { label: string; href: string; children?: { label: string; href: string }[] };

const NAV: NavItem[] = [
  { label: "Home", href: "/" },
  {
    label: "Scooters", href: "/scooters",
    children: [
      { label: "All scooters", href: "/scooters" },
      { label: "Book a test ride", href: "/book-test-ride" },
    ],
  },
  {
    label: "Accessories", href: "/accessories",
    children: [
      { label: "All accessories", href: "/accessories" },
    ],
  },
  {
    label: "Compare Bikes", href: "/compare",
    children: [
      { label: "Compare bikes", href: "/compare" },
      { label: "Specifications", href: "/specifications" },
    ],
  },
  { label: "About Us", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export function Navbar({ signedIn }: { signedIn: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [dropdown, setDropdown] = useState<string | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const overHero = pathname === "/" && !scrolled && !mobile;
  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // eslint-disable-next-line react-hooks/set-state-in-effect -- close menus when the route changes
  useEffect(() => { setMobile(false); setSearchOpen(false); setDropdown(null); }, [pathname]);
  useEffect(() => { if (searchOpen) searchRef.current?.focus(); }, [searchOpen]);
  useEffect(() => {
    document.body.style.overflow = mobile ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobile]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") { setDropdown(null); setSearchOpen(false); setMobile(false); } };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);


  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-5 sm:pt-4">
      <nav
        aria-label="Primary"
        className={`pointer-events-auto mx-auto flex max-w-6xl items-center justify-between rounded-full border px-5 text-ivory backdrop-blur-xl transition-all duration-500 lg:px-7 ${
          scrolled || !overHero
            ? "h-20 border-gold/30 bg-emerald-950/90 shadow-[0_12px_40px_-12px_rgba(0,0,0,0.6)]"
            : "h-[6.25rem] border-ivory/15 bg-emerald-950/35 shadow-[0_8px_30px_-15px_rgba(0,0,0,0.5)]"
        }`}
      >
        <Link href="/" className="brand-link flex shrink-0 flex-col items-start leading-none" aria-label="Vespa Puducherry home">
          <span className="brand-mark relative block">
            <Image src="/brand/vespa-logo-red.png" alt="Vespa" width={800} height={291} priority data-intro-logo className="h-11 w-auto shrink-0 sm:h-[3.1rem]" />
          </span>
        </Link>

        <ul className="hidden items-center gap-3 xl:gap-5 2xl:gap-9 lg:flex lg:mx-3">
          {NAV.map((item) => (
            <li
              key={item.href} className="nav-item relative" style={{ animationDelay: `${0.15 + NAV.indexOf(item) * 0.07}s` }}
              onMouseEnter={() => item.children && setDropdown(item.label)}
              onMouseLeave={() => setDropdown(null)}
            >
              <div className="flex items-center gap-1">
                <Link
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className="nav-link group relative block whitespace-nowrap py-2 text-[0.72rem] font-semibold uppercase tracking-[0.1em] xl:tracking-[0.12em] 2xl:tracking-[0.16em]"
                >
                  <span className="nav-roll" data-label={item.label}><span>{item.label}</span></span>
                  <span aria-hidden className="nav-underline" />
                  {isActive(item.href) && (
                    <motion.span layoutId="nav-indicator" className="absolute inset-x-0 -bottom-0.5 h-px bg-gold" />
                  )}
                </Link>
                {item.children && (
                  <button
                    aria-label={`${item.label} menu`} aria-expanded={dropdown === item.label}
                    onClick={() => setDropdown(dropdown === item.label ? null : item.label)}
                  >
                    <ChevronDown size={13} />
                  </button>
                )}
              </div>
              <AnimatePresence>
                {item.children && dropdown === item.label && (
                  <motion.ul
                    initial={{ clipPath: "inset(0 0 100% 0)", opacity: 0 }}
                    animate={{ clipPath: "inset(0 0 0% 0)", opacity: 1, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } }}
                    exit={{ clipPath: "inset(0 0 100% 0)", opacity: 0, transition: { duration: 0.25 } }}
                    className="absolute left-0 top-full mt-2 min-w-60 border-t-2 border-gold bg-emerald-950/95 py-3 text-ivory shadow-2xl backdrop-blur"
                  >
                    {item.children.map((c, i) => (
                      <motion.li key={c.href} initial={{ opacity: 0, x: -18 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.12 + i * 0.07, ease: [0.22, 1, 0.36, 1] }}>
                        <Link href={c.href} className="drop-link group/d relative flex items-center justify-between overflow-hidden px-6 py-3 text-xs uppercase tracking-[0.18em]">
                          <span aria-hidden className="absolute inset-y-0 left-0 w-0 bg-gold/15 transition-all duration-500 ease-out group-hover/d:w-full group-focus-visible/d:w-full" />
                          <span aria-hidden className="absolute inset-y-2 left-0 w-0.5 origin-center scale-y-0 bg-gold transition-transform duration-300 group-hover/d:scale-y-100 group-focus-visible/d:scale-y-100" />
                          <span className="relative transition-transform duration-300 group-hover/d:translate-x-2 group-hover/d:text-gold-light">{c.label}</span>
                          <ArrowRight size={14} className="relative -translate-x-3 text-gold opacity-0 transition-all duration-300 group-hover/d:translate-x-0 group-hover/d:opacity-100" aria-hidden />
                        </Link>
                      </motion.li>
                    ))}
                  </motion.ul>
                )}
              </AnimatePresence>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-1">
          <button aria-label="Search" onClick={() => setSearchOpen((v) => !v)} className="p-2 transition-colors hover:text-gold"><Search size={19} /></button>
          <span className="ml-0.5 flex min-w-0 items-center gap-2 pl-1 sm:gap-2.5 sm:pl-2" aria-label="Vignesh Moteurx / Auto">
            <Image src="/brand/vignesh-logo-white.png" alt="" aria-hidden width={140} height={240} className="h-8 w-auto shrink-0 sm:h-10" />
            <span className="max-w-[8.5rem] font-sans text-[0.72rem] font-extrabold uppercase leading-tight tracking-[0.08em] text-white sm:max-w-none sm:whitespace-nowrap sm:text-[0.8rem] lg:text-[0.64rem] lg:tracking-[0.03em] xl:text-[0.95rem] xl:tracking-[0.12em]">Vignesh Moteurx / Auto</span>
          </span>
          {signedIn && <Link href="/account" aria-label="My account" className="p-2 transition-colors hover:text-gold"><User size={19} /></Link>}
          <button aria-label={mobile ? "Close menu" : "Open menu"} aria-expanded={mobile} onClick={() => setMobile((v) => !v)} className="p-2 lg:hidden">
            {mobile ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {searchOpen && (
          <motion.form
            role="search" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="pointer-events-auto mx-auto mt-2 max-w-3xl overflow-hidden rounded-3xl border border-gold/30 bg-emerald-950/95 backdrop-blur-xl"
            onSubmit={(e) => {
              e.preventDefault();
              const q = String(new FormData(e.currentTarget).get("q") ?? "").trim();
              if (q) router.push(`/search?q=${encodeURIComponent(q)}`);
            }}
          >
            <div className="mx-auto flex max-w-3xl items-center gap-4 px-6 py-3 text-ivory">
              <Search size={18} className="text-gold" />
              <input ref={searchRef} name="q" aria-label="Search scooters and accessories" placeholder="Search scooters and accessories" className="field !border-0 flex-1 placeholder:text-ivory/40" />
              <button className="btn btn-gold btn-sm" type="submit">Search</button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {mobile && (
          <motion.div
            initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 40 }} transition={{ duration: 0.3 }}
            className="pointer-events-auto fixed inset-x-3 bottom-3 top-[7rem] overflow-y-auto rounded-3xl border border-gold/30 bg-emerald-950 px-6 py-8 text-ivory lg:hidden"
          >
            <ul className="space-y-1">
              {NAV.map((item, i) => (
                <motion.li key={item.href} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                  <Link href={item.href} aria-current={isActive(item.href) ? "page" : undefined} className={`block border-b border-ivory/10 py-4 font-display text-3xl ${isActive(item.href) ? "text-gold" : ""}`}>{item.label}</Link>
                </motion.li>
              ))}
            </ul>
            <div className="mt-8 flex flex-col gap-3">
              <Link href="/book-test-ride" className="btn btn-gold">Book a test ride</Link>
              {signedIn && <Link href="/account" className="btn btn-outline text-ivory">My account</Link>}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
