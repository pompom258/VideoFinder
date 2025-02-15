import fs from "fs";
import path from "path";

import { VIDEO_DIRECTORY, VIDEO_EXTENSIONS } from "../../config/constants";

/**
 * 動画ファイルの検索を行う。サブフォルダ配下も検索対象とする。
 * @param dir 検索対象ディレクトリのパス
 * @returns 動画ファイルの絶対パスを要素として格納する配列
 */
export function findVideoFilesRecurse(dir: string = VIDEO_DIRECTORY): string[] {
  let result: string[] = [];

  fs.readdirSync(dir).forEach((file) => {
    const filePath: string = path.join(dir, file);
    const stat: fs.Stats = fs.statSync(filePath);

    if (stat.isDirectory()) {
      // サブディレクトリを検知した場合、再帰的に検索を行う
      result = result.concat(findVideoFilesRecurse(filePath));
    } else {
      const ext: string = path.extname(file).toLowerCase();

      if (VIDEO_EXTENSIONS.includes(ext)) {
        result.push(filePath);
      }
    }
  });

  return result;
}

/**
 * ファイルの存在チェックを行う
 * @param path 確認対象ファイルのパス
 * @returns チェック結果
 */
export function isFileExists(path: string): boolean {
  return fs.existsSync(path);
}
