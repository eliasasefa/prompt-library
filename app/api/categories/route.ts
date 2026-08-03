import { auth } from "@/auth";
import { sql } from "@/lib/db";

export async function GET() {
  const session = await auth();
  const uid = session?.user?.dbUserId;
  if (!uid) return Response.json([]);

  const rows = await sql`
    SELECT c.id, c.name, COUNT(p.id)::int AS prompt_count
    FROM categories c
    LEFT JOIN prompts p ON p.category_id = c.id
    WHERE c.user_id = ${uid}
    GROUP BY c.id, c.name
    ORDER BY c.name ASC
  `;
  return Response.json(rows);
}

export async function POST(req: Request) {
  const session = await auth();
  const uid = session?.user?.dbUserId;
  if (!uid) return new Response("Unauthorized", { status: 401 });

  const body = await req.json().catch(() => null);
  const name = String(body?.name ?? "").trim().slice(0, 40);
  if (!name) return new Response("Category name is required", { status: 400 });

  const rows = await sql`
    INSERT INTO categories (user_id, name)
    VALUES (${uid}, ${name})
    ON CONFLICT (user_id, name) DO UPDATE SET name = EXCLUDED.name
    RETURNING id, user_id, name
  `;
  return Response.json(rows[0], { status: 201 });
}