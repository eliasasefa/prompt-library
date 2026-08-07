import { NextRequest } from "next/server";
import { auth } from "@/auth";
import { sql } from "@/lib/db";

// export async function GET(req: NextRequest) {
//   const session = await auth();
//   const uid = session?.user?.dbUserId ?? null;

//   const sp = req.nextUrl.searchParams;
//   const scope = sp.get("scope") === "explore" ? "explore" : "mine";
//   const q = (sp.get("q") ?? "").trim();
//   const like = `%${q}%`;
//   const categoryRaw = sp.get("category");
//   const categoryId =
//     scope === "mine" && categoryRaw && categoryRaw !== "all" ? Number(categoryRaw) : null;

//   if (scope === "explore") {
//     const rows = await sql`
//       SELECT p.id, p.title, p.content, p.is_public, p.created_at, p.updated_at,
//              p.category_id, c.name AS category,
//              u.name AS author, u.image AS author_image,
//              (p.user_id = ${uid ?? -1}) AS own
//       FROM prompts p
//       JOIN users u ON u.id = p.user_id
//       LEFT JOIN categories c ON c.id = p.category_id
//       WHERE p.is_public = true
//         AND (${q} = '' OR p.title ILIKE ${like} OR p.content ILIKE ${like})
//       ORDER BY p.created_at DESC
//       LIMIT 200
//     `;
//     return Response.json(rows);
//   }

//   if (!uid) return Response.json([]);

//   const rows = await sql`
//     SELECT p.id, p.title, p.content, p.is_public, p.created_at, p.updated_at,
//            p.category_id, c.name AS category,
//            u.name AS author, u.image AS author_image,
//            true AS own
//     FROM prompts p
//     JOIN users u ON u.id = p.user_id
//     LEFT JOIN categories c ON c.id = p.category_id
//     WHERE p.user_id = ${uid}
//       AND (${q} = '' OR p.title ILIKE ${like} OR p.content ILIKE ${like})
//       AND (${categoryId}::int IS NULL OR p.category_id = ${categoryId})
//     ORDER BY p.created_at DESC
//     LIMIT 500
//   `;
//   return Response.json(rows);
// }

export async function GET(req: NextRequest) {
  const session = await auth();
  const uid = session?.user?.dbUserId ?? null;

  const sp = req.nextUrl.searchParams;
  const scope = sp.get("scope") === "explore" ? "explore" : "mine";
  const q = (sp.get("q") ?? "").trim();
  const like = `%${q}%`;
  const categoryRaw = sp.get("category");
  const categoryId = scope === "mine" && categoryRaw && categoryRaw !== "all" ? Number(categoryRaw) : null;

  const baseSelect = sql`
    SELECT p.id, p.title, p.content, p.is_public, p.created_at, p.updated_at,
           p.category_id, c.name AS category,
           u.name AS author, u.image AS author_image,
           (p.user_id = ${uid ?? -1}) AS own,
           (SELECT COUNT(*) FROM votes v WHERE v.prompt_id = p.id) AS votes_count,
           EXISTS(SELECT 1 FROM votes v WHERE v.prompt_id = p.id AND v.user_id = ${uid ?? -1}) AS user_voted
  `;

  if (scope === "explore") {
    const rows = await sql`
      ${baseSelect}
      FROM prompts p
      JOIN users u ON u.id = p.user_id
      LEFT JOIN categories c ON c.id = p.category_id
      WHERE p.is_public = true
        AND (${q} = '' OR p.title ILIKE ${like} OR p.content ILIKE ${like})
      ORDER BY votes_count DESC, p.created_at DESC
      LIMIT 200
    `;
    return Response.json(rows);
  }

  if (!uid) return Response.json([]);

  const rows = await sql`
    ${baseSelect}
    FROM prompts p
    JOIN users u ON u.id = p.user_id
    LEFT JOIN categories c ON c.id = p.category_id
    WHERE p.user_id = ${uid}
      AND (${q} = '' OR p.title ILIKE ${like} OR p.content ILIKE ${like})
      AND (${categoryId}::int IS NULL OR p.category_id = ${categoryId})
    ORDER BY p.created_at DESC
    LIMIT 500
  `;
  return Response.json(rows);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  const uid = session?.user?.dbUserId;
  if (!uid) return new Response("Unauthorized", { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body) return new Response("Invalid JSON", { status: 400 });

  const title = String(body.title ?? "").trim().slice(0, 200);
  const content = String(body.content ?? "").trim();
  const isPublic = Boolean(body.isPublic);
  const categoryId = body.categoryId ? Number(body.categoryId) : null;

  if (!title || !content)
    return new Response("Title and content are required", { status: 400 });
  if (content.length > 20000)
    return new Response("Prompt too long (max 20,000 chars)", { status: 400 });

  if (categoryId) {
    const check = await sql`SELECT id FROM categories WHERE id = ${categoryId} AND user_id = ${uid}`;
    if (!check.length) return new Response("Category not found", { status: 400 });
  }

  const rows = await sql`
    INSERT INTO prompts (user_id, category_id, title, content, is_public)
    VALUES (${uid}, ${categoryId}, ${title}, ${content}, ${isPublic})
    RETURNING *
  `;
  return Response.json(rows[0], { status: 201 });
}