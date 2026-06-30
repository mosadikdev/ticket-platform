import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDate, formatPrice } from "@/lib/utils";

async function getEvents() {
  return await prisma.event.findMany({
    where: { status: "PUBLISHED" },
    include: {
      ticketTypes: {
        orderBy: { priceCents: "asc" },
      },
    },
    orderBy: { startsAt: "asc" },
  });
}

export default async function EventsPage() {
  const events = await getEvents();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <h1 className="text-3xl font-bold text-gray-900">Upcoming Events</h1>
          <p className="text-gray-500 mt-2">
            {events.length} events available
          </p>
        </div>
      </div>

      {/* Events Grid */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {events.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg">No events available yet.</p>
            <p className="text-gray-400 text-sm mt-2">Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => {
              const minPrice = event.ticketTypes.length > 0
                ? Math.min(...event.ticketTypes.map((t) => t.priceCents))
                : null;

              const totalAvailable = event.ticketTypes.reduce(
                (sum, t) => sum + (t.totalQty - t.reservedQty),
                0
              );

              const isSoldOut = event.ticketTypes.length > 0 && totalAvailable === 0;

              return (
                <Link
                  key={event.id}
                  href={`/events/${event.id}`}
                  className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition group"
                >
                  {/* Image */}
                  <div className="h-48 bg-gradient-to-br from-blue-500 to-purple-600 relative overflow-hidden">
                    {event.imageUrl ? (
                      <img
                        src={event.imageUrl}
                        alt={event.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-white text-5xl opacity-30">🎫</span>
                      </div>
                    )}
                    {isSoldOut && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="text-white font-bold text-lg">SOLD OUT</span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <h2 className="font-bold text-gray-900 text-lg mb-1 line-clamp-1">
                      {event.title}
                    </h2>
                    <p className="text-gray-500 text-sm mb-3 line-clamp-2">
                      {event.description}
                    </p>

                    <div className="space-y-1.5 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span>📅</span>
                        <span>{formatDate(event.startsAt)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span>📍</span>
                        <span>{event.venue}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        {minPrice !== null ? (
                          <span className="text-blue-600 font-bold">
                            From {formatPrice(minPrice)}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-sm">No tickets</span>
                        )}
                      </div>
                      {!isSoldOut && (
                        <span className="text-xs text-green-600 font-medium">
                          {totalAvailable} left
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}