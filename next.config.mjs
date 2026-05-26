import nextra from 'nextra';

const withNextra = nextra({
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
    unoptimized: true
  },
  reactStrictMode: true,
  poweredByHeader: false
});