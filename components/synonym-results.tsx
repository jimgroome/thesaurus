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
  const [filter, setFilter] = useState("");
  const pattern = filter.trim().toLowerCase().split("");
  const activeGroups = expanded ? expandedGroups : groups;
  const visibleGroups = pattern.length
    ? activeGroups
        .filter((group) => group.length === pattern.length)
        .map((group) => ({
          ...group,
          words: group.words.filter((word) => {
            if (!/^\p{L}+$/u.test(word)) return false;
            const lowercase = word.toLowerCase();
            return pattern.every(
              (letter, index) => letter === "-" || letter === lowercase[index],
            );
          }),
        }))
        .filter((group) => group.words.length > 0)
    : activeGroups;
  const total = visibleGroups.reduce(
    (count, group) => count + group.words.length,
    0,
  );
  const synonyms = visibleGroups
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
        <p className="text-muted" role="status">
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
      <div className="mt-5 max-w-xl">
        <label
          htmlFor="synonym-filter"
          className="text-sm font-semibold text-ink"
        >
          Filter by letter pattern
        </label>
        <input
          id="synonym-filter"
          type="text"
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
          placeholder="---f-g-"
          aria-describedby="synonym-filter-help"
          autoCapitalize="none"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          className="mt-1 block w-full rounded-md border border-line bg-transparent px-3 py-2 font-mono text-ink placeholder:text-muted/70 focus-visible:outline-2 focus-visible:outline-accent"
        />
        <p id="synonym-filter-help" className="mt-1 text-sm text-muted">
          Use one dash for each unknown letter.
        </p>
      </div>
      {pattern.length > 0 && total === 0 ? (
        <p className="mt-8 text-muted">No synonyms match this pattern.</p>
      ) : grouped ? (
        <div className="mt-10 flex flex-col gap-10">
          {visibleGroups.map((group) => (
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
