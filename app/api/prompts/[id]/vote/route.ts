import { auth } from "@/auth";
import { sql } from "@/lib/db";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const uid = session?.user?.dbUserId;
  if (!uid) return new Response("Unauthorized", { status: 401 });

  const { id } = await params;
  const promptId = Number(id);

  // Toggle: Try to delete first. If nothing was deleted, it means they hadn't voted, so insert.
  const existing = await sql`DELETE FROM votes WHERE user_id = ${uid} AND prompt_id = ${promptId} RETURNING prompt_id`;
  
  if (!existing.length) {
    await sql`INSERT INTO votes (user_id, prompt_id) VALUES (${uid}, ${promptId})`;
    return Response.json({ voted: true });
  }
  
  return Response.json({ voted: false });
}