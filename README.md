# MTS Tumpat – Hantaran Hafazan Harian

Laman web statik untuk wali melihat perkembangan hantaran hafazan anak mereka: status harian (Telah Menghantar, Tidak Menghantar, Sakit, Izin), juzuk, muka surat lama dan baru, dengan graf untuk tempoh 1 hari, 1 minggu, 1 bulan, 3 bulan dan 6 bulan.

Tiada pelayan, tiada pangkalan data, dan tiada pemasangan (tanpa Node/npm). Hanya HTML, CSS dan JavaScript biasa, jadi boleh terus dihoskan di GitHub Pages atau Vercel secara percuma.

## Struktur fail

```
├── index.html             Halaman utama
├── style.css              Reka bentuk responsif (termasuk mod gelap)
├── app.js                 Logik, graf dan Mod ustaz
├── data.js                DATA pelajar (fail ini yang diganti setiap kali kemas kini)
├── .nojekyll              Memastikan GitHub Pages menyajikan laman sebagai fail statik
├── .github/workflows/
│   └── pages.yml          Penerbitan automatik ke GitHub Pages
└── README.md              Panduan ini
```

## Cuba di komputer sendiri

Klik dua kali `index.html`. Tiada langkah lain.

## Deploy ke GitHub Pages

1. Cipta repository GitHub dan muat naik semua fail projek, termasuk fail tersembunyi `.nojekyll` dan folder `.github/workflows`.
2. Pastikan `index.html`, `style.css`, `data.js`, dan `app.js` berada di akar repository.
3. Buka **Settings → Pages**. Pada *Build and deployment*, pilih **GitHub Actions** sebagai sumber penerbitan.
4. Workflow dalam `.github/workflows/pages.yml` akan menerbitkan laman secara automatik setiap kali perubahan dihantar ke branch `main`. Jalankan juga secara manual melalui **Actions → Deploy to GitHub Pages → Run workflow**.
5. Selepas workflow selesai, alamat laman ialah `https://USERNAME.github.io/NAMA-REPO/`.

## Deploy ke Vercel

1. Log masuk ke vercel.com (boleh guna akaun GitHub).
2. **Add New → Project**, pilih repo GitHub tadi, dan klik **Import**.
3. *Framework Preset*: **Other**. Kosongkan Build Command dan Output Directory. Klik **Deploy**.
4. Alamat laman: `https://NAMA-PROJEK.vercel.app`. Setiap kali repo dikemas kini, Vercel akan menerbitkan semula secara automatik.

## Kemas kini data harian (untuk ustaz)

Laman wali hanya memaparkan data dalam `data.js`. Untuk menukar data:

1. Buka laman anda dengan `#ustaz` di hujung alamat, contohnya `https://USERNAME.github.io/NAMA-REPO/#ustaz`.
2. Di bahagian bawah akan muncul kad **Mod ustaz**. Pilih tarikh, tekan status setiap pelajar, isi juzuk dan muka surat bagi yang *Telah Menghantar*. Nama pelajar boleh ditukar terus pada kotak nama.
3. Tekan **Muat turun data.js**.
4. Di GitHub, buka akar repository, klik **Add file → Upload files**, seret `data.js` yang baru dimuat turun (menggantikan yang lama), kemudian **Commit changes**.
5. Selepas 1–2 minit, wali akan nampak data terkini. Jika masih lama, tekan muat semula (refresh) atau kosongkan cache.

Nota penting:
- Perubahan dalam Mod ustaz hanyalah **draf dalam pelayar anda**, disimpan sementara di telefon/komputer yang sama. Wali tidak nampak apa-apa sehingga `data.js` dimuat naik ke GitHub.
- Draf akan hilang jika anda menukar pelayar atau peranti sebelum memuat turun `data.js`. Muat turun selepas setiap sesi mengisi data.
- Sentiasa gunakan fail `data.js` yang **terbaru** sebagai asas. Jangan ganti dengan salinan lama.

## Privasi dan keselamatan (sila baca)

- Pada akaun GitHub Free, repo perlu **Public** untuk GitHub Pages. Ini bermakna nama dan data pelajar dalam `data.js` boleh dilihat oleh sesiapa yang tahu pautannya atau menjumpai repo itu. Pertimbangkan menggunakan nama panggilan atau inisial.
- `#ustaz` **bukan kata laluan**. Sesiapa yang menambah `#ustaz` boleh membuka borang suntingan, tetapi perubahan mereka hanya berlaku dalam pelayar mereka sendiri dan tidak boleh mengubah data yang diterbitkan. Hanya orang yang boleh menyunting repo GitHub anda yang boleh menukar data sebenar.
- Jaga akaun GitHub dengan kata laluan yang kuat dan hidupkan pengesahan dua faktor.
- Semua wali yang membuka pautan boleh memilih nama mana-mana pelajar dalam kumpulan. Jika perlu pengasingan, gunakan satu repo/pautan bagi setiap kumpulan.

## Had semasa

- Projek ini disediakan untuk **11 pelajar (Kumpulan 1)**. Jika bilangan pelajar bertambah, kod perlu diselaraskan semula.
- Tarikh mengikut zon waktu peranti pengguna.

## Masalah lazim

| Masalah | Penyelesaian |
|---|---|
| Halaman kosong di GitHub Pages | Pastikan `index.html` di akar repo dan Pages dihidupkan (Settings → Pages). |
| Gaya tidak muncul / halaman tidak berwarna | Pastikan `style.css`, `data.js`, dan `app.js` berada bersama `index.html` di akar repository. |
| Data lama masih tampil | Tunggu 1–2 minit, kemudian refresh keras (Ctrl+Shift+R) atau buka tab sulit (incognito). |
| Kad Mod ustaz tidak muncul | Pastikan alamat berakhir dengan `#ustaz`, kemudian muat semula. |
