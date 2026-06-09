import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const ValidateMfaSchema = z.object({
  code: z.string().min(1).max(10),
});

export class ValidateMfaDto extends createZodDto(ValidateMfaSchema) {}
