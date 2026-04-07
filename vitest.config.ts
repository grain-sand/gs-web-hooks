import {defineConfig} from "vitest/config"

export default defineConfig({
	test: {
		browser: {
			enabled: true,
			instances: [
				{
					browser: "chrome",
				} as any
			]
		},
		include: ['./test/*.ts'],
	},
	publicDir:'test/files'
})
