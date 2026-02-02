document.addEventListener("DOMContentLoaded", loadPlaceholders);

function loadPlaceholders() {
    let lang = localStorage.getItem("selectedLanguage");
    if (!lang) {
        lang = "eng";
        localStorage.setItem("selectedLanguage", lang);
    }

    const placeholders = document.querySelectorAll('[id$="-placeholder"]');

    placeholders.forEach((el) => {
        const id = el.id;
        const name = id.replace(/-placeholder$/, "");

        const url = `/components/${name}-${lang}.html`;

        fetch(url)
            .then((res) => {
                if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
                return res.text();
            })
            .then((html) => {
                el.innerHTML = html;

                if (id === "header-placeholder" && typeof window.setActiveLink === "function") {
                    window.setActiveLink();
                }
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

    document.dispatchEvent(new CustomEvent("components:loading", { detail: { lang } }));

    Promise.all(
        Array.from(placeholders).map((el) => {
            const name = el.id.replace(/-placeholder$/, "");
            const url = `/components/${name}-${lang}.html`;
            return fetch(url).then((r) => (r.ok ? r.text() : ""));
        })
    ).then(() => {
        document.dispatchEvent(new CustomEvent("components:loaded", { detail: { lang } }));
        if (typeof window.setActiveLink === "function") window.setActiveLink();
    });
}