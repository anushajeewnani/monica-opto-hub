// Mobile navigation toggle
const menuToggleButton = document.querySelector('.menu-toggle');
const nav = document.getElementById('primary-nav');
const overlay = document.querySelector('[data-overlay]');
const root = document.documentElement;

function setScrollLock(locked){
    if(locked){
        root.style.overflow = 'hidden';
    }else{
        root.style.overflow = '';
    }
}

function setNavOpen(open){
    if(!nav || !menuToggleButton) return;
    nav.classList.toggle('open', open);
    menuToggleButton.setAttribute('aria-expanded', String(open));
    if(overlay){ overlay.setAttribute('aria-hidden', String(!open)); }
    setScrollLock(open);
}

if (menuToggleButton && nav) {
    menuToggleButton.addEventListener('click', () => setNavOpen(!nav.classList.contains('open')));
}

if(overlay){
    overlay.addEventListener('click', () => setNavOpen(false));
}

// Brands mega-menu (mobile expand)
document.querySelectorAll('.has-mega').forEach((item)=>{
    const toggle = item.querySelector('.mega-toggle');
    if(!toggle) return;
    toggle.addEventListener('click', (e)=>{
        // On desktop hover handles it; on mobile we toggle class
        if(window.matchMedia('(max-width: 900px)').matches){
            e.preventDefault();
            const isOpen = item.classList.toggle('open');
            toggle.setAttribute('aria-expanded', String(isOpen));
        }
    });
});

    // Search functionality
    document.addEventListener('DOMContentLoaded', function() {
        // Search button functionality
        const searchButton = document.querySelector('.action[aria-label="Search"]');
        if (searchButton) {
            searchButton.addEventListener('click', function() {
                openSearchModal();
            });
        }
        
        // Brand navigation functionality (simplified for separate pages)
        console.log('Brand navigation set up for separate pages');
    });

    // Search modal functionality
    function openSearchModal() {
        // Create search modal
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.8);
            display: flex;
            align-items: flex-start;
            justify-content: center;
            z-index: 10000;
            padding-top: 100px;
            animation: fadeIn 0.3s ease-in-out;
        `;

        modal.innerHTML = `
            <div style="background: white; padding: 30px; border-radius: 12px; max-width: 600px; width: 90%; box-shadow: 0 20px 60px rgba(0,0,0,0.3);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 2px solid #f1f5f9; padding-bottom: 15px;">
                    <h2 style="margin: 0; color: #0f172a; font-size: 1.8rem;">🔍 Search Products</h2>
                    <button class="close-search-modal-btn" style="background: none; border: none; font-size: 28px; cursor: pointer; color: #64748b; padding: 5px; border-radius: 50%; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center;">&times;</button>
                </div>
                
                <div style="margin-bottom: 20px;">
                    <input type="text" id="searchInput" placeholder="Search for products, brands, or categories..." 
                           style="width: 100%; padding: 15px 20px; border: 2px solid #e2e8f0; border-radius: 8px; font-size: 1.1rem; outline: none; transition: border-color 0.3s;"
                           onkeyup="handleSearchInput(event)">
                    <div id="searchSuggestions" style="margin-top: 10px; max-height: 200px; overflow-y: auto; border: 1px solid #e2e8f0; border-radius: 8px; background: white; display: none;"></div>
                </div>
                
                <div id="searchResults" style="max-height: 400px; overflow-y: auto;">
                    <div style="text-align: center; padding: 40px; color: #64748b;">
                        <div style="font-size: 3rem; margin-bottom: 15px;">🔍</div>
                        <h3 style="margin-bottom: 10px;">Start typing to search</h3>
                        <p>Search for products by name, brand, or category</p>
                    </div>
                </div>
                
                <div style="display: flex; gap: 15px; margin-top: 25px;">
                    <button onclick="window.open('all-products.html', '_blank')" style="background: linear-gradient(135deg, #8b5cf6, #a855f7); color: white; border: none; padding: 12px 25px; border-radius: 8px; cursor: pointer; font-weight: bold; font-size: 1rem; box-shadow: 0 4px 15px rgba(139, 92, 246, 0.4); flex: 1;">
                        📋 View All Products
                    </button>
                    <button class="close-search-modal-btn" style="background: #64748b; color: white; border: none; padding: 12px 25px; border-radius: 8px; cursor: pointer; font-weight: bold;">
                        Close
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Focus on search input
        setTimeout(() => {
            document.getElementById('searchInput').focus();
        }, 100);
        
        // Add event listeners
        const closeButtons = modal.querySelectorAll('.close-search-modal-btn');
        closeButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                modal.remove();
            });
        });
        
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
    }

    // Handle search input
    function handleSearchInput(event) {
        const searchTerm = event.target.value.trim();
        const searchResults = document.getElementById('searchResults');
        const searchSuggestions = document.getElementById('searchSuggestions');
        
        if (searchTerm.length < 2) {
            searchResults.innerHTML = `
                <div style="text-align: center; padding: 40px; color: #64748b;">
                    <div style="font-size: 3rem; margin-bottom: 15px;">🔍</div>
                    <h3 style="margin-bottom: 10px;">Start typing to search</h3>
                    <p>Search for products by name, brand, or category</p>
                </div>
            `;
            searchSuggestions.style.display = 'none';
            return;
        }
        
        // Show loading
        searchResults.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #64748b;">
                <div style="font-size: 2rem; margin-bottom: 15px;">⏳</div>
                <h3 style="margin-bottom: 10px;">Searching...</h3>
                <p>Looking for products matching "${searchTerm}"</p>
            </div>
        `;
        
        // Perform search
        performSearch(searchTerm);
    }

    // Perform search function
    async function performSearch(searchTerm) {
        try {
            let products = [];
            
            // Try to get products from API first
            if (window.apiClient) {
                try {
                    const response = await window.apiClient.getProducts({ search: searchTerm });
                    products = response.products || [];
                } catch (apiError) {
                    console.log('API search failed, trying localStorage:', apiError);
                }
            }
            
            // Fallback to localStorage
            if (products.length === 0) {
                const adminData = JSON.parse(localStorage.getItem('adminPanelData') || '{}');
                const allProducts = adminData.products || [];
                products = allProducts.filter(product => 
                    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    product.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    (product.model && product.model.toLowerCase().includes(searchTerm.toLowerCase()))
                );
            }
            
            displaySearchResults(products, searchTerm);
            
        } catch (error) {
            console.error('Search error:', error);
            displaySearchError(searchTerm);
        }
    }

    // Display search results
    function displaySearchResults(products, searchTerm) {
        const searchResults = document.getElementById('searchResults');
        
        if (products.length === 0) {
            searchResults.innerHTML = `
                <div style="text-align: center; padding: 40px; color: #64748b;">
                    <div style="font-size: 3rem; margin-bottom: 15px;">😔</div>
                    <h3 style="margin-bottom: 10px;">No products found</h3>
                    <p>No products match "${searchTerm}". Try a different search term.</p>
                    <button onclick="window.open('all-products.html', '_blank')" style="background: #8b5cf6; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; margin-top: 15px;">
                        Browse All Products
                    </button>
                </div>
            `;
            return;
        }
        
        const resultsHTML = products.map(product => `
            <div style="display: flex; gap: 15px; padding: 15px; border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 10px; background: #f8fafc;">
                <div style="width: 80px; height: 80px; background: #f1f5f9; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 2rem;">
                    🕶️
                </div>
                <div style="flex: 1;">
                    <h4 style="margin: 0 0 5px 0; color: #0f172a; font-size: 1.1rem;">${product.name}</h4>
                    <p style="margin: 0 0 5px 0; color: #64748b; font-size: 0.9rem;">${product.brand} • ${product.category}</p>
                    <p style="margin: 0 0 10px 0; color: #059669; font-weight: bold; font-size: 1rem;">₹ ${product.price.toLocaleString()}</p>
                    <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                        <button onclick="viewProductFromSearch('${product.id}')" style="background: #8b5cf6; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 0.8rem; flex: 1;">
                            View Details
                        </button>
                        <button onclick="openAddToCartFromSearch('${product.name}', '${product.brand}', ${product.price}, '${product.category}', '${product.model || ''}', '${product.id}')" style="background: #8b5cf6; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 0.8rem; flex: 1;">
                            🛒 Add to Cart
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
        
        searchResults.innerHTML = `
            <div style="margin-bottom: 15px; padding: 10px; background: #f0f9ff; border-radius: 6px; border-left: 4px solid #0ea5e9;">
                <strong style="color: #0c4a6e;">Found ${products.length} product${products.length === 1 ? '' : 's'} matching "${searchTerm}"</strong>
            </div>
            ${resultsHTML}
        `;
    }

    // Display search error
    function displaySearchError(searchTerm) {
        const searchResults = document.getElementById('searchResults');
        searchResults.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #dc2626;">
                <div style="font-size: 3rem; margin-bottom: 15px;">⚠️</div>
                <h3 style="margin-bottom: 10px;">Search Error</h3>
                <p>Unable to search for "${searchTerm}". Please try again.</p>
                <button onclick="window.open('all-products.html', '_blank')" style="background: #dc2626; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; margin-top: 15px;">
                    Browse All Products
                </button>
            </div>
        `;
    }

    // View product from search
    function viewProductFromSearch(productId) {
        // Close search modal first
        const modal = document.querySelector('[style*="position: fixed"]');
        if (modal) modal.remove();
        
        // Navigate to all products page with the specific product
        window.open(`all-products.html#product-${productId}`, '_blank');
    }

    // Enhanced WhatsApp Order functionality
    function openWhatsAppOrder(productName, productBrand, productPrice, productCategory = '', productModel = '') {
        const phoneNumber = '917000532010';
        
        // Create a comprehensive order message
        const orderMessage = `🛒 *NEW ORDER REQUEST - MONICA OPTO HUB*

👤 *Customer Details:*
Please provide your details for order processing.

🛍️ *Product Details:*
• Product: ${productName}
• Brand: ${productBrand}
• Price: ₹${productPrice.toLocaleString()}
${productCategory ? `• Category: ${productCategory}` : ''}
${productModel ? `• Model: ${productModel}` : ''}

📋 *Order Information:*
• Quantity: 1 (please specify if different)
• Size/Fit: Please specify your requirements
• Lens Type: (if applicable)
• Frame Color: (if applicable)

📞 *Contact Information:*
• Name: [Please provide]
• Phone: [Please provide]
• Email: [Please provide]
• Address: [Please provide for delivery]

💳 *Payment & Delivery:*
• Payment Method: [Please specify]
• Delivery Address: [Please provide]
• Preferred Delivery Date: [Please specify]

❓ *Additional Requirements:*
[Please mention any special requirements]

Please confirm this order and provide the above details. Thank you! 🙏`;

        const encodedMessage = encodeURIComponent(orderMessage);
        const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
        
        console.log('Opening WhatsApp order for:', productName);
        console.log('WhatsApp URL:', whatsappUrl);
        
        // Try to open WhatsApp
        try {
            const newWindow = window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
            
            if (!newWindow) {
                // If popup blocked, try direct navigation
                console.log('Popup blocked, trying direct navigation...');
                window.location.href = whatsappUrl;
            } else {
                console.log('✅ WhatsApp order window opened successfully');
            }
            
            // Show confirmation
            setTimeout(() => {
                alert(`🛒 Order request sent to WhatsApp!\n\nProduct: ${productName}\nBrand: ${productBrand}\nPrice: ₹${productPrice.toLocaleString()}\n\nPlease check your WhatsApp to complete the order.`);
            }, 1000);
            
        } catch (error) {
            console.error('Error opening WhatsApp order:', error);
            alert(`Unable to open WhatsApp. Please contact us directly:\n\nPhone: +91-7000532010\n\nProduct: ${productName}\nPrice: ₹${productPrice.toLocaleString()}`);
        }
    }

    // Make WhatsApp order function globally available
    window.openWhatsAppOrder = openWhatsAppOrder;

    // Open WhatsApp order from search
    function openWhatsAppOrderFromSearch(productName, productBrand, productPrice, productCategory, productModel) {
        if (window.openWhatsAppOrder) {
            window.openWhatsAppOrder(productName, productBrand, productPrice, productCategory, productModel);
        } else {
            // Fallback to simple WhatsApp message
            const message = `Hi! I am interested in ${productName} from ${productBrand}. Can you provide more information?`;
            const encodedMessage = encodeURIComponent(message);
            const whatsappUrl = `https://wa.me/917000532010?text=${encodedMessage}`;
            window.open(whatsappUrl, '_blank');
        }
    }

    // Make search WhatsApp order function globally available
    window.openWhatsAppOrderFromSearch = openWhatsAppOrderFromSearch;

    // Open Add to Cart from search
    function openAddToCartFromSearch(productName, productBrand, productPrice, productCategory, productModel, productId) {
        if (window.openAddToCartModal) {
            window.openAddToCartModal(productName, productBrand, productPrice, productCategory, productModel, productId);
        } else {
            console.error('Add to Cart modal function not available');
            alert('Add to Cart functionality is not available. Please try the Quick Order option.');
        }
    }

    // Make search Add to Cart function globally available
    window.openAddToCartFromSearch = openAddToCartFromSearch;

    // Add to Cart Form Modal functionality
    function openAddToCartModal(productName, productBrand, productPrice, productCategory, productModel, productId) {
        const modal = document.createElement('div');
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
            padding: 20px;
            animation: fadeIn 0.3s ease-in-out;
        `;

        modal.innerHTML = `
            <div style="background: white; padding: 30px; border-radius: 12px; max-width: 600px; width: 100%; max-height: 90vh; overflow-y: auto; box-shadow: 0 20px 60px rgba(0,0,0,0.3);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; border-bottom: 2px solid #f1f5f9; padding-bottom: 15px;">
                    <h2 style="margin: 0; color: #0f172a; font-size: 1.8rem;">🛒 Add to Cart</h2>
                    <button class="close-cart-modal-btn" style="background: none; border: none; font-size: 28px; cursor: pointer; color: #64748b; padding: 5px; border-radius: 50%; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center;">&times;</button>
                </div>
                
                <!-- Product Summary -->
                <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 25px; border-left: 4px solid #8b5cf6;">
                    <h3 style="margin: 0 0 10px 0; color: #0f172a;">${productName}</h3>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 0.9rem; color: #64748b;">
                        <div><strong>Brand:</strong> ${productBrand}</div>
                        <div><strong>Category:</strong> ${productCategory}</div>
                        <div><strong>Model:</strong> ${productModel || 'N/A'}</div>
                        <div><strong>Price:</strong> <span style="color: #059669; font-weight: bold;">₹${productPrice.toLocaleString()}</span></div>
                    </div>
                </div>
                
                <!-- Customer Details Form -->
                <form id="addToCartForm" style="display: flex; flex-direction: column; gap: 20px;">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                        <div>
                            <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #0f172a;">Full Name *</label>
                            <input type="text" id="customerName" name="customerName" required 
                                   style="width: 100%; padding: 12px 16px; border: 2px solid #e2e8f0; border-radius: 8px; font-size: 1rem; outline: none; transition: border-color 0.3s;"
                                   placeholder="Enter your full name">
                        </div>
                        <div>
                            <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #0f172a;">Phone Number *</label>
                            <input type="tel" id="customerPhone" name="customerPhone" required 
                                   style="width: 100%; padding: 12px 16px; border: 2px solid #e2e8f0; border-radius: 8px; font-size: 1rem; outline: none; transition: border-color 0.3s;"
                                   placeholder="Enter your phone number">
                        </div>
                    </div>
                    
                    <div>
                        <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #0f172a;">Email Address *</label>
                        <input type="email" id="customerEmail" name="customerEmail" required 
                               style="width: 100%; padding: 12px 16px; border: 2px solid #e2e8f0; border-radius: 8px; font-size: 1rem; outline: none; transition: border-color 0.3s;"
                               placeholder="Enter your email address">
                    </div>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                        <div>
                            <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #0f172a;">Quantity *</label>
                            <select id="quantity" name="quantity" required 
                                    style="width: 100%; padding: 12px 16px; border: 2px solid #e2e8f0; border-radius: 8px; font-size: 1rem; outline: none; transition: border-color 0.3s;">
                                <option value="">Select Quantity</option>
                                <option value="1">1</option>
                                <option value="2">2</option>
                                <option value="3">3</option>
                                <option value="4">4</option>
                                <option value="5">5</option>
                            </select>
                        </div>
                        <div>
                            <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #0f172a;">Size/Fit</label>
                            <select id="sizeFit" name="sizeFit" 
                                    style="width: 100%; padding: 12px 16px; border: 2px solid #e2e8f0; border-radius: 8px; font-size: 1rem; outline: none; transition: border-color 0.3s;">
                                <option value="">Select Size/Fit</option>
                                <option value="Small">Small</option>
                                <option value="Medium">Medium</option>
                                <option value="Large">Large</option>
                                <option value="Extra Large">Extra Large</option>
                                <option value="Custom">Custom</option>
                            </select>
                        </div>
                    </div>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                        <div>
                            <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #0f172a;">Lens Type</label>
                            <select id="lensType" name="lensType" 
                                    style="width: 100%; padding: 12px 16px; border: 2px solid #e2e8f0; border-radius: 8px; font-size: 1rem; outline: none; transition: border-color 0.3s;">
                                <option value="">Select Lens Type</option>
                                <option value="Prescription">Prescription</option>
                                <option value="Non-Prescription">Non-Prescription</option>
                                <option value="Sunglasses">Sunglasses</option>
                                <option value="Blue Light">Blue Light</option>
                                <option value="Progressive">Progressive</option>
                            </select>
                        </div>
                        <div>
                            <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #0f172a;">Frame Color</label>
                            <select id="frameColor" name="frameColor" 
                                    style="width: 100%; padding: 12px 16px; border: 2px solid #e2e8f0; border-radius: 8px; font-size: 1rem; outline: none; transition: border-color 0.3s;">
                                <option value="">Select Frame Color</option>
                                <option value="Black">Black</option>
                                <option value="Brown">Brown</option>
                                <option value="Gold">Gold</option>
                                <option value="Silver">Silver</option>
                                <option value="Tortoise">Tortoise</option>
                                <option value="Clear">Clear</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                    </div>
                    
                    <div>
                        <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #0f172a;">Delivery Address *</label>
                        <textarea id="deliveryAddress" name="deliveryAddress" required rows="3"
                                  style="width: 100%; padding: 12px 16px; border: 2px solid #e2e8f0; border-radius: 8px; font-size: 1rem; outline: none; transition: border-color 0.3s; resize: vertical;"
                                  placeholder="Enter your complete delivery address"></textarea>
                    </div>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                        <div>
                            <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #0f172a;">Payment Method *</label>
                            <select id="paymentMethod" name="paymentMethod" required 
                                    style="width: 100%; padding: 12px 16px; border: 2px solid #e2e8f0; border-radius: 8px; font-size: 1rem; outline: none; transition: border-color 0.3s;">
                                <option value="">Select Payment Method</option>
                                <option value="Cash on Delivery">Cash on Delivery</option>
                                <option value="UPI">UPI</option>
                                <option value="Credit Card">Credit Card</option>
                                <option value="Debit Card">Debit Card</option>
                                <option value="Net Banking">Net Banking</option>
                                <option value="Wallet">Wallet</option>
                            </select>
                        </div>
                        <div>
                            <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #0f172a;">Preferred Delivery Date</label>
                            <input type="date" id="preferredDeliveryDate" name="preferredDeliveryDate" 
                                   style="width: 100%; padding: 12px 16px; border: 2px solid #e2e8f0; border-radius: 8px; font-size: 1rem; outline: none; transition: border-color 0.3s;">
                        </div>
                    </div>
                    
                    <div>
                        <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #0f172a;">Additional Requirements</label>
                        <textarea id="additionalRequirements" name="additionalRequirements" rows="3"
                                  style="width: 100%; padding: 12px 16px; border: 2px solid #e2e8f0; border-radius: 8px; font-size: 1rem; outline: none; transition: border-color 0.3s; resize: vertical;"
                                  placeholder="Any special requirements, prescription details, or additional notes..."></textarea>
                    </div>
                    
                    <!-- Order Summary -->
                    <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; border-left: 4px solid #0ea5e9;">
                        <h4 style="margin: 0 0 15px 0; color: #0c4a6e;">Order Summary</h4>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                            <span>Product Price:</span>
                            <span>₹${productPrice.toLocaleString()}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                            <span>Quantity:</span>
                            <span id="quantityDisplay">1</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                            <span>Delivery Charges:</span>
                            <span>₹200</span>
                        </div>
                        <div style="border-top: 1px solid #cbd5e1; padding-top: 10px; display: flex; justify-content: space-between; font-weight: bold; font-size: 1.1rem;">
                            <span>Total Amount:</span>
                            <span id="totalAmount">₹${(productPrice + 200).toLocaleString()}</span>
                        </div>
                    </div>
                    
                    <!-- Action Buttons -->
                    <div style="display: flex; gap: 15px; margin-top: 25px;">
                        <button type="submit" class="submit-cart-btn" style="background: linear-gradient(135deg, #8b5cf6, #a855f7); color: white; border: none; padding: 15px 30px; border-radius: 8px; cursor: pointer; font-weight: bold; font-size: 1rem; box-shadow: 0 4px 15px rgba(139, 92, 246, 0.4); flex: 1;">
                            🛒 Add to Cart & Order
                        </button>
                        <button type="button" class="close-cart-modal-btn" style="background: #64748b; color: white; border: none; padding: 15px 30px; border-radius: 8px; cursor: pointer; font-weight: bold;">
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Set minimum delivery date to tomorrow
        const deliveryDateInput = document.getElementById('preferredDeliveryDate');
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        deliveryDateInput.min = tomorrow.toISOString().split('T')[0];
        
        // Update quantity and total when quantity changes
        const quantitySelect = document.getElementById('quantity');
        const quantityDisplay = document.getElementById('quantityDisplay');
        const totalAmount = document.getElementById('totalAmount');
        
        quantitySelect.addEventListener('change', function() {
            const quantity = parseInt(this.value) || 1;
            const deliveryCharges = 200;
            const total = (productPrice * quantity) + deliveryCharges;
            
            quantityDisplay.textContent = quantity;
            totalAmount.textContent = `₹${total.toLocaleString()}`;
        });
        
        // Add event listeners
        const closeButtons = modal.querySelectorAll('.close-cart-modal-btn');
        closeButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                modal.remove();
            });
        });
        
        // Handle form submission
        const form = document.getElementById('addToCartForm');
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            handleAddToCartSubmission(productName, productBrand, productPrice, productCategory, productModel, productId);
            modal.remove();
        });
        
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
        
        // Focus on first input
        setTimeout(() => {
            document.getElementById('customerName').focus();
        }, 100);
    }

    // Handle Add to Cart form submission
    function handleAddToCartSubmission(productName, productBrand, productPrice, productCategory, productModel, productId) {
        const form = document.getElementById('addToCartForm');
        const formData = new FormData(form);
        
        const orderData = {
            productId: productId,
            productName: productName,
            productBrand: productBrand,
            productPrice: productPrice,
            productCategory: productCategory,
            productModel: productModel,
            customerName: formData.get('customerName'),
            customerPhone: formData.get('customerPhone'),
            customerEmail: formData.get('customerEmail'),
            quantity: parseInt(formData.get('quantity')),
            sizeFit: formData.get('sizeFit'),
            lensType: formData.get('lensType'),
            frameColor: formData.get('frameColor'),
            deliveryAddress: formData.get('deliveryAddress'),
            paymentMethod: formData.get('paymentMethod'),
            preferredDeliveryDate: formData.get('preferredDeliveryDate'),
            additionalRequirements: formData.get('additionalRequirements'),
            orderDate: new Date().toISOString(),
            orderId: 'ORD-' + Date.now(),
            status: 'pending'
        };
        
        // Calculate total
        const deliveryCharges = 200;
        const totalAmount = (productPrice * orderData.quantity) + deliveryCharges;
        orderData.totalAmount = totalAmount;
        
        // Store order in localStorage
        let orders = JSON.parse(localStorage.getItem('customerOrders') || '[]');
        orders.push(orderData);
        localStorage.setItem('customerOrders', JSON.stringify(orders));
        
        // Also store in admin panel data
        let adminData = JSON.parse(localStorage.getItem('adminPanelData') || '{}');
        if (!adminData.orders) adminData.orders = [];
        adminData.orders.push(orderData);
        localStorage.setItem('adminPanelData', JSON.stringify(adminData));
        
        // Send to WhatsApp
        sendOrderToWhatsApp(orderData);
        
        // Show success message
        showOrderSuccessMessage(orderData);
    }

    // Send order to WhatsApp
    function sendOrderToWhatsApp(orderData) {
        const phoneNumber = '917000532010';
        
        const orderMessage = `🛒 *NEW ORDER - MONICA OPTO HUB*

📋 *Order ID:* ${orderData.orderId}
📅 *Order Date:* ${new Date(orderData.orderDate).toLocaleDateString()}

👤 *Customer Details:*
• Name: ${orderData.customerName}
• Phone: ${orderData.customerPhone}
• Email: ${orderData.customerEmail}

🛍️ *Product Details:*
• Product: ${orderData.productName}
• Brand: ${orderData.productBrand}
• Category: ${orderData.productCategory}
• Model: ${orderData.productModel || 'N/A'}
• Unit Price: ₹${orderData.productPrice.toLocaleString()}
• Quantity: ${orderData.quantity}
• Total Product Cost: ₹${(orderData.productPrice * orderData.quantity).toLocaleString()}

📐 *Specifications:*
• Size/Fit: ${orderData.sizeFit || 'Not specified'}
• Lens Type: ${orderData.lensType || 'Not specified'}
• Frame Color: ${orderData.frameColor || 'Not specified'}

🚚 *Delivery Details:*
• Address: ${orderData.deliveryAddress}
• Preferred Date: ${orderData.preferredDeliveryDate || 'Not specified'}
• Delivery Charges: ₹200

💳 *Payment:*
• Method: ${orderData.paymentMethod}
• Total Amount: ₹${orderData.totalAmount.toLocaleString()}

📝 *Additional Requirements:*
${orderData.additionalRequirements || 'None'}

Please confirm this order and provide delivery timeline. Thank you! 🙏`;

        const encodedMessage = encodeURIComponent(orderMessage);
        const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
        
        console.log('Sending order to WhatsApp:', orderData.orderId);
        
        try {
            const newWindow = window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
            
            if (!newWindow) {
                window.location.href = whatsappUrl;
            }
            
        } catch (error) {
            console.error('Error opening WhatsApp:', error);
            alert(`Unable to open WhatsApp. Please contact us directly:\n\nPhone: +91-7000532010\n\nOrder ID: ${orderData.orderId}`);
        }
    }

    // Show order success message
    function showOrderSuccessMessage(orderData) {
        const successModal = document.createElement('div');
        successModal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10001;
            padding: 20px;
        `;
        
        successModal.innerHTML = `
            <div style="background: white; padding: 30px; border-radius: 12px; max-width: 500px; width: 100%; text-align: center; box-shadow: 0 20px 60px rgba(0,0,0,0.3);">
                <div style="font-size: 4rem; margin-bottom: 20px;">✅</div>
                <h2 style="margin: 0 0 15px 0; color: #059669;">Order Placed Successfully!</h2>
                <p style="margin: 0 0 20px 0; color: #64748b; font-size: 1.1rem;">
                    Your order has been added to cart and sent to our team via WhatsApp.
                </p>
                <div style="background: #f0f9ff; padding: 15px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #0ea5e9;">
                    <strong style="color: #0c4a6e;">Order ID:</strong> ${orderData.orderId}<br>
                    <strong style="color: #0c4a6e;">Total Amount:</strong> ₹${orderData.totalAmount.toLocaleString()}
                </div>
                <p style="margin: 0 0 20px 0; color: #64748b;">
                    We'll contact you shortly to confirm your order and provide delivery details.
                </p>
                <button onclick="this.closest('div').parentElement.remove()" style="background: #8b5cf6; color: white; border: none; padding: 12px 25px; border-radius: 8px; cursor: pointer; font-weight: bold;">
                    Close
                </button>
            </div>
        `;
        
        document.body.appendChild(successModal);
        
        // Auto close after 5 seconds
        setTimeout(() => {
            if (successModal.parentElement) {
                successModal.remove();
            }
        }, 5000);
    }

    // Make Add to Cart function globally available
    window.openAddToCartModal = openAddToCartModal;

// Theme switcher (gold / pink)
function applyTheme(theme){
    const body = document.body;
    body.classList.remove('theme-gold','theme-pink');
    if(theme === 'gold') body.classList.add('theme-gold');
    if(theme === 'pink') body.classList.add('theme-pink');
    try{ localStorage.setItem('ui-theme', theme); }catch(_){/* ignore */}
}

function initTheme(){
    let theme = 'gold';
    try{ theme = localStorage.getItem('ui-theme') || 'gold'; }catch(_){/* ignore */}
    applyTheme(theme);
}

initTheme();

// Hook up theme toggle button
function setThemeToggleLabel(button){
    if(!button) return;
    const isPink = document.body.classList.contains('theme-pink');
    button.textContent = isPink ? 'Gold' : 'Pink';
}

const themeToggleButton = document.querySelector('[data-theme-toggle]');
if(themeToggleButton){
    setThemeToggleLabel(themeToggleButton);
    themeToggleButton.addEventListener('click', ()=>{
        const isPink = document.body.classList.contains('theme-pink');
        applyTheme(isPink ? 'gold' : 'pink');
        setThemeToggleLabel(themeToggleButton);
    });
}

// Dynamic header offset for mobile (prevents content underlap)
function updateHeaderOffset(){
    const header = document.querySelector('.site-header');
    if(!header) return;
    const height = header.offsetHeight;
    document.documentElement.style.setProperty('--header-height', height + 'px');
}

window.addEventListener('load', updateHeaderOffset);
window.addEventListener('resize', () => { requestAnimationFrame(updateHeaderOffset); });
window.addEventListener('orientationchange', () => { setTimeout(updateHeaderOffset, 200); });

// Side drawer (mobile)
const drawer = document.querySelector('[data-drawer]');
const drawerClose = document.querySelector('[data-drawer-close]');
function openDrawer(){ drawer?.classList.add('open'); setScrollLock(true); }
function closeDrawer(){ drawer?.classList.remove('open'); setScrollLock(false); }

// Reuse hamburger to open drawer on mobile
if (menuToggleButton) {
    menuToggleButton.addEventListener('click', () => {
        if (window.matchMedia('(max-width: 900px)').matches) {
            openDrawer();
        }
    });
}
if (drawerClose) { drawerClose.addEventListener('click', closeDrawer); }
window.addEventListener('keydown', (e)=>{ if(e.key==='Escape'){ closeDrawer(); }});

// Drawer accordions
document.querySelectorAll('[data-accordion]').forEach(btn => {
    btn.addEventListener('click', () => {
        const li = btn.closest('.drawer__item');
        if (!li) return;
        li.classList.toggle('open');
    });
});

// Very lightweight slider controls (horizontal scroll)
const slider = document.querySelector('[data-slider]');
const prev = document.querySelector('.slider-prev');
const next = document.querySelector('.slider-next');
const scrollAmount = 320;
if (slider && prev && next) {
    prev.addEventListener('click', () => slider.scrollBy({ left: -scrollAmount, behavior: 'smooth' }));
    next.addEventListener('click', () => slider.scrollBy({ left: scrollAmount, behavior: 'smooth' }));
}

// Newsletter (demo)
const newsletter = document.querySelector('.newsletter');
if (newsletter) {
    newsletter.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = newsletter.querySelector('input[type="email"]');
        if (input && input.value) {
            alert(`Subscribed: ${input.value}`);
            input.value = '';
        }
    });
}

// WhatsApp Contact Button - Enhanced and Reliable
function openWhatsApp(customMessage = null) {
    console.log('=== WHATSAPP FUNCTION CALLED ===');
    
    const phoneNumber = '917000532010';
    const defaultMessage = 'Hi! I am interested in your eyewear collection. Can you help me with more information?';
    const message = customMessage || defaultMessage;
    
    // Clean and format the message properly
    const cleanMessage = message.trim().replace(/\s+/g, ' ');
    
    console.log('Phone Number:', phoneNumber);
    console.log('Original Message:', message);
    console.log('Clean Message:', cleanMessage);
    
    // Try different WhatsApp URL formats
    const formats = [
        // Format 1: Standard wa.me with encoded text
        `https://wa.me/${phoneNumber}?text=${encodeURIComponent(cleanMessage)}`,
        // Format 2: api.whatsapp.com with encoded text
        `https://api.whatsapp.com/send?phone=${phoneNumber}&text=${encodeURIComponent(cleanMessage)}`,
        // Format 3: wa.me with unencoded text (for testing)
        `https://wa.me/${phoneNumber}?text=${cleanMessage}`,
        // Format 4: Direct WhatsApp app link
        `whatsapp://send?phone=${phoneNumber}&text=${encodeURIComponent(cleanMessage)}`
    ];
    
    console.log('Trying different URL formats:');
    formats.forEach((url, index) => {
        console.log(`Format ${index + 1}:`, url);
    });
    
    // Use the first format (most reliable)
    const whatsappUrl = formats[0];
    const encodedMessage = encodeURIComponent(cleanMessage);
    
    console.log('Using URL:', whatsappUrl);
    console.log('Encoded Message:', encodedMessage);
    
    // Create a temporary link element for better compatibility
    const link = document.createElement('a');
    link.href = whatsappUrl;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    
    // Try to open WhatsApp
    try {
        // First try: direct window.open
        const newWindow = window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
        
        if (newWindow && !newWindow.closed) {
            console.log('✅ WhatsApp window opened successfully');
            return true;
        } else {
            console.log('❌ Popup blocked, trying alternative method...');
            // Second try: click the link element
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            console.log('✅ WhatsApp opened via link click');
            return true;
        }
    } catch (error) {
        console.error('❌ Error opening WhatsApp:', error);
        // Fallback: direct navigation
        try {
            window.location.href = whatsappUrl;
            console.log('✅ WhatsApp opened via direct navigation');
            return true;
        } catch (fallbackError) {
            console.error('❌ All methods failed:', fallbackError);
            alert('Unable to open WhatsApp. Please try again or contact us directly.');
            return false;
        }
    }
}

// Initialize WhatsApp button
function initWhatsAppButton() {
    console.log('=== INITIALIZING WHATSAPP BUTTON ===');
    
    const whatsappButton = document.getElementById('whatsappButton');
    console.log('Button element:', whatsappButton);
    
    if (whatsappButton) {
        console.log('✅ WhatsApp button found');
        
        // Remove existing onclick to avoid conflicts
        whatsappButton.removeAttribute('onclick');
        
        // Add event listener
        whatsappButton.addEventListener('click', function(e) {
            console.log('🖱️ WhatsApp button clicked!');
            e.preventDefault();
            e.stopPropagation();
            openWhatsApp();
            return false;
        });
        
        // Make it focusable and accessible
        whatsappButton.setAttribute('tabindex', '0');
        whatsappButton.setAttribute('role', 'button');
        whatsappButton.setAttribute('aria-label', 'Contact us on WhatsApp');
        
        // Add keyboard support
        whatsappButton.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openWhatsApp();
            }
        });
        
        console.log('✅ WhatsApp button initialized successfully');
    } else {
        console.error('❌ WhatsApp button not found!');
    }
}

// Make WhatsApp function globally available
window.openWhatsApp = openWhatsApp;

// Test function for WhatsApp
window.testWhatsApp = function() {
    console.log('=== TESTING WHATSAPP FUNCTION ===');
    return openWhatsApp('Test message from website');
};

// Test function for message encoding
window.testWhatsAppMessage = function() {
    console.log('=== TESTING WHATSAPP MESSAGE ENCODING ===');
    const testMessage = 'Hi! I am interested in Ray-Ban Aviator from Ray-Ban. Can you provide more information?';
    const encoded = encodeURIComponent(testMessage);
    const url = `https://wa.me/917000532010?text=${encoded}`;
    
    console.log('Original message:', testMessage);
    console.log('Encoded message:', encoded);
    console.log('Full URL:', url);
    
    // Test the URL
    window.open(url, '_blank');
    
    return { message: testMessage, encoded, url };
};

// Test function for different WhatsApp URL formats
window.testWhatsAppFormats = function() {
    console.log('=== TESTING DIFFERENT WHATSAPP URL FORMATS ===');
    const phoneNumber = '917000532010';
    const testMessage = 'Hi! I am interested in Ray-Ban Aviator from Ray-Ban. Can you provide more information?';
    
    const formats = [
        {
            name: 'wa.me with encoded text',
            url: `https://wa.me/${phoneNumber}?text=${encodeURIComponent(testMessage)}`
        },
        {
            name: 'api.whatsapp.com with encoded text',
            url: `https://api.whatsapp.com/send?phone=${phoneNumber}&text=${encodeURIComponent(testMessage)}`
        },
        {
            name: 'wa.me with unencoded text',
            url: `https://wa.me/${phoneNumber}?text=${testMessage}`
        },
        {
            name: 'Direct WhatsApp app link',
            url: `whatsapp://send?phone=${phoneNumber}&text=${encodeURIComponent(testMessage)}`
        }
    ];
    
    console.log('Testing formats:');
    formats.forEach((format, index) => {
        console.log(`${index + 1}. ${format.name}:`, format.url);
    });
    
    // Test the first format
    console.log('Testing format 1...');
    window.open(formats[0].url, '_blank');
    
    return formats;
};

// Initialize all interactive elements
function initAllInteractiveElements() {
    console.log('=== INITIALIZING ALL INTERACTIVE ELEMENTS ===');
    
    // Initialize WhatsApp button
    initWhatsAppButton();
    
    // Initialize all WhatsApp buttons on the page
    document.querySelectorAll('[onclick*="wa.me"], [href*="wa.me"]').forEach(button => {
        if (!button.onclick && !button.href.includes('wa.me')) {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                openWhatsApp();
            });
        }
    });
    
    // Initialize all buttons with onclick attributes
    document.querySelectorAll('button[onclick]').forEach(button => {
        const onclickAttr = button.getAttribute('onclick');
        if (onclickAttr && !button.hasAttribute('data-initialized')) {
            button.setAttribute('data-initialized', 'true');
            console.log('Initialized button with onclick:', onclickAttr);
        }
    });
    
    // Initialize all links with href attributes
    document.querySelectorAll('a[href]').forEach(link => {
        if (link.href && !link.hasAttribute('data-initialized')) {
            link.setAttribute('data-initialized', 'true');
            console.log('Initialized link with href:', link.href);
        }
    });
    
    // Initialize form submissions
    document.querySelectorAll('form').forEach(form => {
        if (!form.hasAttribute('data-initialized')) {
            form.setAttribute('data-initialized', 'true');
            form.addEventListener('submit', function(e) {
                console.log('Form submitted:', form);
            });
        }
    });
    
    // Initialize slider controls
    const slider = document.querySelector('[data-slider]');
    const prev = document.querySelector('.slider-prev');
    const next = document.querySelector('.slider-next');
    
    if (slider && prev && next) {
        const scrollAmount = 320;
        
        // Remove existing listeners to prevent duplicates
        prev.replaceWith(prev.cloneNode(true));
        next.replaceWith(next.cloneNode(true));
        
        // Re-query after replacement
        const newPrev = document.querySelector('.slider-prev');
        const newNext = document.querySelector('.slider-next');
        
        if (newPrev && newNext) {
            newPrev.addEventListener('click', () => {
                console.log('Slider prev clicked');
                slider.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
            });
            
            newNext.addEventListener('click', () => {
                console.log('Slider next clicked');
                slider.scrollBy({ left: scrollAmount, behavior: 'smooth' });
            });
            
            console.log('✅ Slider controls initialized');
        }
    }
    
    console.log('✅ All interactive elements initialized');
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initAllInteractiveElements);

// Also try immediately
if (document.readyState !== 'loading') {
    initAllInteractiveElements();
}

// Re-initialize on any dynamic content changes
const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
            console.log('New content detected, re-initializing interactive elements...');
            setTimeout(initAllInteractiveElements, 100);
        }
    });
});

// Start observing
observer.observe(document.body, {
    childList: true,
    subtree: true
});


