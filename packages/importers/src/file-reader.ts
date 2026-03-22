import { readFileSync } from 'node:fs';
import { basename } from 'node:path';
import { Buffer } from 'node:buffer';
import { inflateRawSync } from 'node:zlib';

const ZIP_MAGIC = Buffer.from([0x50, 0x4b, 0x03, 0x04]);

function isZipFile(filePath: string): boolean {
  const fd = readFileSync(filePath);
  return fd.length >= 4 && fd.subarray(0, 4).equals(ZIP_MAGIC);
}

function extractJsonFromZip(filePath: string, targetFile: string): any {
  const data = readFileSync(filePath);

  const entries = parseZipEntries(data);
  const match = entries.find(e =>
    e.name === targetFile ||
    e.name.endsWith('/' + targetFile) ||
    basename(e.name) === targetFile
  );

  if (!match) {
    const jsonFiles = entries.filter(e => e.name.endsWith('.json')).map(e => e.name);
    throw new Error(
      `Could not find "${targetFile}" in ZIP archive.\n` +
      `  JSON files found: ${jsonFiles.length > 0 ? jsonFiles.join(', ') : 'none'}`
    );
  }

  const rawContent = extractEntry(data, match);
  return JSON.parse(rawContent.toString('utf-8'));
}

interface ZipEntry {
  name: string;
  compressedSize: number;
  uncompressedSize: number;
  compressionMethod: number;
  localHeaderOffset: number;
}

function parseZipEntries(data: Buffer): ZipEntry[] {
  const entries: ZipEntry[] = [];

  let eocdOffset = -1;
  for (let i = data.length - 22; i >= 0; i--) {
    if (data.readUInt32LE(i) === 0x06054b50) {
      eocdOffset = i;
      break;
    }
  }
  if (eocdOffset === -1) throw new Error('Invalid ZIP file: cannot find end of central directory');

  const cdOffset = data.readUInt32LE(eocdOffset + 16);
  const cdEntries = data.readUInt16LE(eocdOffset + 10);

  let offset = cdOffset;
  for (let i = 0; i < cdEntries; i++) {
    if (data.readUInt32LE(offset) !== 0x02014b50) break;

    const compressionMethod = data.readUInt16LE(offset + 10);
    const compressedSize = data.readUInt32LE(offset + 20);
    const uncompressedSize = data.readUInt32LE(offset + 24);
    const nameLength = data.readUInt16LE(offset + 28);
    const extraLength = data.readUInt16LE(offset + 30);
    const commentLength = data.readUInt16LE(offset + 32);
    const localHeaderOffset = data.readUInt32LE(offset + 42);
    const name = data.subarray(offset + 46, offset + 46 + nameLength).toString('utf-8');

    entries.push({ name, compressedSize, uncompressedSize, compressionMethod, localHeaderOffset });
    offset += 46 + nameLength + extraLength + commentLength;
  }

  return entries;
}

function extractEntry(data: Buffer, entry: ZipEntry): Buffer {
  const localOffset = entry.localHeaderOffset;
  if (data.readUInt32LE(localOffset) !== 0x04034b50) {
    throw new Error(`Invalid local file header for ${entry.name}`);
  }

  const nameLen = data.readUInt16LE(localOffset + 26);
  const extraLen = data.readUInt16LE(localOffset + 28);
  const dataStart = localOffset + 30 + nameLen + extraLen;
  const compressedData = data.subarray(dataStart, dataStart + entry.compressedSize);

  if (entry.compressionMethod === 0) {
    return compressedData;
  } else if (entry.compressionMethod === 8) {
    return inflateRawSync(compressedData);
  } else {
    throw new Error(`Unsupported compression method ${entry.compressionMethod} for ${entry.name}`);
  }
}

export interface ReadResult {
  data: any;
  sourceFile: string;
}

export function readExportFile(filePath: string, platform: string): ReadResult {
  if (isZipFile(filePath)) {
    const targetFile = 'conversations.json';
    const data = extractJsonFromZip(filePath, targetFile);
    return { data, sourceFile: targetFile };
  }

  const content = readFileSync(filePath, 'utf-8');
  return { data: JSON.parse(content), sourceFile: basename(filePath) };
}
