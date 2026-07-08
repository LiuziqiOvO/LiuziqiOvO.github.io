const fileList = document.querySelector('#fileList');
const filterInput = document.querySelector('#filterInput');
const editorInput = document.querySelector('#editorInput');
const currentPath = document.querySelector('#currentPath');
const dirtyFlag = document.querySelector('#dirtyFlag');
const saveBtn = document.querySelector('#saveBtn');
const refreshBtn = document.querySelector('#refreshBtn');
const statusText = document.querySelector('#statusText');
const newRoot = document.querySelector('#newRoot');
const newTitle = document.querySelector('#newTitle');
const newSlug = document.querySelector('#newSlug');
const newBtn = document.querySelector('#newBtn');

let groups = [];
let activePath = '';
let savedContent = '';

function setStatus(message) {
  statusText.textContent = message;
}

function setDirty(isDirty) {
  dirtyFlag.hidden = !isDirty;
  saveBtn.disabled = !activePath || !isDirty;
}

async function api(path, options = {}) {
  const response = await fetch(path, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Request failed');
  }
  return data;
}

function visibleFiles(files) {
  const query = filterInput.value.trim().toLowerCase();
  if (!query) return files;
  return files.filter((file) => file.path.toLowerCase().includes(query));
}

function renderFiles() {
  fileList.innerHTML = '';
  for (const group of groups) {
    const files = visibleFiles(group.files);
    if (files.length === 0) continue;

    const wrapper = document.createElement('section');
    wrapper.className = 'file-group';

    const heading = document.createElement('h2');
    heading.textContent = group.label;
    wrapper.appendChild(heading);

    for (const file of files) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = `file-button${file.path === activePath ? ' active' : ''}`;
      button.textContent = file.path.replace(`${group.root}/`, '');
      button.title = file.path;
      button.addEventListener('click', () => openFile(file.path));
      wrapper.appendChild(button);
    }

    fileList.appendChild(wrapper);
  }
}

async function loadFiles() {
  setStatus('加载文件列表...');
  const data = await api('/api/files');
  groups = data.groups;
  newRoot.innerHTML = '';
  for (const root of data.roots) {
    const option = document.createElement('option');
    option.value = root.relativePath;
    option.textContent = root.label;
    newRoot.appendChild(option);
  }
  renderFiles();
  setStatus('文件列表已更新');
}

async function openFile(path) {
  if (editorInput.value !== savedContent && activePath) {
    const shouldDiscard = window.confirm('当前文件还没保存，确认切换吗？');
    if (!shouldDiscard) return;
  }

  setStatus('读取文件...');
  const data = await api(`/api/file?path=${encodeURIComponent(path)}`);
  activePath = data.path;
  savedContent = data.content;
  editorInput.value = data.content;
  currentPath.textContent = activePath;
  setDirty(false);
  renderFiles();
  setStatus('已打开');
}

async function saveFile() {
  if (!activePath) return;
  setStatus('保存中...');
  const data = await api('/api/file', {
    method: 'POST',
    body: JSON.stringify({ path: activePath, content: editorInput.value }),
  });
  savedContent = editorInput.value;
  setDirty(false);
  setStatus(`已保存 ${new Date(data.updatedAt).toLocaleTimeString()}`);
}

function slugFromTitle(title) {
  return title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function createFile() {
  const title = newTitle.value.trim();
  const slug = (newSlug.value.trim() || slugFromTitle(title));
  if (!title || !slug) {
    setStatus('需要标题和 slug');
    return;
  }

  setStatus('新建文件...');
  const data = await api('/api/new', {
    method: 'POST',
    body: JSON.stringify({ root: newRoot.value, title, slug }),
  });
  newTitle.value = '';
  newSlug.value = '';
  await loadFiles();
  await openFile(data.path);
}

editorInput.addEventListener('input', () => {
  setDirty(editorInput.value !== savedContent);
});

filterInput.addEventListener('input', renderFiles);
saveBtn.addEventListener('click', saveFile);
refreshBtn.addEventListener('click', loadFiles);
newBtn.addEventListener('click', createFile);

newTitle.addEventListener('input', () => {
  if (!newSlug.value.trim()) {
    newSlug.value = slugFromTitle(newTitle.value);
  }
});

window.addEventListener('keydown', (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 's') {
    event.preventDefault();
    saveFile();
  }
});

window.addEventListener('beforeunload', (event) => {
  if (editorInput.value === savedContent) return;
  event.preventDefault();
  event.returnValue = '';
});

loadFiles().catch((error) => setStatus(error.message));
