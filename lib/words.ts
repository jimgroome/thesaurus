const WORD_PATTERN = /^[a-z]+(?:['-][a-z]+)*$/;

export function normalizeWord(value: string): string | null {
  const word = value
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");

  if (!WORD_PATTERN.test(word)) {
    return null;
  }

  return word;
}

export type SynonymGroup = {
  length: number;
  words: string[];
};

export function groupSynonymsByLength(synonyms: string[]): SynonymGroup[] {
  const unique = new Map<string, string>();

  for (const synonym of synonyms) {
    const cleaned = synonym.replace(/\s+/g, " ").trim();
    if (!cleaned) continue;
    const key = cleaned.toLocaleLowerCase("en");
    if (!unique.has(key)) unique.set(key, cleaned);
  }

  const sorted = [...unique.values()].sort((a, b) =>
    a.localeCompare(b, "en", { sensitivity: "base" }),
  );

  const groups = new Map<number, string[]>();

  for (const word of sorted) {
    const existing = groups.get(word.length);
    if (existing) {
      existing.push(word);
    } else {
      groups.set(word.length, [word]);
    }
  }

  return [...groups.entries()]
    .sort(([left], [right]) => left - right)
    .map(([length, words]) => ({ length, words }));
}

export function letterLabel(length: number): string {
  return length === 1 ? "1 letter" : `${length} letters`;
}
