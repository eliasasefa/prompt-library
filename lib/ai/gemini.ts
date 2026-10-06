import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(
  process.env.GOOGLE_GENERATIVE_AI_API_KEY || ""
);

const GEMINI_MODELS = [
  "gemini-2.5-flash",
  "gemini-3.8-flash",
  "gemini-2.0-flash",
] as const;

const RETRYABLE = /503|429|high demand|unavailable|overloaded|try again|resource exhausted/i;

export interface PromptImprovement {
  improved: string;
  suggestions: string[];
  clarity_score: number;
  specificity_score: number;
}

export interface PromptCategory {
  category: string;
  confidence: number;
  tags: string[];
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetryable(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  const status = typeof error === "object" && error && "status" in error ? Number((error as { status?: unknown }).status) : NaN;
  return status === 429 || status === 503 || RETRYABLE.test(message);
}

function parseJson<T>(text: string): T {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const raw = fenced?.[1]?.trim() ?? trimmed;
  return JSON.parse(raw) as T;
}

async function generateText(prompt: string): Promise<string> {
  let lastError: unknown;
  for (const modelName of GEMINI_MODELS) {
    const model = genAI.getGenerativeModel({ model: modelName });
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const result = await model.generateContent(prompt);
        return result.response.text();
      } catch (error) {
        lastError = error;
        if (!isRetryable(error)) break;
        await sleep(400 * (attempt + 1));
      }
    }
  }
  throw lastError instanceof Error ? lastError : new Error("Gemini request failed");
}

export async function improvePrompt(prompt: string): Promise<PromptImprovement> {
  try {
    const text = await generateText(
      `You are an expert AI prompt engineer. Analyze and improve this prompt for clarity, specificity, and effectiveness.

Original Prompt:
${prompt}

Provide your response in this exact JSON format:
{
  "improved": "the improved version of the prompt",
  "suggestions": ["suggestion 1", "suggestion 2", "suggestion 3"],
  "clarity_score": <1-10>,
  "specificity_score": <1-10>
}

Only respond with valid JSON, no additional text.`
    );

    const parsed = parseJson<Partial<PromptImprovement>>(text);
    return {
      improved: parsed.improved || prompt,
      suggestions: parsed.suggestions || [],
      clarity_score: parsed.clarity_score || 0,
      specificity_score: parsed.specificity_score || 0,
    };
  } catch (error) {
    console.error("Error improving prompt:", error);
    throw error;
  }
}

export async function categorizePrompt(prompt: string): Promise<PromptCategory> {
  try {
    const text = await generateText(
      `Categorize this prompt into one main category and provide relevant tags.

Prompt:
${prompt}

Available categories: writing, coding, analysis, brainstorming, learning, business, creative, other

Provide your response in this exact JSON format:
{
  "category": "one of the available categories",
  "confidence": <0.0-1.0>,
  "tags": ["tag1", "tag2", "tag3"]
}

Only respond with valid JSON, no additional text.`
    );

    const parsed = parseJson<Partial<PromptCategory>>(text);
    return {
      category: parsed.category || "other",
      confidence: parsed.confidence || 0,
      tags: parsed.tags || [],
    };
  } catch (error) {
    console.error("Error categorizing prompt:", error);
    throw error;
  }
}

export async function generatePromptDescription(
  prompt: string,
  maxLength: number = 200
): Promise<string> {
  try {
    const text = (await generateText(
      `Write a concise and informative description for this prompt in ${maxLength} characters or less.

Prompt:
${prompt}

Description:`
    )).trim();
    return text.substring(0, maxLength);
  } catch (error) {
    console.error("Error generating description:", error);
    throw error;
  }
}

export async function generateSimilarPrompts(
  prompt: string,
  count: number = 3
): Promise<string[]> {
  try {
    const text = await generateText(
      `Generate ${count} similar but different prompts based on this one. Keep the same general purpose but vary the approach or context.

Original Prompt:
${prompt}

Generate exactly ${count} prompts, one per line. Only output the prompts, nothing else.`
    );

    return text
      .split("\n")
      .filter((line) => line.trim())
      .slice(0, count);
  } catch (error) {
    console.error("Error generating similar prompts:", error);
    throw error;
  }
}

export async function detectPromptIssues(prompt: string): Promise<string[]> {
  try {
    const text = await generateText(
      `Analyze this prompt and identify any quality issues that might prevent an AI from giving good responses. Be specific and constructive.

Prompt:
${prompt}

List issues as bullet points. If no issues, respond with "No significant issues detected."

Issues:`
    );

    if (text.includes("No significant issues")) {
      return [];
    }

    return text
      .split("\n")
      .filter((line) => line.trim().startsWith("-") || line.trim().startsWith("•"))
      .map((line) => line.replace(/^[-•]\s*/, "").trim())
      .filter((line) => line);
  } catch (error) {
    console.error("Error detecting issues:", error);
    throw error;
  }
}
