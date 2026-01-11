import { pgTable, text, serial, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const sessions = pgTable("sessions", {
  id: serial("id").primaryKey(),
  busNumber: text("bus_number").notNull(),
  driverName: text("driver_name").notNull(),
  stopBoarded: text("stop_boarded").notNull(),
  route: text("route").notNull(),
  startTime: timestamp("start_time").notNull().defaultNow(),
  endTime: timestamp("end_time"),
});

export const violations = pgTable("violations", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").notNull(), // Foreign key references sessions(id)
  type: text("type").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

export const violationTypes = pgTable("violation_types", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  isDefault: boolean("is_default").notNull().default(false),
});

// Schemas
export const insertSessionSchema = createInsertSchema(sessions, {
  startTime: z.coerce.date(),
}).omit({ id: true, endTime: true });
export const insertViolationSchema = createInsertSchema(violations).omit({ id: true });
export const insertViolationTypeSchema = createInsertSchema(violationTypes).omit({ id: true });

// Types
export type Session = typeof sessions.$inferSelect;
export type InsertSession = z.infer<typeof insertSessionSchema>;
export type Violation = typeof violations.$inferSelect;
export type InsertViolation = z.infer<typeof insertViolationSchema>;
export type ViolationType = typeof violationTypes.$inferSelect;
export type InsertViolationType = z.infer<typeof insertViolationTypeSchema>;

// API Payloads
export type CreateSessionRequest = InsertSession;
export type EndSessionRequest = { endTime: string }; // ISO string
export type CreateViolationRequest = InsertViolation;
export type CreateViolationTypeRequest = InsertViolationType;
