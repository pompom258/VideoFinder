import sqlite3 from "sqlite3";
import { TABLE_NAME_VIDEOS, TABLE_PATH_VIDEOS } from "./config/constants";

interface Video {
    id: number;
    name: string;
    durationSeconds: number
}

export class VideoStorage {
    private db = new sqlite3.Database(TABLE_PATH_VIDEOS);

    public initialize() {
        this.db.serialize(() => {
            this.db.run(`DROP TABLE IF EXISTS ${TABLE_NAME_VIDEOS}`);
            this.db.run(`CREATE TABLE IF NOT EXISTS ${TABLE_NAME_VIDEOS}(id INTEGER PRIMARY KEY, name TEXT, durationSeconds INTEGER)`);
        });
    }

    public close() {
        this.db.close();
    }

    public add(id: number, name: string, durationSeconds: number) {
        this.db.serialize(() => {
            this.db.run(`INSERT INTO ${TABLE_NAME_VIDEOS}(id, name, durationSeconds) VALUES (?, ?, ?)`, id, name, durationSeconds);
        });
    }

    public printAll() {
        this.db.each(`SELECT * FROM ${TABLE_NAME_VIDEOS}`, (err, row: Video) => {
            console.log(`${row.id}, ${row.name}, ${row.durationSeconds}`);
        });
    }
}