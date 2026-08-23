import { useEffect, useMemo, useState } from "react";
import {
  Search, Heart, ShoppingBag, User, Menu, X, Star, ChevronRight,
  Plus, Minus, Trash2, Sparkles, Truck, ShieldCheck, MessageCircle,
  Home, Grid2X2,
} from "lucide-react";
import "./App.css";
import "./mobile.css";
import { supabase } from "./lib/supabase";

const fallbackProducts = [
  {
    id: "demo-1", name: "Hydra Glow Serum", name_en: "Hydra Glow Serum",
    name_ar: "سيروم الإشراقة والترطيب", brand: "Dermaé", category: "Serums",
    gender: "Women", price: 45000, oldPrice: 55000, rating: 4.9, reviews: 128,
    badge: "BESTSELLER",
    image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=900&q=85",
    description: "A lightweight hydrating serum designed to restore moisture and give the skin a natural glow.",
    description_ar: "سيروم خفيف للترطيب واستعادة نضارة البشرة الطبيعية.",
    ingredients: ["Hyaluronic Acid", "Niacinamide", "Vitamin B5"],
  },
  {
    id: "demo-2", name: "Pure Balance Cleanser", name_en: "Pure Balance Cleanser",
    name_ar: "غسول التوازن النقي", brand: "Dermaé", category: "Cleansers",
    gender: "Unisex", price: 32000, oldPrice: null, rating: 4.8, reviews: 94,
    badge: "NEW",
    image: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=900&q=85",
    description: "A gentle daily cleanser that removes impurities while respecting the skin barrier.",
    description_ar: "غسول يومي لطيف يزيل الشوائب ويحافظ على حاجز البشرة.",
    ingredients: ["Amino Acids", "Aloe Vera", "Glycerin"],
  },
  {
    id: "demo-3", name: "Radiance Cream", name_en: "Radiance Cream",
    name_ar: "كريم الإشراقة", brand: "Dermaé", category: "Moisturizers",
    gender: "Women", price: 52000, oldPrice: 62000, rating: 4.9, reviews: 176,
    badge: "POPULAR",
    image: "https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?auto=format&fit=crop&w=900&q=85",
    description: "A rich moisturizer formulated to support a smooth, refreshed complexion.",
    description_ar: "مرطب غني يدعم نعومة البشرة ويمنحها مظهراً منتعشاً.",
    ingredients: ["Ceramides", "Shea Butter", "Vitamin E"],
  },
];

const categories = ["All", "Serums", "Cleansers", "Moisturizers", "Sun Care", "Treatments", "Skincare"];
const categoryAr = { All: "الكل", Serums: "سيرومات", Cleansers: "منظفات", Moisturizers: "مرطبات", "Sun Care": "عناية شمسية", Treatments: "علاجات", Skincare: "العناية بالبشرة" };
const genderOptions = [
  { value: "All", en: "All", ar: "الكل" },
  { value: "Women", en: "Women", ar: "نساء" },
  { value: "Men", en: "Men", ar: "رجال" },
];
const formatIQD = (price) => `${Number(price || 0).toLocaleString("en-US")} IQD`;

function App() {
  const [language, setLanguage] = useState("en");
  const [dbProducts, setDbProducts] = useState([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("default");
  const [gender, setGender] = useState("All");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerGovernorate, setCustomerGovernorate] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");

  const isArabic = language === "ar";
  const tr = (en, ar) => (isArabic ? ar : en);

  useEffect(() => {
    const loadProducts = async () => {
      const { data, error } = await supabase.from("products").select("*").order("id", { ascending: false });
      if (error) {
        console.error("Products error:", error);
        return;
      }
      setDbProducts((data || []).map((item) => ({
        id: `db-${item.id}`,
        databaseId: item.id,
        name: item.name_en || item.name_ar || "Unnamed Product",
        name_en: item.name_en || "",
        name_ar: item.name_ar || "",
        description: item.description_en || item.description_ar || "",
        description_en: item.description_en || "",
        description_ar: item.description_ar || "",
        brand: "Dermaé", category: item.category || "Skincare", gender: item.gender || "Unisex",
        price: Number(item.price_iqd || 0), oldPrice: null, rating: 5, reviews: 0,
        badge: "NEW", image: item.image_urls?.[0] || "", ingredients: [],
      })));
    };
    loadProducts();
  }, []);

  useEffect(() => {
    document.documentElement.dir = isArabic ? "rtl" : "ltr";
    document.documentElement.lang = language;
    return () => { document.documentElement.dir = "ltr"; document.documentElement.lang = "en"; };
  }, [isArabic, language]);

  useEffect(() => {
    document.body.style.overflow = cartOpen || checkoutOpen || selectedProduct || mobileMenu ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [cartOpen, checkoutOpen, selectedProduct, mobileMenu]);

  const allProducts = useMemo(() => [...dbProducts, ...fallbackProducts], [dbProducts]);
  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();
    const filtered = allProducts.filter((product) => {
      const categoryMatch = activeCategory === "All" || product.category === activeCategory;
      const genderMatch = gender === "All" || product.gender === gender || product.gender === "Unisex";
      const text = [product.name, product.name_en, product.name_ar, product.category, product.brand].join(" ").toLowerCase();
      return categoryMatch && genderMatch && (!query || text.includes(query));
    });
    return filtered.sort((a, b) => sortBy === "low-high" ? a.price - b.price : sortBy === "high-low" ? b.price - a.price : 0);
  }, [allProducts, activeCategory, gender, search, sortBy]);

  const addToCart = (product) => {
    setCart((current) => {
      const existing = current.find((item) => item.id === product.id);
      return existing
        ? current.map((item) => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item)
        : [...current, { ...product, quantity: 1 }];
    });
    setCartOpen(true);
  };
  const updateQuantity = (id, amount) => setCart((items) => items.map((item) => item.id === id ? { ...item, quantity: item.quantity + amount } : item).filter((item) => item.quantity > 0));
  const removeFromCart = (id) => setCart((items) => items.filter((item) => item.id !== id));
  const toggleWishlist = (id) => setWishlist((items) => items.includes(id) ? items.filter((item) => item !== id) : [...items, id]);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const delivery = cartSubtotal >= 100000 ? 0 : 5000;
  const orderTotal = cartSubtotal + delivery;

  const placeOrder = async () => {
    if (!customerName.trim() || !customerPhone.trim() || !customerGovernorate.trim() || !customerAddress.trim()) {
      alert(tr("Please complete all checkout fields.", "يرجى إكمال جميع حقول الطلب."));
      return;
    }
    if (!cart.length || placingOrder) return;
    setPlacingOrder(true);
    const order = {
      customer_name: customerName.trim(), customer_phone: customerPhone.trim(),
      customer_governorate: customerGovernorate.trim(), customer_address: customerAddress.trim(),
      items: cart, total: orderTotal, status: "Pending",
    };
    const { error } = await supabase.from("orders").insert([order]);
    if (error) {
      console.error("Order error:", error);
      alert(error.message || tr("Order failed", "فشل إرسال الطلب"));
      setPlacingOrder(false);
      return;
    }
    alert(tr("Order placed successfully", "تم إرسال الطلب بنجاح"));
    setCart([]); setCustomerName(""); setCustomerPhone(""); setCustomerGovernorate(""); setCustomerAddress("");
    setCheckoutOpen(false); setCartOpen(false); setPlacingOrder(false);
  };

  const scrollToShop = () => document.getElementById("shop")?.scrollIntoView({ behavior: "smooth" });

  return (
    <div className="app" dir={isArabic ? "rtl" : "ltr"}>
      <div className="top-bar">
        <span>{tr("Free delivery on orders over 100,000 IQD", "توصيل مجاني للطلبات فوق 100,000 دينار")}</span>
        <span className="top-bar-right">
          <span className="care-tagline">Care That Shows™</span>
          <button className="language-button" onClick={() => setLanguage(isArabic ? "en" : "ar")}>{isArabic ? "English" : "العربية"}</button>
          <button className="admin-link" onClick={() => { window.location.href = "/admin"; }}>Admin</button>
        </span>
      </div>

      <header className="header">
        <button className="mobile-menu-button" onClick={() => setMobileMenu(true)} aria-label="Open menu"><Menu size={23} /></button>
        <a className="logo" href="#home"><span className="logo-main">Dermaé</span><span className="logo-sub">CARE THAT SHOWS</span></a>
        <nav className={`nav ${mobileMenu ? "nav-open" : ""}`}>
          <button className="mobile-nav-close" onClick={() => setMobileMenu(false)}><X /></button>
          <a href="#home" onClick={() => setMobileMenu(false)}>{tr("Home", "الرئيسية")}</a>
          <a href="#shop" onClick={() => setMobileMenu(false)}>{tr("Shop", "المتجر")}</a>
          <a href="#about" onClick={() => setMobileMenu(false)}>{tr("Our Story", "قصتنا")}</a>
          <a href="#contact" onClick={() => setMobileMenu(false)}>{tr("Contact", "تواصل معنا")}</a>
        </nav>
        {mobileMenu && <button className="mobile-menu-overlay" onClick={() => setMobileMenu(false)} aria-label="Close menu" />}
        <div className="header-actions">
          <button className="icon-button desktop-only" onClick={() => document.querySelector(".search-box input")?.focus()}><Search size={20} /></button>
          <button className="icon-button desktop-only"><User size={20} /></button>
          <button className="icon-button cart-button" onClick={() => setCartOpen(true)}><ShoppingBag size={21} />{cartCount > 0 && <span className="cart-count">{cartCount}</span>}</button>
        </div>
      </header>

      <main>
        <section className="hero" id="home">
          <div className="hero-content">
            <span className="eyebrow"><Sparkles size={15} />{tr("PREMIUM SKINCARE", "عناية فائقة بالبشرة")}</span>
            <h1>{tr("Care", "عناية")}<br /><em>{tr("That Shows.", "تظهر نتائجها.")}</em></h1>
            <p>{tr("Thoughtfully crafted skincare for every kind of skin. Discover a simple ritual designed to make your natural beauty visible.", "عناية بالبشرة مصممة بعناية لكل أنواع البشرة. اكتشف روتيناً بسيطاً يساعد على إبراز جمالك الطبيعي.")}</p>
            <div className="hero-buttons">
              <a href="#shop" className="primary-button">{tr("Shop Collection", "تسوق المنتجات")}<ChevronRight size={18} /></a>
              <a href="#about" className="secondary-button">{tr("Discover Dermaé", "اكتشف Dermaé")}<ChevronRight size={18} /></a>
            </div>
            <div className="hero-features">
              <div><ShieldCheck size={19} />{tr("Clean formulas", "تركيبات نظيفة")}</div>
              <div><Sparkles size={19} />{tr("Premium care", "عناية فاخرة")}</div>
              <div><Truck size={19} />{tr("Iraq delivery", "توصيل داخل العراق")}</div>
            </div>
          </div>
          <div className="hero-image"><div className="hero-image-card"><img src="https://images.unsplash.com/photo-1556229010-6c3f2c9ca5f8?auto=format&fit=crop&w=1200&q=90" alt="Dermaé skincare" /></div></div>
        </section>

        <section className="brand-strip"><span>{tr("CLINICALLY MINDED", "مدعوم سريرياً")}</span><span>{tr("THOUGHTFULLY FORMULATED", "مصمم بعناية")}</span><span>{tr("CRUELTY FREE", "غير مختبر على الحيوانات")}</span></section>

        <section className="shop-section" id="shop">
          <div className="section-heading"><div><span className="eyebrow">{tr("THE COLLECTION", "المجموعة")}</span><h2>{tr("Find your ritual.", "اكتشف روتينك المثالي")}</h2></div><p>{tr("High-performance essentials designed to work beautifully together.", "منتجات أساسية عالية الأداء مصممة لتعمل بتناغم تام.")}</p></div>
          <div className="shop-controls mobile-shop-controls">
            <div className="search-box"><Search size={18} /><input type="search" placeholder={tr("Search products...", "ابحث عن المنتجات...")} value={search} onChange={(event) => setSearch(event.target.value)} /></div>
            <select className="sort-select" value={sortBy} onChange={(event) => setSortBy(event.target.value)} aria-label="Sort products">
              <option value="default">{tr("Recommended", "مقترحة")}</option><option value="low-high">{tr("Price: Low to High", "السعر: من الأقل")}</option><option value="high-low">{tr("Price: High to Low", "السعر: من الأعلى")}</option>
            </select>
            <div className="gender-buttons">{genderOptions.map((option) => <button key={option.value} className={gender === option.value ? "active" : ""} onClick={() => setGender(option.value)}>{isArabic ? option.ar : option.en}</button>)}</div>
          </div>
          <div className="category-list">{categories.map((category) => <button key={category} className={activeCategory === category ? "active" : ""} onClick={() => setActiveCategory(category)}>{isArabic ? categoryAr[category] || category : category}</button>)}</div>
          <p className="products-count">{tr(`Showing ${filteredProducts.length} products`, `عرض ${filteredProducts.length} منتج`)}</p>

          {filteredProducts.length === 0 ? <div className="empty-products"><h3>{tr("No products found", "لا توجد منتجات مطابقة")}</h3><p>{tr("Try another search or category.", "جرّب بحثاً أو تصنيفاً آخر.")}</p></div> : (
            <div className="products-grid">
              {filteredProducts.map((product) => {
                const isLiked = wishlist.includes(product.id);
                const displayName = isArabic ? product.name_ar || product.name : product.name_en || product.name;
                return (
                  <article className="product-card" key={product.id} onClick={() => setSelectedProduct(product)}>
                    <div className="product-image">
                      {product.image ? <img src={product.image} alt={displayName} loading="lazy" /> : <div className="product-image-placeholder">Dermaé</div>}
                      <span className="product-badge">{product.badge}</span>
                      <button className={`wishlist-button ${isLiked ? "liked" : ""}`} onClick={(event) => { event.stopPropagation(); toggleWishlist(product.id); }} aria-label="Wishlist"><Heart size={18} fill={isLiked ? "currentColor" : "none"} /></button>
                      <button className="quick-view" onClick={(event) => { event.stopPropagation(); setSelectedProduct(product); }}>{tr("Quick View", "عرض سريع")}</button>
                    </div>
                    <div className="product-info">
                      <span className="product-category">{isArabic ? categoryAr[product.category] || product.category : product.category}</span>
                      <h3>{displayName}</h3>
                      <div className="rating"><Star size={14} fill="currentColor" /><span>{product.rating}</span><small>({product.reviews})</small></div>
                      <div className="product-bottom">
                        <div className="price"><strong>{formatIQD(product.price)}</strong>{product.oldPrice && <del>{formatIQD(product.oldPrice)}</del>}</div>
                        <button className="add-button" onClick={(event) => { event.stopPropagation(); addToCart(product); }}><Plus size={18} /><span>{tr("Add", "إضافة")}</span></button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <section className="about-section" id="about">
          <div className="about-image"><img src="https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=1000&q=85" alt="Skincare ritual" loading="lazy" /></div>
          <div className="about-content"><span className="eyebrow">{tr("OUR PHILOSOPHY", "فلسفتنا")}</span><h2>{tr("Beautiful skin starts with care.", "بشرة جميلة تبدأ مع العناية.")}</h2><p>{tr("Dermaé was created around one simple idea: skincare should feel considered, effective and beautiful.", "تم إنشاء Dermaé حول فكرة بسيطة: يجب أن تكون العناية بالبشرة فعالة وجميلة ومصممة بعناية.")}</p><a href="#shop" className="text-link">{tr("Explore our products", "استكشف منتجاتنا")}<ChevronRight size={17} /></a></div>
        </section>
      </main>

      <footer className="footer" id="contact"><div className="footer-brand"><div className="logo"><span className="logo-main">Dermaé</span><span className="logo-sub">SKINCARE</span></div><p>{tr("Care That Shows.", "عناية تظهر نتائجها.")}</p></div><div className="footer-bottom">{tr("© 2026 Dermaé. All rights reserved. Made with care in Iraq.", "© 2026 Dermaé. جميع الحقوق محفوظة. صنع بعناية في العراق.")}</div></footer>

      <a className="whatsapp-button" href="https://wa.me/9640000000000" target="_blank" rel="noreferrer" aria-label="WhatsApp"><MessageCircle size={24} /></a>

      {selectedProduct && (
        <div className="modal-overlay" onClick={() => setSelectedProduct(null)}>
          <div className="product-modal mobile-product-modal" onClick={(event) => event.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedProduct(null)}><X size={22} /></button>
            <div className="modal-image">{selectedProduct.image ? <img src={selectedProduct.image} alt={selectedProduct.name} /> : <div className="product-image-placeholder">Dermaé</div>}</div>
            <div className="modal-content"><span className="product-category">{selectedProduct.category}</span><h2>{isArabic ? selectedProduct.name_ar || selectedProduct.name : selectedProduct.name_en || selectedProduct.name}</h2><div className="rating"><Star size={15} fill="currentColor" /><span>{selectedProduct.rating}</span><small>({selectedProduct.reviews})</small></div><div className="modal-price">{formatIQD(selectedProduct.price)}</div><p>{isArabic ? selectedProduct.description_ar || selectedProduct.description : selectedProduct.description_en || selectedProduct.description}</p>{selectedProduct.ingredients?.length > 0 && <div className="ingredients"><h4>{tr("Key ingredients", "المكونات الأساسية")}</h4><div>{selectedProduct.ingredients.map((ingredient) => <span key={ingredient}>{ingredient}</span>)}</div></div>}<button className="modal-add" onClick={() => { addToCart(selectedProduct); setSelectedProduct(null); }}>{tr("Add to Shopping Bag", "أضف إلى سلة التسوق")}</button></div>
          </div>
        </div>
      )}

      {cartOpen && (
        <div className="cart-overlay" onClick={() => setCartOpen(false)}>
          <aside className="cart-drawer" onClick={(event) => event.stopPropagation()}>
            <div className="cart-header"><div><span className="eyebrow">{tr("YOUR BAG", "سلتك")}</span><h2>{tr("Shopping Bag", "سلة التسوق")}</h2></div><button onClick={() => setCartOpen(false)}><X size={22} /></button></div>
            {cart.length === 0 ? <div className="empty-cart"><ShoppingBag size={42} /><h3>{tr("Your bag is empty", "سلتك فارغة")}</h3><button onClick={() => setCartOpen(false)} className="primary-button">{tr("Continue Shopping", "متابعة التسوق")}</button></div> : <><div className="cart-items">{cart.map((item) => <div className="cart-item" key={item.id}>{item.image ? <img src={item.image} alt={item.name} /> : <div className="cart-thumb-placeholder">Dermaé</div>}<div className="cart-item-info"><h4>{isArabic ? item.name_ar || item.name : item.name_en || item.name}</h4><span>{formatIQD(item.price)}</span><div className="quantity"><button onClick={() => updateQuantity(item.id, -1)}><Minus size={14} /></button><span>{item.quantity}</span><button onClick={() => updateQuantity(item.id, 1)}><Plus size={14} /></button></div></div><button className="remove-item" onClick={() => removeFromCart(item.id)}><Trash2 size={17} /></button></div>)}</div><div className="cart-summary"><div><span>{tr("Subtotal", "المجموع الفرعي")}</span><strong>{formatIQD(cartSubtotal)}</strong></div><div><span>{tr("Delivery", "التوصيل")}</span><strong>{delivery === 0 ? tr("FREE", "مجاني") : formatIQD(delivery)}</strong></div><div className="cart-total"><span>{tr("Total", "المجموع")}</span><strong>{formatIQD(orderTotal)}</strong></div><button className="checkout-button" onClick={() => { setCartOpen(false); setCheckoutOpen(true); }}>{tr("Proceed to Checkout", "إكمال الطلب")}<ChevronRight size={18} /></button></div></>}
          </aside>
        </div>
      )}

      {checkoutOpen && (
        <div className="modal-overlay" onClick={() => setCheckoutOpen(false)}>
          <div className="checkout-modal" onClick={(event) => event.stopPropagation()}>
            <button className="modal-close" onClick={() => setCheckoutOpen(false)}><X size={22} /></button>
            <h2>{tr("Checkout", "إكمال الطلب")}</h2>
            <input type="text" placeholder={tr("Full Name", "الاسم الكامل")} value={customerName} onChange={(event) => setCustomerName(event.target.value)} />
            <input type="tel" inputMode="tel" placeholder={tr("Phone Number", "رقم الهاتف")} value={customerPhone} onChange={(event) => setCustomerPhone(event.target.value)} />
            <input type="text" placeholder={tr("Governorate", "المحافظة")} value={customerGovernorate} onChange={(event) => setCustomerGovernorate(event.target.value)} />
            <textarea placeholder={tr("Full Address", "العنوان الكامل")} value={customerAddress} onChange={(event) => setCustomerAddress(event.target.value)} />
            <div className="checkout-summary"><span>{tr("Items", "القطع")}: {cartCount}</span><strong>{formatIQD(orderTotal)}</strong></div>
            <button className="checkout-button" disabled={placingOrder} onClick={placeOrder}>{placingOrder ? tr("Sending...", "جار الإرسال...") : tr("Place Order", "إرسال الطلب")}</button>
          </div>
        </div>
      )}

      <nav className="mobile-bottom-nav" aria-label="Mobile navigation">
        <a href="#home"><Home size={21} /><span>{tr("Home", "الرئيسية")}</span></a>
        <button onClick={scrollToShop}><Grid2X2 size={21} /><span>{tr("Shop", "المتجر")}</span></button>
        <button onClick={() => { scrollToShop(); }}><Heart size={21} /><span>{tr("Wishlist", "المفضلة")}</span>{wishlist.length > 0 && <b>{wishlist.length}</b>}</button>
        <button onClick={() => setCartOpen(true)}><ShoppingBag size={21} /><span>{tr("Cart", "السلة")}</span>{cartCount > 0 && <b>{cartCount}</b>}</button>
      </nav>
    </div>
  );
}

export default App;
