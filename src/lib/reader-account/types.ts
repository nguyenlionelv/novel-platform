export interface ReaderProfile { user_id: string; display_name: string }
export interface Progress { chapter_id: string; position: number; title: string; progress: number; updated_at: string }
export interface Bookmark { id: string; chapter_id: string; position: number; title: string; paragraph: number; offset: number; available: boolean }
export interface ReaderNotification { chapter_id: string; position: number; title: string; created_at: string; unread: boolean }
export interface OwnReview { id: string; rating: number; comment: string; created_at: string; is_hidden: boolean }
export interface ReaderState {
  profile: ReaderProfile | null;
  progress: Progress[];
  bookmark: Bookmark | null;
  notifications: ReaderNotification[];
  unread: number;
  reviews: OwnReview[];
}
