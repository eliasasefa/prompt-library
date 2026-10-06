type PromptHandler<T> = (prompt: string, count?: number) => Promise<T>;

export async function handleAIRequest<T>(
  request: Request,
  handler: PromptHandler<T>,
  options: { count?: boolean } = {}
): Promise<Response> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return Response.json({ error: "Request body must be a JSON object." }, { status: 400 });
  }

  const { prompt, count } = body as { prompt?: unknown; count?: unknown };
  if (typeof prompt !== "string" || !prompt.trim()) {
    return Response.json({ error: "A non-empty prompt is required." }, { status: 400 });
  }
  if (prompt.length > 20000) {
    return Response.json({ error: "Prompt must be 20,000 characters or fewer." }, { status: 400 });
  }

  let requestedCount: number | undefined;
  if (options.count) {
    if (count !== undefined && (!Number.isInteger(count) || (count as number) < 1 || (count as number) > 10)) {
      return Response.json({ error: "Count must be an integer from 1 to 10." }, { status: 400 });
    }
    requestedCount = (count as number | undefined) ?? 3;
  }

  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    return Response.json({ error: "AI service is not configured." }, { status: 503 });
  }

  try {
    return Response.json(await handler(prompt.trim(), requestedCount));
  } catch (error) {
    console.error("AI request failed:", error);
    const message = error instanceof Error ? error.message : "";
    const busy = /503|429|high demand|unavailable|overloaded|try again|resource exhausted/i.test(message);
    const missing = /404|no longer available|not found/i.test(message);
    return Response.json(
      {
        error: busy
          ? "The AI model is busy right now. Please try again in a moment."
          : missing
            ? "The AI model is unavailable. Please try again shortly."
            : "The AI service could not complete this request. Please try again.",
      },
      { status: busy || missing ? 503 : 502 }
    );
  }
}