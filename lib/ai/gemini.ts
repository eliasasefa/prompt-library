import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(
  process.env.GOOGLE_GENERATIVE_AI_API_KEY || ""
);

const model = genAI.getGenerativeModel({ model: "gemini-3.8-flash" });

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

/**
 * Improve a prompt for clarity and effectiveness
 */
export async function improvePrompt(prompt: string): Promise<PromptImprovement> {
  try {
    const result = await model.generateContent(
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

    const text = result.response.text();
    const parsed = JSON.parse(text);

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

/**
 * Auto-categorize a prompt
 */
export async function categorizePrompt(prompt: string): Promise<PromptCategory> {
  try {
    const result = await model.generateContent(
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

    const text = result.response.text();
    const parsed = JSON.parse(text);

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

/**
 * Generate a description for a prompt
 */
export async function generatePromptDescription(
  prompt: string,
  maxLength: number = 200
): Promise<string> {
  try {
    const result = await model.generateContent(
      `Write a concise and informative description for this prompt in ${maxLength} characters or less.

Prompt:
${prompt}

Description:`
    );

    const text = result.response.text().trim();
    return text.substring(0, maxLength);
  } catch (error) {
    console.error("Error generating description:", error);
    throw error;
  }
}

/**
 * Generate similar prompt ideas
 */
export async function generateSimilarPrompts(
  prompt: string,
  count: number = 3
): Promise<string[]> {
  try {
    const result = await model.generateContent(
      `Generate ${count} similar but different prompts based on this one. Keep the same general purpose but vary the approach or context.

Original Prompt:
${prompt}

Generate exactly ${count} prompts, one per line. Only output the prompts, nothing else.`
    );

    const text = result.response.text();
    return text
      .split("\n")
      .filter((line) => line.trim())
      .slice(0, count);
  } catch (error) {
    console.error("Error generating similar prompts:", error);
    throw error;
  }
}

/**
 * Detect prompt quality issues
 */
export async function detectPromptIssues(prompt: string): Promise<string[]> {
  try {
    const result = await model.generateContent(
      `Analyze this prompt and identify any quality issues that might prevent an AI from giving good responses. Be specific and constructive.

Prompt:
${prompt}

List issues as bullet points. If no issues, respond with "No significant issues detected."

Issues:`
    );

    const text = result.response.text();
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
