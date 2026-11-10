export type ServiceVideo = { slot: number; title: string; path: string | null };
export const SERVICE_VIDEO_SLOTS = [1, 2, 3, 4, 5] as const;
export const SERVICE_VIDEO_KEY = "service_videos";
export const SERVICE_VIDEO_BUCKET = "service-videos";

export function normalizeServiceVideos(value: ServiceVideo[]): ServiceVideo[] {
  return SERVICE_VIDEO_SLOTS.map((slot) => {
    const video = Array.isArray(value) ? value.find((item) => item?.slot === slot) : undefined;
    return { slot, title: typeof video?.title === "string" ? video.title : "", path: typeof video?.path === "string" ? video.path : null };
  });
}