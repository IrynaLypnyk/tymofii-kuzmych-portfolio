import PhotoSwipeLightbox from "/vendor/photoswipe-lightbox.esm.js";
import PhotoSwipe from "/vendor/photoswipe.esm.js";
import fjGallery from "/vendor/fjGallery.esm.js";

const panels = [...document.querySelectorAll(".panel")];
const desktopItems = [...document.querySelectorAll(".nav-item")];
const mobileItems = [...document.querySelectorAll(".mobile-menu-item")];
const mobileBar = document.querySelector(".nav-mobile");
const overlayBar = document.querySelector(".mobile-overlay-bar");
const overlay = document.getElementById("mobileOverlay");
const statusEl = document.getElementById("mobileStatus");
const menuToggle = document.getElementById("menuToggle");
const menuClose = document.getElementById("menuClose");
const credit = document.querySelector(".credit");
const viewport = document.querySelector(".main");
const track = document.getElementById("sectionTrack");
const galleries = document.querySelectorAll(".gallery-grid");

const LIGHTBOX_WIDTH = 2000;

let activeIndex = 0;
let wheelLock = false;
let edgeDelta = 0;
let edgeTimer = 0;
let gesture = null;
let lightboxOpen = false;

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function setActive(index) {
  const panel = panels[index];
  if (!panel) return;

  activeIndex = index;

  const theme = panel.dataset.theme;
  const label =
    desktopItems[index]?.querySelector(".nav-label")?.textContent || "";
  const num = desktopItems[index]?.querySelector(".nav-num")?.textContent || "";

  document.body.dataset.active = String(index);
  document.body.dataset.theme = theme;

  desktopItems.forEach((item, i) =>
    item.classList.toggle("is-active", i === index),
  );

  mobileItems.forEach((item, i) =>
    item.classList.toggle("is-active", i === index),
  );

  panels.forEach((item, i) => {
    item.toggleAttribute("inert", i !== index);
    item.classList.toggle("is-active", i === index);
  });

  if (mobileBar) mobileBar.dataset.theme = theme;
  if (overlay) overlay.dataset.theme = theme;
  if (overlayBar) overlayBar.dataset.theme = theme;

  if (credit) {
    credit.style.color =
      getComputedStyle(panel).getPropertyValue("--section-muted");
  }

  if (statusEl) {
    statusEl.textContent = `${num} — ${label.toUpperCase()}`;
  }

  loadPanelImages(panel);

  const gallery = panel.querySelector(".gallery-grid");

  if (gallery?.fjGallery) {
    requestAnimationFrame(() => {
      fjGallery(gallery, "resize");
    });
  }
}

function goTo(index, { updateHash = true, instant = false } = {}) {
  const panel = panels[index];

  if (!panel || !track || index < 0 || index >= panels.length) return;

  const jump = instant || prefersReducedMotion();

  track.classList.toggle("is-instant", jump);
  track.style.setProperty("--section", String(index));

  if (jump) {
    track.getBoundingClientRect();
    track.classList.remove("is-instant");
  }

  setActive(index);
  closeMenu();

  if (updateHash && location.hash !== `#${panel.id}`) {
    history.replaceState(null, "", `#${panel.id}`);
  }
}

function wheelPixels(event, axis) {
  const raw = axis === "x" ? event.deltaX : event.deltaY;

  if (event.deltaMode === 1) return raw * 16;
  if (event.deltaMode === 2) return raw * window.innerHeight;

  return raw;
}

function stepSection(direction) {
  const next = activeIndex + direction;

  if (next < 0 || next >= panels.length) return;

  wheelLock = true;

  goTo(next);

  window.setTimeout(() => {
    wheelLock = false;
  }, 680);
}

function openMenu() {
  overlay.hidden = false;
  menuToggle.classList.add("is-open");
  menuToggle.setAttribute("aria-expanded", "true");
}

function closeMenu() {
  overlay.hidden = true;
  menuToggle.classList.remove("is-open");
  menuToggle.setAttribute("aria-expanded", "false");
}

function hasBlockingOverlay() {
  return !overlay.hidden || lightboxOpen;
}

function loadPanelImages(panel) {
  const images = [...(panel?.querySelectorAll(".gallery-item img") ?? [])];

  images.forEach((img, index) => {
    img.loading = "eager";

    if (index === 0) {
      img.fetchPriority = "high";
    } else {
      img.fetchPriority = "auto";
    }
  });
}

function justifyOptions() {
  const wide = window.matchMedia("(min-width: 600px)").matches;

  return {
    itemSelector: ".gallery-item",
    gutter: wide ? 20 : 12,
    rowHeight: wide ? 400 : 280,
    lastRow: "left",
    transitionDuration: prefersReducedMotion() ? false : "0.25s",

    onJustify() {
      if (this.images.some((image) => image.width && image.height)) {
        this.$container.classList.add("is-ready");
      }
    },
  };
}

function setLightboxSize(link, img) {
  if (!img.naturalWidth) return;

  link.dataset.pswpWidth = String(LIGHTBOX_WIDTH);

  link.dataset.pswpHeight = String(
    Math.round((LIGHTBOX_WIDTH * img.naturalHeight) / img.naturalWidth),
  );
}

function lightboxIcon(inner) {
  return `
    <svg
      aria-hidden="true"
      class="pswp__icn"
      viewBox="0 0 32 32"
      width="32"
      height="32"
      fill="none"
      stroke="currentColor"
      stroke-width="1.6"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      ${inner}
    </svg>
  `;
}

function waitForImage(img) {
  if (img.complete && img.naturalWidth) {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    img.addEventListener("load", resolve, { once: true });
    img.addEventListener("error", resolve, { once: true });
  });
}

function syncLightboxSizes(gallery) {
  gallery.querySelectorAll(".gallery-item").forEach((link) => {
    const img = link.querySelector("img");

    if (img) {
      setLightboxSize(link, img);
    }
  });
}

function initOneGallery(gallery) {
  fjGallery(gallery, justifyOptions());

  const images = [...gallery.querySelectorAll("img")];

  images.forEach((img) => {
    waitForImage(img).then(() => {
      syncLightboxSizes(gallery);

      if (gallery.fjGallery) {
        fjGallery(gallery, "resize");
      }
    });
  });
}

function initGalleries() {
  if (!galleries.length) return;

  galleries.forEach(initOneGallery);

  const desktop = window.matchMedia("(min-width: 600px)");

  desktop.addEventListener("change", () => {
    galleries.forEach((gallery) => {
      if (gallery.fjGallery) {
        fjGallery(gallery, "updateOptions", justifyOptions());
      }
    });
  });

  const lightbox = new PhotoSwipeLightbox({
    gallery: ".gallery-grid",
    children: "a",
    pswpModule: PhotoSwipe,
    bgOpacity: 0.88,

    paddingFn: (viewportSize) => {
      const space = viewportSize.x < 600 ? 16 : 48;

      return {
        top: space,
        bottom: space,
        left: space,
        right: space,
      };
    },

    closeSVG: lightboxIcon('<path d="M9 9l14 14M23 9L9 23"/>'),

    arrowPrevSVG: lightboxIcon('<path d="M19 6L10 16l9 10"/>'),

    arrowNextSVG: lightboxIcon('<path d="M13 6l9 10-9 10"/>'),

    zoomSVG: lightboxIcon(
      '<circle cx="14" cy="14" r="6.2"/><path d="M18.8 18.8L24 24"/><path class="pswp__zoom-icn-bar-h" d="M11 14h6"/><path class="pswp__zoom-icn-bar-v" d="M14 11v6"/>',
    ),
  });

  lightbox.addFilter("itemData", (itemData) => {
    if (itemData.width && itemData.height) {
      return itemData;
    }

    const img = itemData.element?.querySelector("img");

    if (!img?.naturalWidth) {
      return itemData;
    }

    itemData.width = LIGHTBOX_WIDTH;

    itemData.height = Math.round(
      (LIGHTBOX_WIDTH * img.naturalHeight) / img.naturalWidth,
    );

    return itemData;
  });

  lightbox.on("beforeOpen", () => {
    lightboxOpen = true;
  });

  lightbox.on("close", () => {
    lightboxOpen = false;
  });

  lightbox.init();
}

[...desktopItems, ...mobileItems].forEach((item) => {
  item.addEventListener("click", () => {
    goTo(Number(item.dataset.index));
  });
});

document.querySelectorAll("[data-target]").forEach((el) => {
  if (el.matches(".nav-item, .mobile-menu-item")) {
    return;
  }

  el.addEventListener("click", () => {
    const index = panels.findIndex((panel) => panel.id === el.dataset.target);

    if (index >= 0) {
      goTo(index);
    }
  });
});

menuToggle.addEventListener("click", () => {
  if (overlay.hidden) {
    openMenu();
  } else {
    closeMenu();
  }
});

menuClose.addEventListener("click", closeMenu);

window.addEventListener(
  "wheel",
  (event) => {
    if (hasBlockingOverlay()) return;

    const deltaX = wheelPixels(event, "x");

    const deltaY = wheelPixels(event, "y");

    if (Math.abs(deltaX) <= Math.abs(deltaY) * 1.6) {
      return;
    }

    event.preventDefault();

    if (wheelLock) return;

    edgeDelta += deltaX;

    window.clearTimeout(edgeTimer);

    edgeTimer = window.setTimeout(() => {
      edgeDelta = 0;
    }, 180);

    if (Math.abs(edgeDelta) < 48) {
      return;
    }

    const direction = edgeDelta > 0 ? 1 : -1;

    edgeDelta = 0;

    stepSection(direction);
  },
  { passive: false },
);

viewport.addEventListener(
  "touchstart",
  (event) => {
    if (lightboxOpen || event.touches.length !== 1) {
      return;
    }

    const touch = event.touches[0];

    gesture = {
      x: touch.clientX,
      y: touch.clientY,
      scroll: panels[activeIndex]?.scrollTop ?? 0,
    };
  },
  { passive: true },
);

viewport.addEventListener(
  "touchmove",
  (event) => {
    if (!gesture || event.touches.length !== 1) {
      return;
    }

    const touch = event.touches[0];

    const dx = touch.clientX - gesture.x;

    const dy = touch.clientY - gesture.y;

    if (Math.abs(dx) > 12 && Math.abs(dx) > Math.abs(dy) * 1.2) {
      event.preventDefault();
    }
  },
  { passive: false },
);

viewport.addEventListener(
  "touchend",
  (event) => {
    if (!gesture) return;

    const touch = event.changedTouches[0];

    const dx = touch.clientX - gesture.x;

    const dy = touch.clientY - gesture.y;

    const scrolled = Math.abs(
      (panels[activeIndex]?.scrollTop ?? 0) - gesture.scroll,
    );

    gesture = null;

    if (scrolled > 8) return;

    if (Math.abs(dx) < 56 || Math.abs(dx) < Math.abs(dy) * 1.3) {
      return;
    }

    stepSection(dx < 0 ? 1 : -1);
  },
  { passive: true },
);

window.addEventListener("keydown", (event) => {
  if (
    event.defaultPrevented ||
    event.metaKey ||
    event.ctrlKey ||
    event.altKey
  ) {
    return;
  }

  if (hasBlockingOverlay()) {
    return;
  }

  const target = event.target;

  if (
    target instanceof HTMLElement &&
    target.closest("input, textarea, select, a")
  ) {
    return;
  }

  if (event.key === "ArrowRight") {
    event.preventDefault();

    goTo(Math.min(panels.length - 1, activeIndex + 1));
  } else if (event.key === "ArrowLeft") {
    event.preventDefault();

    goTo(Math.max(0, activeIndex - 1));
  }
});

function getInitialIndex() {
  const id = location.hash.replace("#", "");

  if (!id) {
    return 0;
  }

  const index = panels.findIndex((panel) => panel.id === id);

  return index >= 0 ? index : 0;
}

function applyHash() {
  const id = location.hash.replace("#", "");

  if (!id) {
    goTo(0, {
      updateHash: false,
      instant: true,
    });

    return;
  }

  const index = panels.findIndex((panel) => panel.id === id);

  if (index >= 0) {
    goTo(index, {
      updateHash: false,
      instant: true,
    });
  }
}

initGalleries();

window.addEventListener("hashchange", applyHash);

goTo(getInitialIndex(), {
  updateHash: false,
  instant: true,
});
