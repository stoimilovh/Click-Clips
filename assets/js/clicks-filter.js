document.addEventListener("DOMContentLoaded", () => {
    const placeholder = document.querySelector(".cards-placeholder");
    const sectionNav = document.querySelector("#clicksSections");

    const sections = ["portraits", "events", "landscape"];

    let currentSection = "portraits";
    let currentPage = 1;

    let currentGalleryState = null; // { section, album, title, count }

    // --------- your folder / filename patterns ----------
    const folderMap = {
        portraits: "Portraits",
        events: "Events",
        landscape: "Landscape",
    };

    const prefixMap = {
        portraits: "portrait",
        events: "event",
        landscape: "landscape",
    };

    function getImageSrc(section, album, i) {
        const folder = folderMap[section] || section;
        const prefix = prefixMap[section] || section;
        return `/photos/clicks/${folder}/${album}/${prefix}-${i}.jpg`;
    }

    // --------- restore view on browser refresh ----------
    const savedView = sessionStorage.getItem("clicks_view");
    const savedGallery = sessionStorage.getItem("clicks_gallery");
    const savedCards = sessionStorage.getItem("clicks_cards");

    if (savedCards) {
        try {
            const c = JSON.parse(savedCards);
            if (c.section) currentSection = c.section;
            if (c.page) currentPage = c.page;
        } catch {}
    }

    // own state for this page so Back from gallery returns to cards (not Home)
    history.replaceState(
        { view: "cards", section: currentSection, page: currentPage },
        "",
        window.location.href
    );

    // initial render based on saved view
    if (savedView === "gallery" && savedGallery) {
        try {
            currentGalleryState = JSON.parse(savedGallery);
            renderGallery(currentGalleryState);
        } catch {
            showSectionsNav(true);
            loadCards(currentSection, currentPage);
            setActiveSection(currentSection);
        }
    } else {
        showSectionsNav(true);
        loadCards(currentSection, currentPage);
        setActiveSection(currentSection);
    }

    // =========================
    // TOP NAV: Portraits / Events / Landscape
    // =========================
    sectionNav?.addEventListener("click", (e) => {
        const link = e.target.closest(".page-link");
        if (!link) return;

        e.preventDefault();

        const section = (link.dataset.section || link.textContent.trim()).toLowerCase();
        if (!sections.includes(section)) return;

        currentSection = section;
        currentPage = 1;

        sessionStorage.setItem(
            "clicks_cards",
            JSON.stringify({ section: currentSection, page: currentPage })
        );
        sessionStorage.setItem("clicks_view", "cards");
        sessionStorage.removeItem("clicks_gallery");

        history.replaceState(
            { view: "cards", section: currentSection, page: currentPage },
            "",
            window.location.href
        );

        showSectionsNav(true);
        loadCards(currentSection, currentPage);
        setActiveSection(currentSection);
    });

    // =========================
    // CLICKS INSIDE PLACEHOLDER
    // =========================
    placeholder.addEventListener("click", (e) => {
        // OPEN ALBUM
        const albumBtn = e.target.closest(".js-open-album");
        if (albumBtn) {
            e.preventDefault();

            const section = (albumBtn.dataset.section || currentSection).toLowerCase();
            const album = (albumBtn.dataset.album || "").trim();
            const title = (albumBtn.dataset.title || albumBtn.textContent.trim()).trim();
            const count = parseInt(albumBtn.dataset.count, 10);

            if (!album) return;
            if (Number.isNaN(count) || count < 1) {
                console.error("Missing/invalid data-count on album button.");
                return;
            }

            currentSection = section;
            currentGalleryState = { section, album, title, count };

            // persist gallery so browser refresh stays on gallery
            sessionStorage.setItem("clicks_view", "gallery");
            sessionStorage.setItem("clicks_gallery", JSON.stringify(currentGalleryState));
            sessionStorage.setItem(
                "clicks_cards",
                JSON.stringify({ section: currentSection, page: currentPage })
            );

            // create history entry for gallery (so Back goes to cards inside Clicks)
            history.pushState(
                { view: "gallery", section, album, title, count },
                "",
                window.location.href
            );

            renderGallery(currentGalleryState);
            return;
        }

        // PAGINATION (cards pages)
        const pagerLink = e.target.closest(".clicks-pagination .page-link");
        if (pagerLink) {
            e.preventDefault();

            const text = pagerLink.textContent.trim().toLowerCase();

            if (text === "next") currentPage += 1;
            else if (text === "previous") currentPage = Math.max(1, currentPage - 1);
            else {
                const n = parseInt(text, 10);
                if (Number.isNaN(n)) return;
                currentPage = n;
            }

            sessionStorage.setItem(
                "clicks_cards",
                JSON.stringify({ section: currentSection, page: currentPage })
            );
            sessionStorage.setItem("clicks_view", "cards");
            sessionStorage.removeItem("clicks_gallery");

            history.replaceState(
                { view: "cards", section: currentSection, page: currentPage },
                "",
                window.location.href
            );

            showSectionsNav(true);
            loadCards(currentSection, currentPage);
            return;
        }

        // BACK TO CLICKS (gallery)
        const backBtn = e.target.closest(".js-back-to-clicks");
        if (backBtn) {
            e.preventDefault();
            history.back();
            return;
        }

        // BACK TO TOP (gallery)
        const topBtn = e.target.closest(".js-back-to-top");
        if (topBtn) {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: "smooth" });
            return;
        }
    });

    // =========================
    // BROWSER BACK/FORWARD
    // =========================
    window.addEventListener("popstate", (e) => {
        const state = e.state;
        if (!state || !state.view) return;

        if (state.view === "cards") {
            currentSection = state.section || "portraits";
            currentPage = state.page || 1;
            currentGalleryState = null;

            sessionStorage.setItem("clicks_view", "cards");
            sessionStorage.setItem(
                "clicks_cards",
                JSON.stringify({ section: currentSection, page: currentPage })
            );
            sessionStorage.removeItem("clicks_gallery");

            showSectionsNav(true);
            setActiveSection(currentSection);
            loadCards(currentSection, currentPage);
        }

        if (state.view === "gallery") {
            currentGalleryState = {
                section: state.section,
                album: state.album,
                title: state.title,
                count: state.count,
            };

            sessionStorage.setItem("clicks_view", "gallery");
            sessionStorage.setItem("clicks_gallery", JSON.stringify(currentGalleryState));

            renderGallery(currentGalleryState);
        }
    });

    // =========================
    // FETCH CARDS COMPONENT
    // =========================
    function loadCards(section, page) {
        fetch(`/clicks/${section}/${section}-${page}.html`)
            .then((res) => {
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                return res.text();
            })
            .then((html) => {
                placeholder.innerHTML = html;
                setActivePage(page);
                setActiveSection(section);
            })
            .catch((err) => {
                console.error("Cards load failed:", err);
                placeholder.innerHTML = `
          <div class="text-center py-5">
            <p>Content failed to load.</p>
          </div>
        `;
            });
    }

    // =========================
    // GALLERY TEMPLATE
    // - hides Portraits/Events/Landscape nav
    // - buttons AFTER photos, centered
    // =========================
    function renderGallery({ section, album, title, count }) {
        showSectionsNav(false);

        const container = document.createElement("div");
        container.innerHTML = `
      <div id="photos" style="margin-top:-1rem">
        <div class="container-fluid d-flex justify-content-center flex-column align-items-center">

          <h1 class="h1 d-flex justify-content-center my-4 text-center">${escapeHtml(title)}</h1>

          <div class="container-fluid" style="max-width:1200px;">
            <div class="row justify-content-center" id="galleryRow"></div>
          </div>

          <div class="w-100 d-flex justify-content-center align-items-center gap-2 my-2"
               style="max-width:1200px;">
            <a href="#" class="btn btn-outline-dark js-back-to-clicks">Back to Clicks</a>
            <a href="#" class="btn btn-dark js-back-to-top">Back to Top</a>
          </div>

          <div style="height:0.5rem;"></div>
        </div>
      </div>
    `;

        placeholder.innerHTML = "";
        placeholder.appendChild(container);

        const row = placeholder.querySelector("#galleryRow");

        for (let i = 1; i <= count; i++) {
            const col = document.createElement("div");
            col.className = "col-12 col-md-6 mb-4 d-flex justify-content-center";

            const src = getImageSrc(section, album, i);

            col.innerHTML = `
        <img class="img-fluid ver"
             src="${src}"
             alt="${escapeHtml(album)} ${i}"
             loading="lazy">
      `;
            row.appendChild(col);
        }
    }

    // =========================
    // ACTIVE STATES
    // =========================
    function setActiveSection(activeSection) {
        if (!sectionNav) return;

        sectionNav.querySelectorAll(".page-item").forEach((li) => li.classList.remove("active"));

        sectionNav.querySelectorAll(".page-link").forEach((link) => {
            const section = (link.dataset.section || link.textContent.trim()).toLowerCase();
            if (section === activeSection) link.closest(".page-item")?.classList.add("active");
        });
    }

    function setActivePage(pageNumber) {
        const pager = placeholder.querySelector(".clicks-pagination");
        if (!pager) return;

        pager.querySelectorAll(".page-item").forEach((li) => li.classList.remove("active"));

        pager.querySelectorAll(".page-link").forEach((link) => {
            const n = parseInt(link.textContent.trim(), 10);
            if (!Number.isNaN(n) && n === pageNumber) {
                link.closest(".page-item")?.classList.add("active");
            }
        });

        const prevLi = Array.from(pager.querySelectorAll(".page-link"))
            .find((a) => a.textContent.trim().toLowerCase() === "previous")
            ?.closest(".page-item");

        if (prevLi) {
            if (pageNumber <= 1) prevLi.classList.add("disabled");
            else prevLi.classList.remove("disabled");
        }
    }

    // =========================
    // SHOW / HIDE TOP SECTIONS NAV
    // =========================
    function showSectionsNav(show) {
        if (!sectionNav) return;
        sectionNav.style.display = show ? "" : "none";
    }

    // =========================
    // SAFE TEXT
    // =========================
    function escapeHtml(str) {
        return String(str)
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
    }
});