import { Request } from "express";

export interface ScanApiRequest extends Request {
  query: {
    dirPath: string | undefined;
  };
}

export interface SearchApiRequest extends Request {
  query: {
    keyword: string | undefined;
  };
}

export interface PlayApiRequest extends Request {
  query: {
    videoId: string | undefined;
  };
}

export interface GetGifApiRequest extends Request {
  query: {
    videoId: string | undefined;
  };
}
