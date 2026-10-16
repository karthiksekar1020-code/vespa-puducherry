"use client";

import { useState } from "react";
import { ShowroomCard } from "./showroom-card";
import { TiltCard } from "@/components/ui/tilt-card";
import { Stagger, StaggerItem } from "@/components/ui/reveal";
import type { ShowroomModel } from "@/data/showroom";

/** The four model cards. Only one can be turned over at a time: opening another closes the previous one. */
export function ModelGrid({ models }: { models: ShowroomModel[] }) {
  const [openSlug, setOpenSlug] = useState<string | null>(null);
  return (
    <Stagger className="grid grid-cols-1 gap-4 min-[500px]:grid-cols-2 lg:grid-cols-4 lg:gap-5">
      {models.map((m, i) => (
        <StaggerItem key={m.slug}>
          <TiltCard max={openSlug === m.slug ? 0 : 8}>
            <ShowroomCard model={m} index={i} flip={{ open: openSlug === m.slug, onToggle: () => setOpenSlug((cur) => (cur === m.slug ? null : m.slug)) }} />
          </TiltCard>
        </StaggerItem>
      ))}
    </Stagger>
  );
}
