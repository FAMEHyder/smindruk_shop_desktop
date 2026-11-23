const { app, BrowserWindow, shell, Menu, dialog, session } = require('electron');
const path = require('path');
const config = require('./config');

const isDev = process.argv.includes('--dev') || !app.isPackaged;
let mainWindow = null;

function appOrigin() {
  try {
    return new URL(config.appUrl).origin;
  } catch {
    return config.appUrl;
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: config.width,
    height: config.height,
    minWidth: config.minWidth,
    minHeight: config.minHeight,
    title: 'ShopHub Shopkeeper (Local)',
    backgroundColor: '#EAEDED',
    show: false,
    autoHideMenuBar: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      spellcheck: false,
      // Persist login / cart across restarts
      partition: 'persist:shophub-shopkeeper',
    },
  });

  // Identify this client as the desktop app (web can read navigator.userAgent)
  const ses = session.fromPartition('persist:shophub-shopkeeper');
  ses.setUserAgent(`${ses.getUserAgent()} ShopHubDesktop/1.0`);

  const startUrl = `${config.appUrl.replace(/\/$/, '')}${config.startPath}`;
  mainWindow.loadURL(startUrl);

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    if (isDev) mainWindow.webContents.openDevTools({ mode: 'detach' });
  });

  mainWindow.webContents.on('did-fail-load', (_e, errorCode, errorDescription, validatedURL) => {
    if (errorCode === -3) return; // aborted
    const html = `
      <html><body style="font-family:Segoe UI,sans-serif;padding:40px;background:#EAEDED;color:#111">
        <h1>ShopHub Shopkeeper</h1>
        <p>Could not connect to the web app.</p>
        <p><b>URL:</b> ${validatedURL || startUrl}</p>
        <p><b>Error:</b> ${errorDescription} (${errorCode})</p>
        <p>Is local Backend + Web running on this PC?</p>
        <pre style="background:#fff;padding:12px;border-radius:8px">cd Backend &amp;&amp; npm run dev
cd web &amp;&amp; npm run dev</pre>
        <p style="color:#555">App: ${config.appUrl}<br/>API: ${config.apiUrl}</p>
        <button onclick="location.reload()" style="padding:10px 16px;font-size:14px;cursor:pointer">Retry</button>
      </body></html>`;
    mainWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`);
  });

  // Keep shopkeeper inside our app origin; open outsiders in system browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    const origin = appOrigin();
    if (url.startsWith(origin)) {
      return { action: 'allow' };
    }
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.webContents.on('will-navigate', (event, url) => {
    const origin = appOrigin();
    if (!url.startsWith(origin) && !url.startsWith('data:')) {
      event.preventDefault();
      shell.openExternal(url);
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  buildMenu();
}

function buildMenu() {
  const template = [
    {
      label: 'ShopHub',
      submenu: [
        {
          label: 'Dashboard',
          click: () => mainWindow?.loadURL(`${config.appUrl.replace(/\/$/, '')}/dashboard`),
        },
        {
          label: 'Create Sale',
          click: () => mainWindow?.loadURL(`${config.appUrl.replace(/\/$/, '')}/sales`),
        },
        {
          label: 'Customer / Khata',
          click: () => mainWindow?.loadURL(`${config.appUrl.replace(/\/$/, '')}/customers`),
        },
        {
          label: 'Create Expense',
          click: () => mainWindow?.loadURL(`${config.appUrl.replace(/\/$/, '')}/expenses`),
        },
        {
          label: 'Create Purchase',
          click: () => mainWindow?.loadURL(`${config.appUrl.replace(/\/$/, '')}/purchases`),
        },
        {
          label: 'Products / Cost (COGS)',
          click: () => mainWindow?.loadURL(`${config.appUrl.replace(/\/$/, '')}/products-admin`),
        },
        {
          label: 'Reports / P&L',
          click: () => mainWindow?.loadURL(`${config.appUrl.replace(/\/$/, '')}/reports`),
        },
        { type: 'separator' },
        {
          label: 'Orders',
          click: () => mainWindow?.loadURL(`${config.appUrl.replace(/\/$/, '')}/orders`),
        },
        {
          label: 'Rent & Alerts',
          click: () => mainWindow?.loadURL(`${config.appUrl.replace(/\/$/, '')}/rent`),
        },
        { type: 'separator' },
        { role: 'quit', label: 'Exit' },
      ],
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { type: 'separator' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { role: 'resetZoom' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
        ...(isDev ? [{ type: 'separator' }, { role: 'toggleDevTools' }] : []),
      ],
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'About ShopHub Shopkeeper',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'About',
              message: 'ShopHub Shopkeeper Desktop',
              detail:
                'Desktop access to your shop: sales, products, inventory, orders, expenses, reports, and rent.\n\n' +
                `App: ${config.appUrl}\nAPI: ${config.apiUrl}\nVersion: ${app.getVersion()}`,
            });
          },
        },
      ],
    },
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
