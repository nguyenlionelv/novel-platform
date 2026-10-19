export interface PublicReview {
  id: string;
  display_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

export interface ReviewPage {
  reviews: PublicReview[];
  hasMore: boolean;
  summary: { count: number; average: number | null };
}

export interface ReviewInput { displayName: string; rating: number; comment: string }
export interface ReviewCursor { createdAt: string; id: string }
