const { contextBridge } = require('electron');

/** Exposed to the web app as window.shophubDesktop */
contextBridge.exposeInMainWorld('shophubDesktop', {
  isDesktop: true,
  platform: process.platform,
  version: '1.1.0',
  supportsOfflineQueue: true,
});
