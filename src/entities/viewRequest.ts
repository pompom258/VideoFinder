import { Request } from "express";

export interface VideosViewRequest extends Request {
  query: {
    keyword: string | undefined;
  };
}
