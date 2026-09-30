"use client";

import Link from "next/link";
import { useState } from "react";
import { letterLabel, type SynonymGroup } from "@/lib/words";

const GROUP_COOKIE = "thesaurus-group-by-length";

type SynonymResultsProps = {
  groups: SynonymGroup[];
  initialGrouped: boolean;
};

export function SynonymResults({
  groups,
  initialGrouped,
}: SynonymResultsProps) {
  const [grouped, setGrouped] = useState(initialGrouped);
  const total = groups.reduce((count, group) => count + group.words.length, 0);
  const synonyms = groups
    .flatMap((group) => group.words)
    .sort((left, right) =>
      left.localeCompare(right, "en", { sensitivity: "base" }),
    );

  function toggleGrouped() {
    const next = !grouped;
    setGrouped(next);
    document.cookie = `${GROUP_COOKIE}=${next ? "1" : "0"}; Path=/; Max-Age=31536000; SameSite=Lax`;
  }

  return (
    <>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
        <p className="text-muted">
          {total} {total === 1 ? "synonym" : "synonyms"}, in alphabetical order.
        </p>
        <div className="flex items-center gap-3">
          <span id="group-by-length" className="text-sm font-semibold text-ink">
            Group by length
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={grouped}
            aria-labelledby="group-by-length"
            onClick={toggleGrouped}
            className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${grouped ? "bg-accent" : "bg-line"}`}
          >
            <span
              className={`absolute top-0.5 left-0.5 size-5 rounded-full bg-accent-ink transition-transform ${grouped ? "translate-x-5" : "translate-x-0"}`}
            />
          </button>
        </div>
      </div>
      {grouped ? (
        <div className="mt-10 flex flex-col gap-10">
          {groups.map((group) => (
            <section
              key={group.length}
              aria-labelledby={`length-${group.length}`}
            >
              <h2
                id={`length-${group.length}`}
                className="font-serif text-2xl text-ink"
              >
                {letterLabel(group.length)}
              </h2>
              <SynonymList words={group.words} />
            </section>
          ))}
        </div>
      ) : (
        <SynonymList words={synonyms} className="mt-8" />
      )}
    </>
  );
}

function SynonymList({
  words,
  className = "mt-4",
}: {
  words: string[];
  className?: string;
}) {
  return (
    <ul className={`${className} grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-3`}>
      {words.map((synonym) => (
        <li key={synonym}>
          <Link
            href={`/${encodeURIComponent(synonym)}`}
            className="text-ink underline decoration-line/80 underline-offset-4 transition-colors hover:text-accent hover:decoration-accent"
          >
            {synonym}
          </Link>
        </li>
      ))}
    </ul>
  );
}
