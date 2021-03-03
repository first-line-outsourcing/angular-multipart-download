import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';

interface Chunk {
  start: number;
  end: number;
}

@Injectable({ providedIn: 'root' })
export class DownloadService {

  constructor(private httpClient: HttpClient) {
  }

  /**
   * CORS of the storage should have 'Range' header in AllowedHeaders,
   * current origin in AllowedOrigins and GET method in AllowedMethods
   * and return 'Content-Range' header in ExposedHeaders.
   * For doing the same on the backend, CORS isn't required
   */
  async downloadFileWithChunks(url: string, chunkSize = environment.CHUNK_SIZE) {
    const fileSize = await this.getFileSize(url);
    const chunks = this.splitFileWithChunks(fileSize, chunkSize);
    return this.getFileParts(url, chunks);
  }

  private async getFileSize(url: string): Promise<number> {
    const gettingFileSizeResponse = await this.getFilePart(url);
    return this.parseFileSize(gettingFileSizeResponse.headers);
  }

  private async* getFileParts(url: string, chunks: Chunk[]) {
    /**
     * Download chunks to RAM and yield them
     */
    for (const chunk of chunks) {
      try {
        const chunkHeaders = new HttpHeaders().append('Range', `bytes=${chunk.start}-${chunk.end}`);
        yield await this.httpClient.get(url, {
          responseType: 'blob',
          observe: 'response',
          headers: chunkHeaders
        }).toPromise();
      } catch (e) {
        console.error(e);
        // TODO: Add retry mechanism
      }
    }
  }

  private async getFilePart(url: string, chunk: Chunk = { start: 0, end: 0 }) {
    try {
      const gettingFileSizeHeaders = new HttpHeaders().append('Range', `bytes=${chunk.start}-${chunk.end}`);
      return this.httpClient
        .get(url, {
          responseType: 'blob',
          observe: 'response',
          headers: gettingFileSizeHeaders
        })
        .toPromise();
    } catch (e) {
      console.error(e);
      throw new Error(
        'CORS of the storage should have \'Range\' header in AllowedHeaders, ' +
        'current origin in AllowedOrigins and GET method in AllowedMethods'
      );
    }
  }

  private parseFileSize(headers: HttpHeaders): number {
    /**
     * 'Content-Range' looks like 'bytes 0-0/fileSize'
     */
    const contentRange = headers.get('content-range');
    if (!contentRange) {
      throw new Error('CORS of the storage should have \'Content-Range\' header in ExposedHeaders')
    }

    return parseInt(contentRange.split('/')[1], 10);
  }

  private splitFileWithChunks(fileSize: number, chunkSize: number): Chunk[] {
    const chunks: Chunk[] = [];
    let chunkIndex = 0;
    for (let start = 0; start < fileSize; start += chunkSize + 1) {
      const end = start + chunkSize > fileSize ? fileSize : start + chunkSize;
      chunks[chunkIndex] = { start, end };
      chunkIndex++;
    }

    return chunks;
  }
}
