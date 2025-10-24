const config = {
  pathsIgnored: ['test'],
  rulesExcluded: ['js/log-injection'],
  languages_config: [
    {
      language: 'java-kotlin',
      build_mode: 'manual',
      build_command: './gradlew :coordinator:app:build',
      version: '21',
      distribution: 'temurin',
    },
    {
      language: 'cpp',
      ignore: true,
    },
  ],
  queries: [
    {
      name: 'queries for linea',
      uses: './query-suites/linea-monorepo.qls',
    },
    {
      name: 'Security Code Scanner Custom Queries',
      uses: './custom-queries/query-suites/custom-queries.qls',
    },
  ],
};

export default config;
