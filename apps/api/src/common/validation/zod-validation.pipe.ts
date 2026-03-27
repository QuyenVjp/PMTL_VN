import {
  PipeTransform,
  Injectable,
  BadRequestException,
} from "@nestjs/common";
import { ZodSchema, ZodError } from "zod";
import { mapZodErrorToValidationErrors, formatValidationErrors } from "./validation-error.mapper.js";

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private schema?: ZodSchema) {}

  transform(value: unknown) {
    // If no schema provided to constructor, just pass through
    if (!this.schema) {
      return value;
    }

    try {
      return this.schema.parse(value);
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = mapZodErrorToValidationErrors(error);
        const formatted = formatValidationErrors(errors);

        throw new BadRequestException({
          code: "VALIDATION_ERROR",
          message: "Dữ liệu không hợp lệ",
          errors: formatted,
        });
      }
      throw error;
    }
  }
}

export function ZodValidate(schema: ZodSchema): ZodValidationPipe {
  return new ZodValidationPipe(schema);
}
