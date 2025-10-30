import { getTrelloClient, isTrelloEnabled } from "./client";

export interface TaskCardData {
  title: string;
  description?: string;
  priority: number;
  estimate?: string;
  subtasks?: string[];
  dueDate?: Date;
  assignee?: string;
}

/**
 * 개발 작업을 Trello 카드로 생성합니다
 */
export async function createTaskCard(
  task: TaskCardData
): Promise<string | null> {
  if (!isTrelloEnabled()) {
    console.log("Trello is not enabled, skipping task card creation");
    return null;
  }

  const trello = getTrelloClient();
  if (!trello) return null;

  try {
    const listId = process.env.TRELLO_TODO_LIST_ID || process.env.TRELLO_BACKLOG_LIST_ID;
    if (!listId) {
      console.error("TRELLO_TODO_LIST_ID or TRELLO_BACKLOG_LIST_ID not configured");
      return null;
    }

    // 카드 제목 (우선순위 포함)
    const cardName = `[P${task.priority}] ${task.title}`;

    // 카드 설명
    let cardDesc = "";

    if (task.description) {
      cardDesc += `${task.description}\n\n`;
    }

    if (task.estimate) {
      cardDesc += `**예상 작업 시간:** ${task.estimate}\n\n`;
    }

    if (task.subtasks && task.subtasks.length > 0) {
      cardDesc += `**서브 태스크:**\n`;
      task.subtasks.forEach((subtask) => {
        cardDesc += `- [ ] ${subtask}\n`;
      });
    }

    // 카드 생성
    const card = await trello.addCard(cardName, cardDesc.trim(), listId);

    // 우선순위별 라벨 추가
    await addPriorityLabel(card.id, task.priority);

    // Due date 설정
    if (task.dueDate) {
      await trello.updateCard(card.id, "due", task.dueDate.toISOString());
    }

    // 체크리스트 추가
    if (task.subtasks && task.subtasks.length > 0) {
      await trello.addChecklistToCard(card.id, "Subtasks", task.subtasks);
    }

    console.log(`✅ Trello 작업 카드 생성 완료: ${card.url}`);
    return card.id;
  } catch (error) {
    console.error("❌ Trello 작업 카드 생성 실패:", error);
    return null;
  }
}

/**
 * 작업 상태를 업데이트하여 카드를 다른 리스트로 이동합니다
 */
export async function updateTaskStatus(
  cardId: string,
  status: "todo" | "in_progress" | "review" | "done"
): Promise<boolean> {
  if (!isTrelloEnabled()) return false;

  const trello = getTrelloClient();
  if (!trello) return false;

  try {
    const listMapping: Record<string, string | undefined> = {
      todo: process.env.TRELLO_TODO_LIST_ID,
      in_progress: process.env.TRELLO_IN_PROGRESS_LIST_ID,
      review: process.env.TRELLO_REVIEW_LIST_ID,
      done: process.env.TRELLO_DONE_LIST_ID,
    };

    const targetListId = listMapping[status];
    if (targetListId) {
      await trello.updateCard(cardId, "idList", targetListId);
      console.log(`✅ Trello 작업 카드 이동 완료: ${status}`);
      return true;
    }

    return false;
  } catch (error) {
    console.error("❌ Trello 작업 상태 업데이트 실패:", error);
    return false;
  }
}

/**
 * 우선순위별 라벨을 추가합니다
 */
async function addPriorityLabel(cardId: string, priority: number): Promise<void> {
  const trello = getTrelloClient();
  if (!trello) return;

  try {
    const labelColors = ["red", "orange", "yellow", "green", "blue"];
    const labelColor = labelColors[Math.min(priority - 1, labelColors.length - 1)];

    await trello.addLabelToCard(cardId, labelColor);
  } catch (error) {
    console.error("우선순위 라벨 추가 실패:", error);
  }
}

/**
 * IMPROVEMENT_PLAN.md의 작업들을 Trello에 일괄 동기화합니다
 */
export async function syncImprovementPlanToTrello(): Promise<void> {
  const tasks: TaskCardData[] = [
    {
      title: "Search and Filter Enhancement - 고급 필터 추가",
      description: "가격대, 편의시설, 지역별 필터링 기능 구현",
      priority: 4,
      estimate: "3-4 days",
      subtasks: [
        "가격대 슬라이더 구현",
        "편의시설 멀티 선택 필터",
        "지역별 필터 (시/도, 구/군)",
        "필터 조합 상태 관리",
      ],
    },
    {
      title: "Map View Integration - 지도 기반 검색",
      description: "Google Maps API를 사용한 지도 뷰 구현",
      priority: 5,
      estimate: "4-5 days",
      subtasks: [
        "Google Maps API 설정",
        "지도에 숙소 마커 표시",
        "마커 클릭 시 상세 정보 팝업",
        "지도 영역 내 숙소 필터링",
      ],
    },
    {
      title: "Host Dashboard Enhancement - 호스트 통계 개선",
      description: "호스트를 위한 상세 통계 및 분석 기능",
      priority: 6,
      estimate: "3-4 days",
      subtasks: [
        "예약 통계 차트 (일별, 주별, 월별)",
        "수익 분석 대시보드",
        "리뷰 평점 추이 그래프",
        "인기 날짜 및 시즌 분석",
      ],
    },
    {
      title: "Review System Enhancement - 사진 리뷰",
      description: "사진 업로드 기능 포함한 리뷰 시스템 개선",
      priority: 7,
      estimate: "2-3 days",
      subtasks: [
        "이미지 업로드 컴포넌트",
        "리뷰 갤러리 뷰",
        "사진 리뷰 필터링",
        "호스트 답글 기능 개선",
      ],
    },
  ];

  console.log(`📋 ${tasks.length}개의 작업을 Trello에 동기화합니다...`);

  for (const task of tasks) {
    await createTaskCard(task);
    // Rate limiting을 위해 약간의 딜레이
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  console.log("✅ 모든 작업 동기화 완료!");
}
