import { db } from "./db";
import { 
  sessions, violations, violationTypes,
  type Session, type InsertSession, 
  type Violation, type InsertViolation,
  type ViolationType, type InsertViolationType
} from "@shared/schema";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // Sessions
  createSession(session: InsertSession): Promise<Session>;
  endSession(id: number, endTime: Date): Promise<Session>;
  getSession(id: number): Promise<Session | undefined>;
  getSessions(): Promise<Session[]>;
  deleteSession(id: number): Promise<void>;
  deleteAllSessions(): Promise<void>;
  
  // Violations
  createViolation(violation: InsertViolation): Promise<Violation>;
  getViolations(sessionId: number): Promise<Violation[]>;
  deleteViolation(id: number): Promise<void>;
  
  // Violation Types
  createViolationType(type: InsertViolationType): Promise<ViolationType>;
  getViolationTypes(): Promise<ViolationType[]>;
  getViolationTypeByName(name: string): Promise<ViolationType | undefined>;
}

export class DatabaseStorage implements IStorage {
  // Sessions
  async createSession(session: InsertSession): Promise<Session> {
    const [newSession] = await db.insert(sessions).values(session).returning();
    return newSession;
  }

  async endSession(id: number, endTime: Date): Promise<Session> {
    const [updatedSession] = await db
      .update(sessions)
      .set({ endTime })
      .where(eq(sessions.id, id))
      .returning();
    return updatedSession;
  }

  async getSession(id: number): Promise<Session | undefined> {
    const [session] = await db.select().from(sessions).where(eq(sessions.id, id));
    return session;
  }

  async getSessions(): Promise<Session[]> {
    return await db.select().from(sessions).orderBy(desc(sessions.startTime));
  }

  async deleteSession(id: number): Promise<void> {
    await db.delete(violations).where(eq(violations.sessionId, id));
    await db.delete(sessions).where(eq(sessions.id, id));
  }

  async deleteAllSessions(): Promise<void> {
    await db.delete(violations);
    await db.delete(sessions);
  }

  // Violations
  async createViolation(violation: InsertViolation): Promise<Violation> {
    const [newViolation] = await db.insert(violations).values(violation).returning();
    return newViolation;
  }

  async getViolations(sessionId: number): Promise<Violation[]> {
    return await db
      .select()
      .from(violations)
      .where(eq(violations.sessionId, sessionId))
      .orderBy(desc(violations.timestamp));
  }

  async deleteViolation(id: number): Promise<void> {
    await db.delete(violations).where(eq(violations.id, id));
  }

  // Violation Types
  async createViolationType(type: InsertViolationType): Promise<ViolationType> {
    const [newType] = await db.insert(violationTypes).values(type).returning();
    return newType;
  }

  async getViolationTypes(): Promise<ViolationType[]> {
    return await db.select().from(violationTypes);
  }

  async getViolationTypeByName(name: string): Promise<ViolationType | undefined> {
    const [type] = await db.select().from(violationTypes).where(eq(violationTypes.name, name));
    return type;
  }
}

export const storage = new DatabaseStorage();
