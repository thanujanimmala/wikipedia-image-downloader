async function getImages() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  const result = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => {
      const keywords = ['icon', 'logo', 'sprite', 'badge', 'favicon'];
      const imgs = Array.from(document.images);
      return imgs
        .map(img => ({
          src: img.currentSrc || img.src || img.getAttribute("data-src") || "",
          alt: img.alt || "",
          width: img.naturalWidth || img.width,
          height: img.naturalHeight || img.height
        }))
        .filter(img => {
          if (!img.src || img.width < 100 || img.height < 100) return false;
          const lowerSrc = img.src.toLowerCase();
          return !keywords.some(k => lowerSrc.includes(k));
        });
    }
  });

  return result[0].result;
}

function createImageGrid(images) {
  const container = document.getElementById("images");
  container.innerHTML = "";

  images.forEach((imgObj, index) => {
    const wrapper = document.createElement("div");
    wrapper.className = "img-tile";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = true;

    const img = document.createElement("img");
    img.src = imgObj.src;
    img.alt = imgObj.alt || `image${index + 1}`;
    img.onerror = () => wrapper.remove(); // hide broken

    wrapper.appendChild(checkbox);
    wrapper.appendChild(img);
    container.appendChild(wrapper);
  });

  document.getElementById("status").textContent = `${images.length} images found`;
}

function getSelectedImages() {
  const tiles = document.querySelectorAll(".img-tile");
  const selected = [];

  tiles.forEach((tile, index) => {
    const checkbox = tile.querySelector("input[type='checkbox']");
    const img = tile.querySelector("img");
    if (checkbox.checked && img && img.src) {
      selected.push(img.src);
    }
  });

  return selected;
}

function downloadImages(imageUrls) {
  imageUrls.forEach((url, index) => {
    const ext = url.split(".").pop().split(/\#|\?/)[0];
    const filename = `image${index + 1}.${ext}`;
    chrome.downloads.download({
      url: url,
      filename: filename
    });
  });

  window.close(); // close popup after download
}

document.addEventListener("DOMContentLoaded", async () => {
  document.getElementById("loading").style.display = "block";
  const images = await getImages();
  document.getElementById("loading").style.display = "none";

  if (images.length > 0) {
    createImageGrid(images);
  } else {
    document.getElementById("status").textContent = "No suitable images found";
  }

  document.getElementById("downloadBtn").addEventListener("click", () => {
    const selected = getSelectedImages();
    if (selected.length === 0) {
      alert("Please select at least one image to download.");
      return;
    }
    downloadImages(selected);
  });
});
