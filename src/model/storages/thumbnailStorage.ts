import sqlite3 from "sqlite3";
import { TABLE_NAME_THUMBNAILS, TABLE_PATH_THUMBNAILS } from "../../config/constants";

export class ThumbnailStorage {
    private db = new sqlite3.Database(TABLE_PATH_THUMBNAILS);

    public initialize() {
        this.db.serialize(() => {
            this.db.run(`DROP TABLE IF EXISTS ${TABLE_NAME_THUMBNAILS}`);
            this.db.run(`CREATE TABLE IF NOT EXISTS ${TABLE_NAME_THUMBNAILS}(id INTEGER UNIQUE PRIMARY KEY, path TEXT)`);
        });
    }

    public close() {
        this.db.close();
    }

    public add(id: number, path: string) {
        this.db.serialize(() => {
            this.db.run(`INSERT INTO ${TABLE_NAME_THUMBNAILS}(id, path) VALUES (?, ?)`, id, path);
        });
    }

    public async get(id: number): Promise<ThumbnailsTableRecord> {
        return new Promise<ThumbnailsTableRecord>((resolve, reject) => {
            this.db.get(`SELECT * FROM ${TABLE_NAME_THUMBNAILS} WHERE id = ?`, id, (err, row: ThumbnailsTableRecord) => {
                if (err) {
                    reject(err);
                    return;
                }

                if (row) {
                    resolve(row);
                } else {
                    reject(new Error("The thumbnail not found."));
                }
            });
        });
    }

    public async getAll(): Promise<ThumbnailsTableRecord[]> {
        return new Promise<ThumbnailsTableRecord[]>((resolve, reject) => {
            this.db.all(`SELECT * FROM ${TABLE_NAME_THUMBNAILS}`, (err, rows: ThumbnailsTableRecord[]) => {
                if (err) {
                    reject(err);
                    return;
                }

                if (rows) {
                    resolve(rows);
                } else {
                    reject(new Error("The thumbnail not found."));
                }
            });
        })
    }

    public printAll() {
        this.db.each(`SELECT * FROM ${TABLE_NAME_THUMBNAILS}`, (err, row: ThumbnailsTableRecord) => {
            console.log(`${row.id}, ${row.path}`);
        });
    }
}