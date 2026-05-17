import path from 'path'
import fs from 'fs'


export function handleReadFileSync(filePath: `app/${string}`, fileName: string): string {
  const projectRoot = process.cwd();
  const basePath = path.resolve(projectRoot, filePath)
  return fs.readFileSync(path.join(basePath, fileName), 'utf8')
}