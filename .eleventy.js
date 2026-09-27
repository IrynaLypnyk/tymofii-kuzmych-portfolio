import site from "./src/_data/site.json" with { type: "json" };

function cdnImage(src, width) {
  if (!src) return src;

  let url;

  if (/^https?:\/\//.test(src)) {
    url = src;
  } else {
    const path = String(src)
      .replace(/^\/img\//, "")
      .replace(/^\//, "");

    url = `${site.imageCdn.replace(/\/$/, "")}/${path}`;
  }

  if (!width) return url;

  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}tr=w-${width},f-auto,q-75`;
}

function cdnImageMax(src, requestedWidth, originalWidth) {
  const width = Math.min(requestedWidth, originalWidth);
  return cdnImage(src, width);
}


export default function (eleventyConfig) {
  eleventyConfig.addFilter("cdnImage", cdnImage);
  eleventyConfig.addFilter("cdnImageMax", cdnImageMax);
  eleventyConfig.addPassthroughCopy({ img: "img" });
  eleventyConfig.addPassthroughCopy({ "src/favicon.svg": "favicon.svg" });
  eleventyConfig.addPassthroughCopy({ "src/js": "js" });
  eleventyConfig.addPassthroughCopy({
    "node_modules/photoswipe/dist/photoswipe.css": "vendor/photoswipe.css",
    "node_modules/photoswipe/dist/photoswipe.esm.js": "vendor/photoswipe.esm.js",
    "node_modules/photoswipe/dist/photoswipe-lightbox.esm.js":
      "vendor/photoswipe-lightbox.esm.js",
    "node_modules/photoswipe/dist/photoswipe.esm.js.map":
      "vendor/photoswipe.esm.js.map",
    "node_modules/photoswipe/dist/photoswipe-lightbox.esm.js.map":
      "vendor/photoswipe-lightbox.esm.js.map",
    "node_modules/flickr-justified-gallery/dist/fjGallery.css":
      "vendor/fjGallery.css",
    "node_modules/flickr-justified-gallery/dist/fjGallery.esm.js":
      "vendor/fjGallery.esm.js",
    "node_modules/flickr-justified-gallery/dist/fjGallery.esm.js.map":
      "vendor/fjGallery.esm.js.map",
  });

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      data: "_data",
    },
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk",
  };
}
