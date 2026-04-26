import StoryApi from '../../data/api';
import Swal from 'sweetalert2';

class LoginPage {
  async render() {
    return `
      <section class="auth-container">
        <h1>Masuk ke Akun Anda</h1>
        <form id="loginForm">
          <div class="form-group">
            <label for="email">Email</label>
            <input type="email" id="email" required>
          </div>
          <div class="form-group">
            <label for="password">Password</label>
            <input type="password" id="password" required>
          </div>
          <button type="submit" id="btnLogin">Masuk</button>
        </form>
        <p>Belum punya akun? <a href="#/register">Daftar di sini</a></p>
      </section>
    `;
  }

  async afterRender() {
    const form = document.getElementById('loginForm');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;

      Swal.fire({
        title: 'Memproses...',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading()
      });

      try {
        const response = await StoryApi.login({ email, password });
        if (response.error) {
          Swal.fire({ icon: 'error', title: 'Gagal Masuk', text: response.message });
        } else {
          localStorage.setItem('token', response.loginResult.token);
          Swal.fire({
            icon: 'success',
            title: 'Berhasil!',
            text: 'Anda berhasil masuk.',
            timer: 1500,
            showConfirmButton: false
          }).then(() => {
            window.location.hash = '#/home';
          });
        }
      } catch (err) {
        Swal.fire({ icon: 'error', title: 'Oops...', text: 'Gagal terhubung ke server.' });
      }
    });
  }
}

export default LoginPage;