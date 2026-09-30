import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center px-6 py-16">
      <h1 className="font-serif text-5xl text-ink">Word not found</h1>
      <p className="mt-4 text-lg text-muted">
        That doesn’t look like a word this thesaurus can look up.
      </p>
      <Link
        href="/"
        className="mt-8 text-sm font-semibold text-accent underline underline-offset-4"
      >
        Try another word
      </Link>
    </main>
  );
}
