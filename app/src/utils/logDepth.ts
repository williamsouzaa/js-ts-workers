import util from 'util'

export function logDepth(data: any): string {
  return util.inspect(data, {
      showHidden: false,
      depth: null,
      colors: true
    })
}