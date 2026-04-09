export type CostTier = 'free' | '$' | '$$' | '$$$';

export type Category =
  | 'restaurant'
  | 'outdoors'
  | 'movie'
  | 'activity'
  | 'travel'
  | 'other';

export interface DateIdea {
  id: string;
  created_at: string;
  added_by: string;
  title: string;
  description: string;
  cost_tier: CostTier;
  cost_exact: number | null;
  category: Category;
  tags: string[];
  raw_input: string;
}

export interface ParsedAdd {
  title: string;
  description: string;
  cost_tier: CostTier;
  cost_exact: number | null;
  category: Category;
  tags: string[];
}

export type SheetRow = [
  string, // id
  string, // created_at
  string, // added_by
  string, // title
  string, // description
  string, // cost_tier
  string, // cost_exact (number as string, or empty)
  string, // category
  string, // tags (comma-separated)
  string, // raw_input
];

export interface TelegramUser {
  id: number;
  first_name: string;
  username?: string;
}

export interface TelegramChat {
  id: number;
  type: 'private' | 'group' | 'supergroup' | 'channel';
}

export interface TelegramMessage {
  message_id: number;
  from?: TelegramUser;
  chat: TelegramChat;
  text?: string;
  entities?: TelegramMessageEntity[];
}

export interface TelegramMessageEntity {
  type: string;
  offset: number;
  length: number;
}

export interface TelegramUpdate {
  update_id: number;
  message?: TelegramMessage;
}
