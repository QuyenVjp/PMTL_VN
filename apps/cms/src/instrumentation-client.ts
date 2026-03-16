import * as Sentry from "@sentry/nextjs";

import { getCmsClientSentryOptions } from "@/services/observability/sentry.service";

Sentry.init(getCmsClientSentryOptions());

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
