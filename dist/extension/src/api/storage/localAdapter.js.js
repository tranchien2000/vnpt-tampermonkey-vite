/**
 * Local storage adapter using FileReader
 */
export const localAdapter = {
  /**
   * Read a file and return its content in the specified format
   * @param {File|Blob} file 
   * @param {string} type - 'arraybuffer', 'base64', 'text', 'dataurl'
   * @returns {Promise<any>}
   */
  download(file, type = 'arraybuffer') {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        let result = e.target.result;
        if (type === 'base64' && typeof result === 'string') {
          // Remove data URL header if present
          result = result.split(',')[1] || result;
        }
        resolve(result);
      };
      
      reader.onerror = (err) => reject(err);

      switch (type.toLowerCase()) {
        case 'arraybuffer':
          reader.readAsArrayBuffer(file);
          break;
        case 'base64':
        case 'dataurl':
          reader.readAsDataURL(file);
          break;
        case 'text':
          reader.readAsText(file);
          break;
        default:
          reject(new Error(`Unsupported read type: ${type}`));
      }
    });
  },

  /**
   * For local, upload just means reading the file to a serializable format
   * @param {File} file 
   * @returns {Promise<string>} base64 data
   */
  async upload(file) {
    return this.download(file, 'base64');
  }
};
