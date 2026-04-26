export default class AboutPage {
  async render() {
    return `
      <aside class="about-me" id="tentang-saya">
        <h1 class="about-me-title">Tentang Saya</h1>

        <div class="about-me-content">
          <section class="profile-card glass-card">
            <figure>
              <img src="./images/foto_profil.png" alt="Foto Profil">
              <figcaption>
                <h2>Muhamad Afriza</h2>
              </figcaption>
            </figure>
            <p class="profile-job-title">Junior Web Developer</p>
            
            <hr class="glass-divider">
            
            <div class="info-list">
              <div class="info-item">
                <i class="fas fa-birthday-cake"></i>
                <span>14 April 2005</span>
              </div>
              <div class="info-item">
                <i class="fas fa-briefcase"></i>
                <span>Mahasiswa</span>
              </div>
              <div class="info-item">
                <i class="fas fa-phone-alt"></i>
                <span>(+62) 851 2448 6770</span>
              </div>
              <div class="info-item">
                <i class="fas fa-envelope"></i>
                <span>muhamadafriza900@gmail.com</span>
              </div>
            </div>
          </section>

          <section class="profile-details">
            <div class="details-wrapper">
              <section class="bio-section glass-card">
                <h2>Bio</h2>
                <p>
                  Perkenalkan, saya Muhamad Afriza, mahasiswa S1 Pendidikan Matematika di UIN Sunan Gunung Djati. Dengan latar belakang analitis dari matematika, saat ini saya mendedikasikan diri untuk mendalami pengembangan web dan berambisi untuk memulai karir sebagai seorang Web Developer.
                </p>
              </section>

              <section class="education-section glass-card">
                <h2>Pendidikan Formal</h2>
                <div class="education-item">
                  <p><strong>Universitas Islam Negeri Sunan Gunung Djati (2023 - 2027)</strong></p>
                  <p>S1 - Pendidikan Matematika</p>
                </div>
                <div class="education-item">
                  <p><strong>SMK Istiqomah (2020 - 2023)</strong></p>
                  <p>Farmasi</p>
                </div>
              </section>
            </div>

            <section class="social-section glass-card">
              <h2>Ikuti Media Sosial Saya</h2>
              <div class="social-icons">
                <a href="https://github.com/Frizhub01" target="_blank" aria-label="GitHub"><i class="fab fa-github"></i></a>
                <a href="https://www.instagram.com/frz_326/" target="_blank" aria-label="Instagram"><i class="fab fa-instagram"></i></a>
                <a href="https://x.com/Frz326" target="_blank" aria-label="Twitter"><i class="fab fa-twitter"></i></a>
              </div>
            </section>
          </section>
        </div>
      </aside>
    `;
  }

  async afterRender() {
    // Fungsi ini dijalankan setelah render (dibiarkan kosong untuk saat ini)
  }
}
