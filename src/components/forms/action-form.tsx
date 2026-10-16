"use client";

import { createContext, useActionState, useContext, useEffect, useId, useRef, useState, useTransition, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Check, ChevronDown, Loader2 } from "lucide-react";
import type { ActionState } from "@/lib/types";

type Ctx = { errors: Record<string, string>; pending: boolean };
const FormCtx = createContext<Ctx>({ errors: {}, pending: false });

/**
 * Wraps a server action. Submits via startTransition (instead of the native form action) so that
 * React does not clear the user's input when validation fails.
 */
export function ActionForm({
  action, children, submitLabel, className = "", submitClassName = "btn btn-emerald", footer, resetOnSuccess = false,
}: {
  action: (prev: ActionState, fd: FormData) => Promise<ActionState>;
  children: ReactNode;
  submitLabel: string;
  className?: string;
  submitClassName?: string;
  footer?: ReactNode;
  resetOnSuccess?: boolean;
}) {
  const [state, run] = useActionState(action, null);
  const [pending, start] = useTransition();
  const ref = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.ok && resetOnSuccess) ref.current?.reset();
  }, [state, resetOnSuccess]);

  return (
    <FormCtx.Provider value={{ errors: state?.fieldErrors ?? {}, pending }}>
      <form
        ref={ref} noValidate className={className}
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          start(() => run(fd));
        }}
      >
        {children}
        <div aria-live="polite" className="mt-3 min-h-5">
          {state?.message && (
            <p role={state.ok ? "status" : "alert"} className={`text-sm ${state.ok ? "text-emerald-800" : "text-red-700"}`}>
              {state.message}
              {state.reference && <> Your reference: <strong className="font-mono">{state.reference}</strong></>}
            </p>
          )}
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-4">
          <button type="submit" disabled={pending} className={submitClassName}>
            {pending && <Loader2 size={15} className="animate-spin" />} {pending ? "Please wait" : submitLabel}
          </button>
          {footer}
        </div>
      </form>
    </FormCtx.Provider>
  );
}

type FieldProps = {
  name: string; label: string; type?: string; as?: "input" | "textarea" | "select"; required?: boolean;
  defaultValue?: string; placeholder?: string; autoComplete?: string; children?: ReactNode; rows?: number; hint?: string;
  min?: string; max?: string; step?: string;
};

export function Field({ name, label, type = "text", as = "input", required, defaultValue, placeholder, autoComplete, children, rows = 4, hint, min, max, step }: FieldProps) {
  const { errors } = useContext(FormCtx);
  const error = errors[name];
  const id = `f-${name}`;
  const common = {
    id, name, defaultValue, "aria-invalid": error ? true : undefined,
    "aria-describedby": error ? `${id}-err` : hint ? `${id}-hint` : undefined, className: "field",
  } as const;
  return (
    <div className="field-wrap">
      <label htmlFor={id} className="label">{label}{required && <span aria-hidden> *</span>}</label>
      {as === "textarea" ? (
        <textarea {...common} rows={rows} placeholder={placeholder} />
      ) : as === "select" ? (
        <select {...common}>{children}</select>
      ) : (
        <input {...common} type={type} placeholder={placeholder} autoComplete={autoComplete} min={min} max={max} step={step} />
      )}
      {hint && !error && <p id={`${id}-hint`} className="mt-1 text-xs text-grey">{hint}</p>}
      {error && <p id={`${id}-err`} className="err">{error}</p>}
    </div>
  );
}

/**
 * Animated drop-down that behaves like a native <select> inside the form: it posts `name` with the chosen value,
 * shows server errors, resets with the form and is fully keyboard operable (arrows, Enter, Escape, type-ahead).
 */
export function SelectField({ name, label, options, placeholder = "Choose…", defaultValue = "", required }: {
  name: string; label: string; options: readonly string[]; placeholder?: string; defaultValue?: string; required?: boolean;
}) {
  const { errors } = useContext(FormCtx);
  const error = errors[name];
  const reduce = useReducedMotion();
  const uid = useId();
  const id = `f-${name}`;
  const items = ["", ...options];
  const [value, setValue] = useState(items.includes(defaultValue) ? defaultValue : "");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const wrap = useRef<HTMLDivElement>(null);

  // Follow the form's reset (after a successful send) and close on outside click.
  useEffect(() => {
    const form = wrap.current?.closest("form");
    const onReset = () => { setValue(items.includes(defaultValue) ? defaultValue : ""); setOpen(false); };
    const onDown = (e: MouseEvent) => { if (!wrap.current?.contains(e.target as Node)) setOpen(false); };
    form?.addEventListener("reset", onReset);
    document.addEventListener("mousedown", onDown);
    return () => { form?.removeEventListener("reset", onReset); document.removeEventListener("mousedown", onDown); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultValue]);

  function openList() { setActive(Math.max(0, items.indexOf(value))); setOpen(true); }
  function choose(i: number) { setValue(items[i]); setOpen(false); }
  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") { if (open) { e.preventDefault(); setOpen(false); } return; }
    if (e.key === "Tab") { setOpen(false); return; }
    if (["ArrowDown", "ArrowUp", "Enter", " ", "Home", "End"].includes(e.key)) {
      e.preventDefault();
      if (!open) { openList(); return; }
      if (e.key === "ArrowDown") setActive((a) => Math.min(items.length - 1, a + 1));
      else if (e.key === "ArrowUp") setActive((a) => Math.max(0, a - 1));
      else if (e.key === "Home") setActive(0);
      else if (e.key === "End") setActive(items.length - 1);
      else choose(active);
      return;
    }
    if (e.key.length === 1 && /\S/.test(e.key)) {
      const i = items.findIndex((o, k) => k > 0 && o.toLowerCase().startsWith(e.key.toLowerCase()));
      if (i > 0) { if (open) setActive(i); else setValue(items[i]); }
    }
  }

  const dur = reduce ? 0 : undefined;
  return (
    <div className="field-wrap relative" style={{ zIndex: open ? 30 : undefined }}>
      <label htmlFor={id} className="label">{label}{required && <span aria-hidden> *</span>}</label>
      <div ref={wrap} className="relative">
        <input type="hidden" name={name} value={value} />
        <button
          id={id} type="button" role="combobox" aria-haspopup="listbox" aria-expanded={open} aria-controls={`${uid}-list`}
          aria-activedescendant={open ? `${uid}-o${active}` : undefined} aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-err` : undefined}
          onClick={() => (open ? setOpen(false) : openList())} onKeyDown={onKeyDown}
          className="field flex items-center justify-between gap-3 text-left"
        >
          <span className={value ? "" : "text-grey"}>{value || placeholder}</span>
          <motion.span aria-hidden animate={{ rotate: open ? 180 : 0 }} transition={{ duration: dur ?? 0.3 }} className="text-gold"><ChevronDown size={16} /></motion.span>
        </button>
        <AnimatePresence>
          {open && (
            <motion.ul
              id={`${uid}-list`} role="listbox" aria-label={label}
              style={{ transformOrigin: "top" }}
              initial={reduce ? false : { opacity: 0, y: -10, scaleY: 0.92 }} animate={{ opacity: 1, y: 0, scaleY: 1 }} exit={reduce ? undefined : { opacity: 0, y: -8, scaleY: 0.94 }}
              transition={{ duration: dur ?? 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="absolute left-0 right-0 top-full mt-2 overflow-hidden rounded-xl bg-white py-1.5 shadow-[0_24px_50px_-18px_rgba(5,36,28,0.55)] ring-1 ring-gold/40"
            >
              {items.map((o, i) => {
                const selected = o === value;
                return (
                  <motion.li
                    key={o || "none"} id={`${uid}-o${i}`} role="option" aria-selected={selected}
                    initial={reduce ? false : { opacity: 0, x: -14 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: dur ?? 0.3, delay: reduce ? 0 : 0.04 + i * 0.04 }}
                    onMouseEnter={() => setActive(i)} onMouseDown={(e) => e.preventDefault()} onClick={() => choose(i)}
                    className={`relative flex cursor-pointer items-center justify-between px-4 py-2.5 text-sm transition-[background-color,padding] duration-200 ${active === i ? "bg-ivory pl-6" : ""} ${selected ? "font-semibold text-emerald-800" : o === "" ? "text-grey" : ""}`}
                  >
                    <span aria-hidden className={`absolute inset-y-1.5 left-0 w-1 rounded-r bg-gold transition-transform duration-200 ${active === i ? "scale-y-100" : "scale-y-0"}`} />
                    {o || placeholder}
                    {selected && o !== "" && <motion.span initial={reduce ? false : { scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 500, damping: 18 }} className="text-gold"><Check size={15} /></motion.span>}
                  </motion.li>
                );
              })}
            </motion.ul>
          )}
        </AnimatePresence>
      </div>
      {error && <p id={`${id}-err`} className="err">{error}</p>}
    </div>
  );
}

export function PasswordField({ name, label, autoComplete, hint }: { name: string; label: string; autoComplete: string; hint?: string }) {
  const { errors } = useContext(FormCtx);
  const error = errors[name];
  const ref = useRef<HTMLInputElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  return (
    <div>
      <label htmlFor={`f-${name}`} className="label">{label} <span aria-hidden>*</span></label>
      <div className="relative">
        <input ref={ref} id={`f-${name}`} name={name} type="password" autoComplete={autoComplete} className="field pr-16" aria-invalid={error ? true : undefined} aria-describedby={error ? `f-${name}-err` : undefined} />
        <button
          ref={toggleRef} type="button" className="absolute right-0 top-1/2 -translate-y-1/2 text-xs uppercase tracking-widest text-grey hover:text-emerald-800"
          onClick={() => {
            if (!ref.current || !toggleRef.current) return;
            const show = ref.current.type === "password";
            ref.current.type = show ? "text" : "password";
            toggleRef.current.textContent = show ? "Hide" : "Show";
            toggleRef.current.setAttribute("aria-label", show ? "Hide password" : "Show password");
          }}
          aria-label="Show password"
        >Show</button>
      </div>
      {hint && !error && <p className="mt-1 text-xs text-grey">{hint}</p>}
      {error && <p id={`f-${name}-err`} className="err">{error}</p>}
    </div>
  );
}

/** Hidden honeypot field: real users never see or fill it. */
export function Honeypot() {
  return (
    <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
      <label>Leave this field empty<input name="website" tabIndex={-1} autoComplete="off" /></label>
    </div>
  );
}
