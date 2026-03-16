import * as Sentry from "@sentry/nextjs";

import { getWebServerSentryOptions } from "@/lib/observability/sentry";

Sentry.init(getWebServerSentryOptions());
