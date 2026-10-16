"use client";

import { useEffect } from "react";
import { useCart } from "./cart-context";

/** Rendered only after the server has confirmed the order exists. */
export function ClearCart() {
  const { clear, ready } = useCart();
  useEffect(() => { if (ready) clear(); }, [ready, clear]);
  return null;
}
