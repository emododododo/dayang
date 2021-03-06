import { app, BrowserWindow, ipcMain } from 'electron';
import is from 'electron-is';
import { join } from 'path';
import log from 'electron-log';
// import updater from 'electron-simple-updater';
import * as application from './services/application';
import * as window from './services/window';
import * as menu from './services/menu';
import * as config from './configs/config';

log.info('(main/index) >>>>>>>>>>>>>>>>>>');
log.info('(main/index) app start');
log.info(`(main/index) log file at ${log.findLogPath()}`);

if (is.dev()) {
  require('electron-debug')(); // eslint-disable-line global-require
}

// updater.init({
//   checkUpdateOnStart: false,
//   autoDownload: true,
// });

app.on('ready', () => {
  log.info('(main/index) app ready');
  const mainWin = application.init();
  menu.init();


  // 监听配置页面
  ipcMain.on('sync-EditPage', (event) => {
    const result = event;
    mainWin.reload();
    result.returnValue = '配置更新成功';
  });

  // 加载 devtools extension
  if (is.dev()) {
    BrowserWindow.addDevToolsExtension(
      join($dirname, '../../extensions/redux-devtools/2.11.1_0'),
    );
    BrowserWindow.addDevToolsExtension(
      join($dirname, '../../extensions/react-developer-tools/0.15.4_0'),
    );
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (window.getCount() === 0) {
    application.init();
  }
});

app.on('quit', () => {
  log.info('(main/index) app quit');
  log.info('(main/index) <<<<<<<<<<<<<<<<<<<');
});

// Register to global, so renderer can access these with remote.getGlobal
global.services = {
  application,
  window,
};
global.configs = {
  config,
};
