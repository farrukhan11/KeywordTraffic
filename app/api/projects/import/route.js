import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { connectDB } from "@/lib/mongodb";
import Project from "@/models/Project";

const rowSchema = z.object({
  store: z.string().min(1),
  keyword: z.string().min(1),
  country: z.string().min(2).default("United Kingdom"),
  language: z.string().min(2).default("English"),
});

const importSchema = z.object({ rows: z.array(rowSchema).min(1).max(20000) });

export async function POST(request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { rows } = importSchema.parse(await request.json());
    const grouped = new Map();

    for (const row of rows) {
      const store = row.store.trim();
      const country = row.country.trim();
      const language = row.language.trim();
      const key = `${store.toLowerCase()}::${country.toLowerCase()}::${language.toLowerCase()}`;
      if (!grouped.has(key)) grouped.set(key, { name: store, country, language, keywords: new Set() });
      grouped.get(key).keywords.add(row.keyword.trim().toLowerCase());
    }

    await connectDB();
    const created = [];

    for (const group of grouped.values()) {
      const keywords = [...group.keywords].filter(Boolean);
      const project = await Project.create({
        userId: session.user.id,
        name: group.name,
        country: group.country,
        language: group.language,
        keywords,
        status: keywords.length ? "READY" : "DRAFT",
      });
      created.push(project._id.toString());
    }

    return NextResponse.json({
      createdProjects: created.length,
      importedRows: rows.length,
      uniqueKeywords: [...grouped.values()].reduce((sum, group) => sum + group.keywords.size, 0),
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error?.issues?.[0]?.message || "Unable to import file" }, { status: 400 });
  }
}
