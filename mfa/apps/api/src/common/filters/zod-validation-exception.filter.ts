import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import type { Response } from 'express';
import { ZodValidationException } from 'nestjs-zod';
import { ZodError } from 'zod';

@Catch(ZodValidationException)
export class ZodValidationExceptionFilter implements ExceptionFilter {
  private static formatField(path: PropertyKey[]): string {
    if (!path.length) return 'Field';
    const raw = String(path[path.length - 1] ?? 'field').replace(/_/g, ' ');
    return raw.charAt(0).toUpperCase() + raw.slice(1);
  }

  private static toMessage(issue: {
    code?: string;
    path?: PropertyKey[];
    message?: string;
    input?: unknown;
    expected?: string;
  }): string {
    const path = Array.isArray(issue.path)
      ? issue.path.filter(
          (value): value is string | number =>
            typeof value === 'string' || typeof value === 'number',
        )
      : [];
    const field = this.formatField(path);

    if (
      issue.code === 'invalid_type' &&
      issue.input === undefined &&
      path.length
    ) {
      return `${field} is required`;
    }

    if (
      issue.code === 'invalid_type' &&
      issue.expected === 'string' &&
      path.length
    ) {
      return `${field} must be a string`;
    }

    return issue.message ?? 'Validation failed';
  }

  catch(exception: ZodValidationException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const zodError = exception.getZodError();
    const messages =
      zodError instanceof ZodError
        ? [
            ...new Set(
              zodError.issues.map((issue) =>
                ZodValidationExceptionFilter.toMessage(issue),
              ),
            ),
          ]
        : ['Validation failed'];

    response.status(HttpStatus.BAD_REQUEST).json({
      statusCode: HttpStatus.BAD_REQUEST,
      message: messages[0] ?? 'Validation failed',
      errors: messages,
    });
  }
}
