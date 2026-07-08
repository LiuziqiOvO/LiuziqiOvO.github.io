#!/usr/bin/env node

const http = require('http');
const fs = require('fs/promises');
const path = require('path');
const { URL } = require('url');

const repoRoot = path.resolve(__dirname, '..');
const host = process.env.BLOG_EDITOR_HOST || '127.0.0.1';
const port = Number(process.env.BLOG_EDITOR_PORT || 4010);

const allowedRoots = [
  'source/_posts',
  'source/about',
  'source/links',
  'source/categories',
  'source/tags',
  'review/inbox',
  'review/sanitized',
  'review/rejected',
  'trash',
];

const editableRoots = allowedRoots.map((relativePath) => ({
  label: relativePath,
  relativePath,
  absolutePath: path.join(repoRoot, relativePath),
}));

const staticDir = path.join(repoRoot, 'tools/local-editor');

function send(res, statusCode, body, headers = {}) {
  res.writeHead(statusCode, headers);
  res.end(body);
}

function sendJson(res, statusCode, data) {
  send(res, statusCode, JSON.stringify(data), {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  });
}

function normalizeRepoPath(inputPath) {
  if (!inputPath || typeof inputPath !== 'string') {
    throw new Error('Missing path');
  }

  const normalized = path.normalize(inputPath).replace(/^(\.\.(\/|\\|$))+/, '');
  const absolutePath = path.resolve(repoRoot, normalized);
  const relativePath = path.relative(repoRoot, absolutePath);

  if (relativePath.startsWith('..') || path.isAbsolute(relativePath)) {
    throw new Error('Path escapes repository');
  }

  const isAllowed = editableRoots.some((root) => {
    const relativeToRoot = path.relative(root.absolutePath, absolutePath);
    return relativeToRoot === '' || (!relativeToRoot.startsWith('..') && !path.isAbsolute(relativeToRoot));
  });

  if (!isAllowed) {
    throw new Error('Path is outside editable blog content roots');
  }

  if (path.extname(relativePath) !== '.md') {
    throw new Error('Only Markdown files can be edited');
  }

  return { absolutePath, relativePath };
}

async function readRequestBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
    if (Buffer.concat(chunks).length > 5 * 1024 * 1024) {
      throw new Error('Request body is too large');
    }
  }
  return Buffer.concat(chunks).toString('utf8');
}

async function listMarkdownFiles(root) {
  const files = [];

  async function walk(currentDir) {
    let entries = [];
    try {
      entries = await fs.readdir(currentDir, { withFileTypes: true });
    } catch (error) {
      if (error.code === 'ENOENT') return;
      throw error;
    }

    for (const entry of entries) {
      if (entry.name.startsWith('.')) continue;
      const absolutePath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        await walk(absolutePath);
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        const stat = await fs.stat(absolutePath);
        files.push({
          path: path.relative(repoRoot, absolutePath),
          name: entry.name,
          root: root.relativePath,
          updatedAt: stat.mtime.toISOString(),
          size: stat.size,
        });
      }
    }
  }

  await walk(root.absolutePath);
  return files;
}

async function serveStatic(reqUrl, res) {
  const routePath = reqUrl.pathname === '/' ? '/index.html' : reqUrl.pathname;
  const absolutePath = path.resolve(staticDir, routePath.slice(1));
  const relativePath = path.relative(staticDir, absolutePath);

  if (relativePath.startsWith('..') || path.isAbsolute(relativePath)) {
    send(res, 403, 'Forbidden');
    return;
  }

  const ext = path.extname(absolutePath);
  const type = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
  }[ext] || 'application/octet-stream';

  try {
    const content = await fs.readFile(absolutePath);
    send(res, 200, content, { 'Content-Type': type, 'Cache-Control': 'no-store' });
  } catch (error) {
    if (error.code === 'ENOENT') {
      send(res, 404, 'Not found');
      return;
    }
    throw error;
  }
}

async function handleApi(req, reqUrl, res) {
  if (req.method === 'GET' && reqUrl.pathname === '/api/files') {
    const groups = [];
    for (const root of editableRoots) {
      const files = await listMarkdownFiles(root);
      groups.push({ label: root.label, root: root.relativePath, files });
    }
    sendJson(res, 200, { roots: editableRoots.map(({ label, relativePath }) => ({ label, relativePath })), groups });
    return;
  }

  if (req.method === 'GET' && reqUrl.pathname === '/api/file') {
    const target = normalizeRepoPath(reqUrl.searchParams.get('path'));
    const content = await fs.readFile(target.absolutePath, 'utf8');
    sendJson(res, 200, { path: target.relativePath, content });
    return;
  }

  if (req.method === 'POST' && reqUrl.pathname === '/api/file') {
    const payload = JSON.parse(await readRequestBody(req));
    const target = normalizeRepoPath(payload.path);
    if (typeof payload.content !== 'string') {
      throw new Error('Missing content');
    }
    await fs.writeFile(target.absolutePath, payload.content, 'utf8');
    const stat = await fs.stat(target.absolutePath);
    sendJson(res, 200, { ok: true, path: target.relativePath, updatedAt: stat.mtime.toISOString() });
    return;
  }

  if (req.method === 'POST' && reqUrl.pathname === '/api/new') {
    const payload = JSON.parse(await readRequestBody(req));
    const root = editableRoots.find((candidate) => candidate.relativePath === payload.root);
    if (!root) {
      throw new Error('Unknown root');
    }

    const slug = String(payload.slug || '')
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9\u4e00-\u9fa5-]+/g, '-')
      .replace(/^-+|-+$/g, '');

    if (!slug) {
      throw new Error('Missing slug');
    }

    const target = normalizeRepoPath(path.join(root.relativePath, `${slug}.md`));
    const title = String(payload.title || slug).trim();
    const now = new Date();
    const date = now.toISOString().slice(0, 19).replace('T', ' ');
    const content = `---\ntitle: ${title}\ndate: ${date}\ncategories:\n  - 技术笔记\ntags:\n  - 待整理\ndescription: \n---\n\n## 背景\n\n\n## 结论\n\n`;

    try {
      await fs.writeFile(target.absolutePath, content, { encoding: 'utf8', flag: 'wx' });
    } catch (error) {
      if (error.code === 'EEXIST') {
        throw new Error('File already exists');
      }
      throw error;
    }

    sendJson(res, 201, { ok: true, path: target.relativePath, content });
    return;
  }

  sendJson(res, 404, { error: 'Unknown API route' });
}

const server = http.createServer(async (req, res) => {
  try {
    const reqUrl = new URL(req.url, `http://${host}:${port}`);
    if (reqUrl.pathname.startsWith('/api/')) {
      await handleApi(req, reqUrl, res);
      return;
    }
    await serveStatic(reqUrl, res);
  } catch (error) {
    sendJson(res, 400, { error: error.message });
  }
});

server.listen(port, host, () => {
  console.log(`Local blog editor: http://${host}:${port}/`);
  console.log('Editable roots:');
  for (const root of editableRoots) {
    console.log(`- ${root.relativePath}`);
  }
});
