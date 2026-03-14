import { withPayload } from "@payloadcms/next/withPayload";

const nextConfig = {
  experimental: {
    typedRoutes: true,
  },
};

export default withPayload(nextConfig);
