import fs from 'fs';
import path from 'path';
import ffmpeg from 'fluent-ffmpeg';
import { THUMBNAIL_DIRECTORY, THUMBNAIL_SIZE } from "../config/constants";

/**
 * 動画のサムネイル画像を生成する
 * @param videoPath 動画ファイルのパス
 * @param destFileName 生成するサムネイル画像の名称
 * @returns サムネイル画像の絶対パス
 */
export async function generateThumbnailFile(videoPath: string, destFileName: string): Promise<string> {
    ensureThumbnailDirectoryExists();

    return new Promise<string>((resolve, reject) => {
        ffmpeg(videoPath)
            .screenshots({
                filename: destFileName,
                count: 1,
                folder: THUMBNAIL_DIRECTORY,
                size: THUMBNAIL_SIZE,
            })
            .on("end", () => {
                resolve(path.join(THUMBNAIL_DIRECTORY, destFileName));
            })
            .on("error", reject);
    });
}

function ensureThumbnailDirectoryExists() {
    if (!fs.existsSync(THUMBNAIL_DIRECTORY)) {
        fs.mkdirSync(THUMBNAIL_DIRECTORY, { recursive: true });
    }
}
