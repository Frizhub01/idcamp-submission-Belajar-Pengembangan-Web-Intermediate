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
          <button type="submit">Login</button>
        </form>
        <p>Belum punya akun? <a href="#/register">Daftar di sini</a></p>
      </section>
    `;
  }

  async afterRender() {
    // Logika ketika tombol submit ditekan akan diatur di sini
  }
}

export default LoginPage;
