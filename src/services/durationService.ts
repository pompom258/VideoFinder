import ffmpeg from 'fluent-ffmpeg';

/**
 * 動画の長さを取得する｡
 * @param videoPath 動画ファイルのパス
 * @returns 動画の長さ
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
