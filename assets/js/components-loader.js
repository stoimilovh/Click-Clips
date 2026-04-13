document.addEventListener("DOMContentLoaded", loadPlaceholders);

function loadPlaceholders() {
    let lang = localStorage.getItem("selectedLanguage");
    if (!lang) {
        lang = "eng";
        localStorage.setItem("selectedLanguage", lang);
    }

    const placeholders = document.querySelectorAll('[id$="-placeholder"]');

    function runComponentInit(placeholderId) {
        if (placeholderId === "header-placeholder" && typeof window.setActiveLink === "function") {
            window.setActiveLink();
        }

        if (placeholderId === "booking-placeholder" && typeof window.initBookingForm === "function") {
            window.initBookingForm();
        }
    }

    document.dispatchEvent(new CustomEvent("components:loading", { detail: { lang } }));

    const jobs = Array.from(placeholders).map((el) => {
        const id = el.id;
        const name = id.replace(/-placeholder$/, "");
        const url = `/components/${name}-${lang}.html`;

        return fetch(url)
            .then((res) => {
                if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
                return res.text();
            })
            .then((html) => {
                el.innerHTML = html;

                runComponentInit(id);
            })
            .catch((err) => {
                console.error("Component load failed:", err);
                el.innerHTML = `
          <div style="padding:1rem;border:1px solid #ddd;border-radius:12px;">
            Component failed to load: <b>${name}-${lang}.html</b>
          </div>
        `;
            });
    });

    Promise.all(jobs).then(() => {
        document.dispatchEvent(new CustomEvent("components:loaded", { detail: { lang } }));

        if (typeof window.setActiveLink === "function") window.setActiveLink();
    });
}