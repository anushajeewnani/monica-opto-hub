// Website Content Management System
class WebsiteContentManager {
    constructor() {
        this.adminData = null;
        this.init();
    }

    init() {
        this.loadAdminData();
        this.setupEventListeners();
        this.updateWebsiteContent();
        
        // Auto-refresh content every 5 seconds
        setInterval(() => {
            this.loadAdminData();
            this.updateWebsiteContent();
        }, 5000);
    }

    loadAdminData() {
        try {
            const savedData = localStorage.getItem('adminPanelData');
            if (savedData) {
                this.adminData = JSON.parse(savedData);
                console.log('Website content data loaded:', this.adminData);
            }
        } catch (error) {
            console.error('Error loading admin data:', error);
        }
    }

    setupEventListeners() {
        // Listen for storage changes from admin panel
        window.addEventListener('storage', (e) => {
            if (e.key === 'adminPanelData') {
                console.log('Storage change detected in website content manager');
                this.loadAdminData();
                this.updateWebsiteContent();
            }
        });

        // Listen for custom events from admin panel
        window.addEventListener('adminDataUpdated', (event) => {
            console.log('Admin data updated event received in website content manager:', event.detail);
            this.loadAdminData();
            this.updateWebsiteContent();
        });
    }

    updateWebsiteContent() {
        if (!this.adminData) return;

        this.updateHeroSection();
        this.updateAnnouncement();
        this.updateBrands();
        this.updateSocialMedia();
        this.updateSiteSettings();
        this.updateProducts();
    }

    updateProducts() {
        // Notify ProductDisplay about product updates
        if (window.productDisplay) {
            console.log('Notifying ProductDisplay about product updates');
            window.productDisplay.loadProducts();
            window.productDisplay.displayProductsOnPageLoad();
        }
    }

    updateHeroSection() {
        const content = this.adminData.settings?.content?.hero;
        if (!content) return;

        // Update hero eyebrow text
        const eyebrowElement = document.querySelector('.hero .eyebrow');
        if (eyebrowElement) {
            eyebrowElement.textContent = content.eyebrow || 'Now Trending';
        }

        // Update hero title
        const titleElement = document.querySelector('.hero h1');
        if (titleElement) {
            titleElement.textContent = content.title || 'Ray-Ban Meta Glasses';
        }

        // Update hero description
        const descElement = document.querySelector('.hero .lead');
        if (descElement) {
            descElement.textContent = content.description || 'Immersive, iconic, and innovative. Book your pair today.';
        }

        // Update hero image if provided
        if (content.image) {
            const heroMedia = document.querySelector('.hero__media');
            if (heroMedia) {
                heroMedia.style.backgroundImage = `url(${content.image})`;
                heroMedia.style.backgroundSize = 'cover';
                heroMedia.style.backgroundPosition = 'center';
            }
        }
    }

    updateAnnouncement() {
        const announcement = this.adminData.settings?.content?.announcement;
        if (!announcement) return;

        const noticeElement = document.querySelector('.notice');
        if (noticeElement) {
            if (announcement.visible) {
                noticeElement.style.display = 'block';
                noticeElement.querySelector('.container').textContent = announcement.text;
            } else {
                noticeElement.style.display = 'none';
            }
        }
    }

    updateBrands() {
        const brands = this.adminData.settings?.content?.brands;
        if (!brands || !Array.isArray(brands)) return;

        // Update brand dropdown in product form
        const brandSelect = document.getElementById('productBrand');
        if (brandSelect) {
            // Clear existing options except the first one
            brandSelect.innerHTML = '<option value="">Select Brand</option>';
            
            // Add brands from admin data
            brands.forEach(brand => {
                const option = document.createElement('option');
                option.value = brand;
                option.textContent = brand;
                brandSelect.appendChild(option);
            });
        }

        // Update brand grid on homepage
        this.updateBrandGrid(brands);
    }

    updateBrandGrid(brands) {
        const brandGrid = document.querySelector('.brand-grid');
        if (!brandGrid) return;

        // Brand grid is now handled by direct links to brand pages
        // No JavaScript filtering needed
        console.log('Brand grid updated with direct links to brand pages');
    }


    updateSocialMedia() {
        const social = this.adminData.settings?.content?.social;
        if (!social) return;

        // Update WhatsApp button
        if (social.whatsapp) {
            const whatsappButtons = document.querySelectorAll('[onclick*="wa.me"]');
            whatsappButtons.forEach(button => {
                const onclick = button.getAttribute('onclick');
                if (onclick) {
                    button.setAttribute('onclick', onclick.replace(/wa\.me\/\d+/, `wa.me/${social.whatsapp}`));
                }
            });
        }

        // Update contact phone in footer
        const phoneLink = document.querySelector('a[href^="tel:"]');
        if (phoneLink && social.whatsapp) {
            phoneLink.href = `tel:+${social.whatsapp}`;
            phoneLink.textContent = `+${social.whatsapp}`;
        }
    }

    updateSiteSettings() {
        const website = this.adminData.settings?.website;
        if (!website) return;

        // Update page title
        if (website.title) {
            document.title = website.title;
        }

        // Update meta description
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc && website.description) {
            metaDesc.content = website.description;
        }

        // Update logo text
        const logo = document.querySelector('.logo');
        if (logo && website.title) {
            logo.textContent = website.title;
        }

        // Update contact email
        const emailLink = document.querySelector('a[href^="mailto:"]');
        if (emailLink && website.contactEmail) {
            emailLink.href = `mailto:${website.contactEmail}`;
            emailLink.textContent = website.contactEmail;
        }
    }

    // Method to get current content for admin panel
    getCurrentContent() {
        return {
            hero: {
                eyebrow: document.querySelector('.hero .eyebrow')?.textContent || '',
                title: document.querySelector('.hero h1')?.textContent || '',
                description: document.querySelector('.hero .lead')?.textContent || '',
                image: ''
            },
            announcement: {
                text: document.querySelector('.notice .container')?.textContent || '',
                visible: document.querySelector('.notice')?.style.display !== 'none'
            },
            brands: this.adminData?.settings?.content?.brands || [],
            social: {
                whatsapp: this.extractWhatsAppNumber(),
                instagram: 'https://www.instagram.com/monicaoptohub?igsh=d3ZsMTA1ZzE5Zm0z&utm_source=qr',
                facebook: ''
            }
        };
    }

    extractWhatsAppNumber() {
        const whatsappButton = document.querySelector('[onclick*="wa.me"]');
        if (whatsappButton) {
            const onclick = whatsappButton.getAttribute('onclick');
            const match = onclick.match(/wa\.me\/(\d+)/);
            return match ? match[1] : '917000532010';
        }
        return '917000532010';
    }

    // Method to refresh all content
    refreshContent() {
        this.loadAdminData();
        this.updateWebsiteContent();
        
        // Also refresh products if productDisplay exists
        if (window.productDisplay) {
            window.productDisplay.loadProducts();
            window.productDisplay.displayProductsOnPageLoad();
        }
    }
}

// Initialize website content manager
window.websiteContentManager = new WebsiteContentManager();

// Global function for manual refresh
window.refreshWebsiteContent = function() {
    console.log('Manually refreshing website content...');
    window.websiteContentManager.refreshContent();
};

console.log('Website content manager loaded. Use window.refreshWebsiteContent() to manually refresh.');
