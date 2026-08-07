import { sql } from "@/lib/db";
import { notFound } from "next/navigation";
import PublicPromptView from "../../../components/PublicPromptView";
import { Metadata } from "next";

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const rows = await sql`SELECT title FROM prompts WHERE id = ${Number(params.id)} AND is_public = true`;
  return { title: rows[0]?.title || "Prompt" };
}

export default async function PublicPromptPage({ params }: { params: { id: string } }) {
  const id = Number(params.id);
  if (!id) return notFound();

  const rows = await sql`
    SELECT p.id, p.title, p.content, p.created_at, c.name as category, u.name as author, u.image as author_image
    FROM prompts p
    JOIN users u ON u.id = p.user_id
    LEFT JOIN categories c ON c.id = p.category_id
    WHERE p.id = ${id} AND p.is_public = true
  `;

  if (!rows.length) return notFound();
  return <PublicPromptView prompt={rows[0]} />;
}