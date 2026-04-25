import { z } from "zod";

export const listSchedulesSchema = z.object({
  search: z.string().optional(),
  difficulty: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]).optional(),
  status: z.enum(["DRAFT", "PUBLISHED"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
export type ListSchedulesQuery = z.infer<typeof listSchedulesSchema>;

export const createScheduleSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().min(1),
  difficulty: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]).default("BEGINNER"),
  dailyMinutes: z.number().int().min(1).default(30),
  scriptureList: z.array(z.unknown()).default([]),
  minRecitations: z.number().int().min(1).default(1),
  maxRecitations: z.number().int().min(1).optional(),
  status: z.enum(["DRAFT", "PUBLISHED"]).default("DRAFT"),
});
export type CreateScheduleInput = z.infer<typeof createScheduleSchema>;

export const updateScheduleSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().min(1).optional(),
  difficulty: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]).optional(),
  dailyMinutes: z.number().int().min(1).optional(),
  scriptureList: z.array(z.unknown()).optional(),
  minRecitations: z.number().int().min(1).optional(),
  maxRecitations: z.number().int().min(1).nullable().optional(),
  status: z.enum(["DRAFT", "PUBLISHED"]).optional(),
});
export type UpdateScheduleInput = z.infer<typeof updateScheduleSchema>;

export const listGuidelinesSchema = z.object({
  scheduleId: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
export type ListGuidelinesQuery = z.infer<typeof listGuidelinesSchema>;

export const createGuidelineSchema = z.object({
  schedulePublicId: z.string().min(1),
  topic: z.string().min(1).max(255),
  guidance: z.string().min(1),
  importance: z.enum(["CRITICAL", "IMPORTANT", "REFERENCE"]).default("IMPORTANT"),
});
export type CreateGuidelineInput = z.infer<typeof createGuidelineSchema>;

export const createRoutineSchema = z.object({
  schedulePublicId: z.string().min(1),
  dayNumber: z.number().int().min(1),
  scriptureSequence: z.array(z.string()).default([]),
  timing: z.string().default(""),
  notes: z.string().default(""),
});
export type CreateRoutineInput = z.infer<typeof createRoutineSchema>;
