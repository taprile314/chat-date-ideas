import { withWorkflow } from 'workflow/next';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  serverExternalPackages: ['googleapis'],
};

export default withWorkflow(nextConfig);
