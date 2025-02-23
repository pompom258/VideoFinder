import { VideosApiResponse } from "../entities/apiResponse.js";

document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById(
    "search-input"
  ) as HTMLInputElement;
  const searchButton = document.getElementById(
    "search-button"
  ) as HTMLButtonElement;

  searchButton?.addEventListener("click", () => {
    performSearch(searchInput.value);
  });
  searchInput?.addEventListener("keypress", (e: KeyboardEvent) => {
    if (e.key === "Enter") {
      performSearch(searchInput.value);
    }
  });
});

function performSearch(keyword: string): void {
  const url = new URL(
    `/api/videos?keyword=${encodeURIComponent(keyword)}`,
    document.baseURI
  );
  fetch(url.href)
    .then((response) => {
      if (!response.ok) {
        throw new Error("videos API error");
      }
      return response.json();
    })
    .then((data) => {
      displaySearchResults(data);
    })
    .catch((err) => {
      console.error(`Error occurred in search event handler: ${err}`);
    });
}

function displaySearchResults(results: Array<VideosApiResponse>): void {
  const videoGallery = document.querySelector(
    ".video-gallery"
  ) as HTMLDivElement;
  if (!videoGallery) return;

  videoGallery.innerHTML = ""; // Clear previous results

  results.forEach((result: VideosApiResponse) => {
    const thumbnailSrc = result.isThumbnailGenerationSucceed
      ? `/thumbnails/${encodeURIComponent(result.thumbnailName)}`
      : `/default/${encodeURIComponent("thumbnail_default.png")}`;

    const resultElement = document.createElement("div");
    resultElement.className = "video-item";
    resultElement.id = `"video-${result.id}`;
    resultElement.innerHTML = `
      <div class="thumbnail-container">
          <img src="${thumbnailSrc}" alt="${result.videoPath}" title="${result.videoName}" class="video-thumbnail" id="video-thumbnail-${result.id}">
          <span class="video-duration">${result.videoDuration}</span>
      </div>
      <div class="video-info">
        <p class="video-title" id="video-title-${result.id}">${result.videoName}</p>
        <p class="video-path">${result.videoPath}</p>
      </div>
    `;
    videoGallery.appendChild(resultElement);
  });
}
