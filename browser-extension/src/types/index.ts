export interface Bookmark {
  id: string;
  title: string;
  page_url: string;
  note: string;
  excerpt: string;
  collection_name: string;
  createdAt: string | null;
  tagToBookmarks: TagToBookmark[];
}

export interface TagToBookmark {
  id: string;
  createdAt: string;
  tagId: string;
  tag_name: string;
  bookmarkId: string;
  page_url: string;
}

export interface Session {
  id: string;
  userId: string;
  expires: number;
  sessionToken: string;
}

export interface Collection {
  id: string;
  createdAt: string;
  name: string;
  userId: string;
}

export interface BookmarkCreateRequest {
  userId: string;
  sessionToken: string;
  title: string;
  page_url: string;
  note?: string;
  excerpt?: string;
  collection_name: string;
}

export interface BookmarkUpdateRequest {
  id: string;
  sessionToken: string;
  title?: string;
  page_url?: string;
  note?: string;
  excerpt?: string;
}

export interface BookmarkDeleteRequest {
  sessionToken: string;
  userId: string;
  id: string;
}
