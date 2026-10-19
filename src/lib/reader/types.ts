export interface PublishedChapterSummary {
  id: string;
  position: number;
  title: string;
}

export interface ChapterPage {
  chapters: PublishedChapterSummary[];
  hasMore: boolean;
}

export interface PublishedChapter extends PublishedChapterSummary {
  content: string;
  previous_id: string | null;
  next_id: string | null;
}
