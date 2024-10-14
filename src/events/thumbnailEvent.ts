document.addEventListener('DOMContentLoaded', () => {
    Array.from(document.getElementsByClassName("video-thumbnail")).forEach(thumbnail => {
        let hoverTimer: ReturnType<typeof setTimeout> | null = null;

        thumbnail.addEventListener('mouseover', () => {
            hoverTimer = setTimeout(() => {
                const videoId = thumbnail.getAttribute("id")?.split("-").pop();
                playAnimationThumbnail(videoId!);
            }, 350);
        });

        thumbnail.addEventListener('mouseout', () => {
            if (hoverTimer) {
                clearTimeout(hoverTimer);
            }
        })
    })
});

function playAnimationThumbnail(id: string): void {
    console.log(`Not implemented yet!\id: ${id}`);
}
