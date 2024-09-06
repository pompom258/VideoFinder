document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById("search-input") as HTMLInputElement;
    const searchButton = document.getElementById("search-button") as HTMLButtonElement;

    searchButton?.addEventListener('click', performSearch);
    searchButton?.addEventListener('keypress', (e: KeyboardEvent) => {
        if (e.key === 'Enter') {
            performSearch();
        }
    })
});

function performSearch(): void {
    alert("Not implemented yet!");
}
