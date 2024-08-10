import fs from 'fs';
import ffmpeg from 'fluent-ffmpeg';
import { THUMBNAIL_DIRECTORY, THUMBNAIL_SIZE } from "../config/constants";

/**
 * 動画のサムネイル画像を生成する
 * @param videoPath 動画ファイルのパス
 * @param destFileName サムネイル画像の名称
 * @returns サムネイル画像の名称
 */
export function generateThumbnailFile(videoPath: string, destFileName: string) {
    ensureThumbnailDirectoryExists();

    ffmpeg(videoPath).screenshots({
        filename: destFileName,
        count: 1,
        folder: THUMBNAIL_DIRECTORY,
        size: THUMBNAIL_SIZE,
    });
}

function ensureThumbnailDirectoryExists() {
    if (!fs.existsSync(THUMBNAIL_DIRECTORY)) {
        fs.mkdirSync(THUMBNAIL_DIRECTORY, { recursive: true });
    }
}
