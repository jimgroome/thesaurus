# Thesaurus

Look up a word and see its Merriam-Webster synonyms, sorted alphabetically and grouped by length.

Synonyms come from the [Collegiate Thesaurus API](https://dictionaryapi.com/products/api-collegiate-thesaurus). The public thesaurus pages sit behind Cloudflare and reject requests from Vercel.

## Develop

Copy `.env.example` to `.env.local` and set `MERRIAM_WEBSTER_THESAURUS_KEY` to a Collegiate Thesaurus key from [dictionaryapi.com](https://dictionaryapi.com/).

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). Submitting a word routes to `/word/[word]`.

## Deploy

Import this repository in Vercel and set `MERRIAM_WEBSTER_THESAURUS_KEY` in the project environment variables. Redeploy after adding the key.
