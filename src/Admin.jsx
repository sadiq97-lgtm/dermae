import { supabase } from "./lib/supabase";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { BarChart3, Box, LogOut, PackagePlus, RefreshCw, Search, ShoppingBag, Sparkles, Trash2, Edit3, ImagePlus, X, Clock3, CircleCheck, Ban, Truck } from "lucide-react";
import "./Admin.css";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

const fieldStyle = {
  width: "100%",
  padding: "10px",
  marginBottom: "10px",
  boxSizing: "border-box",
};

const buttonStyle = (background, loading = false) => ({
  background,
  color: "white",
  border: "none",
  borderRadius: "6px",
  padding: "9px 14px",
  cursor: loading ? "not-allowed" : "pointer",
  opacity: loading ? 0.7 : 1,
});

export default function Admin() {
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  const [orders, setOrders] = useState([]);
  const [orderFilter, setOrderFilter] = useState("All");
  const [orderSearch, setOrderSearch] = useState("");
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  const [products, setProducts] = useState([]);
  const [productSearch, setProductSearch] = useState("");
  const [editingProductId, setEditingProductId] = useState(null);
  const [addingProduct, setAddingProduct] = useState(false);
  const [productNameEn, setProductNameEn] = useState("");
  const [productNameAr, setProductNameAr] = useState("");
  const [descriptionEn, setDescriptionEn] = useState("");
  const [descriptionAr, setDescriptionAr] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [productImage, setProductImage] = useState(null);
  const [imageInputKey, setImageInputKey] = useState(0);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [deletingProductId, setDeletingProductId] = useState(null);

  const imagePreviewUrl = useMemo(
    () => (productImage ? URL.createObjectURL(productImage) : ""),
    [productImage]
  );

  useEffect(() => {
    return () => {
      if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
    };
  }, [imagePreviewUrl]);

  const pendingOrders = orders.filter(
    (order) => (order.status || "Pending") === "Pending"
  ).length;
  const processingOrders = orders.filter(
    (order) => order.status === "Processing"
  ).length;
  const deliveredOrders = orders.filter(
    (order) => order.status === "Delivered"
  ).length;
  const cancelledOrders = orders.filter(
    (order) => order.status === "Cancelled"
  ).length;

  const loadProducts = async () => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("id", { ascending: false });

    if (error) {
      console.error("Products error:", error);
      return;
    }
    setProducts(data || []);
  };

  const loadOrders = async () => {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("id", { ascending: false });

    if (error) {
      console.error("Orders error:", error);
      return;
    }
    setOrders(data || []);
  };

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session: currentSession },
      } = await supabase.auth.getSession();

      setSession(currentSession);
      setAuthLoading(false);

      if (currentSession) {
        await Promise.all([loadProducts(), loadOrders()]);
      }
    };

    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, currentSession) => {
      setSession(currentSession);
      setAuthLoading(false);

      if (currentSession) {
        await Promise.all([loadProducts(), loadOrders()]);
      } else {
        setProducts([]);
        setOrders([]);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loginAdmin = async (event) => {
    event.preventDefault();
    setLoginLoading(true);
    setLoginError("");

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      console.error("Login error:", error);
      setLoginError("Invalid email or password.");
      setLoginLoading(false);
      return;
    }

    setEmail("");
    setPassword("");
    setLoginLoading(false);
  };

  const logoutAdmin = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) alert(`Logout failed: ${error.message}`);
  };

  const resetImageSelection = () => {
    setProductImage(null);
    setImageInputKey((key) => key + 1);
  };

  const clearProductForm = () => {
    setProductNameEn("");
    setProductNameAr("");
    setDescriptionEn("");
    setDescriptionAr("");
    setProductPrice("");
    setImageUrl("");
    resetImageSelection();
  };

  const startAddingProduct = () => {
    setEditingProductId(null);
    setAddingProduct(true);
    clearProductForm();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const startEditingProduct = (product) => {
    setAddingProduct(false);
    setEditingProductId(product.id);
    setProductNameEn(product.name_en || "");
    setProductNameAr(product.name_ar || "");
    setDescriptionEn(product.description_en || "");
    setDescriptionAr(product.description_ar || "");
    setProductPrice(product.price_iqd ?? "");
    setImageUrl(product.image_urls?.[0] || "");
    resetImageSelection();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const closeProductForm = () => {
    setEditingProductId(null);
    setAddingProduct(false);
    clearProductForm();
    setUpdateLoading(false);
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0] || null;
    if (!file) {
      setProductImage(null);
      return;
    }

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      alert("Please choose a JPG, PNG, WEBP, or GIF image.");
      event.target.value = "";
      setProductImage(null);
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      alert("The image must be 5 MB or smaller.");
      event.target.value = "";
      setProductImage(null);
      return;
    }

    setProductImage(file);
  };

  const uploadProductImage = async () => {
    if (!productImage) return imageUrl.trim();

    const extension = productImage.name.split(".").pop()?.toLowerCase() || "jpg";
    const unique =
      globalThis.crypto?.randomUUID?.() || Math.random().toString(36).slice(2);
    const filePath = `products/${Date.now()}-${unique}.${extension}`;

    const { error } = await supabase.storage
      .from("product-images")
      .upload(filePath, productImage, {
        cacheControl: "3600",
        upsert: false,
        contentType: productImage.type,
      });

    if (error) throw error;

    const { data } = supabase.storage
      .from("product-images")
      .getPublicUrl(filePath);

    if (!data?.publicUrl) {
      throw new Error("Could not create the public image URL.");
    }

    return data.publicUrl;
  };

  const validateProduct = () => {
    if (!productNameEn.trim() && !productNameAr.trim()) {
      alert("Please enter at least one product name.");
      return false;
    }

    const numericPrice = Number(productPrice);
    if (productPrice === "" || !Number.isFinite(numericPrice) || numericPrice < 0) {
      alert("Please enter a valid product price.");
      return false;
    }

    return true;
  };

  const productPayload = (uploadedImageUrl) => ({
    name_en: productNameEn.trim(),
    name_ar: productNameAr.trim(),
    description_en: descriptionEn.trim(),
    description_ar: descriptionAr.trim(),
    price_iqd: Number(productPrice),
    image_urls: uploadedImageUrl ? [uploadedImageUrl] : [],
  });

  const createProduct = async () => {
    if (!validateProduct() || updateLoading) return;
    setUpdateLoading(true);

    try {
      const url = await uploadProductImage();
      const { data, error } = await supabase
        .from("products")
        .insert([productPayload(url)])
        .select("*");

      if (error) throw error;
      if (!data?.length) {
        throw new Error("The product was not added. Check the products INSERT policy.");
      }

      setProducts((items) => [data[0], ...items]);
      closeProductForm();
      alert("Product added");
    } catch (error) {
      console.error("Add product error:", error);
      alert(`Add failed: ${error.message}`);
      setUpdateLoading(false);
    }
  };

  const updateProduct = async () => {
    if (!editingProductId || !validateProduct() || updateLoading) return;
    setUpdateLoading(true);

    try {
      const url = await uploadProductImage();
      const { data, error } = await supabase
        .from("products")
        .update(productPayload(url))
        .eq("id", editingProductId)
        .select("*");

      if (error) throw error;
      if (!data?.length) {
        throw new Error("The product was not updated. Check the products UPDATE policy.");
      }

      setProducts((items) =>
        items.map((product) =>
          product.id === editingProductId ? data[0] : product
        )
      );
      closeProductForm();
      alert("Product updated");
    } catch (error) {
      console.error("Update error:", error);
      alert(`Update failed: ${error.message}`);
      setUpdateLoading(false);
    }
  };

  const getStoragePath = (publicUrl) => {
    if (!publicUrl || !publicUrl.includes("/product-images/")) return null;
    try {
      return decodeURIComponent(publicUrl.split("/product-images/")[1]);
    } catch {
      return null;
    }
  };

  const deleteProduct = async (product) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    if (deletingProductId) return;

    setDeletingProductId(product.id);
    const { data, error } = await supabase
      .from("products")
      .delete()
      .eq("id", product.id)
      .select("id");

    if (error || !data?.length) {
      alert(
        error
          ? `Delete failed: ${error.message}`
          : "The product was not deleted. Check the authenticated delete policy."
      );
      setDeletingProductId(null);
      return;
    }

    const storagePath = getStoragePath(product.image_urls?.[0]);
    if (storagePath) {
      const { error: storageError } = await supabase.storage
        .from("product-images")
        .remove([storagePath]);
      if (storageError) {
        console.warn("Product deleted, but image cleanup failed:", storageError);
      }
    }

    setProducts((items) => items.filter((item) => item.id !== product.id));
    if (editingProductId === product.id) closeProductForm();
    setDeletingProductId(null);
    alert("Product deleted");
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    if (updatingOrderId) return;
    setUpdatingOrderId(orderId);

    const { error } = await supabase
      .from("orders")
      .update({ status: newStatus })
      .eq("id", orderId);

    if (error) {
      alert(`Status update failed: ${error.message}`);
      setUpdatingOrderId(null);
      return;
    }

    setOrders((items) =>
      items.map((order) =>
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );
    setUpdatingOrderId(null);
  };

  const getOrderTotal = (order) => Number(order.total || 0);

  const visibleProducts = products.filter((product) => {
    const search = productSearch.trim().toLowerCase();
    if (!search) return true;
    return [product.name_en, product.name_ar, product.description_en, product.description_ar]
      .some((value) => (value || "").toLowerCase().includes(search));
  });

  const visibleOrders = orders
    .filter(
      (order) =>
        orderFilter === "All" ||
        (order.status || "Pending") === orderFilter
    )
    .filter((order) => {
      const search = orderSearch.trim().toLowerCase();
      if (!search) return true;
      return [
        order.customer_name,
        order.customer_phone,
        order.phone,
        order.order_number,
        order.id,
      ].some((value) => String(value || "").toLowerCase().includes(search));
    });

  const totalRevenue = orders.reduce((sum, order) => sum + getOrderTotal(order), 0);
  const refreshDashboard = async () => {
    await Promise.all([loadProducts(), loadOrders()]);
  };
  const statusClass = (status) => `admin-status admin-status-${(status || "Pending").toLowerCase()}`;

  if (authLoading) {
    return <div className="admin-loading"><div className="admin-loader" /><span>Loading Dermaé Admin...</span></div>;
  }

  if (!session) {
    return (
      <div className="admin-login-page">
        <div className="admin-login-glow" />
        <motion.form className="admin-login-card" onSubmit={loginAdmin} initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65 }}>
          <div className="admin-login-brand"><Sparkles size={20} /><span>DERMAÉ</span></div>
          <h1>Welcome back.</h1>
          <p>Sign in to manage products, orders and the Dermaé experience.</p>
          <label>Email address</label>
          <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="admin@example.com" autoComplete="email" required />
          <label>Password</label>
          <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Your password" autoComplete="current-password" required />
          {loginError && <p className="admin-error">{loginError}</p>}
          <button className="admin-primary admin-login-button" type="submit" disabled={loginLoading}>{loginLoading ? "Signing in..." : "Sign In"}</button>
          <a href="/">← Back to storefront</a>
        </motion.form>
      </div>
    );
  }

  const stats = [
    { label: "Products", value: products.length.toLocaleString(), note: "Active catalogue", icon: Box, tone: "violet" },
    { label: "Orders", value: orders.length.toLocaleString(), note: `${pendingOrders} waiting`, icon: ShoppingBag, tone: "blue" },
    { label: "Revenue", value: `${totalRevenue.toLocaleString()} IQD`, note: "All recorded orders", icon: BarChart3, tone: "green" },
    { label: "Delivered", value: deliveredOrders.toLocaleString(), note: `${processingOrders} processing`, icon: CircleCheck, tone: "amber" },
  ];

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <a className="admin-logo" href="/"><strong>Dermaé</strong><span>ADMINISTRATION</span></a>
        <nav>
          <a className="active" href="#overview"><BarChart3 size={18} />Overview</a>
          <a href="#products"><Box size={18} />Products</a>
          <a href="#orders"><ShoppingBag size={18} />Orders <b>{pendingOrders}</b></a>
        </nav>
        <div className="admin-sidebar-bottom">
          <span>Signed in as</span><strong>{session.user?.email}</strong>
          <button type="button" onClick={logoutAdmin}><LogOut size={17} />Sign Out</button>
        </div>
      </aside>

      <main className="admin-main">
        <header className="admin-topbar" id="overview">
          <div><span className="admin-kicker">DERMAÉ CONTROL CENTER</span><h1>Dashboard overview</h1><p>Manage your catalogue and fulfil customer orders from one place.</p></div>
          <div className="admin-top-actions"><button className="admin-secondary" type="button" onClick={refreshDashboard}><RefreshCw size={17} />Refresh</button><button className="admin-primary" type="button" onClick={startAddingProduct}><PackagePlus size={18} />New Product</button></div>
        </header>

        <section className="admin-stats-grid">
          {stats.map(({ label, value, note, icon: Icon, tone }, index) => <motion.article className={`admin-stat admin-stat-${tone}`} key={label} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.08 }} whileHover={{ y: -5 }}><div className="admin-stat-icon"><Icon size={20} /></div><span>{label}</span><strong>{value}</strong><small>{note}</small></motion.article>)}
        </section>

        {(addingProduct || editingProductId) && (
          <motion.section className="admin-form-panel" initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}>
            <div className="admin-section-title"><div><span className="admin-kicker">CATALOGUE EDITOR</span><h2>{editingProductId ? "Edit product" : "Add a new product"}</h2></div><button className="admin-icon-button" type="button" onClick={closeProductForm} disabled={updateLoading}><X size={20} /></button></div>
            <div className="admin-form-grid">
              <label><span>English name</span><input value={productNameEn} onChange={(event) => setProductNameEn(event.target.value)} placeholder="Hydra Glow Serum" /></label>
              <label><span>Arabic name</span><input value={productNameAr} onChange={(event) => setProductNameAr(event.target.value)} placeholder="اسم المنتج" dir="rtl" /></label>
              <label className="admin-form-wide"><span>English description</span><textarea value={descriptionEn} onChange={(event) => setDescriptionEn(event.target.value)} placeholder="Product description" rows="4" /></label>
              <label className="admin-form-wide"><span>Arabic description</span><textarea value={descriptionAr} onChange={(event) => setDescriptionAr(event.target.value)} placeholder="وصف المنتج" rows="4" dir="rtl" /></label>
              <label><span>Price in IQD</span><input type="number" min="0" value={productPrice} onChange={(event) => setProductPrice(event.target.value)} placeholder="45000" /></label>
              <label className="admin-upload"><span>Product image</span><div><ImagePlus size={22} /><input key={imageInputKey} type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={handleImageChange} /><small>JPG, PNG, WEBP or GIF · Max 5 MB</small></div></label>
            </div>
            {(imagePreviewUrl || (imageUrl && !productImage)) && <div className="admin-image-preview"><img src={imagePreviewUrl || imageUrl} alt="Product preview" /><div><strong>{imagePreviewUrl ? "New image selected" : "Current product image"}</strong><span>{imagePreviewUrl ? "This image will be uploaded when you save." : "Select a new image to replace the current one."}</span>{imagePreviewUrl && <button type="button" onClick={resetImageSelection}>Remove selected image</button>}</div></div>}
            <div className="admin-form-actions"><button className="admin-primary" type="button" onClick={editingProductId ? updateProduct : createProduct} disabled={updateLoading}>{updateLoading ? "Saving..." : editingProductId ? "Save Changes" : "Add Product"}</button><button className="admin-secondary" type="button" onClick={closeProductForm} disabled={updateLoading}>Cancel</button></div>
          </motion.section>
        )}

        <section className="admin-section" id="products">
          <div className="admin-section-title"><div><span className="admin-kicker">CATALOGUE</span><h2>Products</h2><p>{visibleProducts.length} of {products.length} products</p></div><button className="admin-primary" type="button" onClick={startAddingProduct}><PackagePlus size={17} />Add Product</button></div>
          <div className="admin-toolbar"><div className="admin-search"><Search size={18} /><input type="search" placeholder="Search products..." value={productSearch} onChange={(event) => setProductSearch(event.target.value)} /></div></div>
          {visibleProducts.length === 0 ? <div className="admin-empty"><Box size={34} /><h3>No products found</h3><p>Try a different search or add a new product.</p></div> : <div className="admin-products-grid">{visibleProducts.map((product) => <motion.article className="admin-product-card" key={product.id} whileHover={{ y: -6 }}><div className="admin-product-image">{product.image_urls?.[0] ? <img src={product.image_urls[0]} alt={product.name_en || product.name_ar || "Product"} /> : <div><ImagePlus size={28} /><span>No image</span></div>}<span className="admin-product-id">#{product.id}</span></div><div className="admin-product-body"><span className="admin-product-label">DERMAÉ PRODUCT</span><h3>{product.name_en || product.name_ar || "Unnamed product"}</h3>{product.name_ar && <p dir="rtl">{product.name_ar}</p>}<strong>{Number(product.price_iqd || 0).toLocaleString()} IQD</strong><div className="admin-card-actions"><button className="admin-edit" type="button" onClick={() => startEditingProduct(product)} disabled={deletingProductId === product.id}><Edit3 size={16} />Edit</button><button className="admin-delete" type="button" onClick={() => deleteProduct(product)} disabled={deletingProductId === product.id}><Trash2 size={16} />{deletingProductId === product.id ? "Deleting..." : "Delete"}</button></div></div></motion.article>)}</div>}
        </section>

        <section className="admin-section" id="orders">
          <div className="admin-section-title"><div><span className="admin-kicker">FULFILMENT</span><h2>Orders</h2><p>Review customer details and update fulfilment status.</p></div></div>
          <div className="admin-status-summary"><button onClick={() => setOrderFilter("Pending")}><Clock3 size={16} /><span>Pending</span><b>{pendingOrders}</b></button><button onClick={() => setOrderFilter("Processing")}><Truck size={16} /><span>Processing</span><b>{processingOrders}</b></button><button onClick={() => setOrderFilter("Delivered")}><CircleCheck size={16} /><span>Delivered</span><b>{deliveredOrders}</b></button><button onClick={() => setOrderFilter("Cancelled")}><Ban size={16} /><span>Cancelled</span><b>{cancelledOrders}</b></button></div>
          <div className="admin-toolbar admin-orders-toolbar"><div className="admin-search"><Search size={18} /><input type="search" placeholder="Search customer, phone or order..." value={orderSearch} onChange={(event) => setOrderSearch(event.target.value)} /></div><select value={orderFilter} onChange={(event) => setOrderFilter(event.target.value)}><option value="All">All Orders</option><option value="Pending">Pending</option><option value="Processing">Processing</option><option value="Delivered">Delivered</option><option value="Cancelled">Cancelled</option></select></div>
          {orders.length === 0 ? <div className="admin-empty"><ShoppingBag size={34} /><h3>No orders yet</h3><p>New customer orders will appear here.</p></div> : visibleOrders.length === 0 ? <div className="admin-empty"><Search size={34} /><h3>No matching orders</h3><p>Change the search or selected status.</p></div> : <div className="admin-orders-grid">{visibleOrders.map((order) => { const status = order.status || "Pending"; return <motion.article className="admin-order-card" key={order.id} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}><div className="admin-order-head"><div><span>ORDER</span><strong>#{order.order_number || order.id}</strong></div><span className={statusClass(status)}>{status}</span></div><div className="admin-order-details"><div><span>Customer</span><strong>{order.customer_name || "-"}</strong></div><div><span>Phone</span><strong>{order.customer_phone || order.phone || "-"}</strong></div><div><span>Governorate</span><strong>{order.customer_governorate || "-"}</strong></div><div><span>Total</span><strong>{getOrderTotal(order).toLocaleString()} IQD</strong></div></div><div className="admin-order-footer"><label>Update status<select value={status} disabled={updatingOrderId === order.id} onChange={(event) => updateOrderStatus(order.id, event.target.value)}><option value="Pending">Pending</option><option value="Processing">Processing</option><option value="Delivered">Delivered</option><option value="Cancelled">Cancelled</option></select></label>{updatingOrderId === order.id && <span className="admin-saving">Updating...</span>}</div></motion.article>; })}</div>}
        </section>
      </main>
    </div>
  );
}
