import { auth } from "@/auth";
import { sql } from "@/lib/db";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  const uid = session?.user?.dbUserId;
  if (!uid) return new Response("Unauthorized", { status: 401 });

  const { id } = await params;
  const rows = await sql`
    DELETE FROM categories WHERE id = ${Number(id)} AND user_id = ${uid} RETURNING id
  `;
  if (!rows.length) return new Response("Not found", { status: 404 });
  return new Response(null, { status: 204 });
}