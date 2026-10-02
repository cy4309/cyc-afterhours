import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const nextConfig: NextConfig = {
  agentRules: false,
  transpilePackages: ["three", "@react-three/fiber", "@react-three/drei", "three-bvh-csg"],
  async headers() {
    const gzip = { key: "Content-Encoding", value: "gzip" };
    return [
      {
        source: "/bouldering/BoulderingWeb/Build/BoulderingWeb.wasm.unityweb",
        headers: [gzip, { key: "Content-Type", value: "application/wasm" }],
      },
      {
        source: "/bouldering/BoulderingWeb/Build/BoulderingWeb.data.unityweb",
        headers: [gzip, { key: "Content-Type", value: "application/octet-stream" }],
      },
      {
        source: "/bouldering/BoulderingWeb/Build/BoulderingWeb.framework.js.unityweb",
        headers: [
          gzip,
          { key: "Content-Type", value: "application/javascript; charset=utf-8" },
        ],
      },
    ];
  },
};

export default nextConfig;

if (process.env.DATA_SOURCE === "cloudflare") {
  initOpenNextCloudflareForDev();
}
