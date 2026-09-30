import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import type { ReactNode } from "react";
import { SearchForm } from "@/components/search-form";
import { SynonymResults } from "@/components/synonym-results";
import { getSynonymGroups, ThesaurusFetchError } from "@/lib/synonyms";
import { normalizeWord } from "@/lib/words";

export const runtime = "nodejs";
export const maxDuration = 30;

type WordPageProps = PageProps<"/word/[word]">;

async function readWord(params: WordPageProps["params"]) {
  const { word: raw } = await params;
  return { raw, word: normalizeWord(raw) };
}

export async function generateMetadata({
  params,
}: WordPageProps): Promise<Metadata> {
  const { word } = await readWord(params);

  if (!word) {
    return { title: { absolute: "Thesaurus" } };
  }

  return {
    title: `${word} synonyms`,
    description: `Synonyms for ${word}, grouped by word length.`,
  };
}

export default async function WordPage({ params }: WordPageProps) {
  const { raw, word } = await readWord(params);

  if (!word) {
    notFound();
  }

  if (word !== raw) {
    redirect(`/word/${encodeURIComponent(word)}`);
  }

  let groups;
  try {
    groups = await getSynonymGroups(word);
  } catch (error) {
    const message =
      error instanceof ThesaurusFetchError
        ? error.message
        : "The thesaurus source could not be reached.";

    return (
      <WordLayout word={word}>
        <p className="mt-8 text-lg text-muted" role="alert">
          {message}
        </p>
      </WordLayout>
    );
  }

  const total = groups.reduce((count, group) => count + group.words.length, 0);
  const cookieStore = await cookies();
  const groupedByLength =
    cookieStore.get("thesaurus-group-by-length")?.value !== "0";

  return (
    <WordLayout word={word}>
      {total === 0 ? (
        <p className="mt-8 text-lg text-muted">
          No synonyms were found for “{word}”.
        </p>
      ) : (
        <SynonymResults groups={groups} initialGrouped={groupedByLength} />
      )}
    </WordLayout>
  );
}

function WordLayout({
  word,
  children,
}: {
  word: string;
  children: ReactNode;
}) {
  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-6 py-10">
      <Link
        href="/"
        className="text-sm font-semibold tracking-[0.18em] text-muted uppercase hover:text-ink"
      >
        Thesaurus
      </Link>
      <h1 className="mt-6 font-serif text-5xl tracking-tight text-ink sm:text-6xl">
        {word}
      </h1>
      <div className="mt-8 max-w-xl">
        <SearchForm defaultWord={word} />
      </div>
      {children}
    </main>
  );
}
