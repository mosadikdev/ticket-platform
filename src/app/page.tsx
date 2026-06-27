import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <div className="text-center max-w-2xl">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Ticket Platform
        </h1>
        <p className="text-gray-500 text-lg mb-8">
          Book tickets for your favorite events easily and securely
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/events"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition"
          >
            Browse Events
          </Link>
          <Link
            href="/admin/events"
            className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition"
          >
            Admin Dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}