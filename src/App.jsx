import { useState, useEffect, useMemo } from "react";
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
import { supabase } from "./lib/supabase";
import { Routes, Route } from "react-router-dom";
import Admin from "./Admin";


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
  const [checkoutOpen, setCheckoutOpen] = useState(false);
const [orders, setOrders] = useState([]);
const [dbProducts, setDbProducts] = useState([]);
const updateProduct = async () => {
  const { error } = await supabase
    .from("products")
    .update({
      name_en: productName,
      name_ar: productNameAr,
      description_ar: descriptionAr,
      description_en: descriptionEn,
      price_iqd: Number(productPrice),
      image_urls: [imageUrl],
    })
    .eq("id", editingProductId);

  if (error) {
    alert("Update failed");
    return;
  }

  await loadProducts();
  alert("Product updated");

  setEditingProductId(null);
};
const deleteProduct = async (id) => {
  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", id);

  if (error) {
    alert("Delete failed");
    return;
  }

  await loadProducts();
  alert("Product deleted");
};
const [language, setLanguage] = useState("en");
const [productName, setProductName] = useState("");
const [productNameAr, setProductNameAr] = useState("");
const [productPrice, setProductPrice] = useState("");
const [descriptionAr, setDescriptionAr] = useState("");
const [descriptionEn, setDescriptionEn] = useState("");
const [imageUrl, setImageUrl] = useState("");
const [productCategory, setProductCategory] = useState("Serums");
const [editingProductId, setEditingProductId] = useState(null);
const loadOrders = async () => {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .order("id", { ascending: false });

  if (error) {
    console.error(error);
    return;
  }
console.log("Orders:", data);
  setOrders(data || []);
};
const loadProducts = async () => {
  const { data, error } = await supabase
    .from("products")
    .select("*");

  if (error) {
    console.error(error);
    return;
  }

  const mappedProducts = (data || []).map((item) => ({
    name_en: item.name_en,
name_ar: item.name_ar,
description_en: item.description_en,
description_ar: item.description_ar,
    id: item.id,
    name: item.name_en || item.name_ar || "Unnamed Product",
    id: item.id,
    brand: "Dermaé",
    category: "Skincare",
    price: item.price_iqd || 0,
    rating: 5,
    reviews: 0,
    badge: "NEW",
    image: item.image_urls?.[0] || "",
  }));

  console.log("Products:", mappedProducts);

  setDbProducts(mappedProducts);
};

useEffect(() => {
  loadProducts();
}, []);
  const [customerName, setCustomerName] = useState("");
const [customerPhone, setCustomerPhone] = useState("");
const [customerGovernorate, setCustomerGovernorate] = useState("");
const [customerAddress, setCustomerAddress] = useState("");
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);

  const filteredProducts = useMemo(() => {
    return [...products, ...dbProducts].filter((product) => {
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
  }, [dbProducts, activeCategory, gender, search]);

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
  
      {/* TOP BAR */}
      <div className="top-bar">
        <span>
  {language === "en"
    ? "Free delivery on orders over 100,000 IQD"
    : "توصيل مجاني للطلبات فوق 100,000 دينار"}
</span>
        <span className="top-bar-right">
  Care That Shows™
<button
  style={{ marginLeft: "10px" }}
  onClick={() =>
    setLanguage(language === "en" ? "ar" : "en")
  }
>
  {language === "en" ? "العربية" : "English"}
</button>
<button
  onClick={() => {
  window.location.href = "/admin";
}}
>
  Admin
</button>
</span>
</div>
<header className="header">
        <div className="logo">
          <span className="logo-main">Dermaé</span>
          <span className="logo-sub">CARE THAT SHOWS</span>
        </div>

        <nav className={`nav ${mobileMenu ? "nav-open" : ""}`}>
          <a href="#home">
            {language === "en" ? "Home" : "الرئيسية"}
          </a>
          <a href="#shop">
            {language === "en" ? "Shop" : "المتجر"}
          </a>
          <a href="#about">
            {language === "en" ? "Our Story" : "قصتنا"}
          </a>
          <a href="#bestsellers">
            {language === "en" ? "Bestsellers" : "الأكثر مبيعاً"}
          </a>
          <a href="#contact">
            {language === "en" ? "Contact" : "تواصل معنا"}
          </a>
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
            {language === "en" ? "PREMIUM SKINCARE" : "عناية فائقة بالبشرة"}
          </span>

          <h1>
  
  {language === "en" ? (
    <>
      Care
      <br />
      <em>That Shows.</em>
    </>
  ) : (
    <>
      عناية
      <br />
      <em>تظهر نتائجها.</em>
    </>
  )}
</h1>
<p>
  {language === "en"
    ? "Thoughtfully crafted skincare for every kind of skin. Discover a simple ritual designed to make your natural beauty visible."
    : "عناية بالبشرة مصممة بعناية لكل أنواع البشرة. اكتشف روتيناً بسيطاً يساعد على إبراز جمالك الطبيعي."}
</p>
          

          <div className="hero-buttons">
            <a href="#shop" className="primary-button">
              {language === "en"
  ? "Shop Collection"
  : "تسوق المنتجات"}
              <ChevronRight size={18} />
            </a>

            <a href="#about" className="secondary-button">
              {language === "en"
  ? "Discover Dermaé"
  : "اكتشف Dermaé"}
            </a>
          </div>

          <div className="hero-features">
            <div>
              <ShieldCheck size={19} />
              {language === "en" ? "Clean formulas" : "تركيبات نظيفة"}
            </div>

            <div>
              <Sparkles size={19} />
              {language === "en" ? "Premium care" : "عناية فاخرة"}
            </div>

            <div>
              <Truck size={19} />
              {language === "en" ? "Iraq delivery" : "توصيل داخل العراق"}
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
              {language === "en"
  ? "Skin first. Always."
  : "البشرة أولاً... دائماً"}
            
            </div>
          </div>
        </div>
      </section>

      {/* BRAND STRIP */}
      <section className="brand-strip">
        <span>
  {language === "en"
    ? "CLINICALLY MINDED"
    : "مدعوم سريرياً"}
</span>
        <span>
  {language === "en" ? "THOUGHTFULLY FORMULATED" : "مُصمم بعناية"}
</span>
        <span>
  {language === "en" ? "CRUELTY FREE" : "غير مختبر على الحيوانات"}
</span>
        <span>
  {language === "en" ? "MADE FOR EVERYONE" : "مُصمم لجميع الأشخاص"}
</span>
      </section>

      {/* SHOP */}
      <section className="shop-section" id="shop">
        <div className="section-heading">
          <div>
            <span className="eyebrow">
  {language === "en" ? "THE COLLECTION" : "المجموعة"}
</span>
            <h2>
  {language === "en"
    ? "Find your ritual."
    : "اكتشف روتينك المثالي"}
</h2>
          </div>

          <p>
            {language === "en"
  ? "High-performance essentials designed to work beautifully together."
  : "منتجات أساسية عالية الأداء مصممة لتعمل بتناغم تام معاً."}
``
          </p>
        </div>

        {/* SEARCH + GENDER */}
        <div className="shop-controls">
          <div className="search-box">
            <Search size={18} />
            <input
              type="text"
              placeholder={
  language === "en"
    ? "Search products..."
    : "ابحث عن المنتجات..."
}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="gender-buttons">
            {[
  language === "en" ? "All" : "الكل",
  language === "en" ? "Women" : "نساء",
  language === "en" ? "Men" : "رجال",
].map((item) => (
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
              {
  language === "en"
    ? category
    : category === "All"
    ? "الكل"
    : category === "Serums"
    ? "سيرومات"
    : category === "Cleansers"
    ? "منظفات"
    : category === "Moisturizers"
    ? "مرطبات"
    : category === "Sun Care"
    ? "عناية شمسية"
    : category === "Treatments"
    ? "علاجات"
    : category
}
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
  onClick={() => setSelectedProduct(product)}


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
                   {language === "en" ? "Quick View" : "عرض سريع"}
                  </button>
                </div>

                <div className="product-info">
                  <span className="product-category">
                    {product.category}
                  </span>

                  <h3>
  {language === "en"
    ? (product.name_en || product.name)
    : (product.name_ar || product.name)}
</h3>

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
          {language === "en" ? "OUR PHILOSOPHY" : "فلسفتنا"}
``

          <h2>
  {language === "en" ? (
    <>
      Beautiful skin
      <br />
      starts with <em>care.</em>
    </>
  ) : (
    <>
      بشرة جميلة
      <br />
      تبدأ مع <em>العناية.</em>
    </>
  )}
</h2>

         <p>
  {language === "en"
    ? "Dermae was created around one simple idea: skincare should feel considered, effective and beautiful."
    : "تم إنشاء Dermaé حول فكرة بسيطة: يجب أن تكون العناية بالبشرة فعالة وجميلة ومصممة بعناية."}
</p>


<p>
  {language === "en"
    ? "We create modern formulas that fit naturally into your everyday routine because the best skincare is the skincare you actually enjoy using."
    : "نحن نصنع تركيبات حديثة تندمج بشكل طبيعي مع روتينك اليومي، لأن أفضل عناية بالبشرة هي التي تستمتع باستخدامها فعلاً."}
</p>

          <a href="#shop" className="text-link">
            {language === "en" ? "Explore our products" : "استكشف منتجاتنا"} <ChevronRight size={17} />
          </a>
        </div>
      </section>

      {/* BENEFITS */}
      <section className="benefits-section">
        <div className="benefit">
          <Sparkles size={27} />
          {language === "en"
  ? "Thoughtful formulas"
  : "تركيبات مدروسة"}
          {language === "en"
  ? "Ingredients selected with purpose and care."
  : "مكونات مختارة بعناية وهدف واضح."}
        </div>

        <div className="benefit">
          <ShieldCheck size={27} />
          {language === "en"
  ? "Skin-conscious"
  : "مراعية للبشرة"}
          {language === "en"
  ? "Designed to support your skin barrier."
  : "مصممة لدعم حاجز البشرة."}
        </div>

        <div className="benefit">
          <Truck size={27} />
          {language === "en"
  ? "Local delivery"
  : "توصيل محلي"}
`
          {language === "en"
  ? "Reliable delivery across Iraq."
  : "توصيل موثوق إلى جميع أنحاء العراق."}
        </div>

        <div className="benefit">
          <Heart size={27} />
          {language === "en"
  ? "Made for everyone"
  : "مناسب للجميع"}

          {language === "en"
  ? "Simple skincare for women and men."
  : "عناية بسيطة بالبشرة للنساء والرجال."}
        </div>
      </section>

      {/* NEWSLETTER */}
      <section className="newsletter">
        {language === "en"
  ? "STAY IN THE LOOP"
  : "ابقَ على اطلاع"}
        {language === "en"
  ? "Good skin news, delivered."
  : "أخبار رائعة للعناية بالبشرة."}
        {language === "en"
  ? "Join our community for skincare tips, launches and exclusive offers."
  : "انضم إلى مجتمعنا للحصول على نصائح العناية بالبشرة والعروض الحصرية."
}

        <div className="newsletter-form">
        <input
  type="email"
  placeholder={
    language === "en"
      ? "Your email address"
      : "عنوان بريدك الإلكتروني"
  }
/>
          {language === "en"
  ? "Subscribe"
  : "اشترك"}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer" id="contact">
        <div className="footer-brand">
          <div className="logo">
            <span className="logo-main">Dermæ</span>
            <span className="logo-sub">
  {language === "en" ? "SKINCARE" : "العناية بالبشرة"}
</span>
          </div>

          <p>
  {language === "en"
    ? "Care That Shows."
    : "عناية تظهر نتائجها."}
</p>
        </div>

        <div className="footer-links">
          <div>
            <h4>
  {language === "en" ? "Shop" : "المتجر"}
</h4>
            <a href="#shop">
              {language === "en" ? "All Products" : "جميع المنتجات"}
            </a>
            <a href="#shop">
              {language === "en" ? "Best Sellers" : "الأكثر مبيعاً"}
            </a>
            <a href="#shop">
              {language === "en" ? "New Arrivals" : "الواردون جدد"}
            </a>
          </div>

          <div>
            <h4>
  {language === "en" ? "Help" : "المساعدة"}
</h4>
            {language === "en" ? "Contact Us" : "اتصل بنا"}
            {language === "en" ? "Shipping" : "الشحن"}
            {language === "en" ? "Returns" : "الإرجاع"}
          </div>

          <div>
            {language === "en" ? "Follow" : "تابعنا"}
            <a href="#contact">Instagram</a>
            <a href="#contact">Facebook</a>
            <a href="#contact">WhatsApp</a>
          </div>
        </div>

        <div className="footer-bottom">
          {language === "en"
  ? "© 2026 Dermaé. All rights reserved. Made with care in Iraq."
  : "© 2026 Dermaé. جميع الحقوق محفوظة. صُنع بعناية في العراق."}
         
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

              <h2>
  {language === "en"
    ? (selectedProduct.name_en || selectedProduct.name)
    : (selectedProduct.name_ar || selectedProduct.name)}
</h2>


              <div className="rating">
                <Star size={15} fill="currentColor" />
                <span>{selectedProduct.rating}</span>
                <small>({selectedProduct.reviews} reviews)</small>
              </div>

              <div className="modal-price">
                {formatIQD(selectedProduct.price)}
              </div>

              <p>
  {language === "en"
    ? (selectedProduct.description_en || selectedProduct.description)
    : (selectedProduct.description_ar || selectedProduct.description)}
</p>

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
               {language === "en" ? "Add to bag" : "أضف إلى السلة"}
                <h2>{language === "en" ? "Shopping Bag" : "سلة التسوق"}</h2>
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
                <span className="eyebrow">
  {language === "en" ? "YOUR BAG" : "سلتك"}
</span>
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

                  <button
  className="checkout-button"
  onClick={() => setCheckoutOpen(true)}
>

                    Proceed to Checkout
                    <ChevronRight size={18} />
                  </button>
                </div>
              </>
            )}
          </aside>
        </div>
      )}
      {checkoutOpen && (
  <div className="modal-overlay">
    <div className="product-modal">
      <button
        className="modal-close"
        onClick={() => setCheckoutOpen(false)}
      >
        ✕
      </button>

      <h2>{language === "en" ? "Checkout" : "إكمال الطلب"}</h2>
      

<input
  type="text"
  placeholder={language === "en" ? "Full Name" : "الاسم الكامل"}
  value={customerName}
  onChange={(e) => setCustomerName(e.target.value)}
  style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
/>
<input
  type="text"
  placeholder={language === "en" ? "Phone Number" : "رقم الهاتف"}
  value={customerPhone}
  onChange={(e) => setCustomerPhone(e.target.value)}
  style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
/>

<input
  type="text"
  placeholder={language === "en" ? "Governorate" : "المحافظة"}
  value={customerGovernorate}
  onChange={(e) => setCustomerGovernorate(e.target.value)}
  style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
/>

<textarea
  placeholder={language === "en" ? "Address" : "العنوان"}
  value={customerAddress}
  onChange={(e) => setCustomerAddress(e.target.value)}
  style={{
    width: "100%",
    padding: "10px",
    marginBottom: "10px",
    minHeight: "100px",
  }}
/>

<hr style={{ margin: "20px 0" }} />

<h3>Order Summary</h3>

<p>
  <strong>Items:</strong> {cartCount}
</p>

<p>
  <strong>Total:</strong> {formatIQD(cartTotal)}
</p>
<button
  className="checkout-button"
  onClick={async () => {
  const order = {
    customer_name: customerName,
    customer_phone: customerPhone,
    customer_governorate: customerGovernorate,
    customer_address: customerAddress,
    items: cart,
    total: cartTotal,
  };

  const { error } = await supabase
    .from("orders")
    .insert([order]);

 if (error) {
  console.error("Supabase error:", error);
  alert(error.message || "Order failed");
  return;
}

  alert("Order placed successfully");
  setCart([]);

setCustomerName("");
setCustomerPhone("");
setCustomerGovernorate("");
setCustomerAddress("");

setCheckoutOpen(false);
setCartOpen(false);
}}
>
  {language === "en" ? "Place Order" : "إرسال الطلب"}
</button>
    </div>
  </div>
)}
 
      
    </div>
  );
}

export default App;