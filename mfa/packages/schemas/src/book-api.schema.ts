import { z } from "zod";
import {
  AiJobEntitySchema,
  BookEditionEntitySchema,
  BookEntitySchema,
  BookVariantEntitySchema,
} from "./entities.schema";
import {
  BookDetailViewSchema,
  BookPageViewSchema,
  BookListItemSchema,
  BookListResponseSchema,
  CoverPresignedUploadResponseSchema,
  EditionListResponseSchema,
  EditionPagesResponseSchema,
  PagePresignedUploadResponseSchema,
  PublishEditionResponseSchema,
  PublishVariantResponseSchema,
  PublishedBooksResponseSchema,
  VariantTranscriptionResponseSchema,
  VariantMediaAssetsResponseSchema,
  TranscriptionSegmentViewSchema,
  UploadPagesResponseSchema,
  VariantListResponseSchema,
  VariantWithMetaSchema,
} from "./book-views.schema";

export const BooksFindAllDataSchema = z
  .object({
    items: z.array(BookListItemSchema),
    total: z.number().int(),
  })
  .meta({ id: "BooksFindAllData" });
export type BooksFindAllData = z.infer<typeof BooksFindAllDataSchema>;

export const EditionPageUploadUrlsResponseSchema = z
  .object({
    uploads: z.array(PagePresignedUploadResponseSchema),
  })
  .meta({ id: "EditionPageUploadUrlsResponse" });
export type EditionPageUploadUrlsResponse = z.infer<
  typeof EditionPageUploadUrlsResponseSchema
>;

export const EditionCoverUploadUrlsResponseSchema = z
  .object({
    uploads: z.array(CoverPresignedUploadResponseSchema),
  })
  .meta({ id: "EditionCoverUploadUrlsResponse" });
export type EditionCoverUploadUrlsResponse = z.infer<
  typeof EditionCoverUploadUrlsResponseSchema
>;

export const UpsertTranscriptionSegmentsResponseSchema = z
  .object({
    total_pages: z.number().int(),
    total_segments: z.number().int(),
    segments: z.array(TranscriptionSegmentViewSchema),
  })
  .meta({ id: "UpsertTranscriptionSegmentsResponse" });
export type UpsertTranscriptionSegmentsResponse = z.infer<
  typeof UpsertTranscriptionSegmentsResponseSchema
>;

export const GenerateStaticAudioItemSchema = z
  .object({
    segment_id: z.string().uuid(),
    page_number: z.number().int(),
    order_index: z.number().int(),
    audio_url: z.string(),
    cache_hit: z.boolean(),
  })
  .meta({ id: "GenerateStaticAudioItem" });
export type GenerateStaticAudioItem = z.infer<typeof GenerateStaticAudioItemSchema>;

export const GenerateStaticAudioResponseSchema = z
  .object({
    generated_count: z.number().int(),
    reused_count: z.number().int(),
    skipped_dynamic_count: z.number().int(),
    language: z.string(),
    age_group: z.string(),
    voice: z.enum(["male", "female"]),
    items: z.array(GenerateStaticAudioItemSchema),
  })
  .meta({ id: "GenerateStaticAudioResponse" });
export type GenerateStaticAudioResponse = z.infer<
  typeof GenerateStaticAudioResponseSchema
>;

export const GenerateSubtitleFileResponseSchema = z
  .object({
    variant_id: z.string().uuid(),
    voice: z.enum(["male", "female"]),
    srt_url: z.string(),
    dynamic_cue_index: z.number().int().nullable(),
    total_cues: z.number().int(),
  })
  .meta({ id: "GenerateSubtitleFileResponse" });
export type GenerateSubtitleFileResponse = z.infer<
  typeof GenerateSubtitleFileResponseSchema
>;

export type ApiResponseEnvelope<T> = {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
};

export type GetBooksApiResponse = ApiResponseEnvelope<BooksFindAllData>;
export type GetAllBooksApiResponse = ApiResponseEnvelope<
  z.infer<typeof BookListResponseSchema>
>;
export type GetBookByIdApiResponse = ApiResponseEnvelope<
  z.infer<typeof BookDetailViewSchema>
>;
export type UpdateBookApiResponse = ApiResponseEnvelope<
  z.infer<typeof BookEntitySchema>
>;
export type CreateAdminBookApiResponse = ApiResponseEnvelope<
  z.infer<typeof BookEntitySchema>
>;
export type GenerateEditionApiResponse = ApiResponseEnvelope<
  z.infer<typeof BookEditionEntitySchema>
>;
export type GetBookEditionsApiResponse = ApiResponseEnvelope<
  z.infer<typeof EditionListResponseSchema>
>;
export type GetEditionPagesApiResponse = ApiResponseEnvelope<
  z.infer<typeof EditionPagesResponseSchema>
>;
export type PublishEditionApiResponse = ApiResponseEnvelope<
  z.infer<typeof PublishEditionResponseSchema>
>;
export type UploadEditionPagesApiResponse = ApiResponseEnvelope<
  z.infer<typeof UploadPagesResponseSchema>
>;
export type UpdateEditionPageApiResponse = ApiResponseEnvelope<
  z.infer<typeof BookPageViewSchema>
>;
export type DeleteEditionPageApiResponse = ApiResponseEnvelope<
  z.infer<typeof BookPageViewSchema>
>;
export type CreateEditionPageUploadUrlsApiResponse = ApiResponseEnvelope<
  EditionPageUploadUrlsResponse
>;
export type CreateEditionCoverUploadUrlsApiResponse = ApiResponseEnvelope<
  EditionCoverUploadUrlsResponse
>;
export type UpdateEditionApiResponse = ApiResponseEnvelope<
  z.infer<typeof BookEditionEntitySchema>
>;
export type DeleteEditionApiResponse = ApiResponseEnvelope<
  z.infer<typeof BookEditionEntitySchema>
>;
export type CreateVariantApiResponse = ApiResponseEnvelope<
  z.infer<typeof BookVariantEntitySchema>
>;
export type GetVariantsApiResponse = ApiResponseEnvelope<
  z.infer<typeof VariantListResponseSchema>
>;
export type GetVariantByIdApiResponse = ApiResponseEnvelope<
  z.infer<typeof VariantWithMetaSchema>
>;
export type PublishVariantApiResponse = ApiResponseEnvelope<
  z.infer<typeof PublishVariantResponseSchema>
>;
export type GetPublishedBooksApiResponse = ApiResponseEnvelope<
  z.infer<typeof PublishedBooksResponseSchema>
>;
export type UpdateVariantApiResponse = ApiResponseEnvelope<
  z.infer<typeof BookVariantEntitySchema>
>;
export type DeleteVariantApiResponse = ApiResponseEnvelope<
  z.infer<typeof BookVariantEntitySchema>
>;
export type DeleteVariantByIdApiResponse = ApiResponseEnvelope<
  z.infer<typeof BookVariantEntitySchema>
>;
export type UpsertTranscriptionApiResponse = ApiResponseEnvelope<
  UpsertTranscriptionSegmentsResponse
>;
export type GetVariantTranscriptionApiResponse = ApiResponseEnvelope<
  z.infer<typeof VariantTranscriptionResponseSchema>
>;
export type GetVariantMediaAssetsApiResponse = ApiResponseEnvelope<
  z.infer<typeof VariantMediaAssetsResponseSchema>
>;
export type GenerateStaticAudioApiResponse = ApiResponseEnvelope<
  GenerateStaticAudioResponse
>;
export type GenerateSubtitleFileApiResponse = ApiResponseEnvelope<
  GenerateSubtitleFileResponse
>;
export type GenerateBookJobApiResponse = ApiResponseEnvelope<
  z.infer<typeof AiJobEntitySchema>
>;
export type SoftDeleteBookApiResponse = ApiResponseEnvelope<
  z.infer<typeof BookEntitySchema>
>;
