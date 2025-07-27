# 🧠 Wikipedia Image Downloader

Wikipedia Image Downloader is a lightweight browser extension that allows you to preview and selectively download meaningful content images from Wikipedia articles — while ignoring logos, icons, and irrelevant UI images.

---

## 📌 Features

- ✅ Automatically scans any Wikipedia article for meaningful images  
- ✅ Ignores logos, icons, formula images, and decorative assets  
- ✅ Clean popup interface to preview images in a scrollable grid  
- ✅ Allows users to select specific images to download  
- ✅ Downloads images into a folder named `WikipediaImages`  
- ✅ Image filenames are based on the Wikipedia article title (e.g., `cricket_1.jpg`, `cricket_2.jpg`, etc.)  
- ✅ No background script used — all logic handled within popup  

---

## 🏗️ Folder Structure

```
wikipedia-image-downloader/
├── popup.html           # Popup interface
├── popup.js             # Image extraction, filtering, download logic
├── style.css            # UI styling for the popup
├── manifest.json        # Extension configuration
├── icon.png             # Extension icon
└── README.md            # Project description
```

---

## 🖥️ How It Works

1. Open any article on Wikipedia (e.g., https://en.wikipedia.org/wiki/Cricket)  
2. Click on the extension icon to launch the popup  
3. The extension scans the article and displays relevant images in a preview grid  
4. Select the images you want to download using checkboxes  
5. Click the "Download Images" button  
6. Selected images will be downloaded into a folder named `WikipediaImages` with filenames like `cricket_1.jpg`, `cricket_2.jpg`, etc.

---

## 🔍 What Images Are Included

- Diagrams, figures, real photographs, content illustrations  
- Images from `<img>`, `<object>`, `<embed>`, and background-image styles  
- Lazy-loaded images are supported  

---

## 🚫 What Images Are Ignored

- Logos, icons, buttons, favicons  
- Images with keywords like "logo", "icon", "wikimedia"  
- Formula-related images and small text-based SVGs  
- Broken or invisible images  

---

## 🛠️ Technologies Used

- HTML, CSS, JavaScript  
- Extension APIs (`downloads`, `scripting`, `activeTab`)  
- DOM parsing and image filtering using custom logic  

---

## 🧪 Example Use Case

- Visit: https://en.wikipedia.org/wiki/Flower  
- Launch the extension → See valid image previews → Select and download  
- Images saved as: `flower_1.jpg`, `flower_2.jpg`, ... inside the `WikipediaImages` folder  

---

## 📦 How to Install Locally

1. Download or clone this repository:  
   ```
   git clone https://github.com/thanujanimmala/wikipedia-image-downloader.git
   ```

2. Open your browser’s extension management page:

   - For Google Chrome:  
     Navigate to `chrome://extensions/`

   - For Microsoft Edge:  
     Navigate to `edge://extensions/`

   - For Firefox:  
     Navigate to `about:debugging` → "This Firefox" → "Load Temporary Add-on"

3. Enable Developer Mode or similar.

4. Click “Load unpacked” or “Load extension” and select the folder you cloned.

5. Done! Open any Wikipedia article and use the extension.

---

## 🚀 Future Improvements

- 🖼️ Add support for Wikimedia Commons and media viewer overlays  
- 🧠 Smarter image classification (AI-based image relevance)  
- 📁 Option to choose download folder and file format  
- 🌐 Multi-language Wikipedia support  
- 💾 Option to save metadata like image alt-text or captions  

---

## 🔗 GitHub Repository

🔗 https://github.com/thanujanimmala/wikipedia-image-downloader


## 📜 License

This project is licensed under the MIT License.  
You are free to use, modify, and distribute it for personal or commercial purposes.

---


