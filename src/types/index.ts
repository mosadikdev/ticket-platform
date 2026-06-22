export type UserRole = "USER" | "ADMIN";

export type OrderStatus = "PENDING" | "PAID" | "CANCELLED" | "EXPIRED";

export type TicketStatus = "VALID" | "USED" | "CANCELLED";

export type EventStatus = "DRAFT" | "PUBLISHED" | "CANCELLED" | "COMPLETED";

export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  message?: string;
}