import { HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';

import { DownloadService } from './download.service';
import { UploadService } from './upload.service';

@Injectable({ providedIn: 'root' })
export class TransferService {
  constructor(private downloadService: DownloadService, private uploadService: UploadService) {
  }

  async transferFile(url: string, chunkSize = environment.CHUNK_SIZE) {
    const chunks = await this.downloadService.bufferFileByURLWithChunks(url, chunkSize);
    await this.uploadService.startMultipartUpload(url, chunkSize);
    await this.transferChunks(chunks);
    await this.uploadService.finishMultipartUpload();
  }

  private async transferChunks(chunks: AsyncGenerator<HttpResponse<Blob>>) {
    let chunk;
    do {
      chunk = await chunks.next();

      if (chunk.value) {
        await this.uploadService.uploadChunk(chunk.value);
      } else {
        console.log('It is the last chunk');
      }
    } while (!chunk.done)
  }
}
