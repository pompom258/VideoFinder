document.addEventListener("DOMContentLoaded", () => {
  Array.from(document.getElementsByClassName("video-thumbnail")).forEach(
    (thumbnail) => {
      let hoverTimer: ReturnType<typeof setTimeout> | null = null;
      let frameTimer: ReturnType<typeof setTimeout> | null = null;
      let isHovering = false;
      let currentFrame = 0;
      const gifUrls: string[] = [];
      const originalSrc = thumbnail.getAttribute("src");
      const maxFrames = 3; // 例: 5分ごとに3コマ（15分）
      const frameInterval = 3000; // ms

      thumbnail.addEventListener("mouseover", () => {
        isHovering = true;
        hoverTimer = setTimeout(() => {
          const videoId = thumbnail.getAttribute("id")?.split("-").pop();
          if (!videoId) return;

          // SSEでGIFパスを取得
          const eventSource = new EventSource(
            `/api/getGifs?videoId=${videoId}&count=${maxFrames}`
          );

          eventSource.onmessage = async (event) => {
            try {
              const data = JSON.parse(event.data);
              if (data.path) {
                gifUrls.push(data.path);
              }
              if (
                isHovering &&
                gifUrls.length > 0 &&
                gifUrls.length <= maxFrames
              ) {
                currentFrame = 0;
                playGifFrames(
                  thumbnail,
                  gifUrls,
                  () => isHovering,
                  frameInterval
                );
              }
            } catch (err) {
              // Ignore JSON parse errors or fetch errors
            }
          };

          eventSource.addEventListener("end", () => {
            eventSource.close();
          });
          eventSource.addEventListener("error", () => {
            eventSource.close();
          });
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
        gifUrls: string[],
        isActive: () => boolean,
        interval: number
      ) {
        if (!isActive() || gifUrls.length === 0) return;
        thumb.setAttribute("src", gifUrls[currentFrame]);
        currentFrame = (currentFrame + 1) % gifUrls.length;
        frameTimer = setTimeout(
          () => playGifFrames(thumb, gifUrls, isActive, interval),
          interval
        );
      }
    }
  );
});
