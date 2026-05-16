import { workerData, parentPort } from 'worker_threads';
import libxmljs from 'libxmljs2';


try {
  // Parse the raw XML string received from the main thread
  const xmlDoc = libxmljs.parseXmlString(workerData.xml);

  // Extract specific information (or perform XSLT transforms)
  const rootName = xmlDoc.root().name();

  // Send the extracted string/data back to the main thread
  parentPort.postMessage(rootName);
} catch (error) {
  parentPort.postMessage({ error: error.message });
}