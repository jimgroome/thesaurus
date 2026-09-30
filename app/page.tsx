import { SearchForm } from "@/components/search-form";

export default async function Home({ searchParams }: PageProps<"/">) {
  const params = await searchParams;
  const error = params.error === "1";

  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center px-6 py-16">
      <p className="text-xs font-semibold tracking-[0.22em] text-muted uppercase">
        Word lookup
      </p>
      <h1 className="mt-3 font-serif text-6xl tracking-tight text-ink">
        Thesaurus
      </h1>
      <p className="mt-4 max-w-md text-lg leading-7 text-muted">
        Enter a word to see its synonyms, listed alphabetically and grouped by
        length.
      </p>
      <div className="mt-10">
        <SearchForm error={error} />
      </div>
    </main>
  );
}
