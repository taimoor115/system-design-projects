import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const ConfirmMfaSchema = z.object({
  code: z.string().regex(/^\d{6}$/, 'Code must be exactly 6 digits'),
});

export class ConfirmMfaDto extends createZodDto(ConfirmMfaSchema) {}
