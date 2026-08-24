import nextConfig from "eslint-config-next/core-web-vitals";

const eslintConfig = [
  ...nextConfig,
  {
    rules: {
      // Several existing client components intentionally synchronize derived UI state in effects.
      "react-hooks/set-state-in-effect": "off",
    },
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      ".agents/**",
      ".playwright-cli/**",
    ],
  },
];

export default eslintConfig;
