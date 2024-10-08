import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        proxy: {
            "/": {
                target: "https://postack.onrender.com",
                changeOrigin: true,
            },
        },
    },
});
