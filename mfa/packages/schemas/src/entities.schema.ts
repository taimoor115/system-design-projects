import { z } from "zod";

export const JOB_STATUS_VALUES = [
  "pending",
  "processing",
  "completed",
  "failed",
] as const;

export type JobStatusValue = (typeof JOB_STATUS_VALUES)[number];

export const BookEntitySchema = z
  .object({
    id: z.string().uuid(),
    title: z.string().nullable(),
    description: z.string().nullable(),

    total_pages: z.number().int().nullable(),
    is_deleted: z.boolean(),
    created_at: z.string().nullable(),
    updated_at: z.string().nullable(),
  })
  .meta({ id: "Book" });

export type BookEntity = z.infer<typeof BookEntitySchema>;

export const CreateBookEntitySchema = BookEntitySchema.omit({
  id: true,
  is_deleted: true,
  created_at: true,
  updated_at: true,
}).meta({ id: "CreateBookEntity" });
export type CreateBookEntity = z.infer<typeof CreateBookEntitySchema>;

export const UpdateBookEntitySchema = CreateBookEntitySchema.partial().meta({
  id: "UpdateBookEntity",
});
export type UpdateBookEntity = z.infer<typeof UpdateBookEntitySchema>;

export const BookPageEntitySchema = z
  .object({
    id: z.string().uuid(),
    book_id: z.string().uuid(),
    page_number: z.number().int(),
    transcript: z.string().nullable(),
    original_image: z.string().nullable(),
    should_processed: z.boolean().nullable(),
    is_deleted: z.boolean(),
    created_at: z.string().nullable(),
    updated_at: z.string().nullable(),
  })
  .meta({ id: "BookPage" });

export type BookPageEntity = z.infer<typeof BookPageEntitySchema>;

export const CharacterEntitySchema = z
  .object({
    id: z.string().uuid(),
    user_id: z.string().uuid(),
    child_name: z.string(),
    pronunciation: z.string().nullable(),
    gender: z.enum(["male", "female", "other"]),
    age_range: z.enum(["1_5", "6_10"]),
    birthday_month: z.string().nullable(),
    language: z.string(),
    relationship: z.string(),
    narrator_voice_language: z.string(),
    narrator_gender: z.enum(["male", "female"]),
    child_dialogue_voice: z.string().nullable(),
    memo_text: z.string().nullable(),
    memo_audio_url: z.string().nullable(),
    memo_duration: z.number().int().nullable(),
    photo_1_url: z.string(),
    photo_2_url: z.string().nullable(),
    created_at: z.string().nullable(),
    updated_at: z.string().nullable(),
  })
  .meta({ id: "Character" });

export type CharacterEntity = z.infer<typeof CharacterEntitySchema>;

export const AiJobEntitySchema = z
  .object({
    id: z.string().uuid(),
    user_id: z.string().uuid().nullable(),
    book_id: z.string().uuid().nullable(),
    character_id: z.string().uuid().nullable(),
    payment_id: z.string().uuid().nullable(),
    user_name: z.string().nullable(),
    book_title: z.string().nullable(),
    character_name: z.string().nullable(),
    status: z.string().nullable(),
    step_label: z.string().nullable(),
    progress: z.number().int().nullable(),
    batch_size: z.number().int().nullable(),
    reference_child_hash: z.string().nullable(),
    child_image_url: z.string().nullable(),
    video_url: z.string().nullable(),
    error_message: z.string().nullable(),
    created_at: z.string().nullable(),
    updated_at: z.string().nullable(),
  })
  .meta({ id: "AiJob" });

export type AiJobEntity = z.infer<typeof AiJobEntitySchema>;

export const AiBatchPageSchema = z
  .object({
    id: z.string(),
    page_number: z.number().int(),
    original_image: z.string().nullable(),
  })
  .meta({ id: "AiBatchPage" });

export type AiBatchPage = z.infer<typeof AiBatchPageSchema>;

export const AiBatchEntitySchema = z
  .object({
    id: z.string().uuid(),
    job_id: z.string().uuid(),
    batch_index: z.number().int(),
    pages: z.array(AiBatchPageSchema).nullable(),
    status: z.string().nullable(),
    created_at: z.string().nullable(),
  })
  .meta({ id: "AiBatch" });

export type AiBatchEntity = z.infer<typeof AiBatchEntitySchema>;

export const AiBatchCreateEntitySchema = AiBatchEntitySchema.omit({
  id: true,
}).meta({
  id: "AiBatchCreateEntity",
});
export type AiBatchCreateEntity = z.infer<typeof AiBatchCreateEntitySchema>;

// ─── GeneratedPage ────────────────────────────────────────────────────────────
// Frontend usage: import type { GeneratedPageEntity } from '@repo/schemas'
export const GeneratedPageEntitySchema = z
  .object({
    id: z.string().uuid(),
    job_id: z.string().uuid(),
    page_number: z.number().int(),
    generated_image_url: z.string().nullable(),
    image_hash: z.string().nullable(),
    is_cached: z.boolean().nullable(),
    created_at: z.string().nullable(),
  })
  .meta({ id: "GeneratedPage" });

export type GeneratedPageEntity = z.infer<typeof GeneratedPageEntitySchema>;

// ─── JobDownload (response shape for GET /jobs/:id/download) ─────────────────
// Frontend usage: import type { JobDownloadEntity } from '@repo/schemas'
export const JobDownloadEntitySchema = z
  .object({
    job_id: z.string().uuid(),
    video_url: z.string()
    // generated_pages: z.array(GeneratedPageEntitySchema),
  })
  .meta({ id: "JobDownload" });

export type JobDownloadEntity = z.infer<typeof JobDownloadEntitySchema>;

export const BookEditionEntitySchema = z
  .object({
    id: z.string().uuid(),
    book_id: z.string().uuid(),
    gender: z.string(),
    cover_image_front: z.string().nullable(),
    cover_image_back: z.string().nullable(),
    is_published: z.boolean(),
    processing_meta: z
      .object({
        front: z
          .object({ enabled: z.boolean(), prompt: z.string().nullable().optional() })
          .nullable()
          .optional(),
        back: z
          .object({ enabled: z.boolean(), prompt: z.string().nullable().optional() })
          .nullable()
          .optional(),
      })
      .nullable()
      .optional(),
    is_deleted: z.boolean(),
    created_at: z.string().nullable(),
    updated_at: z.string().nullable(),
  })
  .meta({ id: "BookEdition" });
export type BookEditionEntity = z.infer<typeof BookEditionEntitySchema>;

export const BookVariantEntitySchema = z
  .object({
    id: z.string().uuid(),
    book_id: z.string().uuid(),
    edition_id: z.string().uuid(),
    language: z.string(),
    age_group: z.string(),
    is_published: z.boolean(),
    is_deleted: z.boolean(),
    created_at: z.string().nullable(),
    updated_at: z.string().nullable(),
  })
  .meta({ id: "BookVariant" });
export type BookVariantEntity = z.infer<typeof BookVariantEntitySchema>;

export const TranscriptionSegmentEntitySchema = z
  .object({
    id: z.string().uuid(),
    variant_id: z.string().uuid(),
    page_number: z.number().int(),
    order_index: z.number().int(),
    type: z.string(),
    content: z.string(),
    created_at: z.string().nullable(),
  })
  .meta({ id: "TranscriptionSegment" });
export type TranscriptionSegmentEntity = z.infer<
  typeof TranscriptionSegmentEntitySchema
>;

export const AudioSegmentEntitySchema = z
  .object({
    id: z.string().uuid(),
    text_hash: z.string(),
    content: z.string(),
    language: z.string().nullable(),
    age_group: z.string().nullable(),
    voice: z.string().nullable(),
    audio_url: z.string().nullable(),
    duration_ms: z.number().int().nullable(),
    created_at: z.string().nullable(),
  })
  .meta({ id: "AudioSegment" });
export type AudioSegmentEntity = z.infer<typeof AudioSegmentEntitySchema>;
