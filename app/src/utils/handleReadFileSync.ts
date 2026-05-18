import path from 'path'
import fs from 'fs'


export function handleReadFileSync(filePath: `app/${string}`, fileName: string, isUtf8: boolean= true): string | Buffer<ArrayBuffer> {
  const projectRoot = process.cwd();
  const basePath = path.resolve(projectRoot, filePath)
  return isUtf8 ? fs.readFileSync(path.join(basePath, fileName), 'utf8') : fs.readFileSync(path.join(basePath, fileName))
}