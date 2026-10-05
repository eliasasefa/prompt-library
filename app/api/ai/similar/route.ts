import { generateSimilarPrompts } from "@/lib/ai/gemini";
import { handleAIRequest } from "../_utils";

export async function POST(request: Request) {
  return handleAIRequest(request, async (prompt, count) => ({
    prompts: await generateSimilarPrompts(prompt, count),
  }), { count: true });
}