import nextra from 'nextra';

const withNextra = nextra({
  search: true,
  mdxOptions: {
    rehypePrettyCodeOptions: {
      theme: 'github-dark'
    }
  }
});

export default withNextra({
  output: 'export',
  trailingSlash: true,
  images: {
    // Static export cannot run the optimizer, so images pass through as-is.
    unoptimized: true,
    remotePatterns: [
      // devicon logos used by the cheatsheet grid
      { protocol: 'https', hostname: 'cdn.jsdelivr.net', pathname: '/gh/devicons/devicon@latest/**' }
    ]
  },
  reactStrictMode: true,
  poweredByHeader: false
});