import { z } from "zod";

export const UserRole = z.enum(["admin", "user"]);
export type UserRole = z.infer<typeof UserRole>;

export const UserSchema = z
  .object({
    id: z.string().uuid(),
    name: z.string().min(1, "Name is required").max(100),
    email: z.string().email("Invalid email address"),
    age: z.number().int().min(0).max(150),
    role: UserRole,
    createdAt: z.iso.datetime(),
  })
  .meta({ id: "User" });

export type User = z.infer<typeof UserSchema>;

export const CreateUserSchema = UserSchema.omit({
  id: true,
  createdAt: true,
}).meta({ id: "CreateUser" });

export type CreateUser = z.infer<typeof CreateUserSchema>;

export const UpdateUserSchema = CreateUserSchema.partial().meta({
  id: "UpdateUser",
});

export type UpdateUser = z.infer<typeof UpdateUserSchema>;

export const UserResponseSchema = UserSchema.meta({ id: "UserResponse" });
export type UserResponse = z.infer<typeof UserResponseSchema>;


export const listUsersQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1))
    .refine((val) => Number.isInteger(val) && val > 0, {
      message: "page must be a positive integer",
    }),

  page_size: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 10))
    .refine((val) => Number.isInteger(val) && val > 0, {
      message: "page_size must be a positive integer",
    }),

  search: z.string().optional(),
});

export type ListUsersQueryDto = z.infer<typeof listUsersQuerySchema>;
