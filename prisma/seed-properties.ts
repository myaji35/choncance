import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting property seeding...');

  // 1. Create a sample host profile (if not exists)
  let hostProfile = await prisma.hostProfile.findFirst({
    where: { status: 'APPROVED' },
  });

  if (!hostProfile) {
    // Create a sample user first
    const hostUser = await prisma.user.create({
      data: {
        email: 'host@choncance.com',
        name: '김촌캉',
        role: 'HOST',
      },
    });

    hostProfile = await prisma.hostProfile.create({
      data: {
        userId: hostUser.id,
        businessNumber: '123-45-67890',
        contact: '010-1234-5678',
        status: 'APPROVED',
      },
    });
    console.log('✅ Created sample host profile');
  }

  // 2. Ensure tags exist
  const tags = await Promise.all([
    prisma.tag.upsert({
      where: { name: '논뷰맛집' },
      update: {},
      create: {
        name: '논뷰맛집',
        category: 'VIEW',
        icon: '🌾',
        description: '황금빛 논밭 뷰가 일품인 곳',
        color: 'yellow',
      },
    }),
    prisma.tag.upsert({
      where: { name: '불멍과별멍' },
      update: {},
      create: {
        name: '불멍과별멍',
        category: 'ACTIVITY',
        icon: '🔥',
        description: '모닥불과 별빛을 즐길 수 있는 곳',
        color: 'orange',
      },
    }),
    prisma.tag.upsert({
      where: { name: '찐할머니손맛' },
      update: {},
      create: {
        name: '찐할머니손맛',
        category: 'VIBE',
        icon: '🍚',
        description: '할머니의 정성 가득한 손맛을 경험할 수 있는 곳',
        color: 'red',
      },
    }),
  ]);
  console.log('✅ Tags ready');

  // 3. Create properties for each theme (3 per theme = 9 total)

  // === 논뷰맛집 Properties ===
  const riceFieldProperties = [
    {
      name: '황금들판 한옥스테이',
      description: '사방이 황금빛 논으로 둘러싸인 전통 한옥에서의 힐링 타임. 아침이면 논에서 들려오는 자연의 소리로 눈을 뜨게 됩니다. 해질녘 황금빛으로 물드는 논밭을 바라보며 차 한잔의 여유를 즐겨보세요.',
      address: '강원도 철원군 갈말읍 논밭길 123',
      province: '강원도',
      city: '철원군',
      pricePerNight: 120000,
      discountRate: 20,
      discountedPrice: 96000,
      maxGuests: 4,
      images: ['/rice-field-view.svg'],
      thumbnailUrl: '/rice-field-view.svg',
      hostStory: '20년간 농사를 지어온 저희 부부가 운영하는 한옥입니다. 도시 생활에 지친 분들께 진정한 쉼을 선물하고 싶어 문을 열었습니다.',
      amenities: ['주차', '와이파이', '주방', '에어컨', '난방'],
    },
    {
      name: '논두렁 펜션',
      description: '논두렁을 따라 산책하고, 계절마다 변하는 논의 색을 감상할 수 있는 곳. 봄엔 초록, 가을엔 황금빛으로 물드는 논밭이 창문 너머로 펼쳐집니다. 벼가 자라는 소리를 들으며 힐링하세요.',
      address: '전라북도 김제시 백구면 논길로 456',
      province: '전라북도',
      city: '김제시',
      pricePerNight: 90000,
      maxGuests: 6,
      images: ['/rice-field-view.svg'],
      thumbnailUrl: '/rice-field-view.svg',
      hostStory: '김제 평야가 한눈에 보이는 이곳에서 태어나고 자랐습니다. 이 아름다운 풍경을 더 많은 분들과 나누고 싶습니다.',
      amenities: ['주차', '바비큐', '테라스', '정원'],
    },
    {
      name: '들녘뷰 게스트하우스',
      description: '넓게 펼쳐진 들판이 마치 그림 같은 곳. 2층 창문에서 바라보는 논밭 풍경은 포토존 그 자체입니다. 일몰 시간에는 하늘과 논이 붉게 물들어 장관을 이룹니다.',
      address: '충청남도 서천군 한산면 들판길 789',
      province: '충청남도',
      city: '서천군',
      pricePerNight: 85000,
      maxGuests: 4,
      images: ['/rice-field-view.svg'],
      thumbnailUrl: '/rice-field-view.svg',
      hostStory: '서울에서 귀농한 지 5년차입니다. 매일 아침 이 풍경을 보며 행복을 느낍니다. 여러분도 함께 느껴보세요.',
      amenities: ['주차', '와이파이', '세탁기', '냉장고'],
    },
  ];

  // === 불멍과별멍 Properties ===
  const campfireProperties = [
    {
      name: '별빛 캠핑하우스',
      description: '도심에서는 볼 수 없는 쏟아지는 별들과 함께하는 특별한 밤. 개인 캠프파이어 시설이 구비되어 있어 모닥불을 피우며 마시멜로를 구워먹을 수 있습니다. 은하수가 보이는 날이면 평생 잊지 못할 추억이 될 거예요.',
      address: '강원도 평창군 대관령면 별빛로 234',
      province: '강원도',
      city: '평창군',
      pricePerNight: 150000,
      discountRate: 15,
      discountedPrice: 127500,
      maxGuests: 4,
      allowsPets: true,
      images: ['/campfire-stars.svg'],
      thumbnailUrl: '/campfire-stars.svg',
      hostStory: '도시를 떠나 이곳에 터를 잡은 지 3년. 맑은 공기와 별빛이 주는 치유의 시간을 여러분께도 나누고 싶습니다.',
      amenities: ['주차', '캠프파이어', '바비큐그릴', '야외테이블', '장작제공'],
    },
    {
      name: '산골 불멍하우스',
      description: '깊은 산속, 오직 불멍과 별멍만을 위한 공간. 주변에 불빛이 없어 별이 정말 잘 보입니다. 매일 저녁 호스트가 준비해주는 장작으로 모닥불을 피우고, 하늘 가득 별을 세어보세요.',
      address: '경상북도 봉화군 소천면 산골길 567',
      province: '경상북도',
      city: '봉화군',
      pricePerNight: 130000,
      maxGuests: 6,
      allowsPets: true,
      images: ['/campfire-stars.svg'],
      thumbnailUrl: '/campfire-stars.svg',
      hostStory: '천문학을 전공한 호스트가 별자리 설명도 해드립니다. 맑은 날이면 망원경으로 행성도 관측할 수 있어요.',
      amenities: ['주차', '캠프파이어', '망원경', '별자리지도', '장작제공'],
    },
    {
      name: '숲속 힐링캠프',
      description: '숲으로 둘러싸인 프라이빗 공간에서 즐기는 캠프파이어. 낮에는 숲길 산책, 밤에는 모닥불과 별빛 아래 힐링. 완전한 단절의 시간을 보내고 싶다면 이곳으로 오세요.',
      address: '전라남도 담양군 용면 숲속길 890',
      province: '전라남도',
      city: '담양군',
      pricePerNight: 110000,
      maxGuests: 4,
      images: ['/campfire-stars.svg'],
      thumbnailUrl: '/campfire-stars.svg',
      hostStory: '대나무 숲이 집 뒤편에 있어 바람 소리가 마치 음악 같습니다. 자연의 소리와 함께하는 힐링을 경험하세요.',
      amenities: ['주차', '캠프파이어', '해먹', '산책로', '장작제공'],
    },
  ];

  // === 찐할머니손맛 Properties ===
  const grandmaFoodProperties = [
    {
      name: '외할머니댁 체험',
      description: '70대 할머니가 직접 차려주시는 시골 밥상. 아침이면 갓 지은 밥과 된장찌개, 각종 나물 반찬이 상에 가득합니다. 할머니와 함께 텃밭에서 채소를 따고, 장작불로 밥을 지어보는 특별한 경험도 가능합니다.',
      address: '경상남도 하동군 화개면 할매길 345',
      province: '경상남도',
      city: '하동군',
      pricePerNight: 95000,
      discountRate: 25,
      discountedPrice: 71250,
      maxGuests: 4,
      images: ['/grandma-food.svg'],
      thumbnailUrl: '/grandma-food.svg',
      hostStory: '50년 넘게 이 동네에서 살아온 할머니의 손맛을 그대로 전해드립니다. 화학조미료 없이 정성만 가득 담았어요.',
      amenities: ['주차', '조식포함', '텃밭체험', '전통음식체험', '주방'],
    },
    {
      name: '시골할매 민박',
      description: '3대가 함께 사는 시골집에서 경험하는 진짜 할머니 밥상. 계절 채소로 만든 김치, 손으로 직접 빚은 된장, 마당에서 키운 닭의 달걀로 만든 요리들. 할머니의 따뜻한 정과 함께 제공됩니다.',
      address: '충청북도 괴산군 청천면 할머니길 678',
      province: '충청북도',
      city: '괴산군',
      pricePerNight: 80000,
      maxGuests: 6,
      images: ['/grandma-food.svg'],
      thumbnailUrl: '/grandma-food.svg',
      hostStory: '할머니가 텃밭에서 키운 채소로 매일 다른 반찬을 만들어주십니다. 무엇이 나올지는 그날의 수확에 달려있어요.',
      amenities: ['주차', '조식포함', '석식포함', '텃밭', '마당'],
    },
    {
      name: '정이네 할머니댁',
      description: '옛날 어릴 적 할머니댁 가던 그 느낌 그대로. 아궁이에 불을 지펴 밥을 짓고, 손맛 가득한 반찬들이 상에 차려집니다. 할머니의 구수한 사투리와 따뜻한 미소가 마음까지 편안하게 해줍니다.',
      address: '전라북도 순창군 복흥면 정이길 901',
      province: '전라북도',
      city: '순창군',
      pricePerNight: 75000,
      maxGuests: 4,
      images: ['/grandma-food.svg'],
      thumbnailUrl: '/grandma-food.svg',
      hostStory: '고추장 명인이신 할머니의 손맛을 직접 경험해보세요. 매 끼니마다 다른 반찬이 나옵니다.',
      amenities: ['주차', '조식포함', '아궁이체험', '고추장담그기', '전통음식체험'],
    },
  ];

  // Create all properties
  console.log('\n📍 Creating 논뷰맛집 properties...');
  for (const propertyData of riceFieldProperties) {
    const property = await prisma.property.create({
      data: {
        ...propertyData,
        hostId: hostProfile.id,
        location: { lat: 37.5, lng: 127.5 },
        status: 'APPROVED',
        tags: {
          connect: [{ name: '논뷰맛집' }],
        },
      },
    });
    console.log(`  ✅ ${property.name}`);
  }

  console.log('\n🔥 Creating 불멍과별멍 properties...');
  for (const propertyData of campfireProperties) {
    const property = await prisma.property.create({
      data: {
        ...propertyData,
        hostId: hostProfile.id,
        location: { lat: 37.6, lng: 128.7 },
        status: 'APPROVED',
        tags: {
          connect: [{ name: '불멍과별멍' }],
        },
      },
    });
    console.log(`  ✅ ${property.name}`);
  }

  console.log('\n🍚 Creating 찐할머니손맛 properties...');
  for (const propertyData of grandmaFoodProperties) {
    const property = await prisma.property.create({
      data: {
        ...propertyData,
        hostId: hostProfile.id,
        location: { lat: 35.8, lng: 127.7 },
        status: 'APPROVED',
        tags: {
          connect: [{ name: '찐할머니손맛' }],
        },
      },
    });
    console.log(`  ✅ ${property.name}`);
  }

  console.log('\n✨ Seeding completed successfully!');
  console.log('📊 Total properties created: 9 (3 per theme)');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
