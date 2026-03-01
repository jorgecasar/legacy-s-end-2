import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  esbuild: {
    target: "es2021",
    include: /\.[jt]sx?$/,
    exclude: [],
    tsconfigRaw: {
      compilerOptions: {
        experimentalDecorators: false,
        useDefineForClassFields: true,
      },
    },
  },
  optimizeDeps: {
    esbuildOptions: {
      target: "es2021",
    },
  },
  build: {
    target: "es2021",
  },
  server: {
    fs: {
      allow: [".."],
    },
  },
});
