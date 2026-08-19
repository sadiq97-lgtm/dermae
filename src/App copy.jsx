import { useMemo, useState } from "react";
import {
  Search,
  Heart,
  ShoppingBag,
  User,
  Menu,
  X,
  Star,
  ChevronRight,
  Plus,
  Minus,
  Trash2,
  Sparkles,
  Truck,
  ShieldCheck,
  MessageCircle,
} from "lucide-react";
import "./App.css";

const products = [
  {
    id: 1,
    name: "Hydra Glow Serum",
    brand: "Dermæ",
    category: "Serums",
    gender: "Women",
    price: 45000,
    oldPrice: 55000,
    rating: 4.9,
    reviews: 128,
    badge: "BESTSELLER",
    image:
      "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=900&q=85",
    description:
      "A lightweight hydrating serum designed to restore moisture and give the skin a natural, healthy glow.",
    ingredients: ["Hyaluronic Acid", "Niacinamide", "Vitamin B5"],
  },
  {
    id: 2,
    name: "Pure Balance Cleanser",
    brand: "Dermæ",
    category: "Cleansers",
    gender: "Unisex",
    price: 32000,
    oldPrice: null,
    rating: 4.8,
    reviews: 94,
    badge: "NEW",
    image:
      "https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=900&q=85",
    description:
      "A gentle daily cleanser that removes impurities while respecting the skin's natural moisture barrier.",
    ingredients: ["Amino Acids", "Aloe Vera", "Glycerin"],
  },
  {
    id: 3,
    name: "Radiance Cream",
    brand: "Dermæ",
    category: "Moisturizers",
    gender: "Women",
    price: 52000,
    oldPrice: 62000,
    rating: 4.9,
    reviews: 176,
    badge: "POPULAR",
    image:
      "https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?auto=format&fit=crop&w=900&q=85",
    description:
      "A rich yet elegant moisturizer formulated to support a radiant, smooth and visibly refreshed complexion.",
    ingredients: ["Ceramides", "Shea Butter", "Vitamin E"],
  },
  {
    id: 4,
    name: "Men's Recovery Cream",
    brand: "Dermæ Men",
    category: "Moisturizers",
    gender: "Men",
    price: 48000,
    oldPrice: null,
    rating: 4.7,
    reviews: 83,
    badge: "MEN",
    image:
      "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=900&q=85",
    description:
      "A modern daily moisturizer designed for men's skin after shaving, work and everyday environmental stress.",
    ingredients: ["Peptides", "Panthenol", "Green Tea"],
  },
  {
    id: 5,
    name: "Daily Shield SPF 50",
    brand: "Dermæ",
    category: "Sun Care",
    gender: "Unisex",
    price: 39000,
    oldPrice: 45000,
    rating: 4.9,
    reviews: 201,
    badge: "ESSENTIAL",
    image:
      "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=900&q=85",
    description:
      "High-protection daily sunscreen with a comfortable finish, made for everyday use.",
    ingredients: ["SPF 50+", "Vitamin C", "Antioxidants"],
  },
  {
    id: 6,
    name: "Night Repair Oil",
    brand: "Dermæ",
    category: "Treatments",
    gender: "Unisex",
    price: 58000,
    oldPrice: null,
    rating: 4.8,
    reviews: 67,
    badge: "PREMIUM",
    image:
      "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=900&q=85",
    description:
      "A luxurious overnight facial oil designed to nourish tired skin and support a smoother appearance.",
    ingredients: ["Squalane", "Rosehip Oil", "Vitamin E"],
  },
];

const categories = [
  "All",
  "Serums",
  "Cleansers",
  "Moisturizers",
  "Sun Care",
  "Treatments",
];

const formatIQD = (price) => `${price.toLocaleString("en-US")} IQD`;

function App() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [gender, setGender] = useState("All");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const categoryMatch =
        activeCategory === "All" || product.category === activeCategory;

      const genderMatch =
        gender === "All" ||
        product.gender === gender ||
        product.gender === "Unisex";

      const searchMatch =
        product.name.toLowerCase().includes(search.toLowerCase()) ||
        product.category.toLowerCase().includes(search.toLowerCase());

      return categoryMatch && genderMatch && searchMatch;
    });
  }, [activeCategory, gender, search]);

  const addToCart = (product) => {
    setCart((current) => {
      const exists = current.find((item) => item.id === product.id);

      if (exists) {
        return current.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [...current, { ...product, quantity: 1 }];
    });

    setCartOpen(true);
  };

  const updateQuantity = (id, amount) => {
    setCart((current) =>
      current
        .map((item) =>
          item.id === id
            ? { ...item, quantity: item.quantity + amount }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (id) => {
    setCart((current) => current.filter((item) => item.id !== id));
  };

  const toggleWishlist = (id) => {
    setWishlist((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  };

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  const cartTotal = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  return (
    <div className="app">
      {selectedProduct && (
  <div
    style={{
      position: "fixed",
      top: "20px",
      right: "20px",
      background: "#7c3aed",
      color: "white",
      padding: "10px 15px",
      borderRadius: "10px",
      zIndex: 9999,
    }}
  >
    {selectedProduct.name}
  </div>
)}
      {/* TOP BAR */}
      <div className="top-bar">
        <span>Free delivery on orders over 100,000 IQD</span>
        <span className="top-bar-right">Care That Shows™</span>
      </div>

      {/* HEADER */}
      <header className="header">
        <button
          className="mobile-menu-button"
          onClick={() => setMobileMenu(!mobileMenu)}
        >
          {mobileMenu ? <X size={23} /> : <Menu size={23} />}
        </button>

        <div className="logo">
          <span className="logo-main">Dermæ</span>
          <span className="logo-sub">SKINCARE</span>
        </div>

        <nav className={`nav ${mobileMenu ? "nav-open" : ""}`}>
          <a href="#home">Home</a>
          <a href="#shop">Shop</a>
          <a href="#about">Our Story</a>
          <a href="#bestsellers">Bestsellers</a>
          <a href="#contact">Contact</a>
        </nav>

        <div className="header-actions">
          <button className="icon-button">
            <Search size={20} />
          </button>

          <button className="icon-button">
            <User size={20} />
          </button>

          <button
            className="icon-button cart-button"
            onClick={() => setCartOpen(true)}
          >
            <ShoppingBag size={21} />
            {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
          </button>
        </div>
      </header>

      {/* HERO */}
      <section className="hero" id="home">
        <div className="hero-content">
          <span className="eyebrow">
            <Sparkles size={15} />
            PREMIUM SKINCARE
          </span>

          <h1>
            Care
            <br />
            <em>That Shows.</em>
          </h1>

          <p>
            Thoughtfully crafted skincare for every kind of skin.
            Discover a simple ritual designed to make your natural beauty
            visible.
          </p>

          <div className="hero-buttons">
            <a href="#shop" className="primary-button">
              Shop Collection
              <ChevronRight size={18} />
            </a>

            <a href="#about" className="secondary-button">
              Discover Dermæ
            </a>
          </div>

          <div className="hero-features">
            <div>
              <ShieldCheck size={19} />
              <span>Clean formulas</span>
            </div>

            <div>
              <Sparkles size={19} />
              <span>Premium care</span>
            </div>

            <div>
              <Truck size={19} />
              <span>Iraq delivery</span>
            </div>
          </div>
        </div>

        <div className="hero-image">
          <div className="hero-image-card">
            <img
              src="https://images.unsplash.com/photo-1556229010-6c3f2c9ca5f8?auto=format&fit=crop&w=1200&q=90"
              alt="Dermæ skincare"
            />
          </div>

          <div className="floating-card">
            <span>01</span>
            <div>
              <strong>Skin first.</strong>
              <small>Always.</small>
            </div>
          </div>
        </div>
      </section>

      {/* BRAND STRIP */}
      <section className="brand-strip">
        <span>CLINICALLY MINDED</span>
        <span>THOUGHTFULLY FORMULATED</span>
        <span>CRUELTY FREE</span>
        <span>MADE FOR EVERYONE</span>
      </section>

      {/* SHOP */}
      <section className="shop-section" id="shop">
        <div className="section-heading">
          <div>
            <span className="eyebrow">THE COLLECTION</span>
            <h2>Find your ritual.</h2>
          </div>

          <p>
            High-performance essentials designed to work beautifully together.
          </p>
        </div>

        {/* SEARCH + GENDER */}
        <div className="shop-controls">
          <div className="search-box">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="gender-buttons">
            {["All", "Women", "Men"].map((item) => (
              <button
                key={item}
                className={gender === item ? "active" : ""}
                onClick={() => setGender(item)}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {/* CATEGORIES */}
        <div className="category-list">
          {categories.map((category) => (
            <button
              key={category}
              className={activeCategory === category ? "active" : ""}
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>

        {/* PRODUCTS */}
        <div className="products-grid">
          {filteredProducts.map((product) => {
            const isLiked = wishlist.includes(product.id);

            return (
              <article
  className="product-card"
  key={product.id}
  onClick={() => {
  console.log(product);
  setSelectedProduct(product);
}}

>

                <div className="product-image">
                  <img src={product.image} alt={product.name} />

                  <span className="product-badge">{product.badge}</span>

                  <button
                    className={`wishlist-button ${isLiked ? "liked" : ""}`}
                    onClick={() => toggleWishlist(product.id)}
                  >
                    <Heart
                      size={19}
                      fill={isLiked ? "currentColor" : "none"}
                    />
                  </button>

                  <button
                    className="quick-view"
                    onClick={() => setSelectedProduct(product)}
                  >
                    Quick view
                  </button>
                </div>

                <div className="product-info">
                  <span className="product-category">
                    {product.category}
                  </span>

                  <h3>{product.name}</h3>

                  <div className="rating">
                    <Star size={14} fill="currentColor" />
                    <span>{product.rating}</span>
                    <small>({product.reviews})</small>
                  </div>

                  <div className="product-bottom">
                    <div className="price">
                      <strong>{formatIQD(product.price)}</strong>

                      {product.oldPrice && (
                        <del>{formatIQD(product.oldPrice)}</del>
                      )}
                    </div>

                    <button
                      className="add-button"
                      onClick={() => addToCart(product)}
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {filteredProducts.length === 0 && (
          <div className="empty-products">
            <h3>No products found</h3>
            <p>Try another search or category.</p>
          </div>
        )}
      </section>

      {/* ABOUT */}
      <section className="about-section" id="about">
        <div className="about-image">
          <img
            src="https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=1000&q=85"
            alt="Skincare ritual"
          />
        </div>

        <div className="about-content">
          <span className="eyebrow">OUR PHILOSOPHY</span>

          <h2>
            Beautiful skin
            <br />
            starts with <em>care.</em>
          </h2>

          <p>
            Dermæ was created around one simple idea: skincare should feel
            considered, effective and beautiful.
          </p>

          <p>
            We create modern formulas that fit naturally into your everyday
            routine — because the best skincare is the skincare you actually
            enjoy using.
          </p>

          <a href="#shop" className="text-link">
            Explore our products <ChevronRight size={17} />
          </a>
        </div>
      </section>

      {/* BENEFITS */}
      <section className="benefits-section">
        <div className="benefit">
          <Sparkles size={27} />
          <h3>Thoughtful formulas</h3>
          <p>Ingredients selected with purpose and care.</p>
        </div>

        <div className="benefit">
          <ShieldCheck size={27} />
          <h3>Skin-conscious</h3>
          <p>Designed to support your skin barrier.</p>
        </div>

        <div className="benefit">
          <Truck size={27} />
          <h3>Local delivery</h3>
          <p>Reliable delivery across Iraq.</p>
        </div>

        <div className="benefit">
          <Heart size={27} />
          <h3>Made for everyone</h3>
          <p>Simple skincare for women and men.</p>
        </div>
      </section>

      {/* NEWSLETTER */}
      <section className="newsletter">
        <span className="eyebrow">STAY IN THE LOOP</span>
        <h2>Good skin news, delivered.</h2>
        <p>Join our community for skincare tips, launches and exclusive offers.</p>

        <div className="newsletter-form">
          <input type="email" placeholder="Your email address" />
          <button>Subscribe</button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer" id="contact">
        <div className="footer-brand">
          <div className="logo">
            <span className="logo-main">Dermæ</span>
            <span className="logo-sub">SKINCARE</span>
          </div>

          <p>Care That Shows.</p>
        </div>

        <div className="footer-links">
          <div>
            <h4>Shop</h4>
            <a href="#shop">All Products</a>
            <a href="#shop">Best Sellers</a>
            <a href="#shop">New Arrivals</a>
          </div>

          <div>
            <h4>Help</h4>
            <a href="#contact">Contact Us</a>
            <a href="#contact">Shipping</a>
            <a href="#contact">Returns</a>
          </div>

          <div>
            <h4>Follow</h4>
            <a href="#contact">Instagram</a>
            <a href="#contact">Facebook</a>
            <a href="#contact">WhatsApp</a>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© 2026 Dermæ. All rights reserved.</span>
          <span>Made with care in Iraq.</span>
        </div>
      </footer>

      {/* WHATSAPP */}
      <a
        className="whatsapp-button"
        href="https://wa.me/9640000000000"
        target="_blank"
        rel="noreferrer"
        aria-label="WhatsApp"
      >
        <MessageCircle size={24} />
      </a>

      {/* PRODUCT MODAL */}
      {selectedProduct && (
        <div
          className="modal-overlay"
          onClick={() => setSelectedProduct(null)}
        >
          <div
            className="product-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close"
              onClick={() => setSelectedProduct(null)}
            >
              <X size={22} />
            </button>

            <div className="modal-image">
              <img
                src={selectedProduct.image}
                alt={selectedProduct.name}
              />
            </div>

            <div className="modal-content">
              <span className="product-category">
                {selectedProduct.category}
              </span>

              <h2>{selectedProduct.name}</h2>

              <div className="rating">
                <Star size={15} fill="currentColor" />
                <span>{selectedProduct.rating}</span>
                <small>({selectedProduct.reviews} reviews)</small>
              </div>

              <div className="modal-price">
                {formatIQD(selectedProduct.price)}
              </div>

              <p>{selectedProduct.description}</p>

              <div className="ingredients">
                <h4>Key ingredients</h4>

                <div>
                  {selectedProduct.ingredients.map((ingredient) => (
                    <span key={ingredient}>{ingredient}</span>
                  ))}
                </div>
              </div>

              <button
                className="modal-add"
                onClick={() => {
                  addToCart(selectedProduct);
                  setSelectedProduct(null);
                }}
              >
                Add to bag
                <ShoppingBag size={18} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CART DRAWER */}
      {cartOpen && (
        <div className="cart-overlay" onClick={() => setCartOpen(false)}>
          <aside
            className="cart-drawer"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="cart-header">
              <div>
                <span className="eyebrow">YOUR BAG</span>
                <h2>Shopping Bag</h2>
              </div>

              <button onClick={() => setCartOpen(false)}>
                <X size={22} />
              </button>
            </div>

            {cart.length === 0 ? (
              <div className="empty-cart">
                <ShoppingBag size={42} />
                <h3>Your bag is empty</h3>
                <p>Add something beautiful to your routine.</p>

                <button
                  onClick={() => setCartOpen(false)}
                  className="primary-button"
                >
                  Continue Shopping
                </button>
              </div>
            ) : (
              <>
                <div className="cart-items">
                  {cart.map((item) => (
                    <div className="cart-item" key={item.id}>
                      <img src={item.image} alt={item.name} />

                      <div className="cart-item-info">
                        <h4>{item.name}</h4>
                        <span>{formatIQD(item.price)}</span>

                        <div className="quantity">
                          <button onClick={() => updateQuantity(item.id, -1)}>
                            <Minus size={14} />
                          </button>

                          <span>{item.quantity}</span>

                          <button onClick={() => updateQuantity(item.id, 1)}>
                            <Plus size={14} />
                          </button>
                        </div>
                      </div>

                      <button
                        className="remove-item"
                        onClick={() => removeFromCart(item.id)}
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="cart-summary">
                  <div>
                    <span>Subtotal</span>
                    <strong>{formatIQD(cartTotal)}</strong>
                  </div>

                  <div>
                    <span>Delivery</span>
                    <strong>
                      {cartTotal >= 100000 ? "FREE" : "5,000 IQD"}
                    </strong>
                  </div>

                  <div className="cart-total">
                    <span>Total</span>
                    <strong>
                      {formatIQD(
                        cartTotal >= 100000 ? cartTotal : cartTotal + 5000
                      )}
                    </strong>
                  </div>

                  <button className="checkout-button">
                    Proceed to Checkout
                    <ChevronRight size={18} />
                  </button>
                </div>
              </>
            )}
          </aside>
        </div>
      )}
    </div>
  );
}

export default App;