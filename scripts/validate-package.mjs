import { readdir, readFile, stat } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const packageDirectory = fileURLToPath(new URL('../dist/uae-pass/', import.meta.url));
const manifestPath = join(packageDirectory, 'package.json');
const sourceManifestPath = fileURLToPath(
  new URL('../projects/uae-pass/package.json', import.meta.url)
);
const workspaceManifestPath = fileURLToPath(new URL('../package.json', import.meta.url));
const requiredFiles = ['LICENSE', 'README.md', 'index.d.ts', 'package.json'];
const allowedTopLevelEntries = new Set([...requiredFiles, '.npmignore', 'fesm2022']);

async function collectFiles(directory) {
  const entries = await readdir(directory);
  const files = [];

  for (const entry of entries) {
    const path = join(directory, entry);
    if ((await stat(path)).isDirectory()) {
      files.push(...(await collectFiles(path)));
    } else {
      files.push(path);
    }
  }

  return files;
}

const topLevelEntries = await readdir(packageDirectory);
const missingFiles = requiredFiles.filter((file) => !topLevelEntries.includes(file));
const unexpectedEntries = topLevelEntries.filter((entry) => !allowedTopLevelEntries.has(entry));
const files = await collectFiles(packageDirectory);
const unsafeFiles = files
  .map((file) => relative(packageDirectory, file).replaceAll('\\', '/'))
  .filter(
    (file) =>
      /(^|\/)(\.env|package-lock\.json)$|\.(pem|key|pfx|ts)$/i.test(file) && !file.endsWith('.d.ts')
  );
const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
const sourceManifest = JSON.parse(await readFile(sourceManifestPath, 'utf8'));
const workspaceManifest = JSON.parse(await readFile(workspaceManifestPath, 'utf8'));

const failures = [];
if (missingFiles.length) failures.push(`Missing required files: ${missingFiles.join(', ')}`);
if (unexpectedEntries.length)
  failures.push(`Unexpected top-level entries: ${unexpectedEntries.join(', ')}`);
if (unsafeFiles.length) failures.push(`Unsafe package files: ${unsafeFiles.join(', ')}`);
if (manifest.name !== 'sensei-uaepass') failures.push(`Unexpected package name: ${manifest.name}`);
if (manifest.version !== sourceManifest.version) {
  failures.push(
    `Built version ${manifest.version} does not match source version ${sourceManifest.version}`
  );
}
if (workspaceManifest.version !== sourceManifest.version) {
  failures.push(
    `Workspace version ${workspaceManifest.version} does not match source version ${sourceManifest.version}`
  );
}
if (manifest.private === true) failures.push('Built package must not be private');

if (failures.length) {
  throw new Error(failures.join('\n'));
}

console.log(`Validated ${files.length} package files for sensei-uaepass@${manifest.version}`);
