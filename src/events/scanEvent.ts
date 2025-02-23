document.addEventListener("DOMContentLoaded", async () => {
  const scanButton = document.getElementById(
    "scan-button"
  ) as HTMLButtonElement;
  scanButton.addEventListener("click", async () => {
    const confirmScan = confirm(
      "Are you sure you want to scan for new videos?"
    );
    if (!confirmScan) {
      return;
    }

    try {
      const response = await fetch("/api/scan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ dirPath: undefined }),
      });

      if (response.ok) {
        alert("Scan completed successfully.");
        location.reload();
      } else {
        alert("Failed to scan videos.");
      }
    } catch (error) {
      console.error("Error scanning videos:", error);
      alert("An error occurred while scanning videos.");
    }
  });
});
