import { unstable_cache } from "next/cache";
import { groupSynonymsByLength, type SynonymGroup } from "@/lib/words";

const THESAURUS_API =
  "https://www.dictionaryapi.com/api/v3/references/thesaurus/json";

// sim_list and syn_list are the direct synonyms. rel_list (related words)
// and phrase_list widen that to the thesaurus page's "Synonyms & Similar
// Words" selection. sim_list is the direct list on entries with no syn_list.
const CORE_SYNONYM_LISTS = new Set(["sim_list", "syn_list"]);
const EXPANDED_SYNONYM_LISTS = new Set([
  "sim_list",
  "syn_list",
  "rel_list",
  "phrase_list",
]);

export type SynonymLookup = {
  groups: SynonymGroup[];
  expandedGroups: SynonymGroup[];
};

export class ThesaurusFetchError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ThesaurusFetchError";
  }
}

type ThesaurusEntry = {
  meta?: {
    id?: string;
    stems?: string[];
  };
};

export function extractSynonyms(
  data: unknown,
  word: string,
  expanded = false,
): string[] {
  if (!Array.isArray(data)) return [];
  if (data.some((entry) => typeof entry === "string")) return [];

  const lists = expanded ? EXPANDED_SYNONYM_LISTS : CORE_SYNONYM_LISTS;
  const words: string[] = [];
  for (const entry of matchingEntries(data, word)) {
    collectListWords(entry, words, false, lists);
  }
  return words;
}

function matchingEntries(data: unknown[], word: string): ThesaurusEntry[] {
  const entries = data.filter(isEntry);
  const exact = entries.filter((entry) => headword(entry) === word);
  if (exact.length > 0) return exact;

  return entries.filter((entry) =>
    (entry.meta?.stems ?? []).some((stem) => stem.toLowerCase() === word),
  );
}

function isEntry(value: unknown): value is ThesaurusEntry {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function headword(entry: ThesaurusEntry): string {
  return String(entry.meta?.id ?? "")
    .split(":")[0]
    .toLowerCase();
}

function collectListWords(
  node: unknown,
  words: string[],
  inList: boolean,
  lists: Set<string>,
) {
  if (Array.isArray(node)) {
    for (const item of node) collectListWords(item, words, inList, lists);
    return;
  }

  if (!node || typeof node !== "object") return;

  const record = node as Record<string, unknown>;
  if (inList && typeof record.wd === "string") {
    words.push(record.wd);
  }

  for (const [key, value] of Object.entries(record)) {
    if (lists.has(key)) {
      collectListWords(value, words, true, lists);
    } else if (!inList) {
      collectListWords(value, words, false, lists);
    }
  }
}

async function fetchThesaurus(word: string): Promise<unknown> {
  const key = process.env.MERRIAM_WEBSTER_THESAURUS_KEY;
  if (!key) {
    throw new ThesaurusFetchError(
      "Set MERRIAM_WEBSTER_THESAURUS_KEY to a Collegiate Thesaurus API key.",
    );
  }

  const url = `${THESAURUS_API}/${encodeURIComponent(word)}?key=${encodeURIComponent(key)}`;

  let response: Response;
  try {
    response = await fetch(url, { cache: "no-store" });
  } catch {
    throw new ThesaurusFetchError(
      "The thesaurus source could not be reached.",
    );
  }

  if (response.status === 403) {
    throw new ThesaurusFetchError("The thesaurus API key was rejected.");
  }

  if (response.status === 404) return [];

  if (!response.ok) {
    throw new ThesaurusFetchError(
      "The thesaurus source could not be reached.",
    );
  }

  return response.json();
}

async function loadSynonymGroups(word: string): Promise<SynonymLookup> {
  const data = await fetchThesaurus(word);
  return {
    groups: groupSynonymsByLength(extractSynonyms(data, word)),
    expandedGroups: groupSynonymsByLength(extractSynonyms(data, word, true)),
  };
}

export const getSynonymGroups = unstable_cache(
  loadSynonymGroups,
  ["merriam-webster-thesaurus-api-v4"],
  { revalidate: 60 * 60 },
);
