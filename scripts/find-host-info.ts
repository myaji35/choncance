import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function findHostInfo() {
  try {
    // Find property with name containing "시골할매"
    const property = await prisma.property.findFirst({
      where: {
        name: {
          contains: '시골할매',
        },
      },
      include: {
        host: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!property) {
      console.log('❌ 시골할매 민박을 찾을 수 없습니다.');
      return;
    }

    console.log('\n✅ 숙소 정보 찾음:');
    console.log('=====================================');
    console.log(`숙소 이름: ${property.name}`);
    console.log(`숙소 ID: ${property.id}`);
    console.log(`호스트 이름: ${property.host.user.name}`);
    console.log(`호스트 이메일: ${property.host.user.email}`);
    console.log(`호스트 ID: ${property.host.id}`);
    console.log(`User ID: ${property.host.userId}`);
    console.log('=====================================\n');

    console.log('📝 숙소 수정 방법:');
    console.log('1. Clerk에 로그인');
    console.log(`   이메일: ${property.host.user.email}`);
    console.log('   (Clerk 대시보드에서 비밀번호 확인 또는 재설정)');
    console.log('');
    console.log('2. 호스트 대시보드 접속');
    console.log('   URL: http://localhost:3010/host/dashboard');
    console.log('');
    console.log('3. 숙소 편집 페이지 직접 접속');
    console.log(`   URL: http://localhost:3010/host/properties/${property.id}/edit`);
    console.log('');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

findHostInfo();
