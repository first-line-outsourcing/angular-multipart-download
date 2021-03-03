import { HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';

@Injectable({ providedIn: 'root' })
export class UploadService {
  async startMultipartUpload(url: string, chunkSize = environment.CHUNK_SIZE) {
    // TODO: add your code for starting multipart upload
  }

  async uploadChunk(chunk: HttpResponse<Blob>) {
    // TODO: Upload chunk with retry mechanism
    console.log(chunk.headers.get('content-range'));
  }

  async finishMultipartUpload() {
    // TODO: Finish uploading
  }
}
