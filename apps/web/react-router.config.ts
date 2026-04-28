import type { Config } from "@react-router/dev/config";
import { vercelPreset } from "@vercel/react-router/vite";

const isVercel = process.env.VERCEL === "1";

export default {
  // Config options...
  // Server-side render by default, to enable SPA mode set this to `false`
  ssr: true,
  presets: isVercel ? [vercelPreset()] : [],
  future: {
    v8_middleware: true,
    v8_viteEnvironmentApi: !isVercel,
  },
} satisfies Config;
