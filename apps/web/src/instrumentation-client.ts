import * as Sentry from "@sentry/nextjs";

import { getWebClientSentryOptions } from "@/lib/observability/sentry";

Sentry.init(getWebClientSentryOptions());

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
