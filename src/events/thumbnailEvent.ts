document.addEventListener("DOMContentLoaded", () => {
  Array.from(document.getElementsByClassName("video-thumbnail")).forEach(
    (thumbnail) => {
      let hoverTimer: ReturnType<typeof setTimeout> | null = null;
      const originalSrc = thumbnail.getAttribute("src");

      thumbnail.addEventListener("mouseover", () => {
        hoverTimer = setTimeout(() => {
          const videoId = thumbnail.getAttribute("id")?.split("-").pop();
          playAnimationThumbnail(videoId!, thumbnail);
        }, 350);
      });

      thumbnail.addEventListener("mouseout", () => {
        if (hoverTimer) {
          clearTimeout(hoverTimer);
        }
        if (originalSrc) {
          thumbnail.setAttribute("src", originalSrc);
        }
      });
    }
  );
});

function playAnimationThumbnail(videoId: string, thumbnail: Element): void {
  const url = new URL(`/api/getGif?videoId=${videoId}`, document.baseURI);
  fetch(url.href)
    .then(async (response) => {
      if (!response.ok) {
        const json = await response.json();
        throw new Error(`getGIf API error (${json.error})`);
      }

      return response.blob();
    })
    .then((blob) => {
      thumbnail.setAttribute("src", URL.createObjectURL(blob));
    })
    .catch((err) => {
      console.error(`Error occurred in getGif event handler: ${err}`);
    });
}
