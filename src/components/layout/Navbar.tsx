"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="font-bold text-xl text-gray-900">
          🎫 TicketPlatform
        </Link>

        <div className="flex items-center gap-6">
          <Link
            href="/events"
            className="text-gray-600 hover:text-gray-900 font-medium transition"
          >
            Events
          </Link>

          {session?.user.role === "ADMIN" && (
            <Link
              href="/admin/events"
              className="text-gray-600 hover:text-gray-900 font-medium transition"
            >
              Dashboard
            </Link>
          )}

          {session ? (
            <div className="flex items-center gap-4">
              <Link
                href="/my-tickets"
                className="text-gray-600 hover:text-gray-900 font-medium transition"
              >
                My Tickets
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="border border-gray-300 text-gray-700 px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="text-gray-600 hover:text-gray-900 font-medium transition text-sm"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}