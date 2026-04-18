import StoryApi from '../../data/api';

class RegisterPage {
  async render() {
    return `
      <section class="auth-container">
        <h2>Daftar Akun Baru</h2>
        <form id="registerForm">
          <div class="form-group">
            <label for="name">Nama</label>
            <input type="text" id="name" required>
          </div>
          <div class="form-group">
            <label for="email">Email</label>
            <input type="email" id="email" required>
          </div>
          <div class="form-group">
            <label for="password">Password</label>
            <input type="password" id="password" minlength="8" required>
          </div>
          <button type="submit" id="btnRegister">Daftar</button>
          <p id="errorMessage" class="error-message"></p>
        </form>
        <p>Sudah punya akun? <a href="#/login">Login di sini</a></p>
      </section>
    `;
  }

  async afterRender() {
    const form = document.getElementById('registerForm');
    const errorEl = document.getElementById('errorMessage');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      errorEl.innerText = '';

      const name = document.getElementById('name').value;
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;

      try {
        const response = await StoryApi.register({ name, email, password });
        if (response.error) {
          errorEl.innerText = response.message;
        } else {
          alert('Pendaftaran berhasil! Silakan masuk.');
          window.location.hash = '#/login';
        }
      } catch (err) {
        errorEl.innerText = 'Terjadi kesalahan jaringan.';
      }
    });
  }
}

export default RegisterPage;