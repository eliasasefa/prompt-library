import { auth } from "@/auth";
import { sql } from "@/lib/db";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.dbUserId) return new Response("Unauthorized", { status: 401 });
  const uid = session.user.dbUserId;
  const format = req.nextUrl.searchParams.get("format") || "json";

  const prompts = await sql`
    SELECT p.title, p.content, p.is_public, c.name as category
    FROM prompts p
    LEFT JOIN categories c ON c.id = p.category_id
    WHERE p.user_id = ${uid}
    ORDER BY p.created_at DESC
  `;

  if (format === "md") {
    let md = "# My Prompt Library\n\n";
    const grouped = prompts.reduce((acc, p) => {
      const cat = p.category || "Uncategorized";
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(p);
      return acc;
    }, {} as Record<string, any[]>);

    for (const [cat, ps] of Object.entries(grouped)) {
      md += `## ${cat}\n\n`;
      for (const p of ps) md += `### ${p.title}\n\n${p.content}\n\n---\n\n`;
    }
    return new Response(md, { headers: { "Content-Type": "text/markdown", "Content-Disposition": "attachment; filename=prompts.md" } });
  }

  return Response.json({ prompts });
}