export interface VideosApiResponse {
  id: number;
  videoName: string;
  videoPath: string;
  thumbnailName: string;
  thumbnailPath: string;
  videoDuration: string;
  isThumbnailGenerationSucceed: boolean;
}
