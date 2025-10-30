#!/usr/bin/env node

/**
 * Trello 연동 테스트 스크립트
 *
 * 테스트 예약 카드를 생성하여 Trello 연동이 제대로 작동하는지 확인합니다.
 */

require('dotenv').config({ path: '.env.local' });
const Trello = require('trello');

const TRELLO_API_KEY = process.env.TRELLO_API_KEY;
const TRELLO_TOKEN = process.env.TRELLO_TOKEN;
const TRELLO_BOARD_ID = process.env.TRELLO_BOARD_ID || 'XYvc0OFq';

async function main() {
  console.log('\n🧪 Trello 연동 테스트\n');

  if (!TRELLO_API_KEY || !TRELLO_TOKEN) {
    console.error('❌ Trello API 인증 정보가 없습니다.');
    console.log('먼저 npm run trello:setup을 실행해주세요.\n');
    process.exit(1);
  }

  const trello = new Trello(TRELLO_API_KEY, TRELLO_TOKEN);

  try {
    // 리스트 가져오기
    console.log('📋 리스트 조회 중...');
    const lists = await trello.getListsOnBoard(TRELLO_BOARD_ID);

    if (lists.length === 0) {
      console.error('❌ 보드에 리스트가 없습니다.');
      process.exit(1);
    }

    // 첫 번째 리스트에 테스트 카드 생성
    const testList = lists[0];
    console.log(`✅ 테스트 리스트: ${testList.name}`);

    const testCardName = `[테스트] ChonCance 예약 테스트 - ${new Date().toLocaleString('ko-KR')}`;
    const testCardDesc = `
**이것은 테스트 카드입니다**

ChonCance x Trello 연동 테스트

- 예약 시스템 연동 확인
- 자동 카드 생성 테스트
- 라벨 및 Due Date 테스트

생성 시간: ${new Date().toISOString()}

이 카드는 안전하게 삭제하셔도 됩니다.
`;

    console.log('\n📝 테스트 카드 생성 중...');
    const card = await trello.addCard(
      testCardName,
      testCardDesc.trim(),
      testList.id
    );

    console.log('✅ 카드 생성 완료!');
    console.log(`   카드 ID: ${card.id}`);
    console.log(`   카드 URL: ${card.url}`);

    // 라벨 추가 테스트
    console.log('\n🏷️  라벨 추가 중...');
    await trello.addLabelToCard(card.id, 'green');
    console.log('✅ 라벨 추가 완료!');

    // Due Date 설정 테스트
    console.log('\n📅 Due Date 설정 중...');
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    await trello.updateCard(card.id, 'due', tomorrow.toISOString());
    console.log('✅ Due Date 설정 완료!');

    // 체크리스트 추가 테스트
    console.log('\n☑️  체크리스트 추가 중...');
    await trello.addChecklistToCard(card.id, '테스트 항목', [
      '예약 확인',
      '결제 처리',
      '확정 메일 발송',
    ]);
    console.log('✅ 체크리스트 추가 완료!');

    console.log('\n═══════════════════════════════════════════════════════');
    console.log('\n🎉 Trello 연동 테스트 성공!');
    console.log('\n테스트 카드를 확인하세요:');
    console.log(`   ${card.url}`);
    console.log('\n테스트 카드는 삭제하셔도 됩니다.');
    console.log('═══════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('\n❌ 테스트 실패:', error.message);

    if (error.message.includes('unauthorized')) {
      console.log('\n인증 오류입니다. API Key와 Token을 확인해주세요.');
    } else if (error.message.includes('not found')) {
      console.log('\n보드를 찾을 수 없습니다. TRELLO_BOARD_ID를 확인해주세요.');
    }

    process.exit(1);
  }
}

main();
