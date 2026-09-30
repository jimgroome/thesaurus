import { unstable_cache } from "next/cache";
import { groupSynonymsByLength, type SynonymGroup } from "@/lib/words";

const THESAURUS_API =
  "https://www.dictionaryapi.com/api/v3/references/thesaurus/json";

// The thesaurus page's "Synonyms & Similar Words" lists are syn_list plus
// rel_list (related words) and phrase_list. sim_list is the same kind of
// list on entries that do not have a syn_list.
const SYNONYM_LISTS = new Set([
  "sim_list",
  "syn_list",
  "rel_list",
  "phrase_list",
]);

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

export function extractSynonyms(data: unknown, word: string): string[] {
  if (!Array.isArray(data)) return [];
  if (data.some((entry) => typeof entry === "string")) return [];

  const words: string[] = [];
  for (const entry of matchingEntries(data, word)) {
    collectListWords(entry, words, false);
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

function collectListWords(node: unknown, words: string[], inList: boolean) {
  if (Array.isArray(node)) {
    for (const item of node) collectListWords(item, words, inList);
    return;
  }

  if (!node || typeof node !== "object") return;

  const record = node as Record<string, unknown>;
  if (inList && typeof record.wd === "string") {
    words.push(record.wd);
  }

  for (const [key, value] of Object.entries(record)) {
    if (SYNONYM_LISTS.has(key)) {
      collectListWords(value, words, true);
    } else if (!inList) {
      collectListWords(value, words, false);
    }
  }
}

async function fetchSynonyms(word: string): Promise<string[]> {
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

  return extractSynonyms(await response.json(), word);
}

async function loadSynonymGroups(word: string): Promise<SynonymGroup[]> {
  return groupSynonymsByLength(await fetchSynonyms(word));
}

export const getSynonymGroups = unstable_cache(
  loadSynonymGroups,
  ["merriam-webster-thesaurus-api-v2"],
  { revalidate: 60 * 60 },
);
