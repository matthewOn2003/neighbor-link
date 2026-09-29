import { locales } from "./locales.config.js";

const nextConfig = {
	env: {
		NEXT_PUBLIC_LOCALES: JSON.stringify(locales),
	},
};

export default nextConfig;
