class CustomNav extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
        <div class="container">
            <a href="https://testnets.hypha.coop" class="title-link">
                <h1 class="title">
                <span class="mr2 purple uppercase">Hypha</span>
                <span class="gray regular">Testnets</span>
                </h1>
            </a>
             <nav>
                <ul>
                    
                    <!-- Insert page links in the nav below --!>

                    
                        <li><a href="/">Home</a></li>
                        <li><a href="/about-the-program/">About the program</a></li>
                        <li><a href="https://hypha.coop">About Hypha</a></li>
                    

                    <!-- Page links in navigation are inserted as li elements above this line --!>
                
                </ul>
            </nav>
        </div>
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
