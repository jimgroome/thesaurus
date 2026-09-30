import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { load } from "cheerio";
import { unstable_cache } from "next/cache";
import { groupSynonymsByLength, type SynonymGroup } from "@/lib/words";

const execFileAsync = promisify(execFile);

const USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

export class ThesaurusFetchError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ThesaurusFetchError";
  }
}

/**
 * Cloudflare blocks Node's TLS fingerprint and HTTP/2 clients. curl over
 * HTTP/1.1 receives the thesaurus HTML, including on the Vercel Node runtime.
 */
async function fetchThesaurusHtml(
  word: string,
): Promise<{ status: number; html: string }> {
  const url = `https://www.merriam-webster.com/thesaurus/${encodeURIComponent(word)}`;

  try {
    const { stdout } = await execFileAsync(
      "curl",
      [
        "--http1.1",
        "--silent",
        "--show-error",
        "--location",
        "--compressed",
        "--max-time",
        "20",
        "--user-agent",
        USER_AGENT,
        "--header",
        "Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "--header",
        "Accept-Language: en-US,en;q=0.9",
        "--write-out",
        "\n__HTTP_STATUS__:%{http_code}",
        url,
      ],
      { encoding: "utf8", maxBuffer: 8 * 1024 * 1024 },
    );

    const marker = "\n__HTTP_STATUS__:";
    const markerIndex = stdout.lastIndexOf(marker);

    if (markerIndex === -1) {
      throw new ThesaurusFetchError(
        "The thesaurus source returned an unexpected response.",
      );
    }

    const html = stdout.slice(0, markerIndex);
    const status = Number(stdout.slice(markerIndex + marker.length).trim());

    if (
      html.includes("Just a moment") &&
      html.includes("challenge-platform")
    ) {
      throw new ThesaurusFetchError(
        "The thesaurus source blocked this request.",
      );
    }

    return { status, html };
  } catch (error) {
    if (error instanceof ThesaurusFetchError) throw error;

    const err = error as NodeJS.ErrnoException;
    if (err.code === "ENOENT") {
      throw new ThesaurusFetchError(
        "curl is not available, so the thesaurus page could not be fetched.",
      );
    }

    throw new ThesaurusFetchError(
      "The thesaurus source could not be reached.",
    );
  }
}

export function extractSynonyms(html: string): string[] {
  const $ = load(html);
  const synonyms: string[] = [];

  // Antonyms use the same list-item class inside `.opp-list-scored`.
  $(".sim-list-scored li.thes-word-list-item").each((_, element) => {
    const text = $(element).find(".syl").first().text();
    synonyms.push(text);
  });

  return synonyms;
}

async function loadSynonymGroups(word: string): Promise<SynonymGroup[]> {
  const { status, html } = await fetchThesaurusHtml(word);

  if (status === 404) return [];

  if (status < 200 || status >= 300) {
    throw new ThesaurusFetchError(
      "The thesaurus source could not be reached.",
    );
  }

  return groupSynonymsByLength(extractSynonyms(html));
}

export const getSynonymGroups = unstable_cache(
  loadSynonymGroups,
  ["merriam-webster-synonyms"],
  { revalidate: 60 * 60 },
);
