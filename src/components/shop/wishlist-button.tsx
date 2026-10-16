"use client";

import { useState, useTransition } from "react";
import { Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import { toggleWishlistAction } from "@/actions/forms";

export function WishlistButton({ accessoryId, initial }: { accessoryId: string; initial: boolean }) {
  const [wished, setWished] = useState(initial);
  const [msg, setMsg] = useState("");
  const [pending, start] = useTransition();
  const router = useRouter();

  return (
    <div>
      <button
        type="button" disabled={pending} aria-pressed={wished}
        aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
        className="btn btn-outline-dark btn-sm"
        onClick={() =>
          start(async () => {
            const res = await toggleWishlistAction(accessoryId);
            if (res.ok) { setWished(Boolean(res.wished)); setMsg(""); router.refresh(); }
            else setMsg(res.message ?? "Could not update wishlist");
          })
        }
      >
        <Heart size={14} fill={wished ? "currentColor" : "none"} /> {wished ? "Saved" : "Wishlist"}
      </button>
      {msg && <p role="alert" className="err">{msg}</p>}
    </div>
  );
}
