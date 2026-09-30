const WORD_OF_THE_DAY_FEED =
  "https://www.merriam-webster.com/wotd/feed/rss2";

const FALLBACK_PLACEHOLDER = "word";

export async function getWordOfTheDay(): Promise<string> {
  try {
    const response = await fetch(WORD_OF_THE_DAY_FEED, {
      next: { revalidate: 60 * 60 },
    });

    if (!response.ok) return FALLBACK_PLACEHOLDER;

    const xml = await response.text();
    const match = xml.match(
      /<item>[\s\S]*?<title><!\[CDATA\[(.*?)\]\]><\/title>/,
    );
    const word = match?.[1]?.trim().toLowerCase();

    return word || FALLBACK_PLACEHOLDER;
  } catch {
    return FALLBACK_PLACEHOLDER;
  }
}
