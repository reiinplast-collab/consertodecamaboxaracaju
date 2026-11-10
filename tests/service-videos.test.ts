import { describe, expect, test } from "bun:test";
import { normalizeServiceVideos, SERVICE_VIDEO_SLOTS } from "../src/lib/service-videos";

describe("Vídeos de serviços", () => {
  test("oferece exatamente os cinco espaços solicitados", () => {
    expect(SERVICE_VIDEO_SLOTS).toEqual([1, 2, 3, 4, 5]);
    expect(normalizeServiceVideos([]).map((video) => video.slot)).toEqual([1, 2, 3, 4, 5]);
  });
  test("edição preserva o vídeo no espaço correspondente", () => {
    const videos = normalizeServiceVideos([{ slot: 3, title: "Reforma", path: "reforma.mp4" }]);
    expect(videos[2]).toEqual({ slot: 3, title: "Reforma", path: "reforma.mp4" });
    expect(videos[0].path).toBeNull();
  });
});