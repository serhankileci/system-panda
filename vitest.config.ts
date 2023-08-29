import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		environment: "node",
		include: ["spec/**/*.spec.ts"],
		coverage: {
			provider: "istanbul",
			reporter: ["text"],
		},
		passWithNoTests: true,
	},
});
