export interface ChromeTab {
  title?: string;
  url?: string;
}

export interface Bookmark {
  id: string;
  title: string;
  page_url: string;
  note: string;
  excerpt: string;
  collectionId: string;
  createdAt: string | null;
  tagToBookmarks: TagToBookmark[];
  collection: Collection;
}

export interface Tag {
  id: string;
  createdAt: string;
  name: string;
  userId: string;
}

export interface TagToBookmark {
  id: string;
  createdAt: string;
  tagId: string;
  bookmarkId: string;
  tag: Tag;
}

export interface Session {
  id: string;
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
  sessionToken: string;
  title: string;
  page_url: string;
  note?: string;
  excerpt?: string;
  collection_name: string;
}

export interface BookmarkUpdateRequest {
  sessionToken: string;
  id: string;
  title?: string;
  note?: string;
  collection_name?: string;
  tags?: string[];
  page_url?: string;
  excerpt?: string;
}

export interface BookmarkDeleteRequest {
  sessionToken: string;
  id: string;
}
