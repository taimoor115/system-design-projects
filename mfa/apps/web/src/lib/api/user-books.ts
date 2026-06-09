import { clientInstance } from ".";
import { isAxiosError } from "axios";

export interface JobItem {
  job_id: string;
  user_name: string | null;
  book_id: string | null;
  book_title: string | null;
  queue: "image" | "audio" | "video";
  queue_status: "pending" | "processing" | "completed" | "failed";
  status: string | null;
  progress: number;
  created_at: string | null;
  updated_at: string | null;
}

export interface JobsPagination {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

export interface UserBooksListResponse {
  items: JobItem[];
  pagination: JobsPagination;
}

export interface JobStatusResponse {
  id: string;
  user_id: string | null;
  book_id: string | null;
  character_id: string | null;
  payment_id: string | null;
  status: string | null;
  step_label: string | null;
  progress: number | null;
  batch_size: string | null;
  reference_child_hash: string | null;
  child_image_url: string | null;
  video_url: string | null;
  error_message: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface GeneratedPage {
  id: string;
  job_id: string;
  page_number: number;
  generated_image_url: string | null;
  image_hash: string | null;
  is_cached: boolean | null;
  created_at: string | null;
}

export interface JobDownloadResponse {
  job_id: string;
  video_url: string;
  generated_pages: GeneratedPage[];
}

export async function getJobDownloadErrorMessage(
  error: unknown,
): Promise<string> {
  if (isAxiosError(error)) {
    const responseData = error.response?.data;

    if (responseData instanceof Blob) {
      const rawText = await responseData.text();
      try {
        const parsed = JSON.parse(rawText) as { message?: unknown };
        if (typeof parsed.message === 'string' && parsed.message.trim()) {
          return parsed.message.trim();
        }
      } catch {
        if (rawText.trim()) {
          return rawText.trim();
        }
      }
    }

    if (
      responseData &&
      typeof responseData === 'object' &&
      'message' in responseData &&
      typeof (responseData as { message?: unknown }).message === 'string'
    ) {
      return (responseData as { message: string }).message.trim();
    }
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message.trim();
  }

  return 'Could not download video right now.';
}

export async function fetchUserBooks(
  page: number = 1,
  limit: number = 10,
  queue?: string,
  status?: string,
): Promise<UserBooksListResponse> {
  const { data } = await clientInstance.get<{ data: UserBooksListResponse }>(
    "/v1/jobs/user/books",
    {
      params: {
        page,
        limit,
        ...(queue && { queue }),
        ...(status && { status }),
      },
    },
  );
  return data.data;
}

export async function fetchJobStatus(jobId: string): Promise<JobStatusResponse> {
  const { data } = await clientInstance.get<{ data: JobStatusResponse }>(
    `/v1/jobs/${jobId}/status`,
  );
  return data.data;
}

export async function fetchJobDownload(jobId: string): Promise<JobDownloadResponse> {
  const { data } = await clientInstance.get<{ data: JobDownloadResponse }>(
    `/v1/jobs/${jobId}/download`,
  );
  return data.data;
}

export async function fetchJobDownloadFile(jobId: string): Promise<Blob> {
  try {
    const { data } = await clientInstance.get<Blob>(
      `/v1/jobs/${jobId}/download/file`,
      {
        responseType: 'blob',
      },
    );
    return data;
  } catch (error) {
    throw new Error(await getJobDownloadErrorMessage(error));
  }
}

export async function retryJob(jobId: string): Promise<void> {
  await clientInstance.post(`/v1/jobs/${jobId}/retry`);
}
