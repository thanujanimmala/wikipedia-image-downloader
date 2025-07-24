document.addEventListener("DOMContentLoaded", () => {
  const loading = document.getElementById("loading");
  const imagesDiv = document.getElementById("images");
  const statusDiv = document.getElementById("status");
  const downloadBtn = document.getElementById("downloadBtn");

  let articleTitle = "image"; // fallback title

  loading.style.display = "block";
  imagesDiv.innerHTML = "";
  statusDiv.textContent = "";

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tabId = tabs[0].id;
    chrome.scripting.executeScript(
      {
        target: { tabId },
        func: () => {
          const container = document.querySelector("#mw-content-text") || document.body;
          const title = document.title.split(" - ")[0].replace(/[^a-z0-9]/gi, "_").toLowerCase();

          const imgs = Array.from(container.querySelectorAll("img"));
          const isTexty = (alt) => alt && /^[a-z0-9\s\-:,.'"]{5,}$/.test(alt.trim().toLowerCase());

          const filtered = imgs.filter(img => {
            const src = img.src || "";
            const w = img.naturalWidth;
            const h = img.naturalHeight;
            const a = w / (h || 1);
            const alt = img.alt;

            const tooSmall = w < 50 || h < 50;
            const oddAspect = a > 6 || a < 0.15;
            const textImage = isTexty(alt);
            const badClasses = ["logo", "icon", "navbox", "footer", "metadata", "infobox"];
            const classHit = badClasses.some(cls => img.closest("." + cls));

            return !tooSmall && !oddAspect && !textImage && !classHit && src.startsWith("http");
          });

          return { title, urls: filtered.map(img => img.src) };
        },
      },
      (results) => {
        if (!results || !results[0]) return;
        const { title, urls } = results[0].result;
        articleTitle = title;
        loading.style.display = "none";

        if (urls.length === 0) {
          statusDiv.textContent = "No suitable images found.";
          return;
        }

        urls.forEach((url, index) => {
          const tile = document.createElement("div");
          tile.className = "img-tile";

          const checkbox = document.createElement("input");
          checkbox.type = "checkbox";
          checkbox.checked = true;
          checkbox.dataset.url = url;

          const thumb = document.createElement("img");
          thumb.src = url;

          tile.appendChild(checkbox);
          tile.appendChild(thumb);
          imagesDiv.appendChild(tile);
        });

        statusDiv.textContent = `Found ${urls.length} images. You can uncheck any.`;
      }
    );
  });
  downloadBtn.addEventListener("click", () => {
    const checkboxes = imagesDiv.querySelectorAll("input[type='checkbox']:checked");
    if (checkboxes.length === 0) {
      statusDiv.textContent = "No images selected.";
      return;
    }
    checkboxes.forEach((cb, index) => {
      const url = cb.dataset.url;
      const ext = (url.split('.').pop().split(/#|\?|&/)[0] || 'jpg').slice(0, 5);
      chrome.downloads.download({
        url,
        filename: `WikipediaImages/${articleTitle}${index + 1}.${ext}`,
        conflictAction: "uniquify"
      });
    });

    statusDiv.textContent = `Downloading ${checkboxes.length} image(s)...`;

    // Automatically close the popup after short delay
    setTimeout(() => {
      window.close();
    }, 1000);
  });
});