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
          title: 'Apakah Anda yakin?',
          text: "Anda akan keluar dari aplikasi!",
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#d33',
          cancelButtonColor: '#3085d6',
          confirmButtonText: 'Ya, Logout!',
          cancelButtonText: 'Batal'
        }).then((result) => {
          if (result.isConfirmed) {
            localStorage.removeItem('token');
            window.location.hash = '#/login';
            
            Swal.fire({
              icon: 'success',
              title: 'Berhasil Logout',
              text: 'Sampai jumpa kembali!',
              timer: 1500,
              showConfirmButton: false
            });
          }
        });
      });
    }
  }

  async renderPage() {
    if (window.cameraStream) {
      window.cameraStream.getTracks().forEach(track => track.stop());
      window.cameraStream = null;
    }

    const url = getActiveRoute();
    const token = localStorage.getItem('token');

    if (token && (url === '/login' || url === '/register')) {
      window.location.hash = '#/';
      return;
    }

    if (!token && (url !== '/login' && url !== '/register')) {
      window.location.hash = '#/login';
      return;
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