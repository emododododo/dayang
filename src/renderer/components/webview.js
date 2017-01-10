import React from 'react';
import styles from './webview.css';
import Loading from './loading';

const openExternal = require('electron').remote.shell.openExternal;
const arrowLeft = require('../assets/arrow_left.png');
const reload = require('../assets/reload.png');
const browser = require('../assets/browser.png');
const error = require('../assets/error.png');

class Webview extends React.Component {

  constructor() {
    super();
    this.state = {
      canGoBack: false,
      canGoForward: false,
      isLoading: false,
      crashed: false,
      errorCode: '',
    };
  }

  componentDidMount() {
    const webviewElement = document.getElementById('foo');

    // 站外链接用默认浏览器打开
    webviewElement.addEventListener('new-window', (e) => {
      openExternal(e.url);
    });

    webviewElement.addEventListener('did-navigate', () => {
      const canGoBack = webviewElement.canGoBack();
      const canGoForward = webviewElement.canGoForward();
      if (this.state.canGoBack !== canGoBack) {
        this.setState({
          canGoBack,
        });
      }
      if (this.state.canGoForward !== canGoForward) {
        this.setState({
          canGoForward,
        });
      }
    });

    // 浏览器崩溃或者加载失败
    webviewElement.addEventListener('did-fail-load', (e) => {
      if (this.props.url === e.validatedURL && e.errorCode !== -3) {
        this.setState({
          crashed: true,
          errorCode: e.errorCode,
        });
      }
    });

    webviewElement.addEventListener('crashed', () => {
      this.setState({
        crashed: true,
      });
    });

    // Loading
    webviewElement.addEventListener('did-start-loading', () => {
      this.setState({
        isLoading: true,
        crashed: false,
      });
    });

    webviewElement.addEventListener('did-stop-loading', () => {
      this.setState({
        isLoading: false,
      });
    });

    this.onGoBack = () => {
      webviewElement.goBack();
    };

    this.onGoForward = () => {
      webviewElement.goForward();
    };

    this.onReload = () => {
      webviewElement.reload();
    };
  }

  componentWillReceiveProps(nextProps) {
    const webviewElement = document.getElementById('foo');
    webviewElement.clearHistory();
    webviewElement.loadURL(nextProps.url);
    this.setState({
      canGoBack: webviewElement.canGoBack(),
    });
  }

  onBrowser() {
    const url = this.props.url;
    if (url && url !== '#') {
      openExternal(url);
    }
  }

  render() {
    const url = '#';
    const crashedClassName = this.state.crashed ? styles['crashed--active'] : styles.crashed;
    const goBackClassNames = this.state.canGoBack ? `${styles.goBack} ${styles.canGoBack}` : styles.goBack;
    const goForwardClassNames = this.state.canGoForward ? `${styles.goForward} ${styles.canGoForward}` : styles.goForward;
    const reloadClassNames = `${styles.reload} ${styles['icon-active']}`;
    const browserClassNames = `${styles.browser} ${styles['icon-active']}`;

    const onBrowser = this.onBrowser.bind(this);

    return (
      <Loading className={styles.wrapper} isLoading={this.state.isLoading}>
        <div className={styles['webview-bar']}>
          <a onClick={this.onGoBack} className={styles['goBack-wrapper']}><img className={goBackClassNames} src={arrowLeft} alt="" /></a>
          <a onClick={this.onGoForward} className={styles['goForward-wrapper']}><img className={goForwardClassNames} src={arrowLeft} alt="" /></a>
          <a onClick={this.onReload} className={styles['reload-wrapper']}><img className={reloadClassNames} src={reload} alt="" /></a>
          <a onClick={onBrowser} className={styles['browser-wrapper']}><img className={browserClassNames} src={browser} alt="" /></a>
        </div>
        <webview className={styles.webview} id="foo" src={url} />
        <div className={crashedClassName}>
          <div className={styles['crashed-content']}>
            <img className={goBackClassNames} src={error} alt="" />
            <span>出现错误 {this.state.errorCode}</span>
          </div>
        </div>
      </Loading>
    );
  }
}

export default Webview;
