import { createClient } from '@supabase/supabase-js'
import { prisma } from '@/lib/prisma'

// Supabase Admin Client 생성 (Service Role Key 필요)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, // Service role key가 없으면 anon key 사용
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

async function setupAuth() {
  console.log('🔐 Setting up Supabase Auth...')

  try {
    // 테스트 사용자 생성
    const testUsers = [
      {
        email: 'admin@vintee.com',
        password: 'admin123!',
        name: '관리자',
        role: 'ADMIN'
      },
      {
        email: 'user@vintee.com',
        password: 'user123!',
        name: '일반사용자',
        role: 'USER'
      },
      {
        email: 'host@vintee.com',
        password: 'host123!',
        name: '호스트',
        role: 'HOST'
      }
    ]

    for (const userData of testUsers) {
      // Supabase에 사용자 생성
      const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        email_confirm: true, // 이메일 확인 자동 완료
        user_metadata: {
          name: userData.name
        }
      })

      if (authError) {
        // 이미 존재하는 경우 스킵
        if (authError.message.includes('already been registered')) {
          console.log(`⚠️ User ${userData.email} already exists, skipping...`)

          // 기존 사용자 정보 가져오기
          const { data: { users } } = await supabaseAdmin.auth.admin.listUsers()
          const existingUser = users.find(u => u.email === userData.email)

          if (existingUser) {
            // Prisma DB에 사용자 정보 업데이트/생성
            await prisma.user.upsert({
              where: { email: userData.email },
              update: {
                name: userData.name,
                role: userData.role as any
              },
              create: {
                id: existingUser.id,
                email: userData.email,
                name: userData.name,
                role: userData.role as any,
                emailVerified: new Date()
              }
            })
          }
        } else {
          console.error(`❌ Error creating ${userData.email}:`, authError.message)
        }
        continue
      }

      if (authUser && authUser.user) {
        // Prisma DB에 사용자 정보 저장
        await prisma.user.create({
          data: {
            id: authUser.user.id,
            email: userData.email,
            name: userData.name,
            role: userData.role as any,
            emailVerified: new Date()
          }
        })

        console.log(`✅ Created user: ${userData.email} (${userData.role})`)
      }
    }

    console.log('\n📝 Test Accounts:')
    console.log('================')
    console.log('Admin: admin@vintee.com / admin123!')
    console.log('User: user@vintee.com / user123!')
    console.log('Host: host@vintee.com / host123!')
    console.log('================\n')

    // 호스트 프로필 생성
    const hostUser = await prisma.user.findUnique({
      where: { email: 'host@vintee.com' }
    })

    if (hostUser && !await prisma.hostProfile.findUnique({ where: { userId: hostUser.id } })) {
      await prisma.hostProfile.create({
        data: {
          userId: hostUser.id,
          businessNumber: '123-45-67890',
          contact: '010-1234-5678',
          status: 'APPROVED'
        }
      })
      console.log('✅ Created host profile for host@vintee.com')
    }

    console.log('\n🎉 Supabase Auth setup completed!')

  } catch (error) {
    console.error('❌ Setup failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

setupAuth()