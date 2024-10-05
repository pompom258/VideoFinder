document.addEventListener('DOMContentLoaded', () => {
    Array.from(document.getElementsByClassName("video-thumbnail")).forEach(thumbnail => {
        thumbnail.addEventListener('click', () => {
            const id = thumbnail.getAttribute("id")?.split("-").pop();
            playVideo(id!);
        });
    })
});

function playVideo(videoId: string): void {
    const url = new URL(`/api/play?videoId=${videoId}`, document.baseURI);
    fetch(url.href)
        .then(response => {
            if (!response.ok) {
                throw new Error("play API error");
            }
        })
        .catch(err => {
            console.error(`Error occured in playVideo event handler: ${err}`);
        });
}
