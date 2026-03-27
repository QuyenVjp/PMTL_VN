import {
  PipeTransform,
  Injectable,
  BadRequestException,
} from "@nestjs/common";
import { ZodSchema, z } from "zod";

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private schema?: ZodSchema) {}

  transform(value: unknown) {
    if (!this.schema) {
      return value;
    }

    const result = this.schema.safeParse(value);
    if (result.success) {
      return result.data;
    }

    // ZOD_4_RUNTIME_POLICY: use z.treeifyError() for structured error tree
    const tree = z.treeifyError(result.error);

    throw new BadRequestException({
      code: "VALIDATION_ERROR",
      message: "Dữ liệu không hợp lệ",
      detail: tree,
    });
  }
}

export function ZodValidate(schema: ZodSchema): ZodValidationPipe {
  return new ZodValidationPipe(schema);
}
