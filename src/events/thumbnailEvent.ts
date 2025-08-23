document.addEventListener("DOMContentLoaded", () => {
  Array.from(document.getElementsByClassName("video-thumbnail")).forEach(
    (thumbnail) => {
      let hoverTimer: ReturnType<typeof setTimeout> | null = null;
      let frameTimer: ReturnType<typeof setTimeout> | null = null;
      let isHovering = false;
      let gifBlobs: string[] = [];
      let currentFrame = 0;
      const originalSrc = thumbnail.getAttribute("src");
      const maxFrames = 3; // 例: 5分ごとに3コマ（15分）
      const frameInterval = 3000; // ms

      thumbnail.addEventListener("mouseover", () => {
        isHovering = true;
        hoverTimer = setTimeout(async () => {
          const videoId = thumbnail.getAttribute("id")?.split("-").pop();
          if (!videoId) return;
          gifBlobs = await preloadGifFrames(videoId, maxFrames);
          if (!isHovering || gifBlobs.length === 0) return;
          currentFrame = 0;
          playGifFrames(thumbnail, gifBlobs, () => isHovering, frameInterval);
        }, 350);
      });

      thumbnail.addEventListener("mouseout", () => {
        isHovering = false;
        if (hoverTimer) clearTimeout(hoverTimer);
        if (frameTimer) clearTimeout(frameTimer);
        if (originalSrc) thumbnail.setAttribute("src", originalSrc);
      });

      // コマ送り再生
      function playGifFrames(
        thumb: Element,
        blobs: string[],
        isActive: () => boolean,
        interval: number
      ) {
        if (!isActive() || blobs.length === 0) return;
        thumb.setAttribute("src", blobs[currentFrame]);
        currentFrame = (currentFrame + 1) % blobs.length;
        frameTimer = setTimeout(
          () => playGifFrames(thumb, blobs, isActive, interval),
          interval
        );
      }
    }
  );
});

// 複数のGIFをプリロード
async function preloadGifFrames(
  videoId: string,
  maxFrames: number
): Promise<string[]> {
  const blobUrls: string[] = [];
  for (let i = 0; i < maxFrames; i++) {
    try {
      const url = new URL(
        `/api/getGif?videoId=${videoId}&index=${i}`,
        document.baseURI
      );
      const response = await fetch(url.href);
      if (!response.ok) {
        const json = await response.json();
        throw new Error(`getGif API error (${json.error})`);
      }
      const blob = await response.blob();
      blobUrls.push(URL.createObjectURL(blob));
    } catch (err) {
      // 途中で動画が終わっている場合などはbreak
      break;
    }
  }
  return blobUrls;
}
