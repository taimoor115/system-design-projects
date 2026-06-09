type CurrentUserScope = "admin" | "client";

export interface PaginationParams {
  page: number;
  pageSize: number;
  search?: string;
}

export interface UserListParams {
  page: number;
  pageSize: number;
  search?: string;
  role?: string;
}

export interface JobListParams {
  page: number;
  limit: number;
  queue?: string;
  status?: string;
  book_id?: string;
  user_name?: string;
}

export const queryKeys = {
  auth: {
    all: () => ["auth"] as const,
    currentUser: (scope: CurrentUserScope = "admin") =>
      ["auth", "current-user", scope] as const,
  },

  books: {
    all: () => ["books"] as const,
    lists: () => ["books", "list"] as const,
    list: (filters: PaginationParams) => ["books", "list", filters] as const,
    details: () => ["books", "detail"] as const,
    detail: (id: string) => ["books", "detail", id] as const,
    editions: (bookId: string) => ["books", "editions", bookId] as const,
  },

  publishedBooks: {
    all: () => ["published-books"] as const,
    lists: () => ["published-books", "list"] as const,
    list: (filters: PaginationParams) =>
      ["published-books", "list", filters] as const,
    detail: (bookId: string) => ["published-books", "detail", bookId] as const,
  },

  editions: {
    all: (bookId: string) => ["editions", bookId] as const,
    lists: (bookId: string) => ["editions", bookId, "list"] as const,
    list: (bookId: string) => ["editions", bookId, "list"] as const,
    detail: (bookId: string, editionId: string) =>
      ["editions", bookId, "detail", editionId] as const,
  },

  variants: {
    all: (bookId: string, editionId: string) =>
      ["variants", bookId, editionId] as const,
    lists: (bookId: string, editionId: string) =>
      ["variants", bookId, editionId, "list"] as const,
    list: (bookId: string, editionId: string) =>
      ["variants", bookId, editionId, "list"] as const,
    detail: (bookId: string, editionId: string, variantId: string) =>
      ["variants", bookId, editionId, "detail", variantId] as const,
  },

  users: {
    all: () => ["users"] as const,
    lists: () => ["users", "list"] as const,
    list: (filters: UserListParams) => ["users", "list", filters] as const,
    details: () => ["users", "detail"] as const,
    detail: (id: string) => ["users", "detail", id] as const,
  },

  jobs: {
    all: () => ["jobs"] as const,
    lists: () => ["jobs", "list"] as const,
    list: (filters: JobListParams) => ["jobs", "list", filters] as const,
    stats: (filters?: { book_id?: string; user_name?: string }) =>
      ["jobs", "stats", filters ?? {}] as const,
    detail: (id: string) => ["jobs", "detail", id] as const,
    status: (id: string) => ["jobs", "status", id] as const,
    download: (id: string) => ["jobs", "download", id] as const,
  },

  userBooks: {
    all: () => ["user-books"] as const,
    lists: () => ["user-books", "list"] as const,
    list: (filters: Omit<JobListParams, "user_name"> & { userId?: string }) =>
      ["user-books", "list", filters] as const,
    detail: (id: string) => ["user-books", "detail", id] as const,
  },

  transcription: {
    all: (bookId: string, variantId: string) =>
      ["transcription", bookId, variantId] as const,
    pages: (bookId: string, variantId: string) =>
      ["variant-transcription", bookId, variantId] as const,
    mediaAssets: (bookId: string, variantId: string) =>
      ["variant-media-assets", bookId, variantId] as const,
  },

  payments: {
    all: () => ["payments"] as const,
    job: (paymentId: string) => ["payments", "job", paymentId] as const,
    adminStats: () => ["payments", "admin", "stats"] as const,
    adminList: (params: { page: number; limit: number; status?: string }) =>
      ["payments", "admin", "list", params] as const,
  },

  admin: {
    all: () => ["admin"] as const,
    dashboard: () => ["admin", "dashboard"] as const,
    dashboardStats: () => ["admin", "dashboard", "stats"] as const,
    dashboardRecentBooks: () => ["admin", "dashboard", "recent-books"] as const,
    dashboardRevenueTrends: (days: number = 7) =>
      ["admin", "dashboard", "revenue-trends", days] as const,
  },
} as const;

export type QueryKeys = typeof queryKeys;
