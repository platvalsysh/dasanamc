import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { createFilter, defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import path from "path";
import ViteRestart from "vite-plugin-restart";

const isVercel = process.env.VERCEL === "1";

function removeUseClient() {
  const filter = createFilter(/.*\.(js|ts|jsx|tsx)$/);

  return {
    name: "remove-use-client",

    transform(code: string, id: string) {
      if (!filter(id)) {
        return null;
      }

      const newCode = code.replace(/['"]use client['"];\s*/g, "");

      return { code: newCode, map: null };
    },
  };
}

export default defineConfig(({ mode, isSsrBuild }) => ({
  server: {
    host: "0.0.0.0",
    allowedHosts: [
      '059f-58-123-196-174.ngrok-free.app'
    ],
    port: process.env.PORT ? parseInt(process.env.PORT) : 5175,
    fs: {
      allow: [
        path.resolve(__dirname),
        path.resolve(__dirname, "../../packages"),
      ],
    },
  },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: isSsrBuild && isVercel ? { input: "./server/vercel.ts" } : undefined,
  },
  esbuild: {
    drop: mode === 'production' ? ['console', 'debugger'] : [],
  },
  plugins: [
    tailwindcss(),
    reactRouter(),
    tsconfigPaths(),
    removeUseClient(),
    ViteRestart({
      restart: [
        "../../packages/**/*.server.ts",
        "../../packages/**/.server/**/*",
        "../../packages/**/routes.ts",
        "../../packages/**/routes.server.ts",
        "../../packages/**/module.server.ts",
      ],
    }),
  ],
  envDir: "../../",
  ssr: {
    noExternal: [
      /^@repo\/.*/,
      /^@radix-ui\/.*/,
      "radix-ui",
      "lucide-react",
      "clsx",
      "tailwind-merge",
    ],
    external: [
      "react",
      "react-dom",
      "react-router",
      "sharp",
      "prisma",
      "@prisma/adapter-pg",
      "@prisma/client",
      "solapi",
      "nodemailer",
      "html-to-text",
    ],
  },
  resolve: {
    dedupe: ["react", "react-dom", "react-router"],
    alias: {
      "~": path.resolve(__dirname, "./app"),
    },
  },
}));
