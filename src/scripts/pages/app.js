import routes from "../routes/routes";
import { getActiveRoute } from "../routes/url-parser";
import Swal from "sweetalert2";

class App {
  #content = null;
  #drawerButton = null;
  #navigationDrawer = null;

  constructor({ navigationDrawer, drawerButton, content }) {
    this.#content = content;
    this.#drawerButton = drawerButton;
    this.#navigationDrawer = navigationDrawer;

    this._setupDrawer();
    this._setupSkipLink();
    this._setupLogout();
  }

  _setupDrawer() {
    this.#drawerButton.addEventListener("click", () => {
      this.#navigationDrawer.classList.toggle("open");
    });

    document.body.addEventListener("click", (event) => {
      if (!this.#navigationDrawer.contains(event.target) && !this.#drawerButton.contains(event.target)) {
        this.#navigationDrawer.classList.remove("open");
      }

      this.#navigationDrawer.querySelectorAll("a").forEach((link) => {
        if (link.contains(event.target)) {
          this.#navigationDrawer.classList.remove("open");
        }
      });
    });
  }

  _setupSkipLink() {
    const skipLink = document.querySelector('.skip-link');
    const mainContent = document.querySelector('#main-content');
    
    if (skipLink && mainContent) {
      skipLink.addEventListener('click', (e) => {
        e.preventDefault();
        mainContent.focus(); 
      });
    }
  }

  _setupLogout() {
    const logoutBtn = document.querySelector('#logout-button');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        
        Swal.fire({
          title: 'Keluar dari StoryDrop?',
          text: 'Kamu harus login kembali untuk melihat dan membagikan cerita.',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#dc3545',
          cancelButtonColor: '#6c757d',
          confirmButtonText: '<i class="fas fa-sign-out-alt"></i> Ya, Logout',
          cancelButtonText: 'Batal',
          reverseButtons: true
        }).then((result) => {
          if (result.isConfirmed) {
            localStorage.removeItem('token');
            window.location.hash = '#/login';
          }
        });
      });
    }
  }

  _updateNavigation() {
    const hasToken = !!localStorage.getItem('token');
    const displayStyle = hasToken ? '' : 'none';

    this.#navigationDrawer.style.display = displayStyle;
    this.#drawerButton.style.display = displayStyle;
  }

  async renderPage() {
    this._updateNavigation();

    if (window.cameraStream) {
      window.cameraStream.getTracks().forEach(track => track.stop());
      window.cameraStream = null;
    }

    let url = getActiveRoute();
    const token = localStorage.getItem('token');

    if (token && (url === '/login' || url === '/register')) {
      window.history.replaceState(null, null, '#/'); 
      url = '/';
    }

    if (!token && (url !== '/login' && url !== '/register')) {
      window.history.replaceState(null, null, '#/login');
      url = '/login'; 
    }

    const PageClass = routes[url];
    
    if (!PageClass) {
       this.#content.innerHTML = '<h2 style="text-align: center; margin-top: 50px;">Halaman Tidak Ditemukan</h2>';
       return;
    }

    const page = new PageClass();

    if (!document.startViewTransition) {
      this.#content.innerHTML = await page.render();
      await page.afterRender();
      return;
    }

    document.startViewTransition(async () => {
      this.#content.innerHTML = await page.render();
      await page.afterRender();
    });
  }
}

export default App;