import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader, Notice } from "@/components/ui/page-header";
import { ScooterCard } from "@/components/shop/scooter-card";
import { ShowroomModelGrid } from "@/components/home/showroom-grids";
import { Pagination } from "@/components/shop/pagination";
import { OwnerModelBar } from "@/components/home/owner-model-bar";
import { listCategories, listScooters, PAGE_SIZE, scooterColorOptions, type ScooterFilters } from "@/lib/data/catalogue";
import { AVAILABILITY_LABEL } from "@/lib/format";
import { num } from "@/lib/url";

export const metadata: Metadata = { title: "Scooters", description: "Browse the Vespa scooter collection at Vespa Puducherry." };

type SP = { q?: string; category?: string; color?: string; availability?: string; min?: string; max?: string; sort?: string; page?: string };

export default async function ScootersPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const sortOk = ["name", "price_asc", "price_desc", "newest"].includes(sp.sort ?? "") ? (sp.sort as ScooterFilters["sort"]) : "name";
  const page = Math.max(1, Math.floor(num(sp.page) ?? 1));
  const [res, categories, colors] = await Promise.all([
    listScooters({
      q: sp.q?.trim() || undefined, category: sp.category, color: sp.color, availability: sp.availability && sp.availability in AVAILABILITY_LABEL ? sp.availability : undefined,
      min: num(sp.min), max: num(sp.max), sort: sortOk, page,
    }),
    listCategories("scooter"),
    scooterColorOptions(),
  ]);
  const { items, total } = res.data;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  if (!res.configured) {
    return (
      <>
        <PageHeader eyebrow="The collection" title="Scooters">Models at the showroom.</PageHeader>
        <div className="mx-auto max-w-7xl px-5 py-14 lg:px-8">
          <OwnerModelBar />
          <ShowroomModelGrid />
          <p className="mt-8 text-sm"><Link href="/scooters/vespa-tech" className="font-semibold text-emerald-800 underline decoration-gold underline-offset-4 hover:text-gold">Explore the Vespa Tech colours</Link></p>
          <p className="mt-4 text-sm text-grey">Prices, specifications and filters appear here once the online catalogue is connected. Meanwhile, tap Enquire for details or book a test ride.</p>
        </div>
      </>
    );
  }
  const hasFilters = Boolean(sp.q || sp.category || sp.color || sp.availability || sp.min || sp.max);

  return (
    <>
      <PageHeader eyebrow="The collection" title="Scooters">Browse the range. Prices appear only when verified by the showroom.</PageHeader>
      <div className="mx-auto max-w-7xl px-5 pt-14 lg:px-8"><OwnerModelBar /></div>
      <div className="mx-auto grid max-w-7xl gap-10 px-5 pb-14 pt-2 lg:grid-cols-[17rem_1fr] lg:px-8">
        <form method="get" className="space-y-1 lg:sticky lg:top-28 lg:max-h-[calc(100vh-8rem)] lg:self-start lg:overflow-y-auto lg:pr-2" aria-label="Filter scooters">
          <label className="label !mt-0" htmlFor="q">Search by model</label>
          <input id="q" name="q" defaultValue={sp.q} placeholder="e.g. Primavera" className="field" />
          <label className="label" htmlFor="category">Category</label>
          <select id="category" name="category" defaultValue={sp.category ?? ""} className="field">
            <option value="">All categories</option>
            {categories.map((c) => <option key={c.id} value={c.slug}>{c.name}</option>)}
          </select>
          <label className="label" htmlFor="color">Colour</label>
          <select id="color" name="color" defaultValue={sp.color ?? ""} className="field">
            <option value="">Any colour</option>
            {colors.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <label className="label" htmlFor="availability">Availability</label>
          <select id="availability" name="availability" defaultValue={sp.availability ?? ""} className="field">
            <option value="">Any</option>
            {Object.entries(AVAILABILITY_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label" htmlFor="min">Min price ₹</label><input id="min" name="min" type="number" min="0" defaultValue={sp.min} className="field" /></div>
            <div><label className="label" htmlFor="max">Max price ₹</label><input id="max" name="max" type="number" min="0" defaultValue={sp.max} className="field" /></div>
          </div>
          <label className="label" htmlFor="sort">Sort by</label>
          <select id="sort" name="sort" defaultValue={sortOk} className="field">
            <option value="name">Name A–Z</option>
            <option value="price_asc">Price: low to high</option>
            <option value="price_desc">Price: high to low</option>
            <option value="newest">Newest</option>
          </select>
          <div className="flex gap-3 pt-6">
            <button className="btn btn-emerald btn-sm">Apply</button>
            {hasFilters && <Link href="/scooters" className="btn btn-outline-dark btn-sm">Clear all</Link>}
          </div>
        </form>

        <div>
          {res.error && res.configured && <ShowroomModelGrid />}
          {res.error && !res.configured && <Notice tone="warn">{res.error}</Notice>}
          {!res.error && items.length === 0 && (
            <div className="border border-dashed border-silver p-12 text-center">
              <p className="font-display text-2xl">{hasFilters ? "No scooters match your filters" : "No scooters published yet"}</p>
              <p className="mt-2 text-sm text-grey">{hasFilters ? "Try widening your search or clear the filters." : "Check back soon, or send us an enquiry."}</p>
              {hasFilters && <Link href="/scooters" className="btn btn-emerald mt-6">Clear all filters</Link>}
            </div>
          )}
          {items.length > 0 && (
            <>
              <p className="mb-6 text-sm text-grey" aria-live="polite">{total} scooter{total === 1 ? "" : "s"}</p>
              <div className="grid gap-8 sm:grid-cols-2 xl:grid-cols-3">{items.map((s) => <ScooterCard key={s.id} scooter={s} />)}</div>
              <Pagination page={page} pages={pages} basePath="/scooters" params={{ ...sp, page: undefined }} />
            </>
          )}
        </div>
      </div>
    </>
  );
}

