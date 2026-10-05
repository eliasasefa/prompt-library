"use client";

import { useState } from "react";

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

const AI_ENDPOINTS = {
  improve: "/api/ai/improve",
  categorize: "/api/ai/categorize",
  describe: "/api/ai/describe",
  similar: "/api/ai/similar",
  issues: "/api/ai/issues",
} as const;

async function postAI<T>(endpoint: string, body: Record<string, unknown>): Promise<T> {
  let response: Response;
  try {
    response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error("Could not reach the AI service. Check your connection and try again.");
  }

  const data: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const message =
      data && typeof data === "object" && "error" in data && typeof data.error === "string"
        ? data.error
        : `AI request failed (${response.status}).`;
    throw new Error(message);
  }
  if (!data || typeof data !== "object") throw new Error("The AI service returned an invalid response.");
  return data as T;
}

export const improvePrompt = (prompt: string) =>
  postAI<PromptImprovement>(AI_ENDPOINTS.improve, { prompt });

export const categorizePrompt = (prompt: string) =>
  postAI<PromptCategory>(AI_ENDPOINTS.categorize, { prompt });

export const describePrompt = (prompt: string) =>
  postAI<{ description: string }>(AI_ENDPOINTS.describe, { prompt });

export const generateSimilarPrompts = (prompt: string, count = 3) =>
  postAI<{ prompts: string[] }>(AI_ENDPOINTS.similar, { prompt, count });

export const detectPromptIssues = (prompt: string) =>
  postAI<{ issues: string[] }>(AI_ENDPOINTS.issues, { prompt });

type AIAction = "improve" | "categorize" | "describe" | "similar" | "issues";

export function useAI() {
  const [loading, setLoading] = useState<AIAction | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function run<T>(action: AIAction, request: () => Promise<T>): Promise<T> {
    setLoading(action);
    setError(null);
    try {
      return await request();
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : "Something went wrong. Please try again.";
      setError(message);
      throw cause;
    } finally {
      setLoading(null);
    }
  }

  return {
    loading,
    error,
    improvePrompt: (prompt: string) => run("improve", () => improvePrompt(prompt)),
    categorizePrompt: (prompt: string) => run("categorize", () => categorizePrompt(prompt)),
    describePrompt: (prompt: string) => run("describe", () => describePrompt(prompt)),
    generateSimilarPrompts: (prompt: string, count = 3) =>
      run("similar", () => generateSimilarPrompts(prompt, count)),
    detectPromptIssues: (prompt: string) => run("issues", () => detectPromptIssues(prompt)),
  };
}