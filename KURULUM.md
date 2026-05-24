# Anzel Patisserie — GitHub & iPhone Kurulum Kılavuzu

## 1. GitHub Hesabı
- github.com adresine gidin, hesap açın (yoksa)

## 2. Yeni Repository Oluşturun
- Sağ üstte "+" → "New repository"
- Repository name: `anzel-app`
- Public seçin
- "Create repository" tıklayın

## 3. Dosyaları Yükleyin
- "uploading an existing file" linkine tıklayın
- Bu klasördeki TÜM dosyaları sürükleyip bırakın:
  - App.jsx
  - main.jsx
  - index.html
  - vite.config.js
  - package.json
  - manifest.json
  - sw.js
  - .gitignore
  - .github/workflows/deploy.yml (bu dosyayı ayrıca yükleyin)
- "Commit changes" tıklayın

## 4. GitHub Pages Aktif Edin
- Repository'de "Settings" → "Pages"
- Source: "GitHub Actions" seçin
- Kaydedin

## 5. Otomatik Deploy
- Her "push"ta otomatik build olur
- ~2 dakika sonra: https://KULLANICIADI.github.io/anzel-app

## 6. iPhone'a Kurun (Safari)
1. Safari'de sitenizi açın
2. Alt ortadaki paylaş butonu (kare+ok)
3. "Ana Ekrana Ekle" seçin
4. "Ekle" tıklayın
5. Artık uygulamanız ana ekranda! 🎂

## Önemli Not
- Veri telefonda kalıcı saklanır (localStorage)
- Offline da çalışır
- Uygulama simgesi ana ekranda görünür
