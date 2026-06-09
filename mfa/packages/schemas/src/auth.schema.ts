import { z } from "zod";

const ASCII_PRINTABLE_PASSWORD_REGEX = /^[\x20-\x7E]+$/;
const ASCII_PASSWORD_MESSAGE =
  "Password can only contain standard ASCII characters";

const PasswordInputSchema = z
  .string("Password is required")
  .min(1, "Password is required")
  .max(255, "Password is too long")
  .regex(ASCII_PRINTABLE_PASSWORD_REGEX, ASCII_PASSWORD_MESSAGE);

const LoginPasswordSchema = PasswordInputSchema.min(
  8,
  "Password must be at least 8 characters",
)

const StrongPasswordSchema = LoginPasswordSchema.regex(
  /[a-z]/,
  "Password must include at least one lowercase letter",
)
  .regex(/[A-Z]/, "Password must include at least one uppercase letter")
  .regex(/[0-9]/, "Password must include at least one number")
  .regex(/[^A-Za-z0-9]/, "Password must include at least one special character");

export const JwtRoleSchema = z.enum(["admin", "user"]);
export type JwtRole = z.infer<typeof JwtRoleSchema>;

export const JwtPayloadSchema = z
  .object({
    sub: z.string().uuid(),
    email: z.string().email(),
    role: JwtRoleSchema,
    jti: z.string().min(1).optional(),
    iat: z.number().int().optional(),
    exp: z.number().int().optional(),
  })
  .meta({ id: "JwtPayload" });
export type JwtPayload = z.infer<typeof JwtPayloadSchema>;

export const GoogleAuthLoginBodySchema = z
  .object({
    code: z.string().trim().min(10),
    state: z
      .string()
      .trim()
      .min(20)
      .max(200)
      .regex(/^[A-Za-z0-9._~-]+$/),
  })
  .meta({ id: "GoogleAuthLoginBody" });
export type GoogleAuthLoginBody = z.infer<typeof GoogleAuthLoginBodySchema>;

export const GoogleAuthInitBodySchema = z
  .object({
    state: z
      .string()
      .trim()
      .min(20)
      .max(200)
      .regex(/^[A-Za-z0-9._~-]+$/),
  })
  .meta({ id: "GoogleAuthInitBody" });
export type GoogleAuthInitBody = z.infer<typeof GoogleAuthInitBodySchema>;

export const AdminAuthLoginBodySchema = z
  .object({
    email: z.string("Email is required").trim().email("Invalid email address"),
    password: LoginPasswordSchema,
  })
  .meta({ id: "AdminAuthLoginBody" });
export type AdminAuthLoginBody = z.infer<typeof AdminAuthLoginBodySchema>;

export const AdminSeedBodySchema = z
  .object({
    email: z.string("Email is required").trim().email("Invalid email address"),
    password: LoginPasswordSchema,
    secretKey: z.string().optional(),
  })
  .meta({ id: "AdminSeedBody" });
export type AdminSeedBody = z.infer<typeof AdminSeedBodySchema>;

export const AdminChangePasswordBodySchema = z
  .object({
    password: StrongPasswordSchema,
  })
  .meta({ id: "AdminChangePasswordBody" });
export type AdminChangePasswordBody = z.infer<
  typeof AdminChangePasswordBodySchema
>;

export const AdminChangePasswordWithVerificationBodySchema = z
  .object({
    oldPassword: PasswordInputSchema,
    newPassword: StrongPasswordSchema,
  })
  .refine((values) => values.oldPassword !== values.newPassword, {
    message: "New password must be different from old password",
    path: ["newPassword"],
  })
  .meta({ id: "AdminChangePasswordWithVerificationBody" });
export type AdminChangePasswordWithVerificationBody = z.infer<
  typeof AdminChangePasswordWithVerificationBodySchema
>;

export const AdminVerifyCurrentPasswordBodySchema = z
  .object({
    currentPassword: PasswordInputSchema,
  })
  .meta({ id: "AdminVerifyCurrentPasswordBody" });
export type AdminVerifyCurrentPasswordBody = z.infer<
  typeof AdminVerifyCurrentPasswordBodySchema
>;

export const AdminSettingsBodySchema = z
  .object({
    platformName: z
      .string("Platform name is required")
      .min(1, "Platform name is required")
      .max(255, "Platform name is too long"),
    supportEmail: z
      .string("Support email is required")
      .email("Invalid support email address"),
    maintenanceMode: z.boolean().default(false),
  })
  .meta({ id: "AdminSettingsBody" });
export type AdminSettingsBody = z.infer<typeof AdminSettingsBodySchema>;

export const AdminSettingsResponseSchema = AdminSettingsBodySchema.extend({
  id: z.string().uuid(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
}).meta({ id: "AdminSettingsResponse" });
export type AdminSettingsResponse = z.infer<typeof AdminSettingsResponseSchema>;

export const AuthTokenSchema = z
  .object({
    access_token: z.string().min(1),
    refresh_token: z.string().min(1).optional(),
  })
  .meta({ id: "AuthToken" });
export type AuthToken = z.infer<typeof AuthTokenSchema>;

export const RefreshAccessTokenBodySchema = z
  .object({
    refresh_token: z.string().trim().min(1),
  })
  .meta({ id: "RefreshAccessTokenBody" });
export type RefreshAccessTokenBody = z.infer<
  typeof RefreshAccessTokenBodySchema
>;

export const LogoutBodySchema = z
  .object({
    refresh_token: z.string().trim().min(1).optional(),
  })
  .meta({ id: "LogoutBody" });
export type LogoutBody = z.infer<typeof LogoutBodySchema>;

export const AuthTokenApiResponseSchema = z
  .object({
    success: z.literal(true),
    data: AuthTokenSchema,
    message: z.string(),
    error: z.string().optional(),
  })
  .meta({ id: "AuthTokenApiResponse" });
export type AuthTokenApiResponse = z.infer<typeof AuthTokenApiResponseSchema>;

export const CurrentUserDataSchema = z
  .object({
    id: z.string().uuid(),
    email: z.string().email().nullable(),
    role: JwtRoleSchema,
    name: z.string().nullable().optional(),
    profile_image: z.string().url().nullable().optional(),
    google_id: z.string().nullable().optional(),
    created_at: z.string().datetime().nullable().optional(),
    updated_at: z.string().datetime().nullable().optional(),
  })
  .meta({ id: "CurrentUserData" });
export type CurrentUserData = z.infer<typeof CurrentUserDataSchema>;

export const CurrentUserApiResponseSchema = z
  .object({
    success: z.literal(true),
    data: CurrentUserDataSchema,
    message: z.string(),
    error: z.string().optional(),
  })
  .meta({ id: "CurrentUserApiResponse" });
export type CurrentUserApiResponse = z.infer<
  typeof CurrentUserApiResponseSchema
>;

export interface AuthTokenResponse {
  success: true;
  data: AuthToken;
  message: string;
  error?: string;
}
