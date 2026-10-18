import { locales } from "./i18n/config.js";

const nextConfig = {
	env: {
		NEXT_PUBLIC_LOCALES: JSON.stringify(locales),
	},
};

export default nextConfig;
