import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const eventSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  venue: z.string().min(3, "Venue must be at least 3 characters"),
  imageUrl: z.string().url().optional().or(z.literal("")),
  startsAt: z.string().datetime(),
  endsAt: z.string().datetime().optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "CANCELLED", "COMPLETED"]).default("DRAFT"),
});

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const events = await prisma.event.findMany({
      where: status ? { status: status as any } : undefined,
      include: {
        ticketTypes: true,
        _count: { select: { ticketTypes: true } },
      },
      orderBy: { startsAt: "asc" },
    });

    return NextResponse.json({ data: events });
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "You are not authorized" }, { status: 403 });
    }

    const body = await req.json();
    const data = eventSchema.parse(body);

    const event = await prisma.event.create({
      data: {
        ...data,
        startsAt: new Date(data.startsAt),
        endsAt: data.endsAt ? new Date(data.endsAt) : null,
        imageUrl: data.imageUrl || null,
      },
    });

    return NextResponse.json({ data: event }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}