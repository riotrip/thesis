# Thesis

Pintu masuk catatan dan dataset penelitian di `https://prayogo.is-a.dev/thesis/`.

Halaman depan berupa app launcher ringkas: header Thesis dan tile aplikasi dalam tiga kolom desktop, dua kolom tablet, satu kolom mobile. Font stack dan token warna mengikuti `riotrip.github.io`. Tidak ada hero penelitian atau statistik. HTML + CSS tanpa Astro, JavaScript browser, font eksternal, atau dependency tambahan. `node build-hub.mjs` merender `apps.json` ke `_site/index.html` setelah assembly; buka hasil build, bukan template `index.html`.

- `notes/`: hasil build `riotrip/notes` (branch `main`).
- `datasets/`: file situs `riotrip/datasets` (branch `main`).

Hanya repo ini yang deploy ke GitHub Pages. Workflow `.github/workflows/deploy.yml` berjalan saat push ke `main`, Run workflow, atau `repository_dispatch` bertipe `content-updated`. Job build menguji kedua sumber, membuild notes, lalu merakit `_site/`. Job deploy mempublikasikan artifact tersebut. Konten dispatch tidak digunakan sebagai perintah, nama repo, atau ref checkout.

## Konfigurasi GitHub

1. Simpan workflow dan halaman ini di branch `main` repo `riotrip/thesis`. Dispatch membutuhkan workflow yang sudah ada di default branch; gunakan `main` sebagai default.
2. Di repo **thesis**, Settings → Pages → Build and deployment → Source: **GitHub Actions**. Izinkan branch `main` pada environment `github-pages` jika deployment protection diaktifkan.
3. Di repo **notes** dan **datasets**, tambahkan Actions secret `THESIS_TOKEN`. Gunakan fine-grained personal access token milik akun yang dapat mengakses thesis, dibatasi ke repo `riotrip/thesis`, dengan permission **Contents: Read and write**. `GITHUB_TOKEN` bawaan repo sumber tidak dapat mengirim dispatch lintas repo. Perbarui secret ketika token kedaluwarsa.
4. Jika notes/datasets privat, tambahkan secret `SOURCE_READ_TOKEN` di **thesis**: token dengan **Contents: Read-only** untuk kedua repo sumber. Tidak diperlukan untuk sumber publik.
5. Nonaktifkan/unpublish Pages lama di repo sumber bila masih aktif. Workflow sumber sekarang hanya mengirim sinyal, tidak menerbitkan branch `dist` atau melakukan deployment.
6. Jalankan **Deploy thesis to GitHub Pages** lewat Run workflow untuk deployment awal. Push berikutnya ke `main` di salah satu repo sumber memicu rebuild melalui dispatch.

Domain `prayogo.is-a.dev` mengikuti custom domain situs akun GitHub Pages. Jangan menambahkan CNAME khusus domain itu ke repo project thesis; URL project tetap `/thesis/`.

Halaman depan dirakit dengan Node.js bawaan runner tanpa dependency tambahan. Tautan relatif menjaga navigasi tetap di bawah `/thesis/`. Dataset disalin dengan daftar file publik eksplisit; `.git`, tes, skrip kurasi, README, dan dependency lokal tidak dipublikasikan. Notes hanya menyalin `dist/`.

## Menambahkan aplikasi

Tambahkan objek ke `apps.json`; urutan array menentukan urutan tile:

```json
{
  "name": "Nama aplikasi",
  "description": "Deskripsi singkat aplikasi.",
  "href": "./nama-aplikasi/",
  "icon": "app"
}
```

`name`, `description`, and `href` are required. Optional `icon`: `app` (default), `notes`, `database`, or `document`. Links may be relative (`./subfolder/`) or absolute (`https://...` / `http://...`). Every app tile opens in a new tab. Text is escaped during the build.

Entri baru tidak otomatis meng-host aplikasinya:
- Aplikasi eksternal: isi `href` dengan URL situs yang sudah tersedia; tidak perlu mengubah workflow.
- Aplikasi di `/thesis/nama-aplikasi/`: tambahkan checkout/build aplikasi tersebut di `.github/workflows/deploy.yml`, lalu salin hasil situsnya ke `_site/nama-aplikasi/` sebelum langkah `node build-hub.mjs`. Jangan salin seluruh repo atau secret.

Setelah mengubah konfigurasi, jalankan `node build-hub.mjs` lagi. Jumlah tile tidak dibatasi; baris baru terbentuk otomatis.

## Preview lokal

Dengan folder `notes`, `dataset` (clone repo `datasets`), dan `thesis` berdampingan:

```bash
pnpm --dir ../notes install --frozen-lockfile
pnpm --dir ../notes test
pnpm --dir ../notes build
npm --prefix ../dataset test
mkdir -p _site/notes _site/datasets
cp -R ../notes/dist/. _site/notes/
cp ../dataset/index.html ../dataset/styles.css ../dataset/catalog.json _site/datasets/
cp -R ../dataset/public ../dataset/src _site/datasets/
node build-hub.mjs
python3 -m http.server 4173 --directory _site
```

Buka `http://localhost:4173/`. `_site/` dan `_src/` adalah hasil lokal yang diabaikan Git. Preview ini tidak mengirim dispatch atau melakukan deployment.
