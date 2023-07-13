import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [react()],
	base: "/system-panda-static",
	build: {
		outDir: "../../build/server/static",
	},
});
