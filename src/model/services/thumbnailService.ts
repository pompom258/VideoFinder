import fs from 'fs';
import path from 'path';
import ffmpeg from 'fluent-ffmpeg';
import { THUMBNAIL_DIRECTORY, THUMBNAIL_SIZE } from "../../config/constants";

/**
 * 動画のサムネイル画像を生成する。既に生成済みの場合は何もしない。
 * @param videoPath 動画ファイルのパス
 * @param destFileName 生成するサムネイル画像の名称
 * @returns サムネイル画像の絶対パス
 */
export async function generateThumbnailFile(videoPath: string, destFileName: string): Promise<string> {
    ensureThumbnailDirectoryExists();

    const outPath = path.join(THUMBNAIL_DIRECTORY, destFileName);
    return new Promise<string>((resolve, reject) => {
        if (fs.existsSync(outPath)) {
            console.log(`Thumbnail for the video '${videoPath}' already exists, so generation is skipped.`);
            resolve(outPath);
            return;
        }

        console.log(`Generating thumbnail for the video '${videoPath}'...`);
        ffmpeg(videoPath)
            .screenshots({
                filename: destFileName,
                count: 1,
                folder: THUMBNAIL_DIRECTORY,
                size: THUMBNAIL_SIZE,
            })
            .on("end", () => {
                console.log(`Thumbnail generated for the video '${videoPath}' as ${destFileName}.`);
                resolve(outPath);
            })
            .on("error", (err) => {
                console.error(`An error occurred while generating the thumbnail for the video '${videoPath}'.`);
                ensureThumbnailFileNotExists(outPath);
                reject(err);
            });
    });
}

function ensureThumbnailDirectoryExists() {
    if (!fs.existsSync(THUMBNAIL_DIRECTORY)) {
        fs.mkdirSync(THUMBNAIL_DIRECTORY, { recursive: true });
    }
}

function ensureThumbnailFileNotExists(path: string) {
    if (fs.existsSync(path)) {
        fs.rmSync(path);
    }
}
