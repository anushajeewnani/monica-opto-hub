// API Client for Monica Opto Hub Backend
class ApiClient {
    constructor(baseURL = 'http://localhost:3001/api') {
        this.baseURL = baseURL;
        this.token = localStorage.getItem('adminToken');
    }

    // Set authentication token
    setToken(token) {
        this.token = token;
        if (token) {
            localStorage.setItem('adminToken', token);
        } else {
            localStorage.removeItem('adminToken');
        }
    }

    // Get authentication headers
    getHeaders() {
        const headers = {
            'Content-Type': 'application/json'
        };
        
        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }
        
        return headers;
    }

    // Generic request method
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: this.getHeaders(),
            ...options
        };

        try {
            console.log('Making API request to:', url);
            console.log('Request config:', config);
            
            const response = await fetch(url, config);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('API response error:', response.status, errorText);
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }
            
            const data = await response.json();
            console.log('API response success:', data);
            return data;
        } catch (error) {
            console.error('API request failed:', error);
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                throw new Error('Network error: Unable to connect to server. Please check if the backend server is running.');
            }
            throw error;
        }
    }

    // Authentication methods
    async login(username, password) {
        const response = await this.request('/admin/login', {
            method: 'POST',
            body: JSON.stringify({ username, password })
        });
        
        this.setToken(response.token);
        return response;
    }

    async logout() {
        try {
            await this.request('/admin/logout', { method: 'POST' });
        } finally {
            this.setToken(null);
        }
    }

    // Product methods
    async getProducts(filters = {}) {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                params.append(key, value);
            }
        });
        
        const queryString = params.toString();
        const endpoint = queryString ? `/products?${queryString}` : '/products';
        
        return await this.request(endpoint);
    }

    async getProduct(id) {
        return await this.request(`/products/${id}`);
    }

    async createProduct(productData) {
        const formData = new FormData();
        
        Object.entries(productData).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                formData.append(key, value);
            }
        });

        console.log('Creating product with data:', productData);
        console.log('FormData entries:', Array.from(formData.entries()));

        return await this.request('/products', {
            method: 'POST',
            headers: {}, // Let browser set Content-Type for FormData
            body: formData
        });
    }

    async updateProduct(id, productData) {
        const formData = new FormData();
        
        Object.entries(productData).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                formData.append(key, value);
            }
        });

        return await this.request(`/products/${id}`, {
            method: 'PUT',
            headers: {}, // Let browser set Content-Type for FormData
            body: formData
        });
    }

    async deleteProduct(id) {
        return await this.request(`/products/${id}`, { method: 'DELETE' });
    }

    async getProductStats() {
        return await this.request('/products/stats/summary');
    }

    // Admin methods
    async getProfile() {
        return await this.request('/admin/profile');
    }

    async updateProfile(profileData) {
        return await this.request('/admin/profile', {
            method: 'PUT',
            body: JSON.stringify(profileData)
        });
    }

    async getDashboard() {
        return await this.request('/admin/dashboard');
    }

    async getSettings() {
        return await this.request('/admin/settings');
    }

    async updateSettings(settings) {
        return await this.request('/admin/settings', {
            method: 'PUT',
            body: JSON.stringify(settings)
        });
    }

    // Appointment methods
    async getAppointments(filters = {}) {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                params.append(key, value);
            }
        });
        
        const queryString = params.toString();
        const endpoint = queryString ? `/appointments?${queryString}` : '/appointments';
        
        return await this.request(endpoint);
    }

    async getAppointment(id) {
        return await this.request(`/appointments/${id}`);
    }

    async createAppointment(appointmentData) {
        return await this.request('/appointments', {
            method: 'POST',
            body: JSON.stringify(appointmentData)
        });
    }

    async updateAppointmentStatus(id, status) {
        return await this.request(`/appointments/${id}`, {
            method: 'PUT',
            body: JSON.stringify({ status })
        });
    }

    async deleteAppointment(id) {
        return await this.request(`/appointments/${id}`, { method: 'DELETE' });
    }

    async getAppointmentStats() {
        return await this.request('/appointments/stats/summary');
    }

    // Analytics methods
    async trackVisitor(visitorData) {
        return await this.request('/analytics/track', {
            method: 'POST',
            body: JSON.stringify(visitorData)
        });
    }

    async getAnalyticsStats(period = '30') {
        return await this.request(`/analytics/stats?period=${period}`);
    }

    async getVisitorTimeline(period = '7') {
        return await this.request(`/analytics/timeline?period=${period}`);
    }

    async getPageAnalytics(period = '30') {
        return await this.request(`/analytics/pages?period=${period}`);
    }

    // Health check
    async healthCheck() {
        return await this.request('/health');
    }
}

// Create global API client instance
window.apiClient = new ApiClient();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ApiClient;
}
