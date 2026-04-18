import StoryApi from '../../data/api';

class LoginPage {
  async render() {
    return `
      <section class="auth-container">
        <h2>Masuk ke Akun Anda</h2>
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
          <p id="errorMessage" class="error-message"></p>
        </form>
        <p>Belum punya akun? <a href="#/register">Daftar di sini</a></p>
      </section>
    `;
  }

  async afterRender() {
    const form = document.getElementById('loginForm');
    const errorEl = document.getElementById('errorMessage');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      errorEl.innerText = '';

      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;

      try {
        const response = await StoryApi.login({ email, password });
        if (response.error) {
          errorEl.innerText = response.message;
        } else {
          localStorage.setItem('token', response.loginResult.token);
          window.location.hash = '#/home';
        }
      } catch (err) {
        errorEl.innerText = 'Gagal terhubung ke server.';
      }
    });
  }
}

export default LoginPage;