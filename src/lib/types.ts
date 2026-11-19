export interface Video {
  videoId: string;
  title: string;
  channelTitle: string;
  thumbnailUrl: string;
  publishedAt: string;
  description: string;
  viewCount: number;
  tags: string[];
}

export type VideoSort = "view_count" | "published_at";
