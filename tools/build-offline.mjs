import {readFileSync, writeFileSync} from 'node:fs';
import {dirname, resolve, relative, isAbsolute} from 'node:path';
import {fileURLToPath} from 'node:url';
import {deflateRawSync} from 'node:zlib';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = name => readFileSync(resolve(root, name), 'utf8');
function local(name) {
  const path = resolve(root, name), rel = relative(root, path);
  if (/^(?:[a-z]+:|\/\/)/i.test(name) || rel.startsWith('..') || isAbsolute(rel)) {
    throw new Error('Local assets only: ' + name);
  }
  return readFileSync(path, 'utf8');
}
const safeScript = text => text.replace(/<\/script/gi, '<\\/script');
const docs = {itinerary: read('original-complete.html'), packing: read('packing-complete.html')};
const scripts = [];
let html = read('index.html');
html = html.replace(/<link\b[^>]*\bhref=["']([^"']+)["'][^>]*>/gi, (tag, path) => {
  if (!/rel=["']stylesheet["']/i.test(tag)) return tag;
  return '<style>\n' + local(path) + '\n</style>';
});
html = html.replace(/<script\b[^>]*\bsrc=["']([^"']+)["'][^>]*>\s*<\/script>/gi, (_, path) => {
  scripts.push('<script>\n' + safeScript(local(path)) + '\n</script>');
  return '';
});
// The original scripts use defer. Execute their embedded copies after the DOM exists.
html = html.replace('</body>', '<script>window.OFFLINE_DOCS=' + safeScript(JSON.stringify(docs)) +
  ';</script>\n' + scripts.join('\n') + '\n</body>');
writeFileSync(resolve(root, 'island-days-offline.html'), html);

// ZIP with UTF-8 names and raw DEFLATE, using only Node standard modules.
function crc32(bytes) {
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc ^= byte;
    for (let i = 0; i < 8; i++) crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
  }
  return (crc ^ 0xffffffff) >>> 0;
}
function zip(entries) {
  const localRecords = [], directory = [];
  let offset = 0;
  for (const [filename, text] of entries) {
    const name = Buffer.from(filename), data = Buffer.from(text), compressed = deflateRawSync(data);
    const crc = crc32(data), header = Buffer.alloc(30), central = Buffer.alloc(46);
    header.writeUInt32LE(0x04034b50); header.writeUInt16LE(20, 4);
    header.writeUInt16LE(0x800, 6); header.writeUInt16LE(8, 8);
    header.writeUInt16LE(0x5d2d, 12); header.writeUInt32LE(crc, 14);
    header.writeUInt32LE(compressed.length, 18); header.writeUInt32LE(data.length, 22);
    header.writeUInt16LE(name.length, 26);
    central.writeUInt32LE(0x02014b50); central.writeUInt16LE(20, 4); central.writeUInt16LE(20, 6);
    central.writeUInt16LE(0x800, 8); central.writeUInt16LE(8, 10);
    central.writeUInt16LE(0x5d2d, 14); central.writeUInt32LE(crc, 16);
    central.writeUInt32LE(compressed.length, 20); central.writeUInt32LE(data.length, 24);
    central.writeUInt16LE(name.length, 28); central.writeUInt32LE(offset, 42);
    localRecords.push(header, name, compressed); directory.push(central, name);
    offset += header.length + name.length + compressed.length;
  }
  const dir = Buffer.concat(directory), end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50); end.writeUInt16LE(entries.length, 8);
  end.writeUInt16LE(entries.length, 10); end.writeUInt32LE(dir.length, 12);
  end.writeUInt32LE(offset, 16);
  return Buffer.concat([...localRecords, dir, end]);
}
const instructions = '팡라오·시키호르 오프라인 여행 지도\r\n' +
  'ZIP을 풀고 island-days-offline.html을 Edge 또는 Chrome으로 여세요.\r\n' +
  '지도·날짜별 일정·명소·준비물·원문은 인터넷 없이 볼 수 있습니다.\r\n' +
  '대안 후보와 준비물은 현재 브라우저에 저장됩니다. 파일 이동·브라우저 변경 시 공유되지 않습니다.\r\n' +
  '저장이 제한된 브라우저에서도 현재 화면의 선택은 유지됩니다.\r\n' +
  '외부 지도·전화·출처 링크는 연결이 필요합니다. 파도 소리는 버튼으로 켭니다.\r\n' +
  '개략 연결선은 도로 길찾기가 아닙니다. 예보·요금·운항·입수 조건은 현장 확인하세요.\r\n';
writeFileSync(resolve(root, 'island-days-offline.zip'), zip([
  ['island-days-offline.html', html],
  ['오프라인-사용안내.txt', instructions],
  ['MAPLIBRE-LICENSE.txt', read('assets/MAPLIBRE-LICENSE.txt')],
  ['THREE-LICENSE.txt', read('assets/THREE-LICENSE.txt')],
  ['MAP-DATA-LICENSE.txt', 'Map data © OpenStreetMap contributors, ODbL 1.0.\nhttps://www.openstreetmap.org/copyright\nStored routing: OSRM.\n']
]));
console.log('오프라인 HTML 및 ZIP 재생성 완료');
