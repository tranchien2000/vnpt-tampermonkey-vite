/**
 * @file styles.js
 * @desc Entry point cho hệ thống CSS của VNPT PRO.
 *       Tất cả CSS hiện đã được tách ra các module nhỏ trong thư mục ./styles/ 
 *       để dễ bảo trì và phân tích.
 */

import { injectStyles as injectStylesInternal } from "/src/ui/styles/index.js.js";

export function injectStyles() {
    injectStylesInternal();
}
