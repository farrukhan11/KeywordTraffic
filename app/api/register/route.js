import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

const schema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(["admin", "user"]).optional(),
});

export async function POST(request) {
  try {
    const body = schema.parse(await request.json());
    await connectDB();
    const email = body.email.toLowerCase();
    if (await User.exists({ email })) return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    await User.create({
      name: body.name,
      email,
      passwordHash: await bcrypt.hash(body.password, 12),
      role: body.role || "user",
    });
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error?.issues?.[0]?.message || "Unable to create account" }, { status: 400 });
  }
}
