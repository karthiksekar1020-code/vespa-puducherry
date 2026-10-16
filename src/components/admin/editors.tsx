"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { Loader2, Plus, Trash2, Upload } from "lucide-react";
import { uploadImageAction } from "@/actions/admin";
import type { ColorOption, ImageRef, SpecRow } from "@/lib/types";

/** Uploads to Supabase Storage through an owner-only server action; the form stores the resulting JSON. */
export function ImageEditor({ name, initial }: { name: string; initial: ImageRef[] }) {
  const [images, setImages] = useState<ImageRef[]>(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const file = useRef<HTMLInputElement>(null);

  async function onPick(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true); setError("");
    for (const f of Array.from(files)) {
      const fd = new FormData();
      fd.set("file", f);
      const res = await uploadImageAction(fd);
      if (res.ok && res.url) setImages((cur) => [...cur, { url: res.url!, alt: f.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " ") }]);
      else setError(res.message ?? "Upload failed");
    }
    setBusy(false);
    if (file.current) file.current.value = "";
  }

  return (
    <div>
      <p className="label">Images</p>
      <input type="hidden" name={name} value={JSON.stringify(images)} />
      <ul className="mt-2 grid grid-cols-2 gap-3 md:grid-cols-4">
        {images.map((img, i) => (
          <li key={img.url} className="border border-silver/60 bg-white p-2">
            <div className="relative aspect-[4/3] bg-ivory-dark"><Image src={img.url} alt={img.alt} fill sizes="160px" className="object-cover" /></div>
            <input aria-label="Alt text" value={img.alt} onChange={(e) => setImages((cur) => cur.map((x, j) => (j === i ? { ...x, alt: e.target.value } : x)))} className="field !py-1 text-xs" placeholder="Alt text" />
            <button type="button" onClick={() => setImages((cur) => cur.filter((_, j) => j !== i))} className="mt-1 flex items-center gap-1 text-xs text-red-700"><Trash2 size={12} /> Remove</button>
          </li>
        ))}
      </ul>
      <input ref={file} type="file" accept="image/jpeg,image/png,image/webp,image/avif" multiple hidden onChange={(e) => onPick(e.target.files)} />
      <button type="button" disabled={busy} onClick={() => file.current?.click()} className="btn btn-outline-dark btn-sm mt-3">
        {busy ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />} Upload images
      </button>
      <p className="mt-1 text-xs text-grey">JPEG, PNG, WebP or AVIF, up to 5 MB each. Only upload images you own or are licensed to use.</p>
      {error && <p role="alert" className="err">{error}</p>}
    </div>
  );
}

/** One photo: uploads to Supabase Storage through the owner-only server action and stores the resulting URL. */
export function PhotoEditor({ name, initial }: { name: string; initial?: string }) {
  const [url, setUrl] = useState(initial ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const file = useRef<HTMLInputElement>(null);

  async function onPick(files: FileList | null) {
    const f = files?.[0];
    if (!f) return;
    setBusy(true); setError("");
    const fd = new FormData();
    fd.set("file", f);
    const res = await uploadImageAction(fd);
    if (res.ok && res.url) setUrl(res.url); else setError(res.message ?? "Upload failed");
    setBusy(false);
    if (file.current) file.current.value = "";
  }

  return (
    <div>
      <p className="label">Model photo *</p>
      <input type="hidden" name={name} value={url} />
      <div className="mt-2 flex flex-wrap items-center gap-5">
        <div className="relative h-36 w-52 overflow-hidden rounded-xl bg-[radial-gradient(ellipse_at_50%_60%,#ffffff_0%,var(--ivory-dark)_85%)] ring-1 ring-silver/60">
          {url ? <Image src={url} alt="Model photo preview" fill sizes="208px" className="object-contain p-2 mix-blend-multiply" /> : <span className="flex h-full items-center justify-center text-xs text-grey">No photo yet</span>}
        </div>
        <div>
          <input ref={file} type="file" accept="image/jpeg,image/png,image/webp,image/avif" hidden onChange={(e) => onPick(e.target.files)} />
          <button type="button" disabled={busy} onClick={() => file.current?.click()} className="btn btn-outline-dark btn-sm">
            {busy ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />} {url ? "Replace photo" : "Upload photo"}
          </button>
          <p className="mt-2 max-w-xs text-xs text-grey">Best on a plain light background, side view. JPEG, PNG, WebP or AVIF up to 5 MB. Only upload photos you own or are licensed to use.</p>
          {error && <p role="alert" className="err">{error}</p>}
        </div>
      </div>
    </div>
  );
}

export function SpecsEditor({ name, initial }: { name: string; initial: SpecRow[] }) {
  const [rows, setRows] = useState<SpecRow[]>(initial);
  return (
    <div>
      <p className="label">Specifications</p>
      <input type="hidden" name={name} value={JSON.stringify(rows.filter((r) => r.label && r.value))} />
      {rows.map((r, i) => (
        <div key={i} className="mt-2 flex gap-3">
          <input aria-label="Specification name" placeholder="e.g. Engine" value={r.label} onChange={(e) => setRows((c) => c.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))} className="field" />
          <input aria-label="Specification value" placeholder="Verified value" value={r.value} onChange={(e) => setRows((c) => c.map((x, j) => (j === i ? { ...x, value: e.target.value } : x)))} className="field" />
          <button type="button" aria-label="Remove row" onClick={() => setRows((c) => c.filter((_, j) => j !== i))}><Trash2 size={15} /></button>
        </div>
      ))}
      <button type="button" onClick={() => setRows((c) => [...c, { label: "", value: "" }])} className="btn btn-outline-dark btn-sm mt-3"><Plus size={14} /> Add specification</button>
    </div>
  );
}

export function ColorsEditor({ name, initial }: { name: string; initial: ColorOption[] }) {
  const [rows, setRows] = useState<ColorOption[]>(initial);
  return (
    <div>
      <p className="label">Colours</p>
      <input type="hidden" name={name} value={JSON.stringify(rows.filter((r) => r.name).map((r) => ({ ...r, image: r.image || undefined })))} />
      {rows.map((r, i) => (
        <div key={i} className="mt-2 flex flex-wrap items-center gap-3">
          <input aria-label="Colour name" placeholder="Name" value={r.name} onChange={(e) => setRows((c) => c.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))} className="field !w-40" />
          <input aria-label="Colour swatch" type="color" value={r.hex} onChange={(e) => setRows((c) => c.map((x, j) => (j === i ? { ...x, hex: e.target.value } : x)))} className="h-9 w-12" />
          <input aria-label="Image URL for this colour (optional)" placeholder="Image URL for this colour (optional)" value={r.image ?? ""} onChange={(e) => setRows((c) => c.map((x, j) => (j === i ? { ...x, image: e.target.value } : x)))} className="field min-w-48 flex-1" />
          <button type="button" aria-label="Remove colour" onClick={() => setRows((c) => c.filter((_, j) => j !== i))}><Trash2 size={15} /></button>
        </div>
      ))}
      <button type="button" onClick={() => setRows((c) => [...c, { name: "", hex: "#17684f" }])} className="btn btn-outline-dark btn-sm mt-3"><Plus size={14} /> Add colour</button>
    </div>
  );
}
