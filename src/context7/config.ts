import { defineContext7Config } from '@context7/core'

export default defineContext7Config({
  project: {
    name: 'ProTask',
    description: '개인 또는 소규모 팀이 프로젝트와 작업을 시각적으로 관리할 수 있는 미니멀하고 빠른 웹 대시보드',
    version: '1.0.0'
  },
  contexts: {
    auth: {
      enabled: true,
      providers: ['next-auth']
    },
    api: {
      enabled: true,
      basePath: '/api'
    },
    database: {
      enabled: true,
      provider: 'postgresql',
      orm: 'prisma'
    },
    ui: {
      enabled: true,
      framework: 'next',
      components: ['shadcn/ui']
    }
  },
  features: [
    'tasks',
    'projects'
  ],
  security: {
    csrf: true,
    rateLimit: true,
    cors: {
      enabled: true,
      origins: ['http://localhost:3000']
    }
  },
  logging: {
    enabled: true,
    level: 'info'
  }
})