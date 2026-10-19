import type { Novel } from "../db/queries";

export type ChapterStatus = "draft" | "published";
export interface ChapterSummary {
  id: string;
  position: number;
  title: string;
  status: ChapterStatus;
  updated_at: string;
}
export interface AdminChapter extends ChapterSummary { content: string }
export interface AdminReview {
  id: string;
  display_name: string;
  rating: number;
  comment: string;
  is_hidden: boolean;
  created_at: string;
}
export interface AdminOverview {
  novel: Novel;
  chapters: ChapterSummary[];
  chaptersHasMore: boolean;
  nextPosition: number;
  reviews: AdminReview[];
  reviewsHasMore: boolean;
}
export type ChapterIntent = "draft" | "publish" | "update" | "unpublish";
export interface ChapterInput { id?: string; position: number; title: string; content: string; intent: ChapterIntent }
export interface NovelInput { title: string; author: string; description: string; status: "ongoing" | "completed" }
