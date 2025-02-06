class CustomNav extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
            <nav>
                <ul>
                    <li><a href="/index.html">home</a></li>
                    <li><a href="/about-the-program/">about the program</a></li>
                </ul>
            </nav>
        `;

        // Highlight active link
        this.highlightActiveLink();
    }

    highlightActiveLink() {
        const links = this.querySelectorAll("nav a"); // Select all nav links
        const currentPath = window.location.pathname; // Get the current page path

        links.forEach(link => {
            if (link.getAttribute("href") === currentPath) {
                link.classList.add("active"); // Add 'active' class to matching link
            }
        });
    }
}

customElements.define('custom-nav', CustomNav);
