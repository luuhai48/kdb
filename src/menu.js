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
