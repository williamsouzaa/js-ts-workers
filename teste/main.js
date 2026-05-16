import { Worker } from 'worker_threads'

const xmlString = `<root><element>Data</element></root>`;

const worker = new Worker('./worker.js', {
  workerData: { xml: xmlString }
});

worker.on('message', (result) => {
  console.log('Parsed XML root tag:', result);
});

worker.on('error', (err) => {
  console.error('Worker error:', err);
})