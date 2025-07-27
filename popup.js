function sanitizeFilename(name) {
  return name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
}

function getArticleTitleFromPage() {
  return new Promise((resolve) => {
    chrome.scripting.executeScript({
      target: { tabId: chrome.devtools?.inspectedWindow?.tabId || chrome.tabs.TAB_ID },
      func: () => {
        const h1 = document.querySelector("h1");
        return h1 ? h1.textContent.trim() : document.title.split(" - ")[0];
      },
    }, (results) => {
      const title = results?.[0]?.result || 'image';
      resolve(sanitizeFilename(title));
    });
  });
}

async function getArticleTitle() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  const [{ result }] = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => {
      const h1 = document.querySelector('h1');
      return h1 ? h1.innerText.trim() : document.title.split(" - ")[0];
    },
  });

  return sanitizeFilename(result || "image");
}

function isValidUrl(src) {
  return src && src.startsWith("http");
}

function isBlacklisted(src) {
  return /(icon|logo|wikimedia-button|poweredby|badge|sprite)/i.test(src);
}

function isValidSize(width, height) {
  return width >= 80 && height >= 80;
}

async function getImagesFromPage() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  const [{ result: imageData }] = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => {
      const imgSources = Array.from(document.querySelectorAll("img"))
        .map(img => ({
          src: img.src,
          width: img.naturalWidth || img.width,
          height: img.naturalHeight || img.height
        }))
        .filter(img =>
          img.src &&
          img.src.startsWith("http") &&
          img.width >= 80 && img.height >= 80 &&
          !/(icon|logo|wikimedia-button|poweredby|badge|sprite)/i.test(img.src)
        )
        .map(img => img.src);

      const galleryLinks = Array.from(document.querySelectorAll('a[href*="/wiki/File:"]'))
        .map(a => a.href)
        .map(href => {
          const filename = decodeURIComponent(href.split("/wiki/File:")[1]);
          return `https://upload.wikimedia.org/wikipedia/commons/${filename[0]}/${filename[0]}${filename[1]}/${filename}`;
        });

      return [...imgSources, ...galleryLinks];
    }
  });

  const uniqueImages = [...new Set(imageData)];
  return uniqueImages;
}

function createImageTile(url, index) {
  const div = document.createElement("div");
  div.className = "img-tile";

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = true;

  const img = document.createElement("img");
  img.src = url;
  img.alt = "img" + index;
  img.onerror = () => div.remove();

  div.appendChild(checkbox);
  div.appendChild(img);
  return div;
}

document.addEventListener("DOMContentLoaded", async () => {
  const imagesDiv = document.getElementById("images");
  const statusDiv = document.getElementById("status");
  const loadingDiv = document.getElementById("loading");
  const downloadBtn = document.getElementById("downloadBtn");

  loadingDiv.style.display = "block";
  statusDiv.textContent = "";

  const imageUrls = await getImagesFromPage();

  // Filter broken links (asynchronously check valid images)
  const validImages = await Promise.all(imageUrls.map(url => {
    return new Promise(resolve => {
      const img = new Image();
      img.onload = () => resolve(url);
      img.onerror = () => resolve(null);
      img.src = url;
    });
  }));

  const filteredImages = validImages.filter(Boolean);
  loadingDiv.style.display = "none";

  if (filteredImages.length === 0) {
    statusDiv.textContent = "No suitable images found.";
    return;
  }

  statusDiv.textContent = `Found ${filteredImages.length} images.`;

  filteredImages.forEach((url, i) => {
    const tile = createImageTile(url, i + 1);
    imagesDiv.appendChild(tile);
  });

  downloadBtn.addEventListener("click", async () => {
    const tiles = Array.from(document.querySelectorAll(".img-tile"));
    const selectedUrls = tiles
      .filter(tile => tile.querySelector('input[type="checkbox"]').checked)
      .map(tile => tile.querySelector("img").src);

    if (selectedUrls.length === 0) {
      statusDiv.textContent = "No images selected.";
      return;
    }

    const folder = "WikipediaImages";
    const title = await getArticleTitle();

    selectedUrls.forEach((url, i) => {
      const extension = url.split('.').pop().split('?')[0].split('#')[0];
      const filename = `${title}_${i + 1}.${extension}`;
      chrome.downloads.download({
        url,
        filename: `${folder}/${filename}`,
        saveAs: false
      });
    });

    window.close(); // Close popup after download
  });
});
