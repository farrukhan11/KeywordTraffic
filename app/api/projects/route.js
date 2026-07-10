import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { connectDB } from "@/lib/mongodb";
import Project from "@/models/Project";

const schema = z.object({
  name: z.string().min(2).max(150),
  country: z.string().min(2),
  language: z.string().min(2),
  keywords: z.array(z.string().min(1)).max(5000),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await connectDB();
  const projects = await Project.find({ userId: session.user.id }).sort({ createdAt: -1 }).lean();
  return NextResponse.json({ projects });
}

export async function POST(request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const data = schema.parse(await request.json());
    const keywords = [...new Set(data.keywords.map(k => k.trim().toLowerCase()).filter(Boolean))];
    await connectDB();
    const project = await Project.create({ ...data, keywords, userId: session.user.id, status: keywords.length ? "READY" : "DRAFT" });
    return NextResponse.json({ project }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error?.issues?.[0]?.message || "Unable to create project" }, { status: 400 });
  }
}
