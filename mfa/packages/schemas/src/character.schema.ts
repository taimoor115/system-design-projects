import { z } from "zod";

// ─── Enum value arrays — importable on both frontend and backend ──────────────
export const GENDER_VALUES = ["male", "female", "other"] as const;
export const AGE_RANGE_VALUES = ["1_5", "6_10"] as const;
export const BIRTHDAY_MONTH_VALUES = [
  "january", "february", "march", "april", "may", "june",
  "july", "august", "september", "october", "november", "december",
] as const;
export const RELATIONSHIP_VALUES = [
  "parent", "grandparent", "aunt_uncle", "family_friend", "other",
] as const;
export const NARRATOR_GENDER_VALUES = ["male", "female"] as const;

// Valid Google TTS language codes with neural voices
export const NARRATOR_VOICE_LANGUAGE_VALUES = [
  "en-US",
  "en-GB",
  "es-ES",
  "es-MX",
  "fr-FR",
  "de-DE",
  "it-IT",
  "ja-JP",
  "pt-BR",
  "pt-PT",
] as const;

// ─── Input validation schema (used by NestJS DTO + frontend form) ─────────────
export const CreateCharacterSchema = z
  .object({
    user_id: z.string().uuid(),
    child_name: z.string().min(1).max(255),
    pronunciation: z.string().min(1).max(255).optional(),
    gender: z.enum(GENDER_VALUES),
    age_range: z.enum(AGE_RANGE_VALUES),
    birthday_month: z.enum(BIRTHDAY_MONTH_VALUES).optional(),
    language: z.string().min(2).max(10),
    relationship: z.enum(RELATIONSHIP_VALUES),
    narrator_voice_language: z.enum(NARRATOR_VOICE_LANGUAGE_VALUES).optional(),
    narrator_gender: z.enum(NARRATOR_GENDER_VALUES),
    child_dialogue_voice: z.enum(GENDER_VALUES).optional(),
    memo_text: z.string().min(1).max(1000).optional().or(z.literal("").transform(() => undefined)),
    memo_audio_url: z.string().optional(),
    photo_1_url: z.string().min(1),
    photo_2_url: z.string().optional(),
  })
  .meta({ id: "CreateCharacter" });

export type CreateCharacter = z.infer<typeof CreateCharacterSchema>;
