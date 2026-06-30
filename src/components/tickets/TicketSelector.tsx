"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/utils";

interface TicketType {
  id: string;
  name: string;
  description: string | null;
  priceCents: number;
  available: number;
}

interface Props {
  eventId: string;
  ticketTypes: TicketType[];
}

export function TicketSelector({ ticketTypes }: Props) {
  const { data: session } = useSession();
  const router = useRouter();
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const updateQty = (id: string, delta: number) => {
    setQuantities((prev) => {
      const current = prev[id] || 0;
      const ticket = ticketTypes.find((t) => t.id === id);
      if (!ticket) return prev;
      const next = Math.max(0, Math.min(current + delta, ticket.available, 10));
      return { ...prev, [id]: next };
    });
  };

  const totalItems = Object.values(quantities).reduce((a, b) => a + b, 0);
  const totalPrice = ticketTypes.reduce((sum, t) => {
    return sum + (quantities[t.id] || 0) * t.priceCents;
  }, 0);

  const handleCheckout = () => {
    if (!session) {
      router.push("/login");
      return;
    }

    const items = Object.entries(quantities)
      .filter(([, qty]) => qty > 0)
      .map(([ticketTypeId, quantity]) => ({ ticketTypeId, quantity }));

    const params = new URLSearchParams();
    params.set("items", JSON.stringify(items));
    router.push(`/checkout?${params.toString()}`);
  };

  if (ticketTypes.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
        <p className="text-gray-400">No tickets available</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-6">
      <h2 className="text-lg font-bold text-gray-900 mb-4">Select Tickets</h2>

      <div className="space-y-4 mb-6">
        {ticketTypes.map((ticket) => {
          const qty = quantities[ticket.id] || 0;
          const isSoldOut = ticket.available === 0;

          return (
            <div
              key={ticket.id}
              className={`border rounded-lg p-4 ${isSoldOut ? "opacity-50 border-gray-100" : "border-gray-200"}`}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-medium text-gray-900">{ticket.name}</p>
                  {ticket.description && (
                    <p className="text-xs text-gray-500 mt-0.5">{ticket.description}</p>
                  )}
                  <p className="text-blue-600 font-bold mt-1">
                    {formatPrice(ticket.priceCents)}
                  </p>
                </div>

                {isSoldOut ? (
                  <span className="text-xs text-red-500 font-medium mt-1">
                    Sold Out
                  </span>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQty(ticket.id, -1)}
                      disabled={qty === 0}
                      className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-30 transition"
                    >
                      −
                    </button>
                    <span className="w-6 text-center font-medium text-gray-900">
                      {qty}
                    </span>
                    <button
                      onClick={() => updateQty(ticket.id, 1)}
                      disabled={qty >= ticket.available || qty >= 10}
                      className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-30 transition"
                    >
                      +
                    </button>
                  </div>
                )}
              </div>

              {!isSoldOut && (
                <p className="text-xs text-gray-400">
                  {ticket.available} tickets left
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Total */}
      {totalItems > 0 && (
        <div className="border-t border-gray-100 pt-4 mb-4">
          <div className="flex justify-between text-sm text-gray-500 mb-1">
            <span>{totalItems} ticket{totalItems > 1 ? "s" : ""}</span>
            <span>{formatPrice(totalPrice)}</span>
          </div>
        </div>
      )}

      <button
        onClick={handleCheckout}
        disabled={totalItems === 0}
        className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
      >
        {totalItems === 0 ? "Select Tickets" : `Checkout — ${formatPrice(totalPrice)}`}
      </button>

      {!session && totalItems > 0 && (
        <p className="text-xs text-gray-400 text-center mt-2">
          You&apos;ll need to sign in to complete your purchase
        </p>
      )}
    </div>
  );
}