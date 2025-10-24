const config = {
  pathsIgnored: ['test'],
  rulesExcluded: ['js/log-injection'],
  queries: [
    {
      name: 'Security-extended queries for JavaScript',
      uses: './query-suites/base.qls',
    },
    {
      name: 'Security Code Scanner Custom Queries',
      uses: './custom-queries/query-suites/custom-queries.qls',
    },
  ],
};

export default config;
