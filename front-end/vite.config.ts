import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// Classic Vite config — React + Tailwind CSS v4 (via its Vite plugin). The
// "@/*" alias declared in tsconfig.json is resolved natively by Vite.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: { tsconfigPaths: true },
});
