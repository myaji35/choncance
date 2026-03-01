import { config } from 'dotenv';
import path from 'path';
config({ path: path.resolve(process.cwd(), '.env.local') });

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // 1. 태그 시드 데이터 (16개)
  console.log('📌 Seeding tags...');

  const tags = [
    // VIEW 카테고리 (4개)
    { name: '#논뷰맛집', category: 'VIEW', icon: '🌾', description: '논이 보이는 전망 좋은 숙소', color: 'green' },
    { name: '#계곡앞', category: 'VIEW', icon: '💧', description: '계곡 바로 앞 시원한 숙소', color: 'blue' },
    { name: '#바다뷰', category: 'VIEW', icon: '🌊', description: '탁 트인 바다 전망', color: 'blue' },
    { name: '#산속힐링', category: 'VIEW', icon: '⛰️', description: '산 속 깊은 곳의 평화로운 공간', color: 'green' },

    // ACTIVITY 카테고리 (4개)
    { name: '#불멍과별멍', category: 'ACTIVITY', icon: '🔥', description: '모닥불과 별 보기', color: 'orange' },
    { name: '#아궁이체험', category: 'ACTIVITY', icon: '🪵', description: '직접 불 때보는 전통 아궁이', color: 'red' },
    { name: '#농사체험', category: 'ACTIVITY', icon: '🌱', description: '직접 농작물 수확 체험', color: 'green' },
    { name: '#낚시', category: 'ACTIVITY', icon: '🎣', description: '낚시 가능한 숙소', color: 'blue' },

    // FACILITY 카테고리 (4개)
    { name: '#반려동물동반', category: 'FACILITY', icon: '🐕', description: '반려동물과 함께 머물 수 있는 숙소', color: 'yellow' },
    { name: '#전통가옥', category: 'FACILITY', icon: '🏠', description: '한옥 등 전통 건축물', color: 'brown' },
    { name: '#독채사용', category: 'FACILITY', icon: '🏡', description: '단독 건물 전체 사용', color: 'purple' },
    { name: '#바비큐가능', category: 'FACILITY', icon: '🍖', description: 'BBQ 그릴 시설 완비', color: 'red' },

    // VIBE 카테고리 (4개)
    { name: '#힐링', category: 'VIBE', icon: '🧘', description: '조용하고 평화로운 분위기', color: 'green' },
    { name: '#가족여행', category: 'VIBE', icon: '👨‍👩‍👧‍👦', description: '온 가족이 즐기기 좋은 숙소', color: 'blue' },
    { name: '#커플추천', category: 'VIBE', icon: '💑', description: '로맨틱한 분위기', color: 'pink' },
    { name: '#SNS핫플', category: 'VIBE', icon: '📸', description: '인스타그램에 올리기 좋은 숙소', color: 'purple' },
  ];

  for (const tag of tags) {
    await prisma.tag.upsert({
      where: { name: tag.name },
      update: {},
      create: tag,
    });
  }

  console.log('✅ Created 16 tags');

  // 2. 테스트용 호스트 프로필 생성
  console.log('👤 Creating test host...');

  const testUser = await prisma.user.upsert({
    where: { email: 'host@choncance.com' },
    update: {},
    create: {
      email: 'host@choncance.com',
      name: '김촌장',
      role: 'HOST',
    },
  });

  const testHost = await prisma.hostProfile.upsert({
    where: { userId: testUser.id },
    update: {},
    create: {
      userId: testUser.id,
      businessNumber: '123-45-67890',
      contact: '010-1234-5678',
      status: 'APPROVED',
    },
  });

  console.log('✅ Created test host:', testHost.id);

  // 3. 테스트용 Property 시드 데이터 (3개)
  console.log('🏡 Seeding properties...');

  const tag논뷰 = await prisma.tag.findUnique({ where: { name: '#논뷰맛집' } });
  const tag불멍 = await prisma.tag.findUnique({ where: { name: '#불멍과별멍' } });
  const tag전통가옥 = await prisma.tag.findUnique({ where: { name: '#전통가옥' } });
  const tag반려동물 = await prisma.tag.findUnique({ where: { name: '#반려동물동반' } });
  const tag힐링 = await prisma.tag.findUnique({ where: { name: '#힐링' } });
  const tag가족여행 = await prisma.tag.findUnique({ where: { name: '#가족여행' } });
  const tag계곡 = await prisma.tag.findUnique({ where: { name: '#계곡앞' } });
  const tag독채 = await prisma.tag.findUnique({ where: { name: '#독채사용' } });
  const tag바비큐 = await prisma.tag.findUnique({ where: { name: '#바비큐가능' } });

  const properties = [
    {
      name: '논뷰 한옥스테이',
      description: '시원한 논밭 전망과 함께 전통 한옥의 아름다움을 느낄 수 있는 특별한 공간입니다.',
      address: '전라북도 전주시 완산구 전주천동로 123',
      location: JSON.stringify({ lat: 35.8242, lng: 127.1480 }),
      pricePerNight: 120000,
      maxGuests: 4,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
        'https://images.unsplash.com/photo-1505691723518-36a5ac3be353?w=800',
      ]),
      thumbnailUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400',
      hostStory: '저희 가족이 3대째 지켜온 한옥입니다. 할아버지 때부터 농사를 지으셨고, 지금도 논에서 직접 농사를 짓고 있어요.',
      amenities: JSON.stringify(['wifi', 'parking', 'aircon', 'kitchen']),
      rules: '실내 금연, 반려동물 불가, 밤 10시 이후 정숙',
      status: 'APPROVED',
      province: '전라북도',
      city: '전주시',
      tags: {
        connect: [
          tag논뷰?.id ? { id: tag논뷰.id } : null,
          tag전통가옥?.id ? { id: tag전통가옥.id } : null,
          tag힐링?.id ? { id: tag힐링.id } : null,
          tag가족여행?.id ? { id: tag가족여행.id } : null,
        ].filter((t): t is { id: string } => t !== null),
      },
    },
    {
      name: '계곡 앞 통나무집',
      description: '맑은 계곡물 소리를 들으며 하루를 시작하는 특별한 경험. 여름엔 시원하게, 겨울엔 포근하게.',
      address: '강원도 평창군 봉평면 계곡길 456',
      location: JSON.stringify({ lat: 37.6347, lng: 128.4019 }),
      pricePerNight: 150000,
      maxGuests: 6,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=800',
        'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800',
      ]),
      thumbnailUrl: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=400',
      hostStory: '서울에서 회사 생활을 하다가 5년 전 귀촌했습니다. 직접 통나무를 쌓아 만든 집이에요.',
      amenities: JSON.stringify(['wifi', 'parking', 'bbq', 'fireplace']),
      rules: '반려동물 동반 가능 (소형견만), 실내 금연',
      status: 'APPROVED',
      province: '강원도',
      city: '평창군',
      tags: {
        connect: [
          tag계곡?.id ? { id: tag계곡.id } : null,
          tag불멍?.id ? { id: tag불멍.id } : null,
          tag반려동물?.id ? { id: tag반려동물.id } : null,
          tag바비큐?.id ? { id: tag바비큐.id } : null,
          tag힐링?.id ? { id: tag힐링.id } : null,
        ].filter((t): t is { id: string } => t !== null),
      },
    },
    {
      name: '독채 전원주택',
      description: '넓은 마당과 함께 독채로 사용 가능한 전원주택입니다. 바비큐 파티, 모닥불, 별 관찰까지 모두 즐길 수 있어요.',
      address: '경기도 양평군 지평면 전원길 789',
      location: JSON.stringify({ lat: 37.4912, lng: 127.5870 }),
      pricePerNight: 180000,
      maxGuests: 8,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800',
        'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
      ]),
      thumbnailUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400',
      hostStory: '큰 마당과 넓은 공간에서 가족, 친구들과 자유롭게 시간을 보낼 수 있는 곳입니다.',
      amenities: JSON.stringify(['wifi', 'parking', 'bbq', 'kitchen', 'washer', 'dryer']),
      rules: '실내외 금연, 반려동물 동반 가능',
      status: 'APPROVED',
      province: '경기도',
      city: '양평군',
      tags: {
        connect: [
          tag독채?.id ? { id: tag독채.id } : null,
          tag바비큐?.id ? { id: tag바비큐.id } : null,
          tag불멍?.id ? { id: tag불멍.id } : null,
          tag반려동물?.id ? { id: tag반려동물.id } : null,
          tag가족여행?.id ? { id: tag가족여행.id } : null,
        ].filter((t): t is { id: string } => t !== null),
      },
    },
  ];

  for (const propertyData of properties) {
    await prisma.property.create({
      data: {
        ...propertyData,
        hostId: testHost.id,
      },
    });
  }

  console.log('✅ Created 3 test properties');
  console.log('🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
