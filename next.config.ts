import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const nextConfig: NextConfig = {
  agentRules: false,
};

export default nextConfig;

if (process.env.DATA_SOURCE === "cloudflare") {
  initOpenNextCloudflareForDev();
}
