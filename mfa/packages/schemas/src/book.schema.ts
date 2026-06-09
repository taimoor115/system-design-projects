import { z } from "zod";
import { sanitizeOptionalText, sanitizeRequiredText } from "./text-utils";

export const CreateBookSchema = z.object({
  title: z.preprocess(
    sanitizeRequiredText,
    z.string().min(1, "Title is required").max(255),
  ),
  description: z.preprocess(
    sanitizeOptionalText,
    z.string().max(1000).optional(),
  ),
  total_pages: z.number().int().positive().optional(),
}).meta({ id: "CreateBook" });

export type CreateBook = z.infer<typeof CreateBookSchema>;

export const GenerateBookSchema = z.object({
  character_id: z.string().uuid(),
  variant_id: z.string().uuid(),
  edition_id: z.string().uuid(),
}).meta({ id: "GenerateBook" });

export type GenerateBook = z.infer<typeof GenerateBookSchema>;

export const UpdateBookSchema = z
  .object({
    title: z.preprocess(
      sanitizeOptionalText,
      z.string().min(1).max(255).optional(),
    ),
    description: z.preprocess(
      sanitizeOptionalText,
      z.string().max(1000).optional(),
    ),
  })
  .refine((payload) => Object.keys(payload).length > 0, {
    message: 'at least one field is required',
  })
  .meta({ id: "UpdateBook" });
export type UpdateBook = z.infer<typeof UpdateBookSchema>;

export const EditionGenderSchema = z.enum(["male", "female", "neutral"]);
export type EditionGender = z.infer<typeof EditionGenderSchema>;

export const AgeGroupSchema = z.enum(["1_5", "6_10", "11_plus"]);
export type AgeGroup = z.infer<typeof AgeGroupSchema>;

export const SegmentTypeSchema = z.enum(["text", "dynamic"]);
export type SegmentType = z.infer<typeof SegmentTypeSchema>;

export const AdminCreateBookSchema = z
  .object({
    title: z.preprocess(
      sanitizeRequiredText,
      z.string().min(1, 'Title is required').max(255),
    ),
    description: z.preprocess(
      sanitizeOptionalText,
      z.string().max(1000).optional(),
    ),
  })
  .meta({ id: "AdminCreateBook" });
export type AdminCreateBook = z.infer<typeof AdminCreateBookSchema>;

export const GenerateEditionSchema = z
  .object({
    gender: EditionGenderSchema,
    cover_image_front: z.string().max(1024).optional(),
    cover_image_back: z.string().max(1024).optional(),
    processing_meta: z
      .object({
        front: z
          .object({ enabled: z.boolean(), prompt: z.string().optional() })
          .optional(),
        back: z
          .object({ enabled: z.boolean(), prompt: z.string().optional() })
          .optional(),
      })
      .optional(),
  })
  .meta({ id: "GenerateEdition" });
export type GenerateEdition = z.infer<typeof GenerateEditionSchema>;

export const UpdateEditionSchema = GenerateEditionSchema.partial().meta({
  id: 'UpdateEdition',
});
export type UpdateEdition = z.infer<typeof UpdateEditionSchema>;

export const BookPageMetadataSchema = z
  .object({
    is_group_image: z.boolean().optional(),
    main_character_position: z.number().int().positive().optional(),
    prompt: z.preprocess(
      sanitizeOptionalText,
      z.string().max(2000).optional(),
    ),
  })
  .partial()
  .meta({ id: "BookPageMetadata" });
export type BookPageMetadata = z.infer<typeof BookPageMetadataSchema>;

export const UploadBookImageMetadataItemSchema = z
  .object({
    page_number: z.number().int().positive(),
    should_processed: z.boolean().optional(),
    metadata: BookPageMetadataSchema.optional(),
    image_url: z.string().max(1024),
  })
  .meta({ id: "UploadBookImageMetadataItem" });
export type UploadBookImageMetadataItem = z.infer<
  typeof UploadBookImageMetadataItemSchema
>;

export const UpdateBookImageMetadataItemSchema = z
  .object({
    page_number: z.number().int().positive().optional(),
    should_processed: z.boolean().optional(),
    metadata: BookPageMetadataSchema.optional(),
    image_url: z.string().max(1024).optional(),
  })
  .refine((payload) => Object.keys(payload).length > 0, {
    message: "at least one field is required",
  })
  .meta({ id: "UpdateBookImageMetadataItem" });
export type UpdateBookImageMetadataItem = z.infer<
  typeof UpdateBookImageMetadataItemSchema
>;

export const UploadBookImagesWithMetadataSchema = z
  .object({
    pages: z
      .array(UploadBookImageMetadataItemSchema)
      .min(1, { message: "At least one image required" })
      .max(500)
      .refine(
        (items) => new Set(items.map((item) => item.page_number)).size === items.length,
        { message: "page_number must be unique within pages" },
      ),
  })
  .meta({ id: "UploadBookImagesWithMetadata" });
export type UploadBookImagesWithMetadata = z.infer<
  typeof UploadBookImagesWithMetadataSchema
>;

export const EditionPagePresignedUploadItemSchema = z
  .object({
    page_number: z.number().int().positive(),
    file_name: z.string().trim().min(1).max(255),
    content_type: z.string().trim().min(1).max(255),
  })
  .meta({ id: "EditionPagePresignedUploadItem" });
export type EditionPagePresignedUploadItem = z.infer<
  typeof EditionPagePresignedUploadItemSchema
>;

export const EditionPagePresignedUploadSchema = z
  .object({
    files: z
      .array(EditionPagePresignedUploadItemSchema)
      .min(1, { message: 'At least one image required' })
      .max(500)
      .refine(
        (items) =>
          new Set(items.map((item) => item.page_number)).size === items.length,
        { message: 'page_number must be unique within files' },
      ),
  })
  .meta({ id: 'EditionPagePresignedUpload' });
export type EditionPagePresignedUpload = z.infer<
  typeof EditionPagePresignedUploadSchema
>;

export const CreateBookVariantSchema = z
  .object({
    language: z.string().trim().min(2).max(10),
    age_group: AgeGroupSchema,
  })
  .meta({ id: "CreateBookVariant" });
export type CreateBookVariant = z.infer<typeof CreateBookVariantSchema>;

export const UpdateBookVariantSchema = CreateBookVariantSchema.partial()
  .refine((payload) => Object.keys(payload).length > 0, {
    message: 'at least one field is required',
  })
  .meta({ id: 'UpdateBookVariant' });
export type UpdateBookVariant = z.infer<typeof UpdateBookVariantSchema>;

export const PageTranscriptionInputSchema = z
  .object({
    page_number: z.number().int().positive(),
    text: z.preprocess(
      sanitizeRequiredText,
      z.string().min(1).max(100000),
    ),
  })
  .meta({ id: "PageTranscriptionInput" });
export type PageTranscriptionInput = z.infer<
  typeof PageTranscriptionInputSchema
>;

export const UpsertTranscriptionSegmentsSchema = z
  .object({
    pages: z
      .array(PageTranscriptionInputSchema)
      .min(1)
      .max(1000)
      .optional()
      .refine(
        (items) =>
          !items ||
          new Set(items.map((item) => item.page_number)).size === items.length,
        { message: "page_number must be unique within pages" },
      ),
    replace_existing: z.boolean().default(true),
  })
  .refine(
    (payload) => Boolean(payload.pages?.length),
    {
      message: "pages is required",
      path: ["pages"],
    },
  )
  .meta({ id: "UpsertTranscriptionSegments" });
export type UpsertTranscriptionSegments = z.infer<
  typeof UpsertTranscriptionSegmentsSchema
>;

export const GenerateStaticAudioSchema = z
  .object({
    voice: z.enum(['male', 'female']),
    page_numbers: z.array(z.number().int().positive()).min(1).optional(),
    replace_existing: z.boolean().default(false),
  })
  .meta({ id: "GenerateStaticAudio" });
export type GenerateStaticAudio = z.infer<typeof GenerateStaticAudioSchema>;

export const GenerateSubtitleFileSchema = z
  .object({
    voice: z.enum(['male', 'female']),
  })
  .meta({ id: 'GenerateSubtitleFile' });
export type GenerateSubtitleFile = z.infer<typeof GenerateSubtitleFileSchema>;
