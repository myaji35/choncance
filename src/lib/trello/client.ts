import Trello from "trello";

let trelloClient: Trello | null = null;

export function getTrelloClient(): Trello | null {
  // Trello 연동이 설정되지 않은 경우 null 반환
  if (!process.env.TRELLO_API_KEY || !process.env.TRELLO_TOKEN) {
    console.warn("Trello API credentials not configured");
    return null;
  }

  // 싱글톤 패턴으로 클라이언트 재사용
  if (!trelloClient) {
    trelloClient = new Trello(
      process.env.TRELLO_API_KEY,
      process.env.TRELLO_TOKEN
    );
  }

  return trelloClient;
}

export function isTrelloEnabled(): boolean {
  return !!(
    process.env.TRELLO_API_KEY &&
    process.env.TRELLO_TOKEN &&
    process.env.TRELLO_BOARD_ID
  );
}

// Board ID from the URL: https://trello.com/b/XYvc0OFq/촌캉스choncance
export const TRELLO_BOARD_ID = process.env.TRELLO_BOARD_ID || "XYvc0OFq";
