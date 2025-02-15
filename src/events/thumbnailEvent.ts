document.addEventListener("DOMContentLoaded", () => {
  Array.from(document.getElementsByClassName("video-thumbnail")).forEach(
    (thumbnail) => {
      let hoverTimer: ReturnType<typeof setTimeout> | null = null;

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
      });
    },
  );
});

function playAnimationThumbnail(videoId: string, thumbnail: Element): void {
  const url = new URL(`/api/getGif?videoId=${videoId}`, document.baseURI);
  fetch(url.href)
    .then((response) => {
      if (!response.ok) {
        throw new Error("getGIf API error");
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
