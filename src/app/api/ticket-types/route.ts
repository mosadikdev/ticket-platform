import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const ticketTypeSchema = z.object({
  eventId: z.string().min(1, "Event is required"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().optional(),
  priceCents: z.number().min(0, "Price must be 0 or more"),
  totalQty: z.number().min(1, "Quantity must be at least 1"),
});

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get("eventId");

    if (!eventId) {
      return NextResponse.json({ error: "eventId is required" }, { status: 400 });
    }

    const ticketTypes = await prisma.ticketType.findMany({
      where: { eventId },
      orderBy: { priceCents: "asc" },
    });

    return NextResponse.json({ data: ticketTypes });
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const data = ticketTypeSchema.parse(body);

    const ticketType = await prisma.ticketType.create({ data });

    return NextResponse.json({ data: ticketType }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}