document.documentElement.classList.add("js");

const viewButtons = document.querySelectorAll("[data-view-target]");
const panels = document.querySelectorAll("[data-view]");
const galleryStage = document.querySelector(".gallery-stage");
const LEAD_IMAGE = "selected-1.jpg";
const seriesOrder = ["selected", "boston", "cali", "summer"];
const lightbox = document.querySelector(".lightbox");
const lightboxImage = document.querySelector(".lightbox-image");
const lightboxTitle = document.querySelector("#lightbox-title");
const lightboxDescription = document.querySelector(".lightbox-description");
const lightboxCopy = document.querySelector(".lightbox-copy");
const lightboxCloseTriggers = document.querySelectorAll("[data-lightbox-close]");

const galleryManifest = [
  "0O8A9774.JPG",
  "IMG_5015.jpg",
  "IMG_5018.jpg",
  "IMG_5114-2.jpg",
  "IMG_5135.jpg",
  "IMG_5142.jpg",
  "IMG_5147.jpg",
  "IMG_5153.jpg",
  "IMG_5160.jpg",
  "IMG_5162.jpg",
  "IMG_5166.jpg",
  "IMG_5173.jpg",
  "IMG_5188.jpg",
  "IMG_5209.jpg",
  "IMG_5213.jpg",
  "IMG_5214.jpg",
  "IMG_5226.jpg",
  "IMG_5259.jpg",
  "IMG_5275.jpg",
  "IMG_5284.jpg",
  "IMG_5312.jpg",
  "IMG_5315.jpg",
  "IMG_5342.jpg",
  "IMG_5345.jpg",
  "IMG_5427.jpg",
  "IMG_5437.jpg",
  "IMG_5441.jpg",
  "IMG_5445.jpg",
  "IMG_5499.jpg",
  "IMG_5507.jpg",
  "IMG_5523.jpg",
  "IMG_5572.jpg",
  "IMG_5578.jpg",
  "IMG_5588.jpg",
  "IMG_5621.jpg",
  "IMG_5632.jpg",
  "IMG_5639.jpg",
  "IMG_5681.jpg",
  "IMG_5693.jpg",
  "IMG_5705.jpg",
  "IMG_5706.jpg",
  "IMG_5773.jpg",
  "IMG_5785.jpg",
  "IMG_5801.jpg",
  "IMG_5813.jpg",
  "IMG_5817.jpg",
  "IMG_5819.jpg",
  "IMG_5837-Enhanced-NR.jpg",
  "IMG_6067.jpg",
  "IMG_9635-3.jpg",
  "IMG_9637-3.jpg",
  "IMG_9700-3.jpg",
  "boston-1.jpg",
  "boston-2.jpg",
  "cali-2.jpg",
  "selected-1.jpg",
  "selected-2.jpg",
  "selected-3.jpg",
  "selected-4.jpg",
  "summer-1.jpg",
  "summer-2.jpg",
];

const categoryLabels = {
  selected: "Selected",
  boston: "Boston",
  cali: "California",
  summer: "Summer",
};

const featuredCopy = {
  "selected-1.jpg": {
    title: "Stillness in Structure",
    description:
      "A quiet frame built around balance, negative space, and the tension between architecture and atmosphere.",
  },
  "selected-2.jpg": {
    title: "Movement Through Lines",
  },
  "selected-3.jpg": {
    title: "Portrait-Like Depth",
    description:
      "This frame leans into contrast and subject isolation, using depth to make the viewer pause on a single moment.",
  },
  "boston-1.jpg": {
    title: "Boston in Soft Light",
    description:
      "Part of a city study focused on texture, weather, and the calm hidden inside urban density.",
  },
  "cali-2.jpg": {
    title: "California Transit",
    description:
      "A travel frame shaped by motion, color layering, and the energy of arriving somewhere new.",
  },
  "summer-1.jpg": {
    title: "Endless Summer",
    description:
      "A brighter collection built around seasonal warmth, slow afternoons, and the emotional memory of summer light.",
  },
};

let lastFocusedCard = null;

function activateView(target) {
  viewButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.viewTarget === target);
  });

  panels.forEach((panel) => {
    const active = panel.dataset.view === target;
    panel.classList.toggle("active", active);
    panel.setAttribute("aria-hidden", String(!active));

    // Reveal animations inside a freshly shown panel won't trip the scroll
    // observer (it was display:none), so mark them visible on switch.
    if (active) {
      panel.querySelectorAll(".reveal").forEach((el) => el.classList.add("in"));
    }
  });
}

function getCategory(filename) {
  if (filename.startsWith("selected-") || filename === "0O8A9774.JPG") {
    return "selected";
  }

  if (filename.startsWith("boston-") || /^IMG_5[0-3]/.test(filename)) {
    return "boston";
  }

  if (filename.startsWith("cali-") || /^IMG_(54|55|56|57|58|59|6067)/.test(filename)) {
    return "cali";
  }

  if (filename.startsWith("summer-") || /^IMG_9(63|70)/.test(filename)) {
    return "summer";
  }

  return "selected";
}

function escapeAttr(value) {
  return value.replace(/"/g, "&quot;");
}

function plateLabel(plateNo) {
  return `Pl. ${String(plateNo).padStart(2, "0")}`;
}

function buildCard(filename, category, plateNo) {
  const meta = featuredCopy[filename] || {};
  const title = meta.title || "";
  const description = meta.description || "";
  const plate = plateLabel(plateNo);
  const alt = title || `${categoryLabels[category]} photograph — ${plate}`;
  const ariaLabel = title ? `Open ${title} (${plate})` : `Open ${plate}`;
  const caption = title
    ? `<figcaption class="card-caption"><span>${title}</span></figcaption>`
    : "";

  return `
    <figure
      class="gallery-card"
      data-category="${category}"
      data-title="${escapeAttr(title)}"
      data-description="${escapeAttr(description)}"
      tabindex="0"
      role="button"
      aria-label="${escapeAttr(ariaLabel)}"
    >
      <div class="gallery-media">
        <img src="assets/images/gallery/${filename}" alt="${escapeAttr(alt)}" loading="lazy" />
        <span class="plate-tag">${plate}</span>
        ${caption}
      </div>
    </figure>
  `;
}

function renderGallery() {
  // Group every photo by series, preserving manifest order, while pulling the
  // designated lead image out so it can headline the page as a full-width feature.
  const groups = { selected: [], boston: [], cali: [], summer: [] };

  galleryManifest.forEach((filename) => {
    if (filename === LEAD_IMAGE) {
      return;
    }
    groups[getCategory(filename)].push(filename);
  });

  const leadMeta = featuredCopy[LEAD_IMAGE] || {};
  const leadTitle = leadMeta.title || "";
  const leadDescription = leadMeta.description || "";
  const leadAlt = leadTitle || "Featured photograph";

  // Plates are numbered continuously across the whole hall (lead = Pl. 01).
  let plateNo = 1;

  const lead = `
    <figure
      class="gallery-lead gallery-card"
      data-category="${getCategory(LEAD_IMAGE)}"
      data-title="${escapeAttr(leadTitle)}"
      data-description="${escapeAttr(leadDescription)}"
      tabindex="0"
      role="button"
      aria-label="${escapeAttr(leadTitle ? `Open ${leadTitle} (${plateLabel(plateNo)})` : "Open featured plate")}"
    >
      <div class="gallery-media">
        <img src="assets/images/gallery/${LEAD_IMAGE}" alt="${escapeAttr(leadAlt)}" loading="eager" />
        <span class="plate-no">${plateLabel(plateNo)}</span>
        ${leadTitle ? `<figcaption class="lead-caption"><span>${leadTitle}</span></figcaption>` : ""}
      </div>
    </figure>
  `;

  const series = seriesOrder
    .filter((category) => groups[category].length > 0)
    .map((category) => {
      const items = groups[category];
      const cards = items.map((filename) => buildCard(filename, category, ++plateNo)).join("");

      return `
        <section class="gallery-series">
          <h3 class="series-title" data-count="${String(items.length).padStart(2, "0")} plates">${categoryLabels[category]}</h3>
          <div class="gallery-grid">${cards}</div>
        </section>
      `;
    })
    .join("");

  galleryStage.innerHTML = lead + series;
}

function openLightbox(card) {
  const image = card.querySelector("img");
  const title = card.dataset.title?.trim() || "";
  const description = card.dataset.description?.trim() || "";

  lastFocusedCard = card;
  lightboxImage.src = image.src;
  lightboxImage.alt = image.alt;
  lightboxTitle.textContent = title;
  lightboxTitle.hidden = !title;
  lightboxDescription.textContent = description;
  lightboxCopy.classList.toggle("is-empty", !title && !description);
  lightbox.classList.add("open");
  lightbox.setAttribute("aria-hidden", "false");
  document.body.classList.add("lightbox-open");
}

function closeLightbox() {
  lightbox.classList.remove("open");
  lightbox.setAttribute("aria-hidden", "true");
  document.body.classList.remove("lightbox-open");
  lightboxImage.src = "";
  lightboxImage.alt = "";
  lightboxTitle.textContent = "";
  lightboxTitle.hidden = false;
  lightboxDescription.textContent = "";

  if (lastFocusedCard) {
    lastFocusedCard.focus();
  }
}

viewButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activateView(button.dataset.viewTarget);
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
});

galleryStage.addEventListener("click", (event) => {
  const card = event.target.closest(".gallery-card");

  if (card) {
    openLightbox(card);
  }
});

galleryStage.addEventListener("keydown", (event) => {
  const card = event.target.closest(".gallery-card");

  if (card && (event.key === "Enter" || event.key === " ")) {
    event.preventDefault();
    openLightbox(card);
  }
});

lightboxCloseTriggers.forEach((trigger) => {
  trigger.addEventListener("click", closeLightbox);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && lightbox.classList.contains("open")) {
    closeLightbox();
  }
});

// Live St. Louis (Central) time in the masthead ticker.
const clockEl = document.querySelector("[data-clock]");
function tickClock() {
  if (!clockEl) return;
  const time = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Chicago",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(new Date());
  clockEl.textContent = `${time} CT`;
}
tickClock();
setInterval(tickClock, 1000);

// Scroll-reveal: fade sections up as they enter the viewport.
const reveals = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window && reveals.length) {
  const io = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          observer.unobserve(entry.target);
        }
      });
    },
    { rootMargin: "0px 0px -10% 0px", threshold: 0.08 }
  );
  reveals.forEach((el) => io.observe(el));
} else {
  reveals.forEach((el) => el.classList.add("in"));
}

renderGallery();
activateView("profile");
