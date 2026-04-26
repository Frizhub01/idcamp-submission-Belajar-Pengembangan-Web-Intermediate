import '../styles/variables.css';
import '../styles/base.css';
import '../styles/components/navbar.css';
import '../styles/components/modal.css';
import '../styles/pages/home-page.css';
import '../styles/pages/about-page.css';

import App from './pages/app';

document.addEventListener('DOMContentLoaded', async () => {
  const app = new App({
    content: document.querySelector('#main-content'),
    drawerButton: document.querySelector('#drawer-button'),
    navigationDrawer: document.querySelector('#navigation-drawer'),
  });

  const skipLink = document.querySelector('.skip-link');
  const mainContent = document.querySelector('#main-content');
  
  skipLink.addEventListener('click', (event) => {
    event.preventDefault();
    mainContent.focus();
  });

  const logoutBtn = document.querySelector('#logout-button');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('token');
      window.location.hash = '#/login';
    });
  }

  await app.renderPage();

  window.addEventListener('hashchange', async () => {
    if (window.cameraStream) {
      window.cameraStream.getTracks().forEach(track => track.stop());
      window.cameraStream = null;
    }
    
    await app.renderPage();
  });
});
