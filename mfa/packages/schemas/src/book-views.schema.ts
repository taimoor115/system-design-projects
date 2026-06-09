import { z } from "zod";
import {
  BookEntitySchema,
  BookEditionEntitySchema,
  BookVariantEntitySchema,
  TranscriptionSegmentEntitySchema,
} from "./entities.schema";

// ─── Book List (GET /books/get-all-books response) ──────────────────────────────

/**
 * Matches the shape returned by BooksService.findAll() per item.
 * Extends BookEntity with cover_image_front (presigned URL).
 */
export const BookListItemSchema = z
  .object({
    id: z.string().uuid(),
    title: z.string().nullable(),
    description: z.string().nullable(),
    total_pages: z.number().int(),
    editions_count: z.number().int(),
    variants_count: z.number().int(),
    is_deleted: z.boolean(),
    created_at: z.string().nullable(),
    updated_at: z.string().nullable(),
    cover_image_front: z.string().nullable(),
  })
  .meta({ id: "BookListItem" });
export type BookListItem = z.infer<typeof BookListItemSchema>;

export const BookListPaginationSchema = z
  .object({
    total: z.number().int(),
    page: z.number().int(),
    page_size: z.number().int(),
    total_pages: z.number().int(),
  })
  .meta({ id: "BookListPagination" });
export type BookListPagination = z.infer<typeof BookListPaginationSchema>;

export const BookListResponseSchema = z
  .object({
    items: z.array(BookListItemSchema),
    pagination: BookListPaginationSchema,
  })
  .meta({ id: "BookListResponse" });
export type BookListResponse = z.infer<typeof BookListResponseSchema>;

// ─── Book Page View (returned by findOne with presigned image_url) ──────────────

export const BookPageViewSchema = z
  .object({
    id: z.string().uuid(),
    edition_id: z.string().uuid(),
    page_number: z.number().int(),
    image_url: z.string().nullable(),
    should_processed: z.boolean().nullable(),
    is_deleted: z.boolean(),
    metadata: z
      .object({
        is_group_image: z.boolean().optional(),
        main_character_position: z.number().int().optional(),
        prompt: z.string().optional(),
      })
      .nullable(),
    created_at: z.string().nullable(),
  })
  .meta({ id: "BookPageView" });
export type BookPageView = z.infer<typeof BookPageViewSchema>;

// ─── Book Detail View (GET /books/:id response) ────────────────────────────────

export const BookDetailViewSchema = BookEntitySchema.extend({
  pages: z.array(BookPageViewSchema),
}).meta({ id: "BookDetailView" });
export type BookDetailView = z.infer<typeof BookDetailViewSchema>;

export const BookUpdateResponseSchema = BookEntitySchema.meta({
  id: 'BookUpdateResponse',
});
export type BookUpdateResponse = z.infer<typeof BookUpdateResponseSchema>;

// ─── Edition With Meta (aggregated view with computed counts) ───────────────────

export const EditionWithMetaSchema = BookEditionEntitySchema.extend({
  pages_count: z.number().int(),
  variants_count: z.number().int(),
}).meta({ id: "EditionWithMeta" });
export type EditionWithMeta = z.infer<typeof EditionWithMetaSchema>;

// ─── Variant With Meta (aggregated view with status flags) ──────────────────────

export const VariantWithMetaSchema = BookVariantEntitySchema.extend({
  segments_count: z.number().int(),
  transcription_segments_count: z.number().int(),
  text_segments_count: z.number().int(),
  male_audio_segments_count: z.number().int(),
  female_audio_segments_count: z.number().int(),
  male_subtitle_count: z.number().int(),
  female_subtitle_count: z.number().int(),
  has_audio: z.boolean(),
  has_subtitles: z.boolean(),
}).meta({ id: "VariantWithMeta" });
export type VariantWithMeta = z.infer<typeof VariantWithMetaSchema>;

export const EditionListResponseSchema = z
  .object({
    items: z.array(EditionWithMetaSchema),
  })
  .meta({ id: 'EditionListResponse' });
export type EditionListResponse = z.infer<typeof EditionListResponseSchema>;

export const VariantListResponseSchema = z
  .object({
    items: z.array(VariantWithMetaSchema),
  })
  .meta({ id: 'VariantListResponse' });
export type VariantListResponse = z.infer<typeof VariantListResponseSchema>;

export const EditionPagesResponseSchema = z
  .object({
    edition_id: z.string().uuid(),
    total_pages: z.number().int(),
    pages: z.array(BookPageViewSchema),
  })
  .meta({ id: 'EditionPagesResponse' });
export type EditionPagesResponse = z.infer<typeof EditionPagesResponseSchema>;

export const PublishEditionChecksSchema = z
  .object({
    has_front_cover: z.boolean(),
    has_back_cover: z.boolean(),
    pages_count: z.number().int(),
  })
  .meta({ id: 'PublishEditionChecks' });
export type PublishEditionChecks = z.infer<typeof PublishEditionChecksSchema>;

export const PublishEditionResponseSchema = z
  .object({
    can_publish: z.boolean(),
    errors: z.array(z.string()),
    checks: PublishEditionChecksSchema,
    edition: BookEditionEntitySchema,
  })
  .meta({ id: 'PublishEditionResponse' });
export type PublishEditionResponse = z.infer<
  typeof PublishEditionResponseSchema
>;

export const PublishVariantChecksSchema = z
  .object({
    transcription_segments_count: z.number().int(),
    transcription_pages_count: z.number().int(),
    required_pages_count: z.number().int(),
    text_segments_count: z.number().int(),
    male_audio_segments_count: z.number().int(),
    female_audio_segments_count: z.number().int(),
    male_subtitle_count: z.number().int(),
    female_subtitle_count: z.number().int(),
  })
  .meta({ id: 'PublishVariantChecks' });
export type PublishVariantChecks = z.infer<typeof PublishVariantChecksSchema>;

export const PublishVariantResponseSchema = z
  .object({
    can_publish: z.boolean(),
    errors: z.array(z.string()),
    checks: PublishVariantChecksSchema,
    variant: BookVariantEntitySchema,
  })
  .meta({ id: 'PublishVariantResponse' });
export type PublishVariantResponse = z.infer<
  typeof PublishVariantResponseSchema
>;

export const PublishedBookVariantSchema = z
  .object({
    id: z.string().uuid(),
    language: z.string(),
    age_group: z.string(),
    name: z.string(),
  })
  .meta({ id: 'PublishedBookVariant' });
export type PublishedBookVariant = z.infer<typeof PublishedBookVariantSchema>;

export const PublishedBookEditionSchema = z
  .object({
    id: z.string().uuid(),
    name: z.string(),
    cover_image_front: z.string().nullable(),
    total_pages: z.number().int(),
    published_variants: z.array(PublishedBookVariantSchema),
  })
  .meta({ id: 'PublishedBookEdition' });
export type PublishedBookEdition = z.infer<typeof PublishedBookEditionSchema>;

export const PublishedBookItemSchema = z
  .object({
    id: z.string().uuid(),
    title: z.string().nullable(),
    description: z.string().nullable(),
    created_at: z.string().nullable(),
    updated_at: z.string().nullable(),
    published_editions: z.array(PublishedBookEditionSchema),
  })
  .meta({ id: 'PublishedBookItem' });
export type PublishedBookItem = z.infer<typeof PublishedBookItemSchema>;

export const PublishedBooksPaginationSchema = z
  .object({
    total: z.number().int(),
    page: z.number().int(),
    page_size: z.number().int(),
    total_pages: z.number().int(),
  })
  .meta({ id: 'PublishedBooksPagination' });
export type PublishedBooksPagination = z.infer<
  typeof PublishedBooksPaginationSchema
>;

export const PublishedBooksResponseSchema = z
  .object({
    items: z.array(PublishedBookItemSchema),
    pagination: PublishedBooksPaginationSchema,
  })
  .meta({ id: 'PublishedBooksResponse' });
export type PublishedBooksResponse = z.infer<
  typeof PublishedBooksResponseSchema
>;

// ─── Edition Detail View (edition + pages + variants) ───────────────────────────

export const EditionDetailViewSchema = BookEditionEntitySchema.extend({
  pages: z.array(BookPageViewSchema),
  variants: z.array(VariantWithMetaSchema),
}).meta({ id: "EditionDetailView" });
export type EditionDetailView = z.infer<typeof EditionDetailViewSchema>;

// ─── Segment Audio File Entity ──────────────────────────────────────────────────

export const SegmentAudioFileEntitySchema = z
  .object({
    id: z.string().uuid(),
    segment_id: z.string().uuid(),
    voice: z.string(),
    audio_url: z.string(),
    duration_ms: z.number().int(),
    word_timings: z
      .array(
        z.object({
          word: z.string(),
          startMs: z.number(),
          endMs: z.number(),
        })
      )
      .default([]),
    created_at: z.string().nullable(),
    updated_at: z.string().nullable(),
    is_deleted: z.boolean(),
  })
  .meta({ id: "SegmentAudioFile" });
export type SegmentAudioFileEntity = z.infer<
  typeof SegmentAudioFileEntitySchema
>;

// ─── Variant Subtitle File Entity ───────────────────────────────────────────────

export const VariantSubtitleFileEntitySchema = z
  .object({
    id: z.string().uuid(),
    variant_id: z.string().uuid(),
    voice: z.string(),
    srt_url: z.string(),
    dynamic_cue_index: z.number().int().nullable(),
    created_at: z.string().nullable(),
    updated_at: z.string().nullable(),
    is_deleted: z.boolean(),
  })
  .meta({ id: "VariantSubtitleFile" });
export type VariantSubtitleFileEntity = z.infer<
  typeof VariantSubtitleFileEntitySchema
>;

// ─── Variant Detail View (variant + segments + audio + subtitles) ───────────────

export const VariantDetailViewSchema = BookVariantEntitySchema.extend({
  transcription_segments: z.array(TranscriptionSegmentEntitySchema),
  audio_files: z.array(SegmentAudioFileEntitySchema),
  subtitle_files: z.array(VariantSubtitleFileEntitySchema),
}).meta({ id: "VariantDetailView" });
export type VariantDetailView = z.infer<typeof VariantDetailViewSchema>;

// ─── Transcription Segment View (matches backend TranscriptionSegmentView) ──────

export const TranscriptionSegmentViewSchema = z
  .object({
    id: z.string().uuid(),
    variant_id: z.string().uuid(),
    page_number: z.number().int(),
    order_index: z.number().int(),
    type: z.string(),
    content: z.string(),
    created_at: z.string().nullable(),
  })
  .meta({ id: "TranscriptionSegmentView" });
export type TranscriptionSegmentView = z.infer<
  typeof TranscriptionSegmentViewSchema
>;

export const TranscriptionPageViewSchema = z
  .object({
    page_number: z.number().int(),
    text: z.string(),
  })
  .meta({ id: "TranscriptionPageView" });
export type TranscriptionPageView = z.infer<typeof TranscriptionPageViewSchema>;

export const VariantTranscriptionResponseSchema = z
  .object({
    total_pages: z.number().int(),
    total_segments: z.number().int(),
    pages: z.array(TranscriptionPageViewSchema),
  })
  .meta({ id: "VariantTranscriptionResponse" });
export type VariantTranscriptionResponse = z.infer<
  typeof VariantTranscriptionResponseSchema
>;

export const VariantStaticAudioPreviewItemSchema = z
  .object({
    segment_id: z.string().uuid(),
    page_number: z.number().int(),
    order_index: z.number().int(),
    content: z.string(),
    male_audio_url: z.string().nullable(),
    female_audio_url: z.string().nullable(),
  })
  .meta({ id: "VariantStaticAudioPreviewItem" });
export type VariantStaticAudioPreviewItem = z.infer<
  typeof VariantStaticAudioPreviewItemSchema
>;

export const VariantSubtitleDownloadItemSchema = z
  .object({
    voice: z.enum(["male", "female"]),
    srt_url: z.string(),
  })
  .meta({ id: "VariantSubtitleDownloadItem" });
export type VariantSubtitleDownloadItem = z.infer<
  typeof VariantSubtitleDownloadItemSchema
>;

export const VariantMediaAssetsResponseSchema = z
  .object({
    static_audio: z.array(VariantStaticAudioPreviewItemSchema),
    subtitles: z.array(VariantSubtitleDownloadItemSchema),
  })
  .meta({ id: "VariantMediaAssetsResponse" });
export type VariantMediaAssetsResponse = z.infer<
  typeof VariantMediaAssetsResponseSchema
>;

// ─── Presigned Upload Responses ─────────────────────────────────────────────────

export const PagePresignedUploadResponseSchema = z
  .object({
    page_number: z.number().int(),
    file_name: z.string(),
    key: z.string(),
    storage_ref: z.string(),
    upload_url: z.string(),
    expires_in_seconds: z.number().int(),
  })
  .meta({ id: "PagePresignedUploadResponse" });
export type PagePresignedUploadResponse = z.infer<
  typeof PagePresignedUploadResponseSchema
>;

export const CoverPresignedUploadResponseSchema = z
  .object({
    which: z.enum(["front", "back"]),
    file_name: z.string(),
    key: z.string(),
    storage_ref: z.string(),
    upload_url: z.string(),
    expires_in_seconds: z.number().int(),
  })
  .meta({ id: "CoverPresignedUploadResponse" });
export type CoverPresignedUploadResponse = z.infer<
  typeof CoverPresignedUploadResponseSchema
>;

// ─── Upload Pages Response ──────────────────────────────────────────────────────

export const UploadPagesResponseSchema = z
  .object({
    total_pages: z.number().int(),
    pages: z.array(BookPageViewSchema),
  })
  .meta({ id: "UploadPagesResponse" });
export type UploadPagesResponse = z.infer<typeof UploadPagesResponseSchema>;

// ─── Shared Display Constants ───────────────────────────────────────────────────

export const GENDER_OPTIONS = ["male", "female", "neutral"] as const;
export type GenderOption = (typeof GENDER_OPTIONS)[number];

export const GENDER_LABELS: Record<string, string> = {
  male: "Male",
  female: "Female",
  neutral: "Neutral",
};

export const AGE_GROUP_OPTIONS = ["1_5", "6_10"] as const;
export type AgeGroupOption = (typeof AGE_GROUP_OPTIONS)[number];

export const AGE_GROUP_LABELS: Record<string, string> = {
  "1_5": "1-5 years",
  "6_10": "6-10 years",
};

export const VOICE_OPTIONS = ["male", "female"] as const;
export type VoiceOption = (typeof VOICE_OPTIONS)[number];
