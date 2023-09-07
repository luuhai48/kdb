import { app, Menu } from 'electron';

const isMac = process.platform === 'darwin';

const menu = Menu.buildFromTemplate([
  ...(isMac
    ? [
        {
          label: app.name,
        },
      ]
    : []),
  {
    label: 'Edit',
    submenu: [
      { label: 'Undo', accelerator: 'CmdOrCtrl+Z', selector: 'undo:' },
      { label: 'Redo', accelerator: 'Shift+CmdOrCtrl+Z', selector: 'redo:' },
      { type: 'separator' },
      { label: 'Cut', accelerator: 'CmdOrCtrl+X', selector: 'cut:' },
      { label: 'Copy', accelerator: 'CmdOrCtrl+C', selector: 'copy:' },
      { label: 'Paste', accelerator: 'CmdOrCtrl+V', selector: 'paste:' },
      {
        label: 'Select All',
        accelerator: 'CmdOrCtrl+A',
        selector: 'selectAll:',
      },
    ],
  },
  {
    label: 'View',
    submenu: [{ role: 'toggleDevTools' }],
  },
  {
    label: 'Window',
    submenu: [
      {
        label: 'Quit',
        click: () => app.quit(),
      },
    ],
  },
]);

Menu.setApplicationMenu(menu);
