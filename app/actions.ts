"use server";

import { redirect } from "next/navigation";
import { normalizeWord } from "@/lib/words";

export async function searchWord(formData: FormData) {
  const word = normalizeWord(String(formData.get("word") ?? ""));

  if (!word) {
    redirect("/?error=1");
  }

  redirect(`/word/${encodeURIComponent(word)}`);
}
