import { SetMetadata } from "@nestjs/common";
import { SKIP_CSRF_KEY } from "./csrf.guard.js";

export const SkipCsrf = () => SetMetadata(SKIP_CSRF_KEY, true);
