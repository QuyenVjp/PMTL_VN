import {
  PipeTransform,
  Injectable,
  BadRequestException,
  Optional,
} from "@nestjs/common";
import { ZodError, z } from "zod";

type SchemaLike<TOutput = unknown> = {
  safeParse: (value: unknown) =>
    | { success: true; data: TOutput }
    | { success: false; error: unknown };
};

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(@Optional() private readonly schema?: SchemaLike) {}

  transform(value: unknown) {
    if (!this.schema) {
      return value;
    }

    const result = this.schema.safeParse(value);
    if (result.success) {
      return result.data;
    }

    // ZOD_4_RUNTIME_POLICY: use z.treeifyError() for structured error tree
    const detail =
      result.error instanceof ZodError
        ? z.treeifyError(result.error)
        : { formErrors: ["Validation failed"], details: result.error };

    throw new BadRequestException({
      code: "VALIDATION_ERROR",
      message: "Dữ liệu không hợp lệ",
      detail,
    });
  }
}

export function ZodValidate(schema: SchemaLike): ZodValidationPipe {
  return new ZodValidationPipe(schema);
}
