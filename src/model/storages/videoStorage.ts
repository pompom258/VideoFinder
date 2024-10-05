import sqlite3 from "sqlite3";
import { TABLE_NAME_VIDEOS, TABLE_PATH_VIDEOS } from "../../config/constants";

export class VideoStorage {
    private db = new sqlite3.Database(TABLE_PATH_VIDEOS);

    public initialize() {
        this.db.serialize(() => {
            this.db.run(`DROP TABLE IF EXISTS ${TABLE_NAME_VIDEOS}`);
            this.db.run(`CREATE TABLE IF NOT EXISTS ${TABLE_NAME_VIDEOS}(id INTEGER UNIQUE PRIMARY KEY, path TEXT, durationSeconds INTEGER)`);
        });
    }

    public close() {
        this.db.close();
    }

    public add(id: number, path: string, durationSeconds: number) {
        this.db.serialize(() => {
            this.db.run(`INSERT INTO ${TABLE_NAME_VIDEOS}(id, path, durationSeconds) VALUES (?, ?, ?)`, id, path, durationSeconds);
        });
    }

    public async get(id: number): Promise<VideosTableRecord> {
        return new Promise<VideosTableRecord>((resolve, reject) => {
            this.db.get(`SELECT * FROM ${TABLE_NAME_VIDEOS} WHERE id = ?`, id, (err, row: VideosTableRecord) => {
                if (err) {
                    reject(err);
                    return;
                }

                if (row) {
                    resolve(row);
                } else {
                    reject(new Error("The video not found."));
                }
            });
        });
    }

    public async getAll(): Promise<VideosTableRecord[]> {
        return new Promise<VideosTableRecord[]>((resolve, reject) => {
            this.db.all(`SELECT * FROM ${TABLE_NAME_VIDEOS}`, (err, rows: VideosTableRecord[]) => {
                if (err) {
                    reject(err);
                    return;
                }

                if (rows) {
                    resolve(rows);
                } else {
                    reject(new Error("The video not found."));
                }
            });
        })
    }

    public printAll() {
        this.db.each(`SELECT * FROM ${TABLE_NAME_VIDEOS}`, (err, row: VideosTableRecord) => {
            console.log(`${row.id}, ${row.path}, ${row.durationSeconds}`);
        });
    }
}