// Admin Panel JavaScript
class AdminPanel {
    constructor() {
        this.currentUser = null;
        this.products = [];
        this.appointments = [];
        this.analytics = {
            visitors: [],
            pageViews: [],
            sessions: []
        };
        this.settings = {};
        this.useBackend = true; // Flag to enable/disable backend integration
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.checkAuth();
        this.trackVisitor();
        
        // Load data from backend if available
        if (this.useBackend && window.apiClient) {
            this.loadBackendData();
        } else {
            this.loadData();
        }
    }

    // Authentication
    checkAuth() {
        const isLoggedIn = localStorage.getItem('adminLoggedIn') === 'true';
        const loginScreen = document.getElementById('loginScreen');
        const adminDashboard = document.getElementById('adminDashboard');

        if (isLoggedIn) {
            loginScreen.style.display = 'none';
            adminDashboard.style.display = 'block';
            this.updateDashboard();
        } else {
            loginScreen.style.display = 'block';
            adminDashboard.style.display = 'none';
        }
    }

    setupEventListeners() {
        // Login form
        document.getElementById('loginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        // Logout button
        document.getElementById('logoutBtn').addEventListener('click', () => {
            this.handleLogout();
        });

        // Navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = link.dataset.section;
                this.showSection(section);
            });
        });

        // Product form
        document.getElementById('addProductBtn').addEventListener('click', () => {
            this.showProductForm();
        });

        document.getElementById('productFormElement').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleProductSubmit();
        });

        // Search and filter
        document.getElementById('searchProducts').addEventListener('input', (e) => {
            this.filterProducts();
        });

        document.getElementById('filterCategory').addEventListener('change', (e) => {
            this.filterProducts();
        });

        // Category tabs
        document.querySelectorAll('.category-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const category = e.target.dataset.category;
                this.filterByCategory(category);
            });
        });

        // Analytics period
        document.getElementById('analyticsPeriod').addEventListener('change', (e) => {
            this.updateAnalytics();
        });

        // Settings forms
        document.getElementById('adminSettingsForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleAdminSettings();
        });

        document.getElementById('websiteSettingsForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleWebsiteSettings();
        });

        // Appointments
        document.getElementById('appointmentStatus').addEventListener('change', (e) => {
            this.filterAppointments();
        });

        document.getElementById('appointmentType').addEventListener('change', (e) => {
            this.filterAppointments();
        });

        document.getElementById('searchAppointments').addEventListener('input', (e) => {
            this.filterAppointments();
        });

        // Content management forms
        document.getElementById('heroContentForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleHeroContentUpdate();
        });

        document.getElementById('announcementForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleAnnouncementUpdate();
        });

        document.getElementById('addBrandForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleAddBrand();
        });

        document.getElementById('socialMediaForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSocialMediaUpdate();
        });
    }

    async handleLogin() {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const errorDiv = document.getElementById('loginError');

        try {
            if (this.useBackend && window.apiClient) {
                // Use backend authentication
                const response = await window.apiClient.login(username, password);
                this.currentUser = response.user;
                localStorage.setItem('adminLoggedIn', 'true');
                this.checkAuth();
                errorDiv.style.display = 'none';
                this.showMessage('Login successful!', 'success');
            } else {
                // Fallback to local authentication
                if (username === 'admin' && password === 'admin123') {
                    localStorage.setItem('adminLoggedIn', 'true');
                    this.checkAuth();
                    errorDiv.style.display = 'none';
                } else {
                    errorDiv.textContent = 'Invalid username or password';
                    errorDiv.style.display = 'block';
                }
            }
        } catch (error) {
            console.error('Login error:', error);
            errorDiv.textContent = error.message || 'Login failed';
            errorDiv.style.display = 'block';
        }
    }

    async handleLogout() {
        try {
            if (this.useBackend && window.apiClient) {
                await window.apiClient.logout();
            }
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            localStorage.removeItem('adminLoggedIn');
            this.currentUser = null;
            this.checkAuth();
        }
    }

    showSection(sectionName) {
        // Hide all sections
        document.querySelectorAll('.admin-section').forEach(section => {
            section.classList.remove('active');
        });

        // Remove active class from nav links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });

        // Show selected section
        document.getElementById(sectionName).classList.add('active');
        document.querySelector(`[data-section="${sectionName}"]`).classList.add('active');

        // Update content based on section
        switch(sectionName) {
            case 'dashboard':
                this.updateDashboard();
                break;
            case 'products':
                this.updateProductsList();
                break;
            case 'appointments':
                this.updateAppointmentsList();
                break;
            case 'analytics':
                this.updateAnalytics();
                break;
            case 'content':
                this.updateContentManagement();
                break;
            case 'settings':
                this.updateSettings();
                break;
        }
    }

    // Backend data loading
    async loadBackendData() {
        try {
            console.log('Loading data from backend...');
            
            // Load products
            const productsResponse = await window.apiClient.getProducts();
            this.products = productsResponse.products || [];
            
            // Load appointments
            const appointmentsResponse = await window.apiClient.getAppointments();
            this.appointments = appointmentsResponse.appointments || [];
            
            // Load settings
            this.settings = await window.apiClient.getSettings();
            
            // Load analytics
            const analyticsResponse = await window.apiClient.getAnalyticsStats();
            this.analytics = analyticsResponse;
            
            console.log('Backend data loaded successfully');
            console.log('Products:', this.products.length);
            console.log('Appointments:', this.appointments.length);
            
        } catch (error) {
            console.error('Error loading backend data:', error);
            console.log('Falling back to local data...');
            this.loadData();
        }
    }

    // Dashboard
    updateDashboard() {
        const totalVisitors = this.analytics.visitors.length;
        const totalProducts = this.products.length;
        const todayVisitors = this.getTodayVisitors();
        const featuredProducts = this.products.filter(p => p.featured).length;

        document.getElementById('totalVisitors').textContent = totalVisitors;
        document.getElementById('totalProducts').textContent = totalProducts;
        document.getElementById('todayVisitors').textContent = todayVisitors;
        document.getElementById('featuredProducts').textContent = featuredProducts;

        this.updateRecentActivity();
    }

    updateRecentActivity() {
        const activityList = document.getElementById('recentActivity');
        const activities = this.getRecentActivities();

        if (activities.length === 0) {
            activityList.innerHTML = '<p class="no-data">No recent activity</p>';
            return;
        }

        activityList.innerHTML = activities.map(activity => `
            <div class="activity-item">
                <div class="activity-icon">${activity.icon}</div>
                <div class="activity-content">
                    <p class="activity-text">${activity.text}</p>
                    <p class="activity-time">${activity.time}</p>
                </div>
            </div>
        `).join('');
    }

    getRecentActivities() {
        const activities = [];
        const now = new Date();

        // Add recent product additions
        const recentProducts = this.products
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 3);

        recentProducts.forEach(product => {
            activities.push({
                icon: '📦',
                text: `Added product: ${product.name}`,
                time: this.formatTimeAgo(new Date(product.createdAt))
            });
        });

        // Add recent visitors
        const recentVisitors = this.analytics.visitors
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(0, 2);

        recentVisitors.forEach(visitor => {
            activities.push({
                icon: '👤',
                text: `New visitor from ${visitor.location || 'Unknown'}`,
                time: this.formatTimeAgo(new Date(visitor.timestamp))
            });
        });

        return activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 5);
    }

    // Products
    showProductForm(product = null) {
        const form = document.getElementById('productForm');
        const formTitle = document.getElementById('formTitle');
        const formElement = document.getElementById('productFormElement');

        if (product) {
            formTitle.textContent = 'Edit Product';
            this.populateProductForm(product);
        } else {
            formTitle.textContent = 'Add New Product';
            formElement.reset();
        }

        form.style.display = 'block';
        form.scrollIntoView({ behavior: 'smooth' });
    }

    hideProductForm() {
        document.getElementById('productForm').style.display = 'none';
    }

    populateProductForm(product) {
        document.getElementById('productName').value = product.name;
        document.getElementById('productBrand').value = product.brand;
        document.getElementById('productPrice').value = product.price;
        document.getElementById('productCategory').value = product.category;
        document.getElementById('productGender').value = product.gender;
        document.getElementById('productModel').value = product.model || '';
        document.getElementById('productDescription').value = product.description || '';
        document.getElementById('productImage').value = product.image || '';
        document.getElementById('productFeatured').checked = product.featured || false;
    }

    async handleProductSubmit() {
        const formData = new FormData(document.getElementById('productFormElement'));
        const product = {
            name: formData.get('productName'),
            brand: formData.get('productBrand'),
            price: parseFloat(formData.get('productPrice')),
            category: formData.get('productCategory'),
            gender: formData.get('productGender'),
            model: formData.get('productModel'),
            description: formData.get('productDescription'),
            image: formData.get('productImage'),
            featured: formData.get('productFeatured') === 'on'
        };

        try {
            // Check if editing existing product
            const existingProductId = document.getElementById('productFormElement').dataset.productId;
            
            if (existingProductId) {
                // Update existing product
                if (this.useBackend && window.apiClient) {
                    await window.apiClient.updateProduct(existingProductId, product);
                } else {
                    const index = this.products.findIndex(p => p.id === existingProductId);
                    if (index !== -1) {
                        product.id = existingProductId;
                        product.createdAt = this.products[index].createdAt;
                        this.products[index] = product;
                        this.saveData();
                    }
                }
            } else {
                // Create new product
                if (this.useBackend && window.apiClient) {
                    const newProduct = await window.apiClient.createProduct(product);
                    this.products.push(newProduct);
                } else {
                    product.id = Date.now().toString();
                    product.createdAt = new Date().toISOString();
                    product.updatedAt = new Date().toISOString();
                    this.products.push(product);
                    this.saveData();
                }
            }

            this.updateProductsList();
            this.hideProductForm();
            this.showMessage('Product saved successfully!', 'success');
            
            // Notify the main website about the update
            this.notifyWebsiteUpdate();
            
        } catch (error) {
            console.error('Error saving product:', error);
            let errorMessage = 'Error saving product: ' + error.message;
            
            if (error.message.includes('Failed to fetch')) {
                errorMessage = 'Network error: Unable to connect to server. Please check if the backend server is running on http://localhost:3001';
            } else if (error.message.includes('Network error')) {
                errorMessage = error.message;
            }
            
            this.showMessage(errorMessage, 'error');
        }
    }

    updateProductsList() {
        const productsList = document.getElementById('productsList');
        const filteredProducts = this.getFilteredProducts();

        // Update category stats
        const activeCategoryTab = document.querySelector('.category-tab.active');
        const activeCategory = activeCategoryTab ? activeCategoryTab.dataset.category : 'all';
        this.updateCategoryStats(activeCategory);

        if (filteredProducts.length === 0) {
            productsList.innerHTML = '<div class="no-data">No products found. Add your first product!</div>';
            return;
        }

        productsList.innerHTML = filteredProducts.map(product => `
            <div class="product-row">
                <div class="table-cell">
                    <img src="${product.image || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjRjhGQUZDIi8+CjxwYXRoIGQ9Ik0yMCAyMEg0MFY0MEgyMFYyMFoiIGZpbGw9IiNFMkU4RjAiLz4KPC9zdmc+'}" 
                         alt="${product.name}" 
                         class="product-image" 
                         onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjRjhGQUZDIi8+CjxwYXRoIGQ9Ik0yMCAyMEg0MFY0MEgyMFYyMFoiIGZpbGw9IiNFMkU4RjAiLz4KPC9zdmc+'">
                </div>
                <div class="table-cell">
                    <p class="product-name">${product.name}</p>
                    <p class="product-brand">${product.brand}</p>
                </div>
                <div class="table-cell">${product.brand}</div>
                <div class="table-cell">${product.category}</div>
                <div class="table-cell product-price">₹${product.price.toLocaleString()}</div>
                <div class="table-cell">
                    ${product.featured ? '<span class="featured-badge">Featured</span>' : '-'}
                </div>
                <div class="table-cell product-actions">
                    <button class="btn btn--small" onclick="adminPanel.editProduct('${product.id}')">Edit</button>
                    <button class="btn btn--small btn--danger" onclick="adminPanel.deleteProduct('${product.id}')">Delete</button>
                </div>
            </div>
        `).join('');
    }

    getFilteredProducts() {
        const searchTerm = document.getElementById('searchProducts').value.toLowerCase();
        const categoryFilter = document.getElementById('filterCategory').value;
        const activeCategoryTab = document.querySelector('.category-tab.active');
        const activeCategory = activeCategoryTab ? activeCategoryTab.dataset.category : 'all';

        return this.products.filter(product => {
            const matchesSearch = product.name.toLowerCase().includes(searchTerm) ||
                                product.brand.toLowerCase().includes(searchTerm) ||
                                (product.model && product.model.toLowerCase().includes(searchTerm));
            const matchesCategory = !categoryFilter || product.category === categoryFilter;
            const matchesActiveCategory = this.matchesActiveCategory(product, activeCategory);
            return matchesSearch && matchesCategory && matchesActiveCategory;
        });
    }

    matchesActiveCategory(product, activeCategory) {
        if (activeCategory === 'all') return true;
        if (activeCategory === 'men') return product.gender === 'men' || product.gender === 'unisex';
        if (activeCategory === 'women') return product.gender === 'women' || product.gender === 'unisex';
        return product.category === activeCategory;
    }

    filterByCategory(category) {
        // Update active tab
        document.querySelectorAll('.category-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-category="${category}"]`).classList.add('active');

        // Update category stats
        this.updateCategoryStats(category);

        // Filter products
        this.updateProductsList();
    }

    updateCategoryStats(activeCategory) {
        const stats = this.getCategoryStats(activeCategory);
        document.getElementById('categoryStats').textContent = stats;
    }

    getCategoryStats(activeCategory) {
        const totalProducts = this.products.length;
        let categoryProducts = [];

        if (activeCategory === 'all') {
            categoryProducts = this.products;
        } else if (activeCategory === 'men') {
            categoryProducts = this.products.filter(p => p.gender === 'men' || p.gender === 'unisex');
        } else if (activeCategory === 'women') {
            categoryProducts = this.products.filter(p => p.gender === 'women' || p.gender === 'unisex');
        } else {
            categoryProducts = this.products.filter(p => p.category === activeCategory);
        }

        const categoryCount = categoryProducts.length;
        const featuredCount = categoryProducts.filter(p => p.featured).length;

        if (activeCategory === 'all') {
            return `${totalProducts} total products • ${featuredCount} featured`;
        } else {
            return `${categoryCount} products • ${featuredCount} featured`;
        }
    }

    filterProducts() {
        this.updateProductsList();
    }

    editProduct(productId) {
        const product = this.products.find(p => p.id === productId);
        if (product) {
            document.getElementById('productFormElement').dataset.productId = productId;
            this.showProductForm(product);
        }
    }

    async deleteProduct(productId) {
        if (confirm('Are you sure you want to delete this product?')) {
            try {
                if (this.useBackend && window.apiClient) {
                    await window.apiClient.deleteProduct(productId);
                } else {
                    this.products = this.products.filter(p => p.id !== productId);
                    this.saveData();
                }
                
                this.updateProductsList();
                this.showMessage('Product deleted successfully!', 'success');
                
                // Notify the main website about the update
                this.notifyWebsiteUpdate();
                
            } catch (error) {
                console.error('Error deleting product:', error);
                this.showMessage('Error deleting product: ' + error.message, 'error');
            }
        }
    }

    // Notify main website about data updates
    notifyWebsiteUpdate() {
        // Save data first
        this.saveData();
        
        // Dispatch custom event for same-page updates
        window.dispatchEvent(new CustomEvent('adminDataUpdated', {
            detail: { products: this.products }
        }));
        
        // Also trigger storage event for cross-tab updates
        window.dispatchEvent(new StorageEvent('storage', {
            key: 'adminPanelData',
            newValue: JSON.stringify(this.getAdminData())
        }));
        
        // Update the main website immediately
        this.updateMainWebsite();
        
        console.log('Website update notification sent');
    }

    // Get admin data for sharing with main website
    getAdminData() {
        return {
            products: this.products,
            appointments: this.appointments,
            analytics: this.analytics,
            settings: this.settings,
            lastUpdated: new Date().toISOString()
        };
    }

    // Update main website content
    updateMainWebsite() {
        // This will be called when products are updated
        console.log('Updating main website with new data...');
        console.log('Current products count:', this.products.length);
        
        // Force refresh if main website is open
        if (window.productDisplay) {
            console.log('ProductDisplay found, reloading products...');
            window.productDisplay.loadProducts();
            window.productDisplay.displayProductsOnPageLoad();
        } else {
            console.log('ProductDisplay not found, trying to initialize...');
            // Try to initialize ProductDisplay if it doesn't exist
            if (typeof ProductDisplay !== 'undefined') {
                window.productDisplay = new ProductDisplay();
            }
        }
        
        // Also update website content manager
        if (window.websiteContentManager) {
            window.websiteContentManager.loadAdminData();
            window.websiteContentManager.updateWebsiteContent();
        }
    }

    // Appointments
    getInitialAppointments() {
        return [
            {
                id: '1',
                type: 'appointment',
                name: 'Priya Sharma',
                email: 'priya.sharma@email.com',
                phone: '+91-9876543210',
                service: 'Eye Exam & Consultation',
                preferredDate: '2024-01-15',
                preferredTime: '10:00 AM',
                message: 'I need a comprehensive eye exam and would like to explore prescription glasses options.',
                status: 'pending',
                createdAt: new Date().toISOString(),
                source: 'Website Booking Form'
            },
            {
                id: '2',
                type: 'contact',
                name: 'Rajesh Kumar',
                email: 'rajesh.kumar@email.com',
                phone: '+91-8765432109',
                service: 'Product Inquiry',
                preferredDate: null,
                preferredTime: null,
                message: 'I am interested in the Gucci sunglasses collection. Can you provide more information about pricing and availability?',
                status: 'pending',
                createdAt: new Date().toISOString(),
                source: 'Contact Form'
            },
            {
                id: '3',
                type: 'appointment',
                name: 'Anita Mehta',
                email: 'anita.mehta@email.com',
                phone: '+91-7654321098',
                service: 'Contact Lens Fitting',
                preferredDate: '2024-01-18',
                preferredTime: '2:00 PM',
                message: 'I want to switch from glasses to contact lenses. Need professional fitting and consultation.',
                status: 'confirmed',
                createdAt: new Date().toISOString(),
                source: 'Website Booking Form'
            },
            {
                id: '4',
                type: 'contact',
                name: 'Vikram Singh',
                email: 'vikram.singh@email.com',
                phone: '+91-6543210987',
                service: 'General Inquiry',
                preferredDate: null,
                preferredTime: null,
                message: 'Do you offer home delivery for contact lenses? What are your delivery charges?',
                status: 'completed',
                createdAt: new Date().toISOString(),
                source: 'WhatsApp'
            },
            {
                id: '5',
                type: 'appointment',
                name: 'Sneha Patel',
                email: 'sneha.patel@email.com',
                phone: '+91-5432109876',
                service: 'Style Consultation',
                preferredDate: '2024-01-20',
                preferredTime: '11:00 AM',
                message: 'Looking for luxury eyewear for a special occasion. Need style consultation and recommendations.',
                status: 'pending',
                createdAt: new Date().toISOString(),
                source: 'Website Booking Form'
            }
        ];
    }

    updateAppointmentsList() {
        const appointmentsList = document.getElementById('appointmentsList');
        const filteredAppointments = this.getFilteredAppointments();

        // Update appointment stats
        this.updateAppointmentStats();

        if (filteredAppointments.length === 0) {
            appointmentsList.innerHTML = '<div class="no-data">No appointments found matching your criteria.</div>';
            return;
        }

        appointmentsList.innerHTML = filteredAppointments.map(appointment => `
            <div class="appointment-row">
                <div class="table-cell appointment-date">${this.formatDate(appointment.createdAt)}</div>
                <div class="table-cell">
                    <p class="appointment-name">${appointment.name}</p>
                </div>
                <div class="table-cell appointment-contact">
                    <div>${appointment.email}</div>
                    <div>${appointment.phone}</div>
                </div>
                <div class="table-cell appointment-type">${appointment.type}</div>
                <div class="table-cell appointment-service">${appointment.service}</div>
                <div class="table-cell">
                    <span class="status-badge status-${appointment.status}">${appointment.status}</span>
                </div>
                <div class="table-cell appointment-actions">
                    <button class="btn btn--small" onclick="adminPanel.viewAppointment('${appointment.id}')">View</button>
                    <button class="btn btn--small btn--ghost" onclick="adminPanel.updateAppointmentStatus('${appointment.id}')">Update</button>
                </div>
            </div>
        `).join('');
    }

    getFilteredAppointments() {
        const searchTerm = document.getElementById('searchAppointments').value.toLowerCase();
        const statusFilter = document.getElementById('appointmentStatus').value;
        const typeFilter = document.getElementById('appointmentType').value;

        return this.appointments.filter(appointment => {
            const matchesSearch = appointment.name.toLowerCase().includes(searchTerm) ||
                                appointment.email.toLowerCase().includes(searchTerm) ||
                                appointment.phone.includes(searchTerm) ||
                                appointment.message.toLowerCase().includes(searchTerm);
            const matchesStatus = statusFilter === 'all' || appointment.status === statusFilter;
            const matchesType = typeFilter === 'all' || appointment.type === typeFilter;
            return matchesSearch && matchesStatus && matchesType;
        });
    }

    filterAppointments() {
        this.updateAppointmentsList();
    }

    updateAppointmentStats() {
        const totalAppointments = this.appointments.filter(a => a.type === 'appointment').length;
        const pendingAppointments = this.appointments.filter(a => a.status === 'pending').length;
        const confirmedAppointments = this.appointments.filter(a => a.status === 'confirmed').length;
        const totalContacts = this.appointments.filter(a => a.type === 'contact').length;

        document.getElementById('totalAppointments').textContent = totalAppointments;
        document.getElementById('pendingAppointments').textContent = pendingAppointments;
        document.getElementById('confirmedAppointments').textContent = confirmedAppointments;
        document.getElementById('totalContacts').textContent = totalContacts;
    }

    viewAppointment(appointmentId) {
        const appointment = this.appointments.find(a => a.id === appointmentId);
        if (!appointment) return;

        const modal = document.getElementById('appointmentModal');
        const modalTitle = document.getElementById('modalTitle');
        const appointmentDetails = document.getElementById('appointmentDetails');

        modalTitle.textContent = `${appointment.type === 'appointment' ? 'Appointment' : 'Contact'} Details`;

        appointmentDetails.innerHTML = `
            <div class="appointment-details">
                <div class="detail-group">
                    <div class="detail-label">Name</div>
                    <div class="detail-value important">${appointment.name}</div>
                </div>
                <div class="detail-group">
                    <div class="detail-label">Email</div>
                    <div class="detail-value">${appointment.email}</div>
                </div>
                <div class="detail-group">
                    <div class="detail-label">Phone</div>
                    <div class="detail-value">${appointment.phone}</div>
                </div>
                <div class="detail-group">
                    <div class="detail-label">Service Type</div>
                    <div class="detail-value important">${appointment.service}</div>
                </div>
                ${appointment.preferredDate ? `
                <div class="detail-group">
                    <div class="detail-label">Preferred Date</div>
                    <div class="detail-value">${this.formatDate(appointment.preferredDate)}</div>
                </div>
                ` : ''}
                ${appointment.preferredTime ? `
                <div class="detail-group">
                    <div class="detail-label">Preferred Time</div>
                    <div class="detail-value">${appointment.preferredTime}</div>
                </div>
                ` : ''}
                <div class="detail-group">
                    <div class="detail-label">Status</div>
                    <div class="detail-value">
                        <span class="status-badge status-${appointment.status}">${appointment.status}</span>
                    </div>
                </div>
                <div class="detail-group">
                    <div class="detail-label">Source</div>
                    <div class="detail-value">${appointment.source}</div>
                </div>
                <div class="detail-group">
                    <div class="detail-label">Message</div>
                    <div class="detail-value">${appointment.message}</div>
                </div>
                <div class="detail-group">
                    <div class="detail-label">Submitted</div>
                    <div class="detail-value">${this.formatDateTime(appointment.createdAt)}</div>
                </div>
            </div>
        `;

        modal.style.display = 'flex';
        modal.dataset.appointmentId = appointmentId;
    }

    closeAppointmentModal() {
        document.getElementById('appointmentModal').style.display = 'none';
    }

    updateAppointmentStatus(appointmentId) {
        const appointment = this.appointments.find(a => a.id === appointmentId);
        if (!appointment) return;

        const currentStatus = appointment.status;
        const statusOptions = ['pending', 'confirmed', 'completed', 'cancelled'];
        const currentIndex = statusOptions.indexOf(currentStatus);
        const nextIndex = (currentIndex + 1) % statusOptions.length;
        const newStatus = statusOptions[nextIndex];

        appointment.status = newStatus;
        appointment.updatedAt = new Date().toISOString();

        this.saveData();
        this.updateAppointmentsList();
        this.showMessage(`Appointment status updated to ${newStatus}`, 'success');
    }

    exportAppointments() {
        const appointmentsData = this.appointments.map(appointment => ({
            ...appointment,
            formattedDate: this.formatDateTime(appointment.createdAt)
        }));

        const data = {
            appointments: appointmentsData,
            exportDate: new Date().toISOString(),
            totalCount: appointmentsData.length
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `appointments-export-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.showMessage('Appointments exported successfully!', 'success');
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    }

    formatDateTime(dateString) {
        const date = new Date(dateString);
        return date.toLocaleString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    // Analytics
    trackVisitor() {
        const visitor = {
            id: this.generateVisitorId(),
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            location: this.getVisitorLocation(),
            referrer: document.referrer,
            page: window.location.pathname
        };

        this.analytics.visitors.push(visitor);
        this.analytics.pageViews.push({
            timestamp: new Date().toISOString(),
            page: window.location.pathname,
            visitorId: visitor.id
        });

        this.saveData();
    }

    generateVisitorId() {
        return 'visitor_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    getVisitorLocation() {
        // In a real application, you would use a geolocation service
        return 'Unknown';
    }

    updateAnalytics() {
        const period = parseInt(document.getElementById('analyticsPeriod').value);
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - period);

        const recentVisitors = this.analytics.visitors.filter(v => new Date(v.timestamp) >= cutoffDate);
        const recentPageViews = this.analytics.pageViews.filter(p => new Date(p.timestamp) >= cutoffDate);

        // Update stats
        document.getElementById('analyticsTotalVisitors').textContent = recentVisitors.length;
        document.getElementById('analyticsUniqueVisitors').textContent = new Set(recentVisitors.map(v => v.id)).size;
        document.getElementById('analyticsPageViews').textContent = recentPageViews.length;
        document.getElementById('analyticsAvgSession').textContent = this.calculateAvgSession(recentVisitors);

        // Update popular pages
        this.updatePopularPages(recentPageViews);

        // Update visitor timeline
        this.updateVisitorTimeline(recentVisitors);

        // Update device stats
        this.updateDeviceStats(recentVisitors);
    }

    calculateAvgSession(visitors) {
        if (visitors.length === 0) return '0m';
        
        // Simple calculation - in reality you'd track actual session durations
        const avgMinutes = Math.round(visitors.length * 2.5); // Assume 2.5 minutes average
        return `${avgMinutes}m`;
    }

    updatePopularPages(pageViews) {
        const pageCounts = {};
        pageViews.forEach(pageView => {
            pageCounts[pageView.page] = (pageCounts[pageView.page] || 0) + 1;
        });

        const popularPages = Object.entries(pageCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5);

        const container = document.getElementById('popularPages');
        if (popularPages.length === 0) {
            container.innerHTML = '<div class="no-data">No data available</div>';
            return;
        }

        container.innerHTML = popularPages.map(([page, views]) => `
            <div class="page-item">
                <span class="page-name">${page || '/'}</span>
                <span class="page-views">${views} views</span>
            </div>
        `).join('');
    }

    updateVisitorTimeline(visitors) {
        const timeline = {};
        visitors.forEach(visitor => {
            const date = new Date(visitor.timestamp).toDateString();
            timeline[date] = (timeline[date] || 0) + 1;
        });

        const timelineData = Object.entries(timeline)
            .sort(([a], [b]) => new Date(a) - new Date(b))
            .slice(-7); // Last 7 days

        const container = document.getElementById('visitorTimeline');
        if (timelineData.length === 0) {
            container.innerHTML = '<div class="no-data">No data available</div>';
            return;
        }

        container.innerHTML = timelineData.map(([date, count]) => `
            <div class="timeline-item">
                <span class="timeline-date">${new Date(date).toLocaleDateString()}</span>
                <span class="timeline-count">${count} visitors</span>
            </div>
        `).join('');
    }

    updateDeviceStats(visitors) {
        const devices = { mobile: 0, desktop: 0, tablet: 0 };
        
        visitors.forEach(visitor => {
            const userAgent = visitor.userAgent.toLowerCase();
            if (/mobile|android|iphone/.test(userAgent)) {
                devices.mobile++;
            } else if (/tablet|ipad/.test(userAgent)) {
                devices.tablet++;
            } else {
                devices.desktop++;
            }
        });

        const total = devices.mobile + devices.desktop + devices.tablet;
        const container = document.getElementById('deviceStats');
        
        if (total === 0) {
            container.innerHTML = '<div class="no-data">No data available</div>';
            return;
        }

        container.innerHTML = Object.entries(devices).map(([device, count]) => `
            <div class="device-item">
                <span class="device-name">${device.charAt(0).toUpperCase() + device.slice(1)}</span>
                <span class="device-percentage">${Math.round((count / total) * 100)}%</span>
            </div>
        `).join('');
    }

    getTodayVisitors() {
        const today = new Date().toDateString();
        return this.analytics.visitors.filter(v => new Date(v.timestamp).toDateString() === today).length;
    }

    // Content Management
    updateContentManagement() {
        // Populate hero content
        document.getElementById('heroEyebrow').value = this.settings.content.hero.eyebrow;
        document.getElementById('heroTitle').value = this.settings.content.hero.title;
        document.getElementById('heroDescription').value = this.settings.content.hero.description;
        document.getElementById('heroImage').value = this.settings.content.hero.image;

        // Populate announcement
        document.getElementById('announcementText').value = this.settings.content.announcement.text;
        document.getElementById('announcementVisible').checked = this.settings.content.announcement.visible;

        // Populate brands
        this.updateBrandList();

        // Populate social media
        document.getElementById('whatsappNumber').value = this.settings.content.social.whatsapp;
        document.getElementById('instagramHandle').value = this.settings.content.social.instagram;
        document.getElementById('facebookPage').value = this.settings.content.social.facebook;
    }

    updateBrandList() {
        const brandList = document.getElementById('brandList');
        if (!brandList) return;

        brandList.innerHTML = this.settings.content.brands.map(brand => `
            <div class="brand-item">
                <span class="brand-name">${brand}</span>
                <button class="btn btn--small btn--danger" onclick="adminPanel.removeBrand('${brand}')">Remove</button>
            </div>
        `).join('');
    }

    handleHeroContentUpdate() {
        this.settings.content.hero.eyebrow = document.getElementById('heroEyebrow').value;
        this.settings.content.hero.title = document.getElementById('heroTitle').value;
        this.settings.content.hero.description = document.getElementById('heroDescription').value;
        this.settings.content.hero.image = document.getElementById('heroImage').value;

        this.saveData();
        this.showMessage('Hero section updated successfully!', 'success');
        this.notifyWebsiteUpdate();
    }

    handleAnnouncementUpdate() {
        this.settings.content.announcement.text = document.getElementById('announcementText').value;
        this.settings.content.announcement.visible = document.getElementById('announcementVisible').checked;

        this.saveData();
        this.showMessage('Announcement updated successfully!', 'success');
        this.notifyWebsiteUpdate();
    }

    handleAddBrand() {
        const newBrand = document.getElementById('newBrandName').value.trim();
        if (!newBrand) return;

        if (this.settings.content.brands.includes(newBrand)) {
            this.showMessage('Brand already exists!', 'error');
            return;
        }

        this.settings.content.brands.push(newBrand);
        this.saveData();
        this.updateBrandList();
        document.getElementById('newBrandName').value = '';
        this.showMessage('Brand added successfully!', 'success');
        this.notifyWebsiteUpdate();
    }

    removeBrand(brandName) {
        if (confirm(`Are you sure you want to remove ${brandName}?`)) {
            this.settings.content.brands = this.settings.content.brands.filter(brand => brand !== brandName);
            this.saveData();
            this.updateBrandList();
            this.showMessage('Brand removed successfully!', 'success');
            this.notifyWebsiteUpdate();
        }
    }

    handleSocialMediaUpdate() {
        this.settings.content.social.whatsapp = document.getElementById('whatsappNumber').value;
        this.settings.content.social.instagram = document.getElementById('instagramHandle').value;
        this.settings.content.social.facebook = document.getElementById('facebookPage').value;

        this.saveData();
        this.showMessage('Social media settings updated successfully!', 'success');
        this.notifyWebsiteUpdate();
    }

    // Settings
    updateSettings() {
        // Populate admin settings
        document.getElementById('adminUsername').value = this.settings.admin.username;

        // Populate website settings
        document.getElementById('siteTitle').value = this.settings.website.title;
        document.getElementById('siteDescription').value = this.settings.website.description;
        document.getElementById('contactPhone').value = this.settings.website.contactPhone;
        document.getElementById('contactEmail').value = this.settings.website.contactEmail;
    }

    handleAdminSettings() {
        const username = document.getElementById('adminUsername').value;
        const password = document.getElementById('adminPassword').value;

        this.settings.admin.username = username;
        if (password) {
            this.settings.admin.password = password;
        }

        this.saveData();
        this.showMessage('Admin settings updated successfully!', 'success');
    }

    handleWebsiteSettings() {
        this.settings.website.title = document.getElementById('siteTitle').value;
        this.settings.website.description = document.getElementById('siteDescription').value;
        this.settings.website.contactPhone = document.getElementById('contactPhone').value;
        this.settings.website.contactEmail = document.getElementById('contactEmail').value;

        this.saveData();
        this.showMessage('Website settings updated successfully!', 'success');
    }

    // Data Management
    exportData() {
        const data = {
            products: this.products,
            analytics: this.analytics,
            settings: this.settings,
            exportDate: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `monica-opto-hub-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.showMessage('Data exported successfully!', 'success');
    }

    importData() {
        document.getElementById('importFile').click();
    }

    handleImportFile(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                
                if (data.products) this.products = data.products;
                if (data.analytics) this.analytics = data.analytics;
                if (data.settings) this.settings = data.settings;

                this.saveData();
                this.updateDashboard();
                this.updateProductsList();
                this.updateAnalytics();
                this.updateSettings();

                this.showMessage('Data imported successfully!', 'success');
            } catch (error) {
                this.showMessage('Error importing data: Invalid file format', 'error');
            }
        };
        reader.readAsText(file);
    }

    clearAllData() {
        if (confirm('Are you sure you want to clear all data? This action cannot be undone!')) {
            this.products = [];
            this.analytics = { visitors: [], pageViews: [], sessions: [] };
            this.saveData();
            this.updateDashboard();
            this.updateProductsList();
            this.updateAnalytics();
            this.showMessage('All data cleared successfully!', 'success');
        }
    }

    // Utility Functions
    formatTimeAgo(date) {
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);

        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
        return `${Math.floor(diffInSeconds / 86400)} days ago`;
    }

    showMessage(message, type = 'success') {
        // Remove existing messages
        document.querySelectorAll('.message').forEach(msg => msg.remove());

        const messageDiv = document.createElement('div');
        messageDiv.className = `message message--${type}`;
        messageDiv.textContent = message;

        const main = document.querySelector('.admin-main');
        main.insertBefore(messageDiv, main.firstChild);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.remove();
            }
        }, 5000);
    }

    // Data Persistence
    saveData() {
        const data = {
            products: this.products,
            appointments: this.appointments,
            analytics: this.analytics,
            settings: this.settings
        };
        localStorage.setItem('adminPanelData', JSON.stringify(data));
    }

    getInitialProducts() {
        return [
            {
                id: '1',
                name: 'Ray-Ban Aviator Classic',
                brand: 'Ray-Ban',
                price: 10990,
                category: 'sunglasses',
                gender: 'unisex',
                model: 'RB3025 001/58',
                description: 'Classic aviator sunglasses with crystal green lenses',
                image: '', // Use placeholder instead of external URL
                featured: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
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
                image: '', // Use placeholder instead of external URL
                featured: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
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
                image: '', // Use placeholder instead of external URL
                featured: false,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            },
            {
                id: '4',
                name: 'Prada Cat Eye Sunglasses',
                brand: 'Prada',
                price: 33700,
                category: 'sunglasses',
                gender: 'women',
                model: 'PR 01VS 1AB-1F0',
                description: 'Elegant cat eye sunglasses with gradient lenses',
                image: '', // Use placeholder instead of external URL
                featured: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            },
            {
                id: '5',
                name: 'Cartier Skyline Optical',
                brand: 'Cartier',
                price: 96500,
                category: 'optical-frames',
                gender: 'unisex',
                model: 'CT0046S 001',
                description: 'Luxury optical frame with 18k gold accents',
                image: '', // Use placeholder instead of external URL
                featured: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            },
            {
                id: '6',
                name: 'Acuvue Oasys Contact Lenses',
                brand: 'Johnson & Johnson',
                price: 2500,
                category: 'contact-lenses',
                gender: 'unisex',
                model: 'ACUVUE OASYS',
                description: 'Monthly disposable contact lenses for all-day comfort',
                image: '', // Use placeholder instead of external URL
                featured: false,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }
        ];
    }

    loadData() {
        const savedData = localStorage.getItem('adminPanelData');
        if (savedData) {
            try {
                const data = JSON.parse(savedData);
                if (data.products && data.products.length > 0) {
                    this.products = data.products;
                }
                if (data.appointments && data.appointments.length > 0) {
                    this.appointments = data.appointments;
                }
                if (data.analytics) this.analytics = data.analytics;
                if (data.settings) this.settings = { ...this.settings, ...data.settings };
            } catch (error) {
                console.error('Error loading saved data:', error);
            }
        }
    }
}

// Global functions for HTML onclick handlers
function showSection(sectionName) {
    adminPanel.showSection(sectionName);
}

function hideProductForm() {
    adminPanel.hideProductForm();
}

function exportData() {
    adminPanel.exportData();
}

function importData() {
    adminPanel.importData();
}

function handleImportFile(event) {
    adminPanel.handleImportFile(event);
}

function clearAllData() {
    adminPanel.clearAllData();
}

function exportAppointments() {
    adminPanel.exportAppointments();
}

function closeAppointmentModal() {
    adminPanel.closeAppointmentModal();
}

// Initialize admin panel when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.adminPanel = new AdminPanel();
});
