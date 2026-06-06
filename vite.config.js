import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
import path from "path";

export default defineConfig({
  plugins: [react(), svgr()],
  define: {
    "process.env": "import.meta.env",
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            { name: "vendor-react", test: /node_modules\/(react|react-dom)\// },
            { name: "vendor-framer", test: /node_modules\/framer-motion\// },
          ],
        },
      },
    },
  },
});
