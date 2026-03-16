import * as Sentry from "@sentry/nextjs";

import { getCmsServerSentryOptions } from "@/services/observability/sentry.service";

Sentry.init(getCmsServerSentryOptions());
