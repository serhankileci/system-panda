import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import million from "million/compiler";
// import { fileURLToPath } from "node:url";

// https://vitejs.dev/config/
export default defineConfig({
	publicDir: process.env.NODE_ENV === "development" ? "public" : false, // Atm, we're excluding public directory that has mockServiceWorker. If we're including any other file public dir, then we may need to re-consider setting publicDir to false.
	plugins: [million.vite(), react()],
	base: "/system-panda-static",
	build: {
		target: "esnext",
		outDir: "../../build/server/static",
		// rollupOptions: {
		// 	external: [fileURLToPath(new URL("public/mockServiceWorker.js", import.meta.url))],
		// },
	},
});
