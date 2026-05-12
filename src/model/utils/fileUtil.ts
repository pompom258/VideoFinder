import fs from "fs";
import path from "path";

import { VIDEO_DIRECTORIES, VIDEO_EXTENSIONS } from "../../config/constants.js";

/**
 * すべての検索対象ディレクトリから動画ファイルを検索する。
 * @returns 動画ファイルの絶対パスを要素として格納する配列
 */
export function findAllVideoFiles(): string[] {
  let allFiles: string[] = [];
  const visited = new Set<string>();

  VIDEO_DIRECTORIES.forEach((dir) => {
    if (fs.existsSync(dir)) {
      allFiles = allFiles.concat(findVideoFilesRecurse(dir, visited));
    } else {
      console.warn(`Directory does not exist: ${dir}`);
    }
  });

  return allFiles;
}

/**
 * 動画ファイルの検索を行う。サブフォルダ配下も検索対象とする。
 * 循環参照（シンボリックリンク等）を避けるため、実パスを追跡する。
 * @param dir 検索対象ディレクトリのパス
 * @param visited すでに訪問したディレクトリの実パスのセット
 * @returns 動画ファイルの絶対パスを要素として格納する配列
 */
export function findVideoFilesRecurse(
  dir: string,
  visited: Set<string> = new Set<string>()
): string[] {
  let result: string[] = [];

  try {
    const realPath = fs.realpathSync(dir);
    if (visited.has(realPath)) {
      return [];
    }
    visited.add(realPath);

    fs.readdirSync(dir).forEach((file) => {
      const filePath: string = path.join(dir, file);
      const stat: fs.Stats = fs.statSync(filePath);

      if (stat.isDirectory()) {
        // サブディレクトリを検知した場合、再帰的に検索を行う
        result = result.concat(findVideoFilesRecurse(filePath, visited));
      } else {
        const ext: string = path.extname(file).toLowerCase();

        if (VIDEO_EXTENSIONS.includes(ext)) {
          result.push(filePath);
        }
      }
    });
  } catch (error) {
    console.error(`Error scanning directory ${dir}:`, error);
  }

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
