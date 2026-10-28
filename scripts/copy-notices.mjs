import {copyFileSync, mkdirSync} from 'node:fs';
import {fileURLToPath} from 'node:url';

const root = new URL('../', import.meta.url);
const copies = [
  ['LICENSE', 'dist/LICENSE.txt'],
  ['THIRD_PARTY_NOTICES.md', 'dist/THIRD_PARTY_NOTICES.txt'],
  ['fonts/OFL-NanumGothic.txt', 'dist/fonts/OFL-NanumGothic.txt'],
];

mkdirSync(fileURLToPath(new URL('dist/fonts/', root)), {recursive: true});
for (const [source, target] of copies) {
  copyFileSync(new URL(source, root), new URL(target, root));
}
