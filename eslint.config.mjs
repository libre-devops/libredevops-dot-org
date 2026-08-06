import next from 'eslint-config-next'

// eslint-config-next already ignores .next, out, build and next-env.d.ts.
const config = [
  ...next,
  {
    ignores: ['patches/**', 'public/**'],
  },
]

export default config
