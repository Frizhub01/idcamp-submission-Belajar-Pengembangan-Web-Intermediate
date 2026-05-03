import '../styles/variables.css';
import '../styles/base.css';
import '../styles/components/navbar.css';
import '../styles/components/modal.css';
import '../styles/pages/home-page.css';
import '../styles/pages/about-page.css';

import App from './pages/app';
import PushNotification from './utils/push-notification';

document.addEventListener('DOMContentLoaded', async () => {
  const app = new App({
    content: document.querySelector('#main-content'),
    drawerButton: document.querySelector('#drawer-button'),
    navigationDrawer: document.querySelector('#navigation-drawer'),
  });

  await app.renderPage();
  await PushNotification.init();

  window.addEventListener('hashchange', async () => {
    await app.renderPage();
  });
});