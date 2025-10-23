import { defineConfig } from 'bmad-method'

export default defineConfig({
  projectName: 'ChonCance',
  version: '1.0.0',
  routes: {
    base: '/api',
    endpoints: []
  },
  models: {
    directory: './models',
    generate: true
  },
  auth: {
    enabled: true,
    provider: 'next-auth'
  },
  database: {
    provider: 'postgresql',
    orm: 'prisma'
  }
})