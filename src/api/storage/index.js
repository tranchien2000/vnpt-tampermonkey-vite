import { localAdapter } from './localAdapter.js';

const adapters = {
  local: localAdapter
};

export const storage = {
  /**
   * Get adapter by name
   * @param {string} type 
   * @returns {object}
   */
  getAdapter(type) {
    const adapter = adapters[type];
    if (!adapter) throw new Error(`Storage adapter not found: ${type}`);
    return adapter;
  },

  /**
   * Unified upload
   * @param {string} type - 'local' or 'firebase'
   * @param {any} data 
   * @param {object} options 
   */
  async upload(type, data, options = {}) {
    return await this.getAdapter(type).upload(data, options);
  },

  /**
   * Unified download
   * @param {string} type - 'local' or 'firebase'
   * @param {any} source 
   * @param {object} options 
   */
  async download(type, source, options = {}) {
    return await this.getAdapter(type).download(source, options.type || 'arraybuffer');
  }
};
