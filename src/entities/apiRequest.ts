import { Request } from 'express';

export interface PlayApiRequest extends Request {
    query: {
        videoId: string | undefined
    }
}
