import * as Sentry from "@sentry/nextjs";

import { getWebEdgeSentryOptions } from "@/lib/observability/sentry";

Sentry.init(getWebEdgeSentryOptions());
