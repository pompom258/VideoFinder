import fs from 'fs';
import path from 'path';
import ffmpeg from 'fluent-ffmpeg';
import { THUMBNAIL_DIRECTORY, THUMBNAIL_SIZE } from "../config/constants";

/**
 * 動画のサムネイル画像を生成する
 * @param videoPath 動画ファイルのパス
 * @param destDir 生成先ディレクトリパス
 */
export function generateThumbnailFile(videoPath: string, destDir: string = THUMBNAIL_DIRECTORY) {
    ensureThumbnailDirectoryExists();
    ffmpeg(videoPath).screenshots({
        filename: `thumbnail-${path.parse(videoPath).name.replace(/ /g, "_")}.png`,
        count: 1,
        folder: destDir,
        size: THUMBNAIL_SIZE,
    });
}

function ensureThumbnailDirectoryExists() {
    if (!fs.existsSync(THUMBNAIL_DIRECTORY)) {
        fs.mkdirSync(THUMBNAIL_DIRECTORY, { recursive: true });
    }
}
