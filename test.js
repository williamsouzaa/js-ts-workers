

const packagesToProcess = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j']

console.log(packagesToProcess[56])

const totalWorkers = 4



// function brokePackagesToParts(packagesToProcess, totalWorkers) {
//   const packagesPartsToEachaWorker = new Array()
//   for (let i = 0; i < totalWorkers; i++) {
//     const sizeOfSlice = Math.ceil(packagesToProcess.length / totalWorkers)
//     const part = packagesToProcess.slice(i * sizeOfSlice, (i + 1) * sizeOfSlice)
//     packagesPartsToEachaWorker.push(part)
//   }
//   return packagesPartsToEachaWorker
// }


// console.log(packagesPartsToEachaWorker)