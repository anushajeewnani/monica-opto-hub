// Product Display System
class ProductDisplay {
    constructor() {
        this.products = [];
        this.useBackend = true; // Flag to enable/disable backend integration
        this.init().catch(error => {
            console.error('Error initializing ProductDisplay:', error);
            // Fallback initialization
            this.initializeSampleProducts();
        });
    }

    async init() {
        console.log('=== INITIALIZING PRODUCT DISPLAY ===');
        this.setupEventListeners();
        
        // Load products and wait for completion
        await this.loadProducts();
        
        console.log('Products loaded:', this.products.length);
        
        // Display products when page loads - try multiple times to ensure it works
        setTimeout(() => {
            this.displayProductsOnPageLoad();
        }, 100);
        
        setTimeout(() => {
            this.displayProductsOnPageLoad();
        }, 500);
        
        setTimeout(() => {
            this.displayProductsOnPageLoad();
        }, 1000);
        
        console.log('=== PRODUCT DISPLAY INITIALIZED ===');
    }

    setupEventListeners() {
        // Listen for admin panel updates
        window.addEventListener('adminDataUpdated', (event) => {
            console.log('Admin data updated event received:', event.detail);
            this.loadProducts();
            this.displayProductsOnPageLoad();
        });

        // Listen for storage changes
        window.addEventListener('storage', (e) => {
            if (e.key === 'adminPanelData') {
                console.log('Storage change detected for adminPanelData');
                this.loadProducts();
                this.displayProductsOnPageLoad();
            }
        });

        // Event delegation for View Details buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('view-details-btn')) {
                e.preventDefault();
                e.stopPropagation();
                const productId = e.target.getAttribute('data-product-id');
                console.log('View Details button clicked!');
                console.log('Button element:', e.target);
                console.log('Product ID:', productId);
                console.log('ProductDisplay instance:', this);
                
                if (productId) {
                    console.log('Calling viewProduct with ID:', productId);
                    this.viewProduct(productId);
                } else {
                    console.error('No product ID found on button');
                    console.log('Button attributes:', e.target.attributes);
                }
            }
        });

        // Event delegation for Add to Cart buttons
        document.addEventListener('click', (e) => {
            console.log('Click detected on:', e.target);
            console.log('Target classes:', e.target.classList.toString());
            console.log('Is Add to Cart button?', e.target.classList.contains('add-to-cart-btn'));
            
            if (e.target.classList.contains('add-to-cart-btn')) {
                console.log('✅ Add to Cart button clicked!');
                e.preventDefault();
                e.stopPropagation();
                
                // Get product info from data attributes
                const productName = e.target.getAttribute('data-product-name') || 'this product';
                const productBrand = e.target.getAttribute('data-product-brand') || 'Unknown Brand';
                const productPrice = parseFloat(e.target.getAttribute('data-product-price')) || 0;
                const productCategory = e.target.getAttribute('data-product-category') || '';
                const productModel = e.target.getAttribute('data-product-model') || '';
                const productId = e.target.getAttribute('data-product-id') || '';
                
                console.log('Product info:', { productName, productBrand, productPrice, productCategory, productModel, productId });
                
                // Use the global Add to Cart function
                if (typeof window.openAddToCartModal === 'function') {
                    console.log('Using global openAddToCartModal function');
                    window.openAddToCartModal(productName, productBrand, productPrice, productCategory, productModel, productId);
                } else {
                    console.error('openAddToCartModal function not available');
                    alert('Add to Cart functionality is not available. Please try refreshing the page.');
                }
            }
        });
    }

    // Load products from backend or localStorage
    async loadProducts() {
        try {
            if (this.useBackend && window.apiClient) {
                console.log('Loading products from backend...');
                const response = await window.apiClient.getProducts();
                this.products = response.products || [];
                console.log('Backend products loaded:', this.products.length);
            } else {
                console.log('Loading products from localStorage...');
                // Fallback to localStorage
                const adminData = JSON.parse(localStorage.getItem('adminPanelData') || '{}');
                this.products = adminData.products || [];
                console.log('LocalStorage products loaded:', this.products.length);
            }
            
            // If no products found, try to initialize with sample data
            if (this.products.length === 0) {
                console.log('No products found, initializing with sample data...');
                this.initializeSampleProducts();
            } else {
                // Products found, make sure they're properly formatted
                this.products = this.products.map(product => ({
                    ...product,
                    featured: Boolean(product.featured), // Ensure boolean
                    price: Number(product.price) || 0, // Ensure number
                    createdAt: product.createdAt || new Date().toISOString(),
                    updatedAt: product.updatedAt || new Date().toISOString()
                }));
                
                console.log('Products processed:', this.products.length);
                console.log('Featured products after processing:', this.products.filter(p => p.featured).length);
            }
        } catch (error) {
            console.error('Error loading products:', error);
            console.log('Falling back to localStorage...');
            
            // Fallback to localStorage
            try {
                const adminData = JSON.parse(localStorage.getItem('adminPanelData') || '{}');
                this.products = adminData.products || [];
            } catch (localError) {
                console.error('Error loading from localStorage:', localError);
                this.products = [];
            }
            
            // Initialize sample products even if there's an error
            if (this.products.length === 0) {
                this.initializeSampleProducts();
            }
        }
    }

    // Initialize sample products if none exist
    initializeSampleProducts() {
        const sampleProducts = [
            {
                id: 'abc-1',
                name: 'abc',
                brand: 'Dolce & Gabbana',
                price: 21590,
                category: 'sunglasses',
                gender: 'men',
                model: '',
                description: 'Luxury sunglasses from Dolce & Gabbana',
                image: 'https://via.placeholder.com/300x200/8b5cf6/ffffff?text=abc+D%26G',
                featured: true,
                createdAt: new Date().toISOString()
            },
            {
                id: '1',
                name: 'Ray-Ban Aviator Classic',
                brand: 'Ray-Ban',
                price: 10990,
                category: 'sunglasses',
                gender: 'unisex',
                model: 'RB3025 001/58',
                description: 'Classic aviator sunglasses with crystal green lenses',
                image: 'https://via.placeholder.com/300x200/1e40af/ffffff?text=Ray-Ban+Aviator',
                featured: true,
                createdAt: new Date().toISOString()
            },
            {
                id: '2',
                name: 'Gucci Oversized Square',
                brand: 'Gucci',
                price: 20700,
                category: 'sunglasses',
                gender: 'women',
                model: 'GG0061S 001',
                description: 'Oversized square sunglasses with crystal lenses',
                image: 'https://via.placeholder.com/300x200/059669/ffffff?text=Gucci+Square',
                featured: true,
                createdAt: new Date().toISOString()
            },
            {
                id: '3',
                name: 'Tom Ford Optical Frame',
                brand: 'Tom Ford',
                price: 24500,
                category: 'optical-frames',
                gender: 'men',
                model: 'TF5156 001',
                description: 'Premium optical frame with titanium construction',
                image: 'https://via.placeholder.com/300x200/7c2d12/ffffff?text=Tom+Ford+Frame',
                featured: false,
                createdAt: new Date().toISOString()
            },
            {
                id: '4',
                name: 'Prada Cat Eye Sunglasses',
                brand: 'Prada',
                price: 33700,
                category: 'sunglasses',
                gender: 'women',
                model: 'PR17WS 1AB-1A4',
                description: 'Elegant cat eye sunglasses with crystal lenses',
                image: 'https://via.placeholder.com/300x200/be185d/ffffff?text=Prada+Cat+Eye',
                featured: true,
                createdAt: new Date().toISOString()
            },
            {
                id: '5',
                name: 'Cartier Optical Frame',
                brand: 'Cartier',
                price: 96500,
                category: 'optical-frames',
                gender: 'unisex',
                model: 'CT0014S 001',
                description: 'Luxury optical frame with gold accents',
                image: 'https://via.placeholder.com/300x200/dc2626/ffffff?text=Cartier+Luxury',
                featured: false,
                createdAt: new Date().toISOString()
            }
        ];

        this.products = sampleProducts;
        this.saveProducts();
        console.log('Sample products initialized:', this.products.length);
        console.log('Products saved to localStorage');
    }

    // Save products to localStorage (for admin panel integration)
    saveProducts() {
        try {
            let adminData = JSON.parse(localStorage.getItem('adminPanelData') || '{}');
            adminData.products = this.products;
            localStorage.setItem('adminPanelData', JSON.stringify(adminData));
            console.log('Products saved to admin panel data');
        } catch (error) {
            console.error('Error saving products:', error);
        }
    }

    // Get products by category
    getProductsByCategory(category) {
        if (category === 'all') {
            return this.products;
        }
        return this.products.filter(product => product.category === category);
    }

    // Get featured products
    getFeaturedProducts() {
        return this.products.filter(product => product.featured === true);
    }

    // Get products by gender
    getProductsByGender(gender) {
        return this.products.filter(product => product.gender === gender);
    }

    // Get placeholder image
    getPlaceholderImage() {
        return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMDAgODBDMTEwLjQ2MSA4MCAxMjAgODkuNTM5IDEyMCAxMDBDMTIwIDExMC40NjEgMTEwLjQ2MSAxMjAgMTAwIDEyMEM4OS41MzkxIDEyMCA4MCAxMTAuNDYxIDgwIDEwMEM4MCA4OS41MzkgODkuNTM5MSA4MCAxMDAgODBaIiBmaWxsPSIjOUNBM0FGIi8+CjxwYXRoIGQ9Ik0xMDAgMTQwQzEwNS41MjMgMTQwIDExMCAxMzUuNTIzIDExMCAxMzBDMTEwIDEyNC40NzcgMTA1LjUyMyAxMjAgMTAwIDEyMEM5NC40NzcyIDEyMCA5MCAxMjQuNDc3IDkwIDEzMEM5MCAxMzUuNTIzIDk0LjQ3NzIgMTQwIDEwMCAxNDBaIiBmaWxsPSIjOUNBM0FGIi8+Cjwvc3ZnPgo=';
    }

    // Render product card
    renderProductCard(product) {
        // Use placeholder image instead of external URLs to avoid 404 errors
        const imageUrl = this.getPlaceholderImage();
        return `
            <article class="product-card">
                <div class="product-card__media">
                    <img src="${imageUrl}" 
                         alt="${product.name}" 
                         style="width: 100%; height: 200px; object-fit: cover; border-radius: 8px;"
                         onerror="this.src='${this.getPlaceholderImage()}'">
                </div>
                <h3 class="product-card__title">${product.name}</h3>
                <p class="product-card__price">₹ ${product.price.toLocaleString()}</p>
                <button class="btn btn--ghost view-details-btn" data-product-id="${product.id}">View Details</button>
                <button class="btn btn--primary add-to-cart-btn" 
                        data-product-name="${product.name}" 
                        data-product-brand="${product.brand}"
                        data-product-price="${product.price}"
                        data-product-category="${product.category}"
                        data-product-model="${product.model || ''}"
                        data-product-id="${product.id}" style="width: 100%; margin-top: 10px;">🛒 Add to Cart</button>
            </article>
        `;
    }

    // Display products in a container
    displayProducts(containerId, category = 'all', limit = null) {
        const container = document.getElementById(containerId);
        if (!container) {
            // Only log error for containers that should exist on this page
            const expectedContainers = ['featuredProducts', 'trendingProducts'];
            if (expectedContainers.includes(containerId)) {
                console.warn(`Container ${containerId} not found on this page`);
            }
            return;
        }

        let productsToShow = this.getProductsByCategory(category);
        
        if (limit) {
            productsToShow = productsToShow.slice(0, limit);
        }

        if (productsToShow.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 40px; color: #64748b;">
                    <p>No products found in this category.</p>
                    <p>Products will appear here once added through the admin panel.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = productsToShow.map(product => this.renderProductCard(product)).join('');
    }

    // Display featured products
    displayFeaturedProducts(containerId, limit = 4) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const featuredProducts = this.getFeaturedProducts().slice(0, limit);
        
        if (featuredProducts.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 40px; color: #64748b;">
                    <p>No featured products available.</p>
                    <p>Mark products as "Featured" in the admin panel to display them here.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = featuredProducts.map(product => this.renderProductCard(product)).join('');
    }

    // View product details
    viewProduct(productId) {
        console.log('=== VIEW PRODUCT CALLED ===');
        console.log('Product ID:', productId);
        console.log('Available products:', this.products.length);
        
        const product = this.products.find(p => p.id === productId);
        if (!product) {
            console.error('Product not found with ID:', productId);
            alert('Product not found');
            return;
        }

        console.log('Found product:', product);

        // Remove any existing modals
        const existingModals = document.querySelectorAll('.product-modal');
        existingModals.forEach(modal => modal.remove());

        // Create a simple product detail modal
        const modal = document.createElement('div');
        modal.className = 'product-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            animation: fadeIn 0.3s ease-in-out;
        `;

        // Add CSS animation
        if (!document.querySelector('#modal-styles')) {
            const style = document.createElement('style');
            style.id = 'modal-styles';
            style.textContent = `
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .product-modal-content {
                    animation: slideIn 0.3s ease-out;
                }
                @keyframes slideIn {
                    from { transform: translateY(-50px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
            `;
            document.head.appendChild(style);
        }

        const imageUrl = product.image || this.getPlaceholderImage();
        
        modal.innerHTML = `
            <div class="product-modal-content" style="background: white; padding: 30px; border-radius: 12px; max-width: 600px; width: 90%; max-height: 80vh; overflow-y: auto; box-shadow: 0 20px 60px rgba(0,0,0,0.3);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 2px solid #f1f5f9; padding-bottom: 15px;">
                    <h2 style="margin: 0; color: #0f172a; font-size: 1.8rem;">${product.name}</h2>
                    <button class="close-modal-btn" style="background: none; border: none; font-size: 28px; cursor: pointer; color: #64748b; padding: 5px; border-radius: 50%; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center;">&times;</button>
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                    <div>
                        <img src="${imageUrl}" alt="${product.name}" style="width: 100%; height: 250px; object-fit: cover; border-radius: 8px; border: 2px solid #f1f5f9;">
                    </div>
                    <div>
                        <div style="margin-bottom: 15px;">
                            <strong style="color: #475569;">Brand:</strong> 
                            <span style="color: #0f172a; font-weight: 500;">${product.brand}</span>
                        </div>
                        
                        <div style="margin-bottom: 15px;">
                            <strong style="color: #475569;">Category:</strong> 
                            <span style="color: #0f172a; font-weight: 500;">${product.category}</span>
                        </div>
                        
                        <div style="margin-bottom: 15px;">
                            <strong style="color: #475569;">Gender:</strong> 
                            <span style="color: #0f172a; font-weight: 500;">${product.gender}</span>
                        </div>
                        
                        <div style="margin-bottom: 15px;">
                            <strong style="color: #475569;">Model:</strong> 
                            <span style="color: #0f172a; font-weight: 500;">${product.model || 'N/A'}</span>
                        </div>
                        
                        <div style="margin-bottom: 20px; padding: 15px; background: linear-gradient(135deg, #8b5cf6, #a855f7); border-radius: 8px; text-align: center;">
                            <strong style="color: white; font-size: 1.1rem;">Price</strong><br>
                            <span style="color: white; font-size: 1.5em; font-weight: bold;">₹ ${product.price.toLocaleString()}</span>
                        </div>
                    </div>
                </div>
                
                ${product.description ? `
                    <div style="margin-bottom: 20px; padding: 15px; background: #f8fafc; border-radius: 8px; border-left: 4px solid #8b5cf6;">
                        <strong style="color: #475569;">Description:</strong><br>
                        <span style="color: #0f172a; line-height: 1.6;">${product.description}</span>
                    </div>
                ` : ''}
                
                <div style="display: flex; gap: 15px; margin-top: 25px;">
                    <button class="whatsapp-modal-btn" style="background: linear-gradient(135deg, #25D366, #128C7E); color: white; border: none; padding: 15px 25px; border-radius: 8px; cursor: pointer; flex: 1; font-weight: bold; font-size: 1rem; box-shadow: 0 4px 15px rgba(37, 211, 102, 0.3);">
                        📱 Contact via WhatsApp
                    </button>
                    <button class="close-modal-btn" style="background: #64748b; color: white; border: none; padding: 15px 25px; border-radius: 8px; cursor: pointer; font-weight: bold;">
                        Close
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Add event listeners for modal interactions
        const closeButtons = modal.querySelectorAll('.close-modal-btn');
        const whatsappButton = modal.querySelector('.whatsapp-modal-btn');
        
        closeButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                console.log('Close button clicked');
                modal.remove();
            });
        });
        
        if (whatsappButton) {
            whatsappButton.addEventListener('click', () => {
                const message = `Hi! I am interested in ${product.name} from ${product.brand}. Can you provide more information?`;
                
                console.log('Modal WhatsApp message:', message);
                
                // Use the global WhatsApp function if available
                if (typeof window.openWhatsApp === 'function') {
                    window.openWhatsApp(message);
                } else {
                    // Fallback to direct WhatsApp URL
                    const cleanMessage = message.trim().replace(/\s+/g, ' ');
                    const encodedMessage = encodeURIComponent(cleanMessage);
                    const whatsappUrl = `https://wa.me/917000532010?text=${encodedMessage}`;
                    console.log('Modal fallback WhatsApp URL:', whatsappUrl);
                    window.open(whatsappUrl, '_blank');
                }
            });
        }
        
        // Close modal when clicking outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
        
        // Close modal with Escape key
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                modal.remove();
                document.removeEventListener('keydown', handleEscape);
            }
        };
        document.addEventListener('keydown', handleEscape);
        
        console.log('✅ Product modal created and displayed');
    }

    // Setup event listeners
    setupEventListeners() {
        // Listen for storage changes to update products when admin panel adds new ones
        window.addEventListener('storage', (e) => {
            if (e.key === 'adminPanelData') {
                this.loadProducts();
                this.refreshAllDisplays();
            }
        });

        // Custom event for same-page updates
        window.addEventListener('adminDataUpdated', () => {
            this.loadProducts();
            this.refreshAllDisplays();
        });
    }

    // Display products when page loads
    displayProductsOnPageLoad() {
        console.log('Displaying products on page load...');
        console.log('Available products:', this.products.length);
        
        // Force reload products from admin panel first
        this.loadProducts();
        
        // Display featured products
        this.displayFeaturedProducts('featuredProducts');
        
        // Display category-specific products only if containers exist
        if (document.getElementById('sunglassesGrid')) {
            this.displayProducts('sunglassesGrid', 'sunglasses');
        }
        if (document.getElementById('opticalFramesGrid')) {
            this.displayProducts('opticalFramesGrid', 'optical-frames');
        }
        
        // Display trending products (show latest 4 products)
        const latestProducts = this.products.slice(-4).reverse();
        const trendingContainer = document.querySelector('.product-slider');
        if (trendingContainer) {
            trendingContainer.innerHTML = latestProducts.map(product => this.renderProductCard(product)).join('');
        }
        
        // Also try to display in trendingProducts container if it exists
        const trendingProductsContainer = document.getElementById('trendingProducts');
        if (trendingProductsContainer) {
            trendingProductsContainer.innerHTML = latestProducts.map(product => this.renderProductCard(product)).join('');
        }
        
        console.log('Products displayed:', this.products.length);
        console.log('Featured products:', this.getFeaturedProducts().length);
        console.log('Sunglasses:', this.getProductsByCategory('sunglasses').length);
        console.log('Optical frames:', this.getProductsByCategory('optical-frames').length);
        
        // Debug: Check if featured products are actually showing
        const featuredContainer = document.getElementById('featuredProducts');
        if (featuredContainer) {
            console.log('Featured container HTML:', featuredContainer.innerHTML.substring(0, 200) + '...');
            console.log('Featured container has content:', featuredContainer.innerHTML.length > 0);
        }
    }

    // Refresh all product displays on the page
    refreshAllDisplays() {
        // Refresh featured products
        this.displayFeaturedProducts('featuredProducts');
        
        // Refresh category-specific displays only if containers exist
        if (document.getElementById('sunglassesGrid')) {
            this.displayProducts('sunglassesGrid', 'sunglasses');
        }
        if (document.getElementById('opticalFramesGrid')) {
            this.displayProducts('opticalFramesGrid', 'optical-frames');
        }
        
        // Refresh trending products (show latest 4 products)
        const latestProducts = this.products.slice(-4).reverse();
        const trendingContainer = document.querySelector('.product-slider');
        if (trendingContainer) {
            trendingContainer.innerHTML = latestProducts.map(product => this.renderProductCard(product)).join('');
        }
    }

    // Add a new product (called from admin panel)
    addProduct(productData) {
        const product = {
            id: Date.now().toString(),
            ...productData,
            createdAt: new Date().toISOString()
        };
        
        this.products.push(product);
        this.saveProducts();
        this.refreshAllDisplays();
        
        // Dispatch custom event
        window.dispatchEvent(new CustomEvent('adminDataUpdated'));
    }

    // Update a product (called from admin panel)
    updateProduct(productId, productData) {
        const index = this.products.findIndex(p => p.id === productId);
        if (index !== -1) {
            this.products[index] = { ...this.products[index], ...productData };
            this.saveProducts();
            this.refreshAllDisplays();
            
            // Dispatch custom event
            window.dispatchEvent(new CustomEvent('adminDataUpdated'));
        }
    }

    // Delete a product (called from admin panel)
    deleteProduct(productId) {
        this.products = this.products.filter(p => p.id !== productId);
        this.saveProducts();
        this.refreshAllDisplays();
        
        // Dispatch custom event
        window.dispatchEvent(new CustomEvent('adminDataUpdated'));
    }
}

// Initialize product display system
window.productDisplay = new ProductDisplay();

// Global Add to Cart button handler (backup solution)
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('add-to-cart-btn')) {
        console.log('Global Add to Cart button handler triggered');
        e.preventDefault();
        e.stopPropagation();
        
        // Get product info from data attributes
        const productName = e.target.getAttribute('data-product-name') || 'this product';
        const productBrand = e.target.getAttribute('data-product-brand') || 'Unknown Brand';
        const productPrice = parseFloat(e.target.getAttribute('data-product-price')) || 0;
        const productCategory = e.target.getAttribute('data-product-category') || '';
        const productModel = e.target.getAttribute('data-product-model') || '';
        const productId = e.target.getAttribute('data-product-id') || '';
        
        console.log('Global handler - Product info:', { productName, productBrand, productPrice, productCategory, productModel, productId });
        
        // Use the global Add to Cart function
        if (typeof window.openAddToCartModal === 'function') {
            window.openAddToCartModal(productName, productBrand, productPrice, productCategory, productModel, productId);
        } else {
            console.error('openAddToCartModal function not available');
            alert('Add to Cart functionality is not available. Please try refreshing the page.');
        }
    }
});

// Global event listener for view buttons (backup solution)
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('view-details-btn')) {
        e.preventDefault();
        e.stopPropagation();
        const productId = e.target.getAttribute('data-product-id');
        console.log('Global View Details button clicked!');
        console.log('Button element:', e.target);
        console.log('Product ID:', productId);
        
        if (productId && window.productDisplay) {
            console.log('Calling viewProduct via global listener with ID:', productId);
            window.productDisplay.viewProduct(productId);
        } else if (!productId) {
            console.error('No product ID found on button');
            console.log('Button attributes:', e.target.attributes);
        } else {
            console.error('ProductDisplay not available');
        }
    }
});

// Auto-refresh products every 5 seconds (in case admin panel is open in another tab)
setInterval(() => {
    window.productDisplay.loadProducts();
}, 5000);

// Manual refresh function for debugging
window.refreshProducts = function() {
    console.log('Manual refresh triggered...');
    window.productDisplay.loadProducts();
    window.productDisplay.displayProductsOnPageLoad();
};

// Global function to debug product sync
window.debugProducts = function() {
    console.log('=== PRODUCT DEBUG INFO ===');
    console.log('ProductDisplay exists:', !!window.productDisplay);
    console.log('Products in system:', window.productDisplay?.products?.length || 0);
    console.log('Featured products:', window.productDisplay?.getFeaturedProducts()?.length || 0);
    
    // Check admin data
    try {
        const adminData = JSON.parse(localStorage.getItem('adminPanelData') || '{}');
        console.log('Admin data products:', adminData.products?.length || 0);
        console.log('Admin featured products:', adminData.products?.filter(p => p.featured)?.length || 0);
        console.log('Admin products:', adminData.products);
    } catch (error) {
        console.error('Error reading admin data:', error);
    }
    
    // Check featured container
    const featuredContainer = document.getElementById('featuredProducts');
    console.log('Featured container exists:', !!featuredContainer);
    console.log('Featured container content length:', featuredContainer?.innerHTML?.length || 0);
    
    return 'Debug complete - check console for details';
};

// Global function to force sync products
window.forceSyncProducts = function() {
    console.log('Force syncing products...');
    
    try {
        // Load from admin panel
        const adminData = JSON.parse(localStorage.getItem('adminPanelData') || '{}');
        const products = adminData.products || [];
        
        if (products.length === 0) {
            console.log('No products in admin panel!');
            return 'No products found in admin panel';
        }
        
        // Update productDisplay
        if (window.productDisplay) {
            window.productDisplay.products = products;
            window.productDisplay.saveProducts();
            window.productDisplay.displayProductsOnPageLoad();
            
            console.log('Products synced successfully!');
            return `Synced ${products.length} products (${products.filter(p => p.featured).length} featured)`;
        } else {
            console.log('ProductDisplay not available');
            return 'ProductDisplay system not loaded';
        }
    } catch (error) {
        console.error('Error syncing products:', error);
        return 'Error syncing products: ' + error.message;
    }
};

// Force initialize products (use this if products aren't showing)
window.forceInitProducts = function() {
    console.log('Force initializing products...');
    window.productDisplay.initializeSampleProducts();
    window.productDisplay.displayProductsOnPageLoad();
    console.log('Products force initialized:', window.productDisplay.products.length);
};

// Make functions available immediately
console.log('Product system loaded. Available functions:');
console.log('- window.refreshProducts()');
console.log('- window.forceInitProducts()');
console.log('- window.forceReloadProducts()');
console.log('- window.checkProductStatus()');
console.log('- window.testViewProduct(productId)');
console.log('- window.testViewFirstProduct()');
console.log('- window.testViewButton()');
console.log('- window.testWhatsAppButtons()');
console.log('- window.productDisplay.products');

// Global function to test viewProduct
window.testViewProduct = function(productId) {
    console.log('Testing viewProduct with ID:', productId);
    if (window.productDisplay) {
        window.productDisplay.viewProduct(productId);
    } else {
        console.error('ProductDisplay not available');
    }
};

// Global function to test with first available product
window.testViewFirstProduct = function() {
    if (window.productDisplay && window.productDisplay.products.length > 0) {
        const firstProduct = window.productDisplay.products[0];
        console.log('Testing with first product:', firstProduct);
        window.productDisplay.viewProduct(firstProduct.id);
    } else {
        console.error('No products available for testing');
    }
};

// Global function to force reload products
window.forceReloadProducts = async function() {
    console.log('Force reloading products...');
    if (window.productDisplay) {
        await window.productDisplay.loadProducts();
        window.productDisplay.displayProductsOnPageLoad();
        console.log('Products reloaded:', window.productDisplay.products.length);
        return `Products reloaded: ${window.productDisplay.products.length} products found`;
    } else {
        console.error('ProductDisplay not available');
        return 'ProductDisplay not available';
    }
};

// Global function to check product status
window.checkProductStatus = function() {
    console.log('=== PRODUCT STATUS CHECK ===');
    console.log('ProductDisplay available:', !!window.productDisplay);
    console.log('API Client available:', !!window.apiClient);
    console.log('Products loaded:', window.productDisplay ? window.productDisplay.products.length : 'N/A');
    console.log('Products data:', window.productDisplay ? window.productDisplay.products : 'N/A');
    
    if (window.productDisplay && window.productDisplay.products.length > 0) {
        console.log('First product:', window.productDisplay.products[0]);
        return `✅ Products loaded: ${window.productDisplay.products.length} products available`;
    } else {
        console.log('❌ No products available');
        return '❌ No products available - try window.forceReloadProducts()';
    }
};

// Global function to test WhatsApp buttons
window.testWhatsAppButtons = function() {
    console.log('=== TESTING WHATSAPP BUTTONS ===');
    
    const whatsappButtons = document.querySelectorAll('.whatsapp-btn');
    console.log('WhatsApp buttons found:', whatsappButtons.length);
    
    whatsappButtons.forEach((button, index) => {
        console.log(`Button ${index + 1}:`, {
            element: button,
            classes: button.classList.toString(),
            'data-product-name': button.getAttribute('data-product-name'),
            'data-product-brand': button.getAttribute('data-product-brand'),
            onclick: button.getAttribute('onclick')
        });
    });
    
    if (whatsappButtons.length > 0) {
        console.log('Testing first WhatsApp button...');
        whatsappButtons[0].click();
        return `✅ Found ${whatsappButtons.length} WhatsApp buttons`;
    } else {
        console.log('❌ No WhatsApp buttons found');
        return '❌ No WhatsApp buttons found on page';
    }
};

// Global function to test view button functionality
window.testViewButton = function() {
    console.log('=== TESTING VIEW BUTTON FUNCTIONALITY ===');
    
    // Check if ProductDisplay is available
    if (!window.productDisplay) {
        console.error('❌ ProductDisplay not available');
        return '❌ ProductDisplay not available';
    }
    
    // Check if products are loaded
    if (window.productDisplay.products.length === 0) {
        console.error('❌ No products loaded');
        return '❌ No products loaded - try window.forceReloadProducts()';
    }
    
    // Check if view buttons exist on the page
    const viewButtons = document.querySelectorAll('.view-details-btn');
    console.log('View buttons found on page:', viewButtons.length);
    
    if (viewButtons.length === 0) {
        console.error('❌ No view buttons found on page');
        return '❌ No view buttons found on page - products may not be displayed';
    }
    
    // Test clicking the first button
    const firstButton = viewButtons[0];
    const productId = firstButton.getAttribute('data-product-id');
    console.log('First button product ID:', productId);
    
    if (productId) {
        console.log('✅ Testing view button click...');
        firstButton.click();
        return `✅ View button test completed - check console for results`;
    } else {
        console.error('❌ First button has no product ID');
        return '❌ First button has no product ID';
    }
};
