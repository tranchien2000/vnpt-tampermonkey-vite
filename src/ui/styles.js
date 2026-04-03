// src/ui/styles.js

export function injectStyles() {
    GM_addStyle(`
        /* Khối Widget tổng hợp bọc toàn bộ, đây sẽ là khối duy chuyển */
        #vnpt-docx-widget { position: fixed; top: 100px; right: 50px; z-index: 999999; font-family: 'Segoe UI', Tahoma, Verdana, sans-serif;}

        /* Nút khi panel ĐÓNG (Biến thành icon tròn to) */
        #vnpt-toggle-btn.btn-closed { 
            position: absolute; right: 0; top: 0;
            width: 46px; height: 46px; font-size: 22px; border-radius: 50%;
            background-color: #1a73e8; color: white; border: none; 
            cursor: pointer; display: flex; align-items: center; justify-content: center; 
            box-shadow: 0 4px 10px rgba(0,0,0,0.3); transition: all 0.2s;
        }
        #vnpt-toggle-btn.btn-closed:hover { transform: scale(1.05); background-color: #1557b0; }

        /* Nút khi panel MỞ (Biến thành nút X nhỏ góc trên header) */
        #vnpt-toggle-btn.btn-opened {
            position: absolute; top: 8px; right: 8px;
            width: 28px; height: 28px; font-size: 14px; border-radius: 6px;
            background-color: #d32f2f; color: white; border: none;
            cursor: pointer; display: flex; align-items: center; justify-content: center;
            z-index: 10; transition: all 0.2s;
        }
        #vnpt-toggle-btn.btn-opened:hover { background-color: #b71c1c; }

        /* Bảng điều khiển */
        #vnpt-export-panel { position: relative; width: 500px; min-width: 300px; max-height: 90vh; resize: both; overflow: hidden; display: flex; flex-direction: column; background: #ffffff; border: 1px solid #e0e0e0; border-radius: 10px; padding: 10px; box-shadow: 0 8px 30px rgba(0,0,0,0.2); transition: none; }
        
        #vnpt-panel-body { display: flex; flex-direction: column; overflow: auto; flex: 1; margin-top: 5px; }

        /* Header vùng kéo thả */
        #vnpt-panel-header { margin: 0 0 10px 0; color: #1a73e8; font-size: 15px; border-bottom: 2px solid #f0f0f0; cursor: move; user-select: none; display: flex; align-items: center; justify-content: space-between; font-weight: bold;}
        #vnpt-panel-header:hover { background: #f8f9fa; border-radius: 4px; }
        .drag-icon { font-size: 14px; cursor: move; opacity: 0.6; }

        /* Box chứa danh sách biến */
        #vnpt-fields-container { max-height: 400px; overflow-y: auto; background: #f8f9fa; border: 1px solid #dadce0; border-radius: 6px; padding: 8px; margin-bottom: 12px; transition: max-height 0.3s ease;}
        .vnpt-field-row { display: flex; gap: 4px; margin-bottom: 6px; align-items: center; }
        .row-drag-handle { cursor: grab; padding: 0 4px; color: #888; font-size: 14px; user-select: none; }
        .row-drag-handle:active { cursor: grabbing; }
        .vnpt-field-row.dragging { opacity: 0.4; }
        .vnpt-field-row.over { background-color: #e3f2fd; border-radius: 4px; }
        .vnpt-field-row input { flex: 1; padding: 5px; border: 1px solid #ccc; border-radius: 4px; font-size: 11px; }
        .vnpt-field-row input.row-chk { flex: 0 0 auto; width: auto; height: auto; margin: 0 4px 0 0; padding: 0; cursor: pointer; }
        .vnpt-field-row input.f-label { flex: 0.55; color: #0056b3; font-weight: bold;}
        .vnpt-field-row input.f-key { display: none; flex: 0.45; font-weight: bold; color: #d63384;}
        .show-ids .vnpt-field-row input.f-key { display: block; }
        .vnpt-btn-hide { background: #f0f0f0; border: 1px solid #ccc; border-radius: 4px; font-size: 10px; cursor: pointer; padding: 3px 6px; }
        .vnpt-btn-hide:hover { background: #e0e0e0; }
        .vnpt-btn-del { background: #fee; color: #d32f2f; border: 1px solid #fcc; padding: 3px 6px; border-radius: 4px; cursor: pointer; font-weight: bold; font-size: 10px;}
        .vnpt-btn-del:hover { background: #fcc; }

        .vnpt-control-group { margin-bottom: 10px; }
        .vnpt-control-group label { display: block; font-weight: 600; font-size: 12px; color: #444; margin-bottom: 4px; }
        .vnpt-control-group input[type="file"], .vnpt-control-group input[type="text"] { width: 100%; box-sizing: border-box; padding: 6px; border: 1px solid #ccc; border-radius: 5px; font-size: 12px;}

        .btn-row { display: flex; gap: 8px; margin-bottom: 8px; flex-wrap: wrap; }
        .vnpt-btn-action { border: none; padding: 7px 12px; font-weight: bold; font-size: 11px; cursor: pointer; border-radius: 5px; transition: background 0.2s; white-space: nowrap;}

        .btn-scan { background: #fbbc04; color: #000; } .btn-scan:hover { background: #f2a500; }
        .btn-toggle-id { background: #e0f7fa; color: #00838f; } .btn-toggle-id:hover { background: #b2ebf2; }
        .btn-add { background: #e8eaed; color: #3c4043; } .btn-add:hover { background: #dadce0; }
        .btn-fill-back { background: #ab47bc; color: #fff; } .btn-fill-back:hover { background: #8e24aa; }
        .btn-clean { background: #ff5252; color: #fff; } .btn-clean:hover { background: #ff1744; }
        .btn-export { width: 100%; background: #1a73e8; color: white; padding: 10px; font-size: 13px; margin-top: 5px;} .btn-export:hover { background: #1557b0; }

        .bottom-export-row { display: flex; gap: 8px; align-items: flex-end; border-top: 1px solid #eee; margin-top: 5px; }
        .bottom-export-row .vnpt-control-group { margin-bottom: 0; flex: 1; min-width: 0; }
        .bottom-export-row .vnpt-control-group label { font-size: 11px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .bottom-export-row .vnpt-control-group input { padding: 4px; font-size: 11px; }
        .bottom-export-row .btn-export { flex: 0 0 40px; height: 26px; padding: 0; margin-top: 0; display: flex; align-items: center; justify-content: center; font-size: 16px;}

        .text-hint { font-size: 11px; color: #666; font-style: italic; text-align: center; margin-bottom: 5px;}

        #vnpt-fields-container::-webkit-scrollbar { width: 5px; }
        #vnpt-fields-container::-webkit-scrollbar-thumb { background-color: #bbb; border-radius: 10px; }
    `);
}
