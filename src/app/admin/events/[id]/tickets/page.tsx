"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { TicketTypeForm } from "@/components/tickets/TicketTypeForm";
import { formatPrice } from "@/lib/utils";

interface TicketType {
  id: string;
  name: string;
  description: string | null;
  priceCents: number;
  totalQty: number;
  reservedQty: number;
}

interface Event {
  id: string;
  title: string;
}

export default function ManageTicketsPage() {
  const { id: eventId } = useParams<{ id: string }>();
  const router = useRouter();

  const [event, setEvent] = useState<Event | null>(null);
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingTicket, setEditingTicket] = useState<TicketType | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const fetchData = async () => {
    const [eventRes, ticketsRes] = await Promise.all([
      fetch(`/api/events/${eventId}`),
      fetch(`/api/ticket-types?eventId=${eventId}`),
    ]);

    const eventJson = await eventRes.json();
    const ticketsJson = await ticketsRes.json();

    setEvent(eventJson.data);
    setTicketTypes(ticketsJson.data || []);
    setFetching(false);
  };

  useEffect(() => { fetchData(); }, [eventId]);

  const handleSubmit = async (data: any) => {
    setLoading(true);
    try {
      const url = editingTicket
        ? `/api/ticket-types/${editingTicket.id}`
        : "/api/ticket-types";
      const method = editingTicket ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, eventId }),
      });

      if (res.ok) {
        setShowForm(false);
        setEditingTicket(null);
        fetchData();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this ticket type?")) return;
    await fetch(`/api/ticket-types/${id}`, { method: "DELETE" });
    fetchData();
  };

  const availableQty = (ticket: TicketType) => ticket.totalQty - ticket.reservedQty;

  if (fetching) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => router.push("/admin/events")}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            ← Back
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">Ticket Types</h1>
            <p className="text-gray-500 text-sm">{event?.title}</p>
          </div>
          <button
            onClick={() => { setShowForm(true); setEditingTicket(null); }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition"
          >
            + Add Ticket Type
          </button>
        </div>

        {/* Form */}
        {showForm && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-bold mb-4">
              {editingTicket ? "Edit Ticket Type" : "Add New Ticket Type"}
            </h2>
            <TicketTypeForm
              eventId={eventId}
              initialData={editingTicket ? {
                name: editingTicket.name,
                description: editingTicket.description || "",
                priceCents: editingTicket.priceCents,
                totalQty: editingTicket.totalQty,
              } : undefined}
              onSubmit={handleSubmit}
              onCancel={() => { setShowForm(false); setEditingTicket(null); }}
              loading={loading}
            />
          </div>
        )}

        {/* Ticket Types List */}
        {ticketTypes.length === 0 && !showForm ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <p className="text-gray-400 mb-4">No ticket types yet</p>
            <button
              onClick={() => setShowForm(true)}
              className="text-blue-600 font-medium hover:underline"
            >
              Add your first ticket type
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {ticketTypes.map((ticket) => (
              <div
                key={ticket.id}
                className="bg-white rounded-xl border border-gray-200 p-5 flex items-center justify-between"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-semibold text-gray-900">{ticket.name}</h3>
                    <span className="text-lg font-bold text-blue-600">
                      {formatPrice(ticket.priceCents)}
                    </span>
                  </div>
                  {ticket.description && (
                    <p className="text-gray-500 text-sm mb-2">{ticket.description}</p>
                  )}
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>Total: {ticket.totalQty}</span>
                    <span>Reserved: {ticket.reservedQty}</span>
                    <span className={availableQty(ticket) === 0 ? "text-red-500 font-medium" : "text-green-600 font-medium"}>
                      Available: {availableQty(ticket)}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => { setEditingTicket(ticket); setShowForm(true); }}
                    className="text-sm text-blue-600 hover:underline px-3 py-1"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(ticket.id)}
                    className="text-sm text-red-500 hover:underline px-3 py-1"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}