import { categorizePrompt } from "@/lib/ai/gemini";
import { handleAIRequest } from "../_utils";

export async function POST(request: Request) {
  return handleAIRequest(request, categorizePrompt);
}