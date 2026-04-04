// src/features/cloudTemplates.js

import { listCloudTemplates, uploadCloudTemplate, downloadCloudTemplateArrayBuffer, deleteCloudTemplate } from '../api/firebase.js';
import { showToast } from '../ui/toast.js';
import { renderTemplateManager } from './templateManager.js';

export function renderCloudTemplateSection(container, headerWrap, onSelectTemplate, currentActiveName = null) {
  // Clear any existing cloud buttons in the header
  const oldCloudControls = headerWrap.querySelectorAll('.cloud-control-btn');
  oldCloudControls.forEach(el => el.remove());
  
  let cloudSection = container.querySelector('.vnpt-cloud-tpl-section');
  if (!cloudSection) {
    cloudSection = document.createElement('div');
    cloudSection.className = 'vnpt-cloud-tpl-section';
    cloudSection.style.cssText = 'margin-top: 10px; border-top: 1px dashed #ccc; padding-top: 5px;';
    container.appendChild(cloudSection);
  } else {
    cloudSection.innerHTML = ''; // clear old content
  }

  // Tạo các nút điều khiển Cloud gắn thẳng vào `headerWrap`
  const uploadBtn = document.createElement('button');
  uploadBtn.className = 'cloud-control-btn';
  uploadBtn.textContent = '⬆ Up';
  uploadBtn.title = 'Tải file .docx lên Cloud';
  uploadBtn.style.cssText = 'font-size:10px;padding:2px 5px;border:1px solid #28a745;background:#e8f5e9;color:#28a745;border-radius:4px;cursor:pointer;font-weight:600;display:block;';
  uploadBtn.onclick = () => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.docx';
      input.onchange = async (e) => {
          if (e.target.files && e.target.files[0]) {
              await handleUploadToCloud(e.target.files[0], onSelectTemplate, container);
              // Lưu ý: sau khi upload, templateManager gọi renderTemplateManager sẽ reset DOM, 
              // renderCloudTemplateSection sẽ tự được gọi lại.
          }
      };
      input.click();
  };

  const syncBtn = document.createElement('button');
  syncBtn.className = 'cloud-control-btn';
  syncBtn.textContent = '⬇ Down';
  syncBtn.style.cssText = 'font-size:10px;padding:2px 5px;border:1px solid #17a2b8;background:#e0f7fa;color:#00838f;border-radius:4px;cursor:pointer;font-weight:600;display:block;';
  syncBtn.onclick = async () => {
    showToast('⬇ Đang tải danh sách...', '#17a2b8');
    await loadAndRenderCloudList(contentWrapper, onSelectTemplate, currentActiveName);
  };

  // Insert nút thẳng lên đầu
  headerWrap.insertBefore(syncBtn, headerWrap.firstChild);
  headerWrap.insertBefore(uploadBtn, headerWrap.firstChild);

  // Content wrapper
  const contentWrapper = document.createElement('div');
  contentWrapper.style.display = 'block';
  cloudSection.appendChild(contentWrapper);

  // Fetch and render immediately
  loadAndRenderCloudList(contentWrapper, onSelectTemplate, currentActiveName);
}

async function loadAndRenderCloudList(wrapper, onSelectTemplate, currentActiveName) {
  wrapper.innerHTML = '';
  const templates = await listCloudTemplates();

  if (templates.length === 0) {
    return;
  }

  const listWrapper = document.createElement('div');
  listWrapper.style.cssText = 'display:flex;flex-wrap:wrap;gap:2px;';

  templates.forEach(tpl => {
    const row = document.createElement('div');
    row.style.cssText = 'display:flex;align-items:center;gap:4px;padding:3px 6px;background:#e3f2fd;border:1px solid #bbdefb;border-radius:15px;cursor:pointer;';
    row.title = tpl.description || tpl.name;

    const nameEl = document.createElement('span');
    nameEl.textContent = tpl.name;
    nameEl.style.cssText = 'font-size:11px;font-weight:600;color:#0d47a1;white-space:nowrap;padding-left:4px;';

    row.onclick = async () => {
      showToast(`☁️ Đang tải ${tpl.name}...`, '#1976d2');
      const arrayBuffer = await downloadCloudTemplateArrayBuffer(tpl.id);
      if (arrayBuffer) {
          if (onSelectTemplate) onSelectTemplate(arrayBuffer, tpl.name);
          showToast(`✅ Đã nạp ${tpl.name}`, '#28a745');
      } else {
          showToast(`❌ Lỗi tải arraybuffer`, '#dc3545');
      }
    };

    const downloadBtn = document.createElement('button');
    downloadBtn.innerHTML = '⬇️';
    downloadBtn.title = 'Tải file gốc về máy tính';
    downloadBtn.style.cssText = 'font-size:10px;padding:1px 4px;border:none;background:none;cursor:pointer;margin-left:auto;';
    downloadBtn.onclick = async (e) => {
        e.stopPropagation();
        showToast('Đang tạo file tải xuống...', '#1976d2');
        const arrayBuffer = await downloadCloudTemplateArrayBuffer(tpl.id);
        if (arrayBuffer) {
            const blob = new Blob([arrayBuffer], { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = tpl.name + '.docx';
            document.body.appendChild(a);
            a.click();
            setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 100);
        } else {
            showToast('Lỗi lấy dữ liệu tải xuống', '#dc3545');
        }
    };

    const delBtn = document.createElement('button');
    delBtn.innerHTML = '✕';
    delBtn.style.cssText = 'font-size:10px;padding:1px 4px;border:none;background:none;color:#d32f2f;cursor:pointer;margin-left:2px;';
    delBtn.onclick = async (e) => {
      e.stopPropagation();
      if (confirm(`Xoá template cloud "${tpl.name}"?`)) {
        await deleteCloudTemplate(tpl.id);
        loadAndRenderCloudList(wrapper, onSelectTemplate, currentActiveName);
      }
    };

    row.appendChild(nameEl);
    row.appendChild(downloadBtn);
    row.appendChild(delBtn);
    listWrapper.appendChild(row);
  });

  wrapper.appendChild(listWrapper);
}

// Hàm helpers gọi từ templateManager.js để upload local -> cloud
export async function handleUploadToCloud(file, onSelectTemplate, container) {
  const name = prompt(`Tên template trên Cloud:`, file.name.replace(/\.docx$/i, ''));
  if (!name || !name.trim()) return;

  const desc = prompt('Mô tả (tuỳ chọn):', '');

  showToast(`☁️ Đang xử lý file...`, '#1976d2');
  try {
    const base64Data = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = err => reject(err);
    });

    showToast(`☁️ Đang upload ${name}...`, '#1976d2');
    const id = await uploadCloudTemplate(base64Data, name.trim(), desc);
    if (id) {
        showToast(`✅ Upload thành công!`, '#28a745');
        // render lại cả cục (local + cloud)
        renderTemplateManager(container, onSelectTemplate); 
    }
  } catch (err) {
    showToast(`❌ Lỗi upload: ${err.message}`, '#dc3545');
  }
}
