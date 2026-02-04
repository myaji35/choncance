export interface Tag {
  id: string;
  name: string;
  category: 'VIEW' | 'ACTIVITY' | 'FACILITY' | 'VIBE';
  icon?: string;
  color: string;
  description?: string;
  display_order: number;
  created_at: string;
}

export interface TagListResponse {
  tags: Tag[];
}
