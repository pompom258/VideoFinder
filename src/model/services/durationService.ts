import ffmpeg from 'fluent-ffmpeg';

/**
 * 動画の長さを取得する。
 *
 * @param videoPath 動画ファイルのパス
 * @returns 動画の長さ(秒)
 */
export async function getVideoDuration(videoPath: string): Promise<number> {
    return new Promise<number>((resolve, reject) => {
        ffmpeg.ffprobe(videoPath, (err, data) => {
            if (err) {
                console.log(`An error occurred while retrieving the duration of the video '${videoPath}'.`);
                reject(err);
                return;
            }

            const durationInSeconds = data.format?.duration;
            if (typeof durationInSeconds === 'number') {
                resolve(durationInSeconds);
            } else {
                reject(new Error(`The duration of the video '${videoPath}' could not be retrieved.`));
            }
        });
    });
}

/**
 * 動画の長さを文字列形式に変換して返却する｡
 *
 * 変換後の文字列形式は動画の長さによって可変する｡
 * * 1時間未満の場合: **mm:ss**
 * * 1時間以上の場合: **HH:mm:ss**
 * @param durationInSeconds 動画の長さ(秒)
 * @returns 動画の長さ(文字列形式)
 */
export function formatDuration(durationInSeconds: number): string {
    const hours = Math.floor(durationInSeconds / 3600);
    const minutes = Math.floor((durationInSeconds % 3600) / 60);
    const seconds = Math.floor(durationInSeconds % 60);

    if (hours > 0) {
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    } else {
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
}
