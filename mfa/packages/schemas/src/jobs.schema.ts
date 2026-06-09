import { z } from "zod";

export const JOB_QUEUE_VALUES = ["image", "audio", "video"] as const;
export const QUEUE_STATUS_VALUES = [
  "pending",
  "processing",
  "completed",
  "failed",
] as const;

const positiveIntegerSchema = z
  .coerce
  .number()
  .int("Must be a whole number")
  .positive("Must be greater than zero");

export const jobsFiltersSchema = z
  .object({
    queue: z.enum(JOB_QUEUE_VALUES).optional(),
    status: z.enum(QUEUE_STATUS_VALUES).optional(),
    book_id: z.string().trim().optional(),
    user_name: z
      .string()
      .trim()
      .max(100, "Search query must be 100 characters or fewer")
      .optional(),
  })
  .strict();

export const adminJobsQuerySchema = jobsFiltersSchema.extend({
  page: positiveIntegerSchema.default(1),
  limit: positiveIntegerSchema
    .max(100, "Items per page must be 100 or fewer")
    .default(10),
});

export const adminJobStatsQuerySchema = jobsFiltersSchema;

export type AdminJobsQueryDto = z.infer<typeof adminJobsQuerySchema>;
export type AdminJobStatsQueryDto = z.infer<typeof adminJobStatsQuerySchema>;