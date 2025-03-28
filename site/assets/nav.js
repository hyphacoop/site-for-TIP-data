class CustomNav extends HTMLElement {
    async connectedCallback() {
        
        const pages = await this.loadPages();

        this.innerHTML = `
        <div class="container">
            <a href="/" class="title-link">
                <h1 class="title">
                <span class="mr2 purple uppercase">Hypha</span>
                <span class="gray medium">Testnets</span>
                </h1>
            </a>
             <nav>
                <ul>
                    
                    <!-- Insert page links in the nav below --!>

                    
                        <li><a class="mid-gray regular" href="/">Home</a></li>

                        ${pages.map(page => `<li><a class="mid-gray regular" href="${page.url}">${page.title}</a></li>`).join('')}
                        
                        <li>
                            <a class="nav-link mid-gray regular" target="_blank" href="https://hypha.coop">
                                About Hypha 
                                <span class="nav-link-wrapper">
                                    <img class="nav-link-img" src="/assets/images/overlap-character.png" alt="Open in new window">
                                </span>
                            </a>
                        </li>
                    

                    <!-- Page links in navigation are inserted as li elements above this line --!>
                
                </ul>
            </nav>
        </div>
        `;

        // Highlight active link
        this.highlightActiveLink();
    }

    async loadPages() {
        try {
            const response = await fetch('/assets/pages.json');
            return await response.json();
        } catch (error) {
            console.error('Error loading pages:', error);
            return [];
        }
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
