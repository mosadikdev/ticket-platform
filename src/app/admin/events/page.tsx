"use client";

import { useState, useEffect } from "react";
import { EventForm } from "@/components/events/EventForm";
import { formatDate } from "@/lib/utils";

interface Event {
  id: string;
  title: string;
  venue: string;
  startsAt: string;
  status: string;
  ticketTypes: any[];
}

const statusColors: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-600",
  PUBLISHED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-600",
  COMPLETED: "bg-blue-100 text-blue-700",
};

const statusLabels: Record<string, string> = {
  DRAFT: "Draft",
  PUBLISHED: "Published",
  CANCELLED: "Cancelled",
  COMPLETED: "Completed",
};

export default function AdminEventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const fetchEvents = async () => {
    const res = await fetch("/api/events");
    const json = await res.json();
    setEvents(json.data || []);
    setFetching(false);
  };

  useEffect(() => { fetchEvents(); }, []);

  const handleSubmit = async (data: any) => {
    setLoading(true);
    try {
      const url = editingEvent ? `/api/events/${editingEvent.id}` : "/api/events";
      const method = editingEvent ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          startsAt: new Date(data.startsAt).toISOString(),
          endsAt: data.endsAt ? new Date(data.endsAt).toISOString() : undefined,
        }),
      });

      if (res.ok) {
        setShowForm(false);
        setEditingEvent(null);
        fetchEvents();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this event?")) return;
    await fetch(`/api/events/${id}`, { method: "DELETE" });
    fetchEvents();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Manage Events</h1>
            <p className="text-gray-500 text-sm mt-1">{events.length} Events</p>
          </div>
          <button
            onClick={() => { setShowForm(true); setEditingEvent(null); }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition"
          >
            add new event
          </button>
        </div>

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold">
                  {editingEvent ? "Edit Event" : "Add New Event"}
                </h2>
                <button
                  onClick={() => { setShowForm(false); setEditingEvent(null); }}
                  className="text-gray-400 hover:text-gray-600 text-xl"
                >✕</button>
              </div>
              <EventForm
                initialData={editingEvent ? {
                  ...editingEvent,
                  startsAt: new Date(editingEvent.startsAt).toISOString().slice(0, 16),
                } : undefined}
                onSubmit={handleSubmit}
                loading={loading}
              />
            </div>
          </div>
        )}

        {/* Events Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {fetching ? (
            <div className="p-12 text-center text-gray-400">Loading...</div>
          ) : events.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-400 mb-4">No events found</p>
              <button
                onClick={() => setShowForm(true)}
                className="text-blue-600 font-medium hover:underline"
              >
                Add First Event
              </button>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-right text-sm font-medium text-gray-500 px-6 py-3">Event</th>
                  <th className="text-right text-sm font-medium text-gray-500 px-6 py-3">Venue</th>
                  <th className="text-right text-sm font-medium text-gray-500 px-6 py-3">Date</th>
                  <th className="text-right text-sm font-medium text-gray-500 px-6 py-3">Status</th>
                  <th className="text-right text-sm font-medium text-gray-500 px-6 py-3">Tickets</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {events.map((event) => (
                  <tr key={event.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{event.title}</p>
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-sm">{event.venue}</td>
                    <td className="px-6 py-4 text-gray-500 text-sm">
                      {formatDate(event.startsAt)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusColors[event.status]}`}>
                        {statusLabels[event.status]}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-sm">
                      {event.ticketTypes.length} types
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => { setEditingEvent(event); setShowForm(true); }}
                          className="text-sm text-blue-600 hover:underline"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(event.id)}
                          className="text-sm text-red-500 hover:underline"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}