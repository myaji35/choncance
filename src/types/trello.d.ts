declare module "trello" {
  export default class Trello {
    constructor(apiKey: string, token: string);

    // Board methods
    getBoards(memberId: string): Promise<TrelloBoard[]>;
    getBoardMembers(boardId: string): Promise<TrelloMember[]>;

    // List methods
    getListsOnBoard(boardId: string): Promise<TrelloList[]>;
    addListToBoard(
      boardId: string,
      name: string
    ): Promise<TrelloList>;

    // Card methods
    addCard(
      name: string,
      description: string,
      listId: string
    ): Promise<TrelloCard>;

    updateCard(
      cardId: string,
      field: string,
      value: string
    ): Promise<TrelloCard>;

    getCard(
      boardId: string,
      cardId: string
    ): Promise<TrelloCard>;

    deleteCard(cardId: string): Promise<void>;

    // Label methods
    addLabelToCard(
      cardId: string,
      labelColor: string
    ): Promise<any>;

    getLabelsForBoard(boardId: string): Promise<TrelloLabel[]>;

    // Checklist methods
    addChecklistToCard(
      cardId: string,
      name: string,
      items?: string[]
    ): Promise<TrelloChecklist>;

    // Webhook methods
    addWebhook(
      description: string,
      callbackURL: string,
      idModel: string
    ): Promise<TrelloWebhook>;

    deleteWebhook(webhookId: string): Promise<void>;
  }

  export interface TrelloBoard {
    id: string;
    name: string;
    desc: string;
    url: string;
    closed: boolean;
  }

  export interface TrelloList {
    id: string;
    name: string;
    closed: boolean;
    idBoard: string;
    pos: number;
  }

  export interface TrelloCard {
    id: string;
    name: string;
    desc: string;
    idList: string;
    idBoard: string;
    url: string;
    due: string | null;
    dueComplete: boolean;
    closed: boolean;
    labels: TrelloLabel[];
  }

  export interface TrelloLabel {
    id: string;
    idBoard: string;
    name: string;
    color: string;
  }

  export interface TrelloMember {
    id: string;
    username: string;
    fullName: string;
    avatarUrl: string;
  }

  export interface TrelloChecklist {
    id: string;
    name: string;
    idCard: string;
    idBoard: string;
    checkItems: TrelloCheckItem[];
  }

  export interface TrelloCheckItem {
    id: string;
    name: string;
    state: "complete" | "incomplete";
    pos: number;
  }

  export interface TrelloWebhook {
    id: string;
    description: string;
    idModel: string;
    callbackURL: string;
    active: boolean;
  }
}
