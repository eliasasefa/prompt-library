import { auth } from "@/auth";
import { sql } from "@/lib/db";

export async function POST(req: Request) {
  const session = await auth();
  const uid = session?.user?.dbUserId;
  if (!uid) return new Response("Unauthorized", { status: 401 });

  const body = await req.json();
  if (!body.prompts || !Array.isArray(body.prompts)) return new Response("Invalid data", { status: 400 });

  const categoryMap = new Map<string, number>();
  const existingCats = await sql`SELECT id, name FROM categories WHERE user_id = ${uid}`;
  existingCats.forEach(c => categoryMap.set(c.name, c.id));

  let imported = 0;
  for (const p of body.prompts) {
    let categoryId = null;
    if (p.category) {
      if (!categoryMap.has(p.category)) {
        const newCat = await sql`INSERT INTO categories (user_id, name) VALUES (${uid}, ${p.category}) RETURNING id`;
        categoryMap.set(p.category, newCat[0].id);
      }
      categoryId = categoryMap.get(p.category);
    }
    
    await sql`INSERT INTO prompts (user_id, category_id, title, content, is_public) VALUES (${uid}, ${categoryId}, ${p.title}, ${p.content}, ${p.is_public || false})`;
    imported++;
  }

  return Response.json({ imported });
}