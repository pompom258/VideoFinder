document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById(
    "search-input",
  ) as HTMLInputElement;
  const searchButton = document.getElementById(
    "search-button",
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
  alert(`Not implemented yet!\nkeyword: ${keyword}`);
}
