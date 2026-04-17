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
            <input type="password" id="password" required>
          </div>
          <button type="submit">Register</button>
        </form>
        <p>Sudah punya akun? <a href="#/login">Login di sini</a></p>
      </section>
    `;
  }

  async afterRender() {
    // Logika form submit akan diatur di sini
  }
}

export default RegisterPage;
