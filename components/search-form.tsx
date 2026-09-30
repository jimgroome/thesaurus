import { searchWord } from "@/app/actions";
import { SearchShortcut } from "@/components/search-shortcut";

type SearchFormProps = {
  defaultWord?: string;
  error?: boolean;
  placeholder?: string;
};

export function SearchForm({
  defaultWord = "",
  error = false,
  placeholder = "word",
}: SearchFormProps) {
  return (
    <form action={searchWord} className="w-full">
      <SearchShortcut />
      <label htmlFor="word" className="sr-only">
        Word
      </label>
      <div className="flex items-end gap-3 border-b border-ink">
        <input
          id="word"
          name="word"
          type="text"
          defaultValue={defaultWord}
          placeholder={placeholder}
          autoCapitalize="none"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          className="w-full bg-transparent py-3 font-serif text-3xl text-ink outline-none placeholder:text-muted/50"
        />
        <button
          type="submit"
          className="mb-3 shrink-0 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-accent-ink transition-colors hover:bg-accent-deep"
        >
          Look up
        </button>
      </div>
      {error ? (
        <p className="mt-3 text-sm text-accent" role="alert">
          Enter a word made of letters. Hyphens and apostrophes are fine.
        </p>
      ) : null}
    </form>
  );
}
