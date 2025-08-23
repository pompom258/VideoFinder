/**
 * index値をhh:mm:ss形式の開始時刻文字列に変換
 */
export function indexToStartTime(index: number, intervalMinutes: number = 5): string {
  const startSeconds = index * intervalMinutes * 60;
  const hours = String(Math.floor(startSeconds / 3600)).padStart(2, "0");
  const minutes = String(Math.floor((startSeconds % 3600) / 60)).padStart(2, "0");
  const seconds = String(startSeconds % 60).padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
}
