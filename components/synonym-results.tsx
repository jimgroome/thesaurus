"use client";

import Link from "next/link";
import { useState } from "react";
import { letterLabel, type SynonymGroup } from "@/lib/words";

const GROUP_COOKIE = "thesaurus-group-by-length";
const EXPANDED_COOKIE = "thesaurus-expanded-synonyms";

type SynonymResultsProps = {
  groups: SynonymGroup[];
  expandedGroups: SynonymGroup[];
  initialGrouped: boolean;
  initialExpanded: boolean;
};

export function SynonymResults({
  groups,
  expandedGroups,
  initialGrouped,
  initialExpanded,
}: SynonymResultsProps) {
  const [grouped, setGrouped] = useState(initialGrouped);
  const [expanded, setExpanded] = useState(initialExpanded);
  const activeGroups = expanded ? expandedGroups : groups;
  const total = activeGroups.reduce(
    (count, group) => count + group.words.length,
    0,
  );
  const synonyms = activeGroups
    .flatMap((group) => group.words)
    .sort((left, right) =>
      left.localeCompare(right, "en", { sensitivity: "base" }),
    );

  function toggleGrouped() {
    const next = !grouped;
    setGrouped(next);
    writeCookie(GROUP_COOKIE, next);
  }

  function toggleExpanded() {
    const next = !expanded;
    setExpanded(next);
    writeCookie(EXPANDED_COOKIE, next);
  }

  return (
    <>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
        <p className="text-muted">
          {total} {total === 1 ? "synonym" : "synonyms"}, in alphabetical order.
        </p>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <Toggle
            id="expanded-synonyms"
            label="Expanded synonyms"
            checked={expanded}
            onToggle={toggleExpanded}
          />
          <Toggle
            id="group-by-length"
            label="Group by length"
            checked={grouped}
            onToggle={toggleGrouped}
          />
        </div>
      </div>
      {grouped ? (
        <div className="mt-10 flex flex-col gap-10">
          {activeGroups.map((group) => (
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

function writeCookie(name: string, value: boolean) {
  document.cookie = `${name}=${value ? "1" : "0"}; Path=/; Max-Age=31536000; SameSite=Lax`;
}

function Toggle({
  id,
  label,
  checked,
  onToggle,
}: {
  id: string;
  label: string;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <span id={id} className="text-sm font-semibold text-ink">
        {label}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-labelledby={id}
        onClick={onToggle}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${checked ? "bg-accent" : "bg-line"}`}
      >
        <span
          className={`absolute top-0.5 left-0.5 size-5 rounded-full bg-accent-ink transition-transform ${checked ? "translate-x-5" : "translate-x-0"}`}
        />
      </button>
    </div>
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
