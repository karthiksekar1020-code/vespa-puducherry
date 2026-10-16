"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Send } from "lucide-react";

/** The two call-to-action buttons: staggered rise-in, a pulsing gold ring and a left-to-right fill wipe on hover. */
export function CtaButtons() {
  const reduce = useReducedMotion();
  const item = (delay: number) => ({
    initial: reduce ? false : ({ opacity: 0, y: 28, scale: 0.94 } as const),
    whileInView: { opacity: 1, y: 0, scale: 1 },
    viewport: { once: true, margin: "-60px" },
    transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] as const },
  });
  return (
    <>
      <motion.div {...item(0.15)}>
        <Link href="/book-test-ride" className="btn cta-gold">
          Book a test ride <ArrowRight size={15} className="cta-arrow" aria-hidden />
        </Link>
      </motion.div>
      <motion.div {...item(0.3)}>
        <Link href="/contact" className="btn cta-ghost">
          Send an enquiry <Send size={14} className="cta-send" aria-hidden />
        </Link>
      </motion.div>
    </>
  );
}
