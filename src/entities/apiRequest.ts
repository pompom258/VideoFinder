import { Request } from 'express';

export interface ScanApiRequest extends Request {
    query: {
        dirPath: string | undefined
    }
}

export interface PlayApiRequest extends Request {
    query: {
        videoId: string | undefined
    }
}
