export interface IStorageService {
  /**
   * Dosyayı storage'a kaydeder
   * @param file Buffer veya Stream
   * @param filename Dosya adı
   * @param path Dosya yolu (opsiyonel, otomatik oluşturulabilir)
   * @returns Kaydedilen dosyanın tam yolu
   */
  saveFile(file: Buffer | NodeJS.ReadableStream, filename: string, path?: string): Promise<string>;

  /**
   * Dosyayı storage'dan okur
   * @param path Dosya yolu
   * @returns Dosya buffer'ı
   */
  readFile(path: string): Promise<Buffer>;

  /**
   * Dosyayı storage'dan siler
   * @param path Dosya yolu
   */
  deleteFile(path: string): Promise<void>;

  /**
   * Dosyanın var olup olmadığını kontrol eder
   * @param path Dosya yolu
   * @returns Dosya varsa true
   */
  fileExists(path: string): Promise<boolean>;

  /**
   * Dosya stream'i döndürür (download için)
   * @param path Dosya yolu
   * @returns Readable stream
   */
  getFileStream(path: string): NodeJS.ReadableStream;
}

