# StoryDrop App

StoryDrop adalah aplikasi web *Single-Page Application* (SPA) berbasis Progressive Web App (PWA) yang memungkinkan pengguna untuk membagikan cerita momen mereka beserta lokasi peta. Proyek ini dibangun menggunakan Webpack, Leaflet.js untuk pemetaan, serta memanfaatkan IndexedDB dan Background Sync untuk dukungan fitur *offline*.

## Table of Contents

- [Features](#features)
- [Getting Started](#getting-started)
- [Scripts](#scripts)
- [Project Structure](#project-structure)

## Features

- **Single-Page Application (SPA):** Transisi halaman yang mulus tanpa *reload*.
- **Peta Interaktif:** Integrasi dengan Leaflet.js untuk menampilkan dan menentukan titik lokasi cerita.
- **PWA & Offline Support:** Mendukung instalasi aplikasi (Add to Home Screen) dan dapat digunakan saat luring berkat Service Worker dan Cache API.
- **IndexedDB:** Menyimpan data cerita dan cerita favorit secara lokal.
- **Background Sync:** Cerita yang dibuat saat *offline* akan otomatis diunggah ketika koneksi internet kembali *online*.
- **Push Notification:** Menerima pemberitahuan ketika ada pembaruan cerita terbaru.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (disarankan versi 14 atau lebih tinggi)
- [npm](https://www.npmjs.com/) (Node package manager)

### Installation

1. *Clone* repositori ini atau *download* kode sumbernya.
2. Buka terminal dan arahkan ke direktori proyek.
3. Pasang seluruh *dependencies* dengan perintah berikut:
   ```shell
   npm install
   ```

## Scripts

- **Start Development Server:**
  ```shell
  npm run start-dev
  ```
  Script ini menjalankan server pengembangan Webpack dengan fitur *live reload* dan mode *development* sesuai konfigurasi di `webpack.dev.js`. *(Catatan: Service Worker dimatikan pada mode ini).*

- **Build for Production:**
  ```shell
  npm run build
  
  ```
  Script ini menjalankan Webpack dalam mode *production* menggunakan konfigurasi `webpack.prod.js` dan menghasilkan sejumlah file *build* (termasuk *Service Worker*) ke direktori `dist`.

- **Serve Production Build:**
  ```shell
  npm run serve
  ```
  Script ini menggunakan `http-server` (atau server statis serupa) untuk menyajikan konten dari direktori `dist`. Gunakan perintah ini untuk menguji fitur PWA dan *Offline Mode*.

## Project Structure

Proyek ini dirancang secara modular agar kode tetap bersih dan mudah dipelihara.
```text
storydrop/
├── dist/                   # Compiled files for production (hasil build)
├── src/                    # Source project files
│   ├── public/             # Public assets
│   │   ├── images/         # Ikon dan gambar statis
│   │   ├── app.webmanifest # Konfigurasi PWA Manifest
│   │   └── favicon.png     # Favicon aplikasi
│   ├── scripts/            # Source JavaScript files
│   │   ├── data/           # Konfigurasi API (api.js) dan IndexedDB (idb.js)
│   │   ├── pages/          # Komponen halaman (Home, Add Story, Auth, dll)
│   │   ├── routes/         # Logika routing SPA (routes.js, url-parser.js)
│   │   ├── utils/          # Fungsi utilitas (Push Notification)
│   │   ├── index.js        # Main JavaScript entry file
│   │   └── sw.js           # Konfigurasi Service Worker (Workbox & Background Sync)
│   ├── styles/             # Source CSS files
│   │   ├── components/     # CSS khusus untuk komponen (modal, navbar)
│   │   ├── pages/          # CSS khusus untuk halaman tertentu
│   │   ├── base.css        # CSS dasar/reset
│   │   └── variables.css   # Variabel warna dan ukuran CSS
│   └── index.html          # Main HTML file
├── package.json            # Project metadata and dependencies
├── package-lock.json       # Lockfile dependencies
├── eslint.config.mjs       # Konfigurasi ESLint (Linter)
├── README.md               # Project documentation
├── STUDENT.txt             # Informasi siswa dan URL Deployment
├── webpack.common.js       # Webpack common configuration
├── webpack.dev.js          # Webpack development configuration
└── webpack.prod.js         # Webpack production configuration
```

```