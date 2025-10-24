// Shared Prettier configuration for all packages
const config = {
  quoteProps: 'as-needed',
  singleQuote: true,
  tabWidth: 2,
  trailingComma: 'all',
  plugins: ['prettier-plugin-packagejson', 'prettier-plugin-sh'],
};

export default config;
