export const ENDPOINTS = {
  AUTH: {
    ADMIN_LOGIN: "/v1/auth/admin/login",
    GOOGLE_INIT: "/v1/auth/google/init",
    GOOGLE_LOGIN: "/v1/auth/google",
    GET_CURRENT_USER: "/v1/auth/get-current-user",
    LOGOUT: "/v1/auth/logout",
    VERIFY_ADMIN_PASSWORD: "/v1/auth/admin/verify-password",
    CHANGE_ADMIN_PASSWORD: "/v1/auth/admin/change-password",
    CHANGE_ADMIN_PASSWORD_WITH_VERIFICATION:
      "/v1/auth/admin/change-password-with-verification",
    GET_ADMIN_SETTINGS: "/v1/auth/admin/settings",
    UPDATE_ADMIN_SETTINGS: "/v1/auth/admin/settings",
    GET_SETTINGS: "/v1/auth/settings",
  },

  USERS: {
    LIST: "/v1/users",
  },

  CHARACTERS: {
    CREATE: "/v1/characters",
    PRESIGNED_UPLOADS: (userId: string) => `/v1/characters/presigned-uploads/${userId}`,
    BY_USER: (userId: string) => `/v1/characters/user/${userId}`,
    BY_ID: (id: string) => `/v1/characters/${id}`,
  },

  JOBS: {
    LIST: "/v1/jobs",
    STATS: "/v1/jobs/stats",
    STATUS: (id: string) => `/v1/jobs/${id}/status`,
    DOWNLOAD: (id: string) => `/v1/jobs/${id}/download`,
    RETRY: (id: string) => `/v1/jobs/${id}/retry`,
  },

  BOOKS: {
    LIST: "/v1/books/get-all-books",
    PUBLISHED: "/v1/books/published",
    BY_ID: (id: string) => `/v1/books/get-book/${id}`,
    CREATE: "/v1/books/admin/create-book",
    UPDATE: (id: string) => `/v1/books/admin/update-book/${id}`,
    DELETE: (id: string) => `/v1/books/admin/delete-book/${id}`,
    GENERATE: (id: string) => `/v1/books/${id}/generate-book`,

    EDITIONS: {
      LIST: (bookId: string) => `/v1/books/admin/${bookId}/get-editions`,
      CREATE: (bookId: string) => `/v1/books/admin/${bookId}/add-edition`,
      UPDATE: (bookId: string, editionId: string) =>
        `/v1/books/admin/${bookId}/update-edition/${editionId}`,
      PUBLISH: (bookId: string, editionId: string) =>
        `/v1/books/admin/${bookId}/publish-edition/${editionId}`,
      DELETE: (bookId: string, editionId: string) =>
        `/v1/books/admin/${bookId}/delete-edition/${editionId}`,

      PAGES: {
        LIST: (bookId: string, editionId: string) =>
          `/v1/books/admin/${bookId}/get-edition-pages/${editionId}`,
        UPLOAD: (bookId: string, editionId: string) =>
          `/v1/books/admin/${bookId}/upload-edition-pages/${editionId}`,
        UPDATE: (bookId: string, editionId: string, pageId: string) =>
          `/v1/books/admin/${bookId}/update-edition-page/${editionId}/${pageId}`,
        DELETE: (bookId: string, editionId: string, pageId: string) =>
          `/v1/books/admin/${bookId}/delete-edition-page/${editionId}/${pageId}`,
        PRESIGNED: (bookId: string, editionId: string) =>
          `/v1/books/admin/${bookId}/presign-edition-pages/${editionId}`,
      },

      COVERS: {
        PRESIGN: (bookId: string, editionId: string) =>
          `/v1/books/admin/${bookId}/presign-edition-covers/${editionId}`,
      },
    },

    VARIANTS: {
      LIST: (bookId: string, editionId: string) =>
        `/v1/books/admin/${bookId}/get-variants/${editionId}`,
      BY_ID: (bookId: string, editionId: string, variantId: string) =>
        `/v1/books/admin/${bookId}/get-variant/${editionId}/${variantId}`,
      CREATE: (bookId: string, editionId: string) =>
        `/v1/books/admin/${bookId}/add-variant/${editionId}`,
      UPDATE: (bookId: string, editionId: string, variantId: string) =>
        `/v1/books/admin/${bookId}/update-variant/${editionId}/${variantId}`,
      PUBLISH: (bookId: string, editionId: string, variantId: string) =>
        `/v1/books/admin/${bookId}/publish-variant/${editionId}/${variantId}`,
      DELETE: (bookId: string, editionId: string, variantId: string) =>
        `/v1/books/admin/${bookId}/delete-variant/${editionId}/${variantId}`,
      DELETE_BY_ID: (bookId: string, variantId: string) =>
        `/v1/books/admin/${bookId}/delete-variant-by-id/${variantId}`,
    },

    TRANSCRIPTION: {
      UPSERT: (bookId: string, variantId: string) =>
        `/v1/books/admin/${bookId}/save-transcription/${variantId}`,
      LIST: (bookId: string, variantId: string) =>
        `/v1/books/admin/${bookId}/get-transcription/${variantId}`,
      MEDIA_ASSETS: (bookId: string, variantId: string) =>
        `/v1/books/admin/${bookId}/get-media-assets/${variantId}`,
    },

    AUDIO: {
      GENERATE: (bookId: string, variantId: string) =>
        `/v1/books/admin/${bookId}/generate-audio/${variantId}`,
    },

    SUBTITLES: {
      GENERATE: (bookId: string, variantId: string) =>
        `/v1/books/admin/${bookId}/generate-subtitle/${variantId}`,
    },
  },
  PAYMENTS: {
    CREATE_INTENT: "/v1/payments/create-intent",
    JOB: (paymentId: string) => `/v1/payments/${paymentId}/job`,
    ADMIN_STATS: "/v1/payments/admin/stats",
    ADMIN_LIST: "/v1/payments/admin/list",
  },

  ADMIN: {
    DASHBOARD_STATS: "/v1/admin/dashboard/stats",
    DASHBOARD_RECENT_BOOKS: "/v1/admin/dashboard/recent-books",
    DASHBOARD_REVENUE_TRENDS: "/v1/admin/dashboard/revenue-trends",
  },
} as const;

/** @deprecated use ENDPOINTS */
export const ENPOINTS = ENDPOINTS;
