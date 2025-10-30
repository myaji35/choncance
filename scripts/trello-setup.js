#!/usr/bin/env node

/**
 * Trello 보드 설정 스크립트
 *
 * 이 스크립트는 Trello 보드의 List ID들을 조회하여
 * 환경 변수 설정에 필요한 정보를 출력합니다.
 *
 * 사용법:
 * 1. .env.local에 TRELLO_API_KEY와 TRELLO_TOKEN 설정
 * 2. npm run trello:setup 실행
 */

require('dotenv').config({ path: '.env.local' });
const Trello = require('trello');

const TRELLO_API_KEY = process.env.TRELLO_API_KEY;
const TRELLO_TOKEN = process.env.TRELLO_TOKEN;
const TRELLO_BOARD_ID = process.env.TRELLO_BOARD_ID || 'XYvc0OFq';

async function main() {
  console.log('\n🔍 Trello 보드 설정 도구\n');

  // Validate credentials
  if (!TRELLO_API_KEY || !TRELLO_TOKEN) {
    console.error('❌ Trello API 인증 정보가 없습니다.');
    console.log('\n다음 단계를 따라주세요:');
    console.log('1. https://trello.com/power-ups/admin 방문');
    console.log('2. New Power-Up 생성 후 API Key 복사');
    console.log('3. Token 링크 클릭하여 Token 생성');
    console.log('4. .env.local 파일에 다음 추가:');
    console.log('   TRELLO_API_KEY=your_api_key');
    console.log('   TRELLO_TOKEN=your_token');
    console.log('   TRELLO_BOARD_ID=XYvc0OFq\n');
    process.exit(1);
  }

  const trello = new Trello(TRELLO_API_KEY, TRELLO_TOKEN);

  try {
    console.log(`📋 보드 ID: ${TRELLO_BOARD_ID}`);
    console.log('🔄 리스트 정보를 가져오는 중...\n');

    const lists = await trello.getListsOnBoard(TRELLO_BOARD_ID);

    if (lists.length === 0) {
      console.log('⚠️  보드에 리스트가 없습니다.');
      return;
    }

    console.log(`✅ ${lists.length}개의 리스트를 찾았습니다:\n`);

    // 리스트 출력
    console.log('═══════════════════════════════════════════════════════');
    lists.forEach((list, index) => {
      console.log(`${index + 1}. ${list.name}`);
      console.log(`   ID: ${list.id}`);
      console.log(`   상태: ${list.closed ? '닫힘' : '열림'}`);
      console.log('───────────────────────────────────────────────────────');
    });

    // 환경 변수 설정 가이드
    console.log('\n📝 환경 변수 설정:\n');
    console.log('다음 내용을 .env.local 파일에 추가하세요:\n');
    console.log('# Trello API Credentials');
    console.log(`TRELLO_API_KEY=${TRELLO_API_KEY}`);
    console.log(`TRELLO_TOKEN=${TRELLO_TOKEN}`);
    console.log(`TRELLO_BOARD_ID=${TRELLO_BOARD_ID}`);
    console.log('\n# Trello List IDs');

    // 예약 관리용 리스트 추천
    console.log('\n# 예약 관리 (추천 이름: "새 예약", "확정됨", "체크인 완료", "완료", "취소됨")');
    const bookingLists = lists.filter(l =>
      ['새 예약', '신규 예약', 'new', 'pending', '확정', 'confirmed',
       '체크인', 'checked', '완료', 'completed', 'done', '취소', 'cancelled'].some(keyword =>
        l.name.toLowerCase().includes(keyword.toLowerCase())
      )
    );

    if (bookingLists.length > 0) {
      bookingLists.forEach(list => {
        const varName = getListVarName(list.name);
        console.log(`${varName}=${list.id}  # ${list.name}`);
      });
    } else {
      lists.slice(0, 5).forEach((list, index) => {
        console.log(`TRELLO_LIST_${index + 1}_ID=${list.id}  # ${list.name}`);
      });
    }

    // 개발 작업 관리용 리스트 추천
    const devLists = lists.filter(l =>
      ['backlog', 'todo', 'progress', 'in progress', 'review', 'done', 'complete'].some(keyword =>
        l.name.toLowerCase().includes(keyword.toLowerCase())
      )
    );

    if (devLists.length > 0) {
      console.log('\n# 개발 작업 관리 (추천 이름: "Backlog", "To Do", "In Progress", "Review", "Done")');
      devLists.forEach(list => {
        const varName = getDevListVarName(list.name);
        console.log(`${varName}=${list.id}  # ${list.name}`);
      });
    }

    console.log('\n═══════════════════════════════════════════════════════\n');

    // 리스트 생성 가이드
    if (bookingLists.length === 0) {
      console.log('💡 팁: 예약 관리를 위해 다음 리스트들을 생성하는 것을 추천합니다:');
      console.log('   • 새 예약 (New Bookings)');
      console.log('   • 확정됨 (Confirmed)');
      console.log('   • 체크인 완료 (Checked In)');
      console.log('   • 완료 (Completed)');
      console.log('   • 취소됨 (Cancelled)\n');
    }

    // 테스트 카드 생성 제안
    console.log('\n🧪 테스트하기:');
    console.log('   npm run trello:test\n');

  } catch (error) {
    console.error('❌ 오류 발생:', error.message);

    if (error.message.includes('unauthorized')) {
      console.log('\n인증 오류입니다. API Key와 Token을 확인해주세요.');
    } else if (error.message.includes('not found')) {
      console.log('\n보드를 찾을 수 없습니다. TRELLO_BOARD_ID를 확인해주세요.');
      console.log('보드 ID는 Trello URL에서 확인할 수 있습니다:');
      console.log('https://trello.com/b/BOARD_ID/board-name');
    }

    process.exit(1);
  }
}

function getListVarName(listName) {
  const name = listName.toLowerCase();

  if (name.includes('새') || name.includes('신규') || name.includes('new') || name.includes('pending')) {
    return 'TRELLO_NEW_BOOKINGS_LIST_ID';
  } else if (name.includes('확정') || name.includes('confirmed')) {
    return 'TRELLO_CONFIRMED_LIST_ID';
  } else if (name.includes('체크인') || name.includes('checked')) {
    return 'TRELLO_CHECKED_IN_LIST_ID';
  } else if (name.includes('완료') || name.includes('completed') || name.includes('done')) {
    return 'TRELLO_COMPLETED_LIST_ID';
  } else if (name.includes('취소') || name.includes('cancelled')) {
    return 'TRELLO_CANCELLED_LIST_ID';
  }

  return 'TRELLO_CUSTOM_LIST_ID';
}

function getDevListVarName(listName) {
  const name = listName.toLowerCase();

  if (name.includes('backlog')) {
    return 'TRELLO_BACKLOG_LIST_ID';
  } else if (name.includes('todo') || name.includes('to do')) {
    return 'TRELLO_TODO_LIST_ID';
  } else if (name.includes('progress')) {
    return 'TRELLO_IN_PROGRESS_LIST_ID';
  } else if (name.includes('review')) {
    return 'TRELLO_REVIEW_LIST_ID';
  } else if (name.includes('done') || name.includes('complete')) {
    return 'TRELLO_DONE_LIST_ID';
  }

  return 'TRELLO_DEV_LIST_ID';
}

main();
