import { sql } from "@/lib/db";

function isStableGithubId(id: string | null | undefined): id is string {
  return !!id && /^\d+$/.test(id);
}

function asId(value: unknown): number {
  return Number(value);
}

async function mergeUserInto(fromId: number, intoId: number) {
  if (fromId === intoId) return;
  const stillThere = await sql`SELECT id FROM users WHERE id = ${fromId} LIMIT 1`;
  if (!stillThere.length) return;

  const dupCats = await sql`
    SELECT id, name FROM categories WHERE user_id = ${fromId}
  `;
  for (const cat of dupCats) {
    const existing = await sql`
      SELECT id FROM categories
      WHERE user_id = ${intoId} AND name = ${cat.name as string}
      LIMIT 1
    `;
    if (existing.length) {
      await sql`UPDATE prompts SET category_id = ${asId(existing[0].id)} WHERE category_id = ${asId(cat.id)}`;
      await sql`DELETE FROM categories WHERE id = ${asId(cat.id)}`;
    } else {
      await sql`UPDATE categories SET user_id = ${intoId} WHERE id = ${asId(cat.id)}`;
    }
  }

  await sql`UPDATE prompts SET user_id = ${intoId} WHERE user_id = ${fromId}`;

  await sql`
    DELETE FROM votes d
    WHERE d.user_id = ${fromId}
      AND EXISTS (
        SELECT 1 FROM votes c
        WHERE c.user_id = ${intoId} AND c.prompt_id = d.prompt_id
      )
  `;
  await sql`UPDATE votes SET user_id = ${intoId} WHERE user_id = ${fromId}`;

  await sql`DELETE FROM users WHERE id = ${fromId}`;
}

export async function resolveAppUserId(input: {
  githubId?: string | null;
  email?: string | null;
  name?: string | null;
  image?: string | null;
}): Promise<number | undefined> {
  const githubId = input.githubId?.trim() || null;
  const email = input.email?.trim() || null;
  const name = input.name ?? null;
  const image = input.image ?? null;
  const stableGithubId = isStableGithubId(githubId) ? githubId : null;

  if (!githubId && !email) return undefined;

  const candidates = await sql`
    SELECT u.id
    FROM users u
    LEFT JOIN prompts p ON p.user_id = u.id
    WHERE (${stableGithubId}::text IS NOT NULL AND u.github_id = ${stableGithubId})
       OR (${email}::text IS NOT NULL AND u.email = ${email})
       OR (${githubId}::text IS NOT NULL AND u.github_id = ${githubId})
    GROUP BY u.id
    ORDER BY
      MAX(CASE WHEN ${stableGithubId}::text IS NOT NULL AND u.github_id = ${stableGithubId} THEN 1 ELSE 0 END) DESC,
      COUNT(p.id) DESC,
      u.id ASC
  `;

  let userId: number;
  if (candidates.length) {
    userId = asId(candidates[0].id);
  } else {
    const inserted = await sql`
      INSERT INTO users (github_id, email, name, image)
      VALUES (${stableGithubId ?? githubId}, ${email}, ${name}, ${image})
      ON CONFLICT (github_id)
      DO UPDATE SET
        email = COALESCE(EXCLUDED.email, users.email),
        name = COALESCE(EXCLUDED.name, users.name),
        image = COALESCE(EXCLUDED.image, users.image)
      RETURNING id
    `;
    userId = asId(inserted[0].id);
  }

  const dupes = candidates.slice(1).map((row) => asId(row.id)).filter((id) => id !== userId);
  for (const dupId of dupes) {
    await mergeUserInto(dupId, userId);
  }

  if (stableGithubId) {
    const taken = await sql`
      SELECT id FROM users WHERE github_id = ${stableGithubId} AND id <> ${userId} LIMIT 1
    `;
    for (const row of taken) {
      await mergeUserInto(asId(row.id), userId);
    }
  }

  await sql`
    UPDATE users
    SET
      github_id = COALESCE(${stableGithubId}, github_id),
      email = COALESCE(${email}, email),
      name = COALESCE(${name}, name),
      image = COALESCE(${image}, image)
    WHERE id = ${userId}
  `;

  return userId;
}
