# Thesaurus

Look up a word and see its Merriam-Webster synonyms, sorted alphabetically and grouped by length.

## Develop

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). Submitting a word routes to `/word/[word]`.

## Deploy

Import this repository in Vercel. It uses the default Next.js settings. Fetching a thesaurus page shells out to `curl` over HTTP/1.1, which is available on the Vercel Node.js runtime.
