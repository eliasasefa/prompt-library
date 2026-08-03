import { auth } from "@/auth";
import { sql } from "@/lib/db";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Ctx) {
  const session = await auth();
  const uid = session?.user?.dbUserId;
  if (!uid) return new Response("Unauthorized", { status: 401 });

  const { id } = await params;
  const promptId = Number(id);
  if (!Number.isInteger(promptId)) return new Response("Invalid id", { status: 400 });

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") return new Response("Invalid JSON", { status: 400 });

  const existing = await sql`
    SELECT * FROM prompts WHERE id = ${promptId} AND user_id = ${uid}
  `;
  if (!existing.length) return new Response("Not found", { status: 404 });
  const current = existing[0] as {
    title: string;
    content: string;
    is_public: boolean;
    category_id: number | null;
  };

  const title =
    typeof body.title === "string" && body.title.trim()
      ? body.title.trim().slice(0, 200)
      : current.title;
  const content =
    typeof body.content === "string" && body.content.trim()
      ? body.content.trim().slice(0, 20000)
      : current.content;
  const isPublic =
    typeof body.isPublic === "boolean" ? body.isPublic : current.is_public;

  let categoryId = current.category_id;
  if ("categoryId" in body) {
    categoryId = body.categoryId ? Number(body.categoryId) : null;
    if (categoryId) {
      const owns = await sql`SELECT id FROM categories WHERE id = ${categoryId} AND user_id = ${uid}`;
      if (!owns.length) return new Response("Category not found", { status: 400 });
    }
  }

  const rows = await sql`
    UPDATE prompts
    SET title = ${title}, content = ${content}, is_public = ${isPublic},
        category_id = ${categoryId}, updated_at = now()
    WHERE id = ${promptId}
    RETURNING id, title, content, is_public, category_id, created_at, updated_at
  `;
  return Response.json(rows[0]);
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const session = await auth();
  const uid = session?.user?.dbUserId;
  if (!uid) return new Response("Unauthorized", { status: 401 });

  const { id } = await params;
  const rows = await sql`
    DELETE FROM prompts WHERE id = ${Number(id)} AND user_id = ${uid} RETURNING id
  `;
  if (!rows.length) return new Response("Not found", { status: 404 });
  return new Response(null, { status: 204 });
}