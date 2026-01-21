document.addEventListener('DOMContentLoaded', loadHeaderFooter);
document.addEventListener('DOMContentLoaded', setActiveLink);


function loadHeaderFooter() {
    let lang = localStorage.getItem('selectedLanguage');
    if (!lang) {
        lang = 'eng';
        localStorage.setItem('selectedLanguage', lang);
    }

    fetch(`/components/header-${lang}.html`)
        .then(response => response.text())
        .then(data => {
            document.getElementById('header-placeholder').innerHTML = data;
            setActiveLink();
        });

    fetch(`/components/footer-${lang}.html`)
        .then(response => response.text())
        .then(data => {
            document.getElementById('footer-placeholder').innerHTML = data;
        });
}


function setActiveLink() {
    const currentPage = window.location.pathname.split('/').pop() || 'Home.html';
    const links = document.querySelectorAll('#menu a');

    links.forEach(link => {
        const linkHref = link.getAttribute('href');

        if (linkHref.replace(/[^a-z]/gi, '').includes(currentPage.replace(/[^a-z]/gi, ''))) {
            link.classList.add('active');
            link.classList.remove('inactive');
        } else {
            link.classList.remove('active');
            link.classList.add('inactive');
        }
    });
}


function setLanguage(lang) {
    localStorage.setItem('selectedLanguage', lang);
    window.location.reload();
}



function menuShow() {
    const menu = document.getElementById('menu');
    const button = document.getElementById('menu-button')
    menu.classList.toggle('show');
    button.classList.toggle('clicked')
}


