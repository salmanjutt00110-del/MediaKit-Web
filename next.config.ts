import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    '/api/**': ['./bin/**/*'],
    '/api/**/*': ['./bin/**/*'],
    '/api/download': ['./bin/**/*'],
    '/api/download/stream': ['./bin/**/*'],
    '/api/download/file': ['./bin/**/*'],
    '/api/download/serve': ['./bin/**/*'],
    '/api/media-info': ['./bin/**/*'],
  },
};

export default nextConfig;
