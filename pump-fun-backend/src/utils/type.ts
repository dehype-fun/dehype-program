import { Request } from 'express';
import { UploadedFile } from 'multer';

export interface priceFeedInfo {
  price: number,
  time: Date,
}
export type CandlePrice = {
  open: number;
  high: number;
  low: number;
  close: number;
  time: number;
};

export interface UploadRequest extends Request {
  file?: UploadedFile;
}