import StoryApi from "../../data/api";
import Swal from "sweetalert2";

class RegisterPage {
  async render() {
    return `
      <section class="auth-container">
        <h1>Daftar Akun Baru</h1>
        <form id="registerForm">
          <div class="form-group">
            <label for="name">Nama</label>
            <input type="text" id="name" autocomplete="name" required>
          </div>
          <div class="form-group">
            <label for="email">Email</label>
            <input type="email" id="email" autocomplete="email" required>
          </div>
          <div class="form-group">
            <label for="password">Password</label>
            <input type="password" id="password" minlength="8" autocomplete="new-password" required>
          </div>
          <button type="submit" id="btnRegister">Daftar</button>
          <p id="errorMessage" class="error-message"></p>
        </form>
        <p>Sudah punya akun? <a href="#/login">Login di sini</a></p>
      </section>
    `;
  }

  async afterRender() {
    const form = document.getElementById("registerForm");
    const errorEl = document.getElementById("errorMessage");

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      errorEl.innerText = "";

      const name = document.getElementById("name").value;
      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;

      try {
        Swal.fire({
          title: 'Memproses...',
          allowOutsideClick: false,
          didOpen: () => Swal.showLoading()
        });

        const response = await StoryApi.register({ name, email, password });
        if (response.error) {
          Swal.close();
          errorEl.innerText = response.message;
        } else {
          Swal.fire({
            icon: 'success',
            title: 'Berhasil!',
            text: 'Pendaftaran berhasil! Silakan masuk.',
          }).then(() => {
            window.location.hash = '#/login';
          });
        }
      } catch (err) {
        console.error(err);
        Swal.close();
        errorEl.innerText = 'Terjadi kesalahan jaringan.';
      }
    });
  }
}

export default RegisterPage;
