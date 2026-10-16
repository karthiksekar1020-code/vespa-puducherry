import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader, Notice } from "@/components/ui/page-header";
import { AccessoryCard } from "@/components/shop/accessory-card";
import { ShowroomAccessoryGrid } from "@/components/home/showroom-grids";
import { Pagination } from "@/components/shop/pagination";
import { listAccessories, listCategories, type AccessoryFilters } from "@/lib/data/catalogue";
import { num } from "@/lib/url";

export const metadata: Metadata = { title: "Accessories", description: "Helmets, storage, covers and more for your Vespa." };

type SP = { q?: string; category?: string; min?: string; max?: string; sort?: string; stock?: string; page?: string };
const SIZE = 12;

export default async function AccessoriesPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const sort = ["name", "price_asc", "price_desc", "newest"].includes(sp.sort ?? "") ? (sp.sort as AccessoryFilters["sort"]) : "name";
  const page = Math.max(1, Math.floor(num(sp.page) ?? 1));
  const [res, categories] = await Promise.all([
    listAccessories({ q: sp.q?.trim() || undefined, category: sp.category, min: num(sp.min), max: num(sp.max), inStock: sp.stock === "1", sort, page, pageSize: SIZE }),
    listCategories("accessory"),
  ]);
  const { items, total } = res.data;
  if (!res.configured) {
    return (
      <>
        <PageHeader eyebrow="Complete the ride" title="Accessories">Available at the showroom.</PageHeader>
        <div className="mx-auto max-w-7xl px-5 py-14 lg:px-8">
          <ShowroomAccessoryGrid />
          <p className="mt-8 text-sm text-grey">Tap an item to enquire about price and fitment. Online ordering opens once items are listed with prices.</p>
        </div>
      </>
    );
  }
  const hasFilters = Boolean(sp.q || sp.category || sp.min || sp.max || sp.stock);

  return (
    <>
      <PageHeader eyebrow="Complete the ride" title="Accessories">Only items listed and priced by the showroom appear here.</PageHeader>
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 lg:grid-cols-[17rem_1fr] lg:px-8">
        <form method="get" className="space-y-1 lg:sticky lg:top-28 lg:self-start" aria-label="Filter accessories">
          <label className="label !mt-0" htmlFor="q">Search</label>
          <input id="q" name="q" defaultValue={sp.q} className="field" placeholder="e.g. helmet" />
          <label className="label" htmlFor="category">Category</label>
          <select id="category" name="category" defaultValue={sp.category ?? ""} className="field">
            <option value="">All categories</option>
            {categories.map((c) => <option key={c.id} value={c.slug}>{c.name}</option>)}
          </select>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label" htmlFor="min">Min ₹</label><input id="min" name="min" type="number" min="0" defaultValue={sp.min} className="field" /></div>
            <div><label className="label" htmlFor="max">Max ₹</label><input id="max" name="max" type="number" min="0" defaultValue={sp.max} className="field" /></div>
          </div>
          <label className="label" htmlFor="sort">Sort by</label>
          <select id="sort" name="sort" defaultValue={sort} className="field">
            <option value="name">Name A–Z</option>
            <option value="price_asc">Price: low to high</option>
            <option value="price_desc">Price: high to low</option>
            <option value="newest">Newest</option>
          </select>
          <label className="mt-5 flex items-center gap-2 text-sm"><input type="checkbox" name="stock" value="1" defaultChecked={sp.stock === "1"} /> In stock only</label>
          <div className="flex gap-3 pt-6">
            <button className="btn btn-emerald btn-sm">Apply</button>
            {hasFilters && <Link href="/accessories" className="btn btn-outline-dark btn-sm">Clear all</Link>}
          </div>
        </form>
        <div>
          {res.error && <Notice tone={res.configured ? "error" : "warn"}>{res.configured ? "We couldn't load accessories right now. Please try again shortly." : res.error}</Notice>}
          {!res.error && items.length === 0 && (
            <div className="border border-dashed border-silver p-12 text-center">
              <p className="font-display text-2xl">{hasFilters ? "No accessories match your filters" : "No accessories listed yet"}</p>
              {hasFilters && <Link href="/accessories" className="btn btn-emerald mt-6">Clear all filters</Link>}
            </div>
          )}
          {items.length > 0 && (
            <>
              <p className="mb-6 text-sm text-grey" aria-live="polite">{total} item{total === 1 ? "" : "s"}</p>
              <div className="grid grid-cols-2 gap-6 xl:grid-cols-3">{items.map((a) => <AccessoryCard key={a.id} accessory={a} />)}</div>
              <Pagination page={page} pages={Math.max(1, Math.ceil(total / SIZE))} basePath="/accessories" params={{ ...sp, page: undefined }} />
            </>
          )}
        </div>
      </div>
    </>
  );
}
