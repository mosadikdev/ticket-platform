import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatDate, formatPrice } from "@/lib/utils";
import { TicketSelector } from "@/components/tickets/TicketSelector";

async function getEvent(id: string) {
  return await prisma.event.findUnique({
    where: { id, status: "PUBLISHED" },
    include: {
      ticketTypes: {
        orderBy: { priceCents: "asc" },
      },
    },
  });
}

export default async function EventDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const event = await getEvent(params.id);

  if (!event) notFound();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="h-72 bg-gradient-to-br from-blue-500 to-purple-600 relative">
        {event.imageUrl && (
          <img
            src={event.imageUrl}
            alt={event.title}
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-white mb-2">{event.title}</h1>
            <div className="flex items-center gap-6 text-white/80 text-sm">
              <span>📅 {formatDate(event.startsAt)}</span>
              <span>📍 {event.venue}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Description */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-3">About This Event</h2>
            <p className="text-gray-600 leading-relaxed whitespace-pre-line">
              {event.description}
            </p>

            {event.endsAt && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-sm text-gray-500">
                  Ends: {formatDate(event.endsAt)}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Ticket Selector */}
        <div className="lg:col-span-1">
          <TicketSelector
            eventId={event.id}
            ticketTypes={event.ticketTypes.map((t) => ({
              id: t.id,
              name: t.name,
              description: t.description,
              priceCents: t.priceCents,
              available: t.totalQty - t.reservedQty,
            }))}
          />
        </div>
      </div>
    </div>
  );
}