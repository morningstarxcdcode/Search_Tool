import React, { useState, useEffect } from 'react';
import api from '../utils/axios';
import styles from '../styles/ProductList.module.css';

const ProductList = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        category: '',
        brand: '',
        minPrice: '',
        maxPrice: ''
    });

    const fetchProducts = async () => {
        try {
            setLoading(true);
            // First, let's try to get all products without filters
            const response = await api.get('/products');
            console.log('API Response:', response.data); // Debug log
            setProducts(response.data);
        } catch (err) {
            console.error('API Error:', err); // Debug log
            setError(err.response?.data?.detail || err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []); // Remove filters dependency for now

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className={styles.container}>
            <div className={styles.filters}>
                <input
                    type="text"
                    name="category"
                    placeholder="Category"
                    value={filters.category}
                    onChange={handleFilterChange}
                />
                <input
                    type="text"
                    name="brand"
                    placeholder="Brand"
                    value={filters.brand}
                    onChange={handleFilterChange}
                />
                <input
                    type="number"
                    name="minPrice"
                    placeholder="Min Price"
                    value={filters.minPrice}
                    onChange={handleFilterChange}
                />
                <input
                    type="number"
                    name="maxPrice"
                    placeholder="Max Price"
                    value={filters.maxPrice}
                    onChange={handleFilterChange}
                />
            </div>

            <div className={styles.productGrid}>
                {products.length === 0 ? (
                    <div>No products found</div>
                ) : (
                    products.map(product => (
                        <div key={product.id} className={styles.productCard}>
                            <img src={product.image_url} alt={product.name} className={styles.productImage} />
                            <div className={styles.productInfo}>
                                <h3>{product.name}</h3>
                                <p className={styles.price}>{product.price_text}</p>
                                {product.brand && <p className={styles.brand}>Brand: {product.brand}</p>}
                                {product.category && <p className={styles.category}>Category: {product.category}</p>}
                                {product.condition && <p className={styles.condition}>Condition: {product.condition}</p>}
                                <a href={product.url} target="_blank" rel="noopener noreferrer" className={styles.link}>
                                    View on Mercari
                                </a>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ProductList; 