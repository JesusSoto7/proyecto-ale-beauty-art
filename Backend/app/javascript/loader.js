document.addEventListener("DOMContentLoaded", () => {
  const loader = document.getElementById("loader");
  if (!loader) return;

  const hideLoader = () => {
    loader.classList.add("hidden");
  };

  const images = Array.from(document.images);
  let loaded = 0;

  const done = () => {
    loaded++;
    if (loaded >= images.length) {
      setTimeout(hideLoader, 100);
    }
  };

  if (images.length === 0) {
    hideLoader();
  } else {
    images.forEach(img => {
      if (img.complete) {
        done();
      } else {
        img.addEventListener("load", done);
        img.addEventListener("error", done);
      }
    });

    setTimeout(hideLoader, 10000);
  }
});
