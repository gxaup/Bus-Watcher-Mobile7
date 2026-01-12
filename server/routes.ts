import type { Express, Request, Response, NextFunction } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { format } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";
import { registerAuthRoutes, isAuthenticated } from "./auth";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  const TZ = "America/New_York";
  
  registerAuthRoutes(app);

  // Seed default violation types
  const defaultTypes = [
    "Customer standing while bus in motion",
    "Ran red",
    "Excessive Honking",
    "Uniform",
    "Took off while customers standing"
  ];
  for (const name of defaultTypes) {
    const existing = await storage.getViolationTypeByName(name);
    if (!existing) {
      await storage.createViolationType({ name, isDefault: true });
    }
  }

  // Sessions (protected routes)
  app.get(api.sessions.list.path, isAuthenticated, async (req, res) => {
    const allSessions = await storage.getUserSessions(req.user!.id);
    res.json(allSessions);
  });

  app.post(api.sessions.create.path, isAuthenticated, async (req, res) => {
    try {
      await storage.deleteCustomViolationTypes();
      
      const input = api.sessions.create.input.parse(req.body);
      const session = await storage.createSession(input, req.user!.id);
      res.status(201).json(session);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.patch(api.sessions.end.path, isAuthenticated, async (req, res) => {
    try {
      const { endTime } = api.sessions.end.input.parse(req.body);
      const session = await storage.endSession(Number(req.params.id), new Date(endTime));
      if (!session) return res.status(404).json({ message: "Session not found" });
      res.json(session);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.message });
      throw err;
    }
  });

  app.patch(api.sessions.update.path, isAuthenticated, async (req, res) => {
    try {
      const input = api.sessions.update.input.parse(req.body);
      const updateData: Record<string, unknown> = {};
      if (input.busNumber !== undefined) updateData.busNumber = input.busNumber;
      if (input.driverName !== undefined) updateData.driverName = input.driverName;
      if (input.route !== undefined) updateData.route = input.route;
      if (input.stopBoarded !== undefined) updateData.stopBoarded = input.stopBoarded;
      if (input.startTime !== undefined) updateData.startTime = new Date(input.startTime);
      
      const session = await storage.updateSession(Number(req.params.id), updateData);
      if (!session) return res.status(404).json({ message: "Session not found" });
      res.json(session);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.message });
      throw err;
    }
  });

  app.get(api.sessions.get.path, isAuthenticated, async (req, res) => {
    const session = await storage.getSession(Number(req.params.id));
    if (!session) return res.status(404).json({ message: "Session not found" });
    const violations = await storage.getViolations(session.id);
    res.json({ ...session, violations });
  });

  app.delete(api.sessions.delete.path, isAuthenticated, async (req, res) => {
    const session = await storage.getSession(Number(req.params.id));
    if (!session) return res.status(404).json({ message: "Session not found" });
    await storage.deleteSession(Number(req.params.id));
    res.status(204).end();
  });

  app.delete(api.sessions.deleteAll.path, isAuthenticated, async (req, res) => {
    await storage.deleteAllSessions();
    res.status(204).end();
  });

  // Violations
  app.post(api.violations.create.path, async (req, res) => {
    try {
      const input = api.violations.create.input.parse(req.body);
      const violation = await storage.createViolation(input);
      res.status(201).json(violation);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.get(api.violations.list.path, async (req, res) => {
    const violations = await storage.getViolations(Number(req.params.sessionId));
    res.json(violations);
  });

  app.delete(api.violations.delete.path, async (req, res) => {
    await storage.deleteViolation(Number(req.params.id));
    res.status(204).end();
  });

  // Violation Types
  app.get(api.violationTypes.list.path, async (req, res) => {
    const types = await storage.getViolationTypes();
    res.json(types);
  });

  app.post(api.violationTypes.create.path, async (req, res) => {
    try {
      const input = api.violationTypes.create.input.parse(req.body);
      const type = await storage.createViolationType(input);
      res.status(201).json(type);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  // Reports
  app.get(api.reports.generate.path, async (req, res) => {
    const sessionId = Number(req.params.id);
    const username = req.query.username as string | undefined;
    const session = await storage.getSession(sessionId);
    if (!session) return res.status(404).json({ message: "Session not found" });

    const violations = await storage.getViolations(sessionId);

    // Format Report
    const lines = [];
    lines.push(`SESSION REPORT`);
    lines.push(`================================`);
    lines.push(`Bus Number: ${session.busNumber}`);
    lines.push(`Driver: ${session.driverName}`);
    lines.push(`Route: ${session.route}`);
    lines.push(`Stop Boarded: ${session.stopBoarded}`);
    lines.push(`Start Time: ${formatInTimeZone(new Date(session.startTime), TZ, "h:mm")}`);
    lines.push(`End Time: ${session.endTime ? formatInTimeZone(new Date(session.endTime), TZ, "h:mm") : "N/A"}`);
    lines.push(``);
    lines.push(`VIOLATIONS LOG (${violations.length})`);
    lines.push(`--------------------------------`);
    
    if (violations.length === 0) {
      lines.push(`No violations recorded.`);
    } else {
      // Sort violations by timestamp (earliest first)
      const sortedViolations = [...violations].sort((a, b) => 
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );
      
      // Group violations by type, preserving time order
      const grouped: Record<string, Array<{time: string, timestamp: Date, note?: string}>> = {};
      sortedViolations.forEach((v) => {
        const timeStr = formatInTimeZone(new Date(v.timestamp), TZ, "h:mm");
        if (!grouped[v.type]) {
          grouped[v.type] = [];
        }
        grouped[v.type].push({ time: timeStr, timestamp: new Date(v.timestamp), note: v.notes || undefined });
      });
      
      // Sort groups by earliest violation time
      const sortedGroups = Object.entries(grouped).sort((a, b) => 
        a[1][0].timestamp.getTime() - b[1][0].timestamp.getTime()
      );
      
      for (const [type, entries] of sortedGroups) {
        if (type.toLowerCase() === "uniform") {
          // For uniform violations, only show notes (no time)
          const notesOnly = entries.filter(e => e.note).map(e => e.note);
          if (notesOnly.length > 0) {
            lines.push(`[${notesOnly.join(", ")}] || ${type}`);
          } else {
            lines.push(`${type} (${entries.length})`);
          }
        } else {
          const timesWithNotes = entries.map(e => e.note ? `${e.time} (${e.note})` : e.time);
          lines.push(`[${timesWithNotes.join(", ")}] || ${type}`);
        }
      }
    }

    const content = lines.join("\n");
    const reportName = username ? `${username}_${session.busNumber}` : `Session_${session.busNumber}`;
    const filename = `${reportName}_${format(new Date(), "yyyyMMdd_HHmm")}.txt`;

    res.json({ filename, content });
  });

  return httpServer;
}
