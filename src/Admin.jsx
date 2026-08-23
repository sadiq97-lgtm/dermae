import { supabase } from "./lib/supabase";
import { useEffect, useState } from "react";

const fieldStyle = { width: "100%", padding: "10px", marginBottom: "10px", boxSizing: "border-box" };
const buttonStyle = (background, loading = false) => ({
  background, color: "white", border: "none", borderRadius: "6px",
  padding: "9px 14px", cursor: loading ? "not-allowed" : "pointer",
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
  const [products, setProducts] = useState([]);
  const [editingProductId, setEditingProductId] = useState(null);
  const [addingProduct, setAddingProduct] = useState(false);
  const [productNameEn, setProductNameEn] = useState("");
  const [productNameAr, setProductNameAr] = useState("");
  const [descriptionEn, setDescriptionEn] = useState("");
  const [descriptionAr, setDescriptionAr] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [productImage, setProductImage] = useState(null);
  const [updateLoading, setUpdateLoading] = useState(false);

  const pendingOrders = orders.filter((o) => (o.status || "Pending") === "Pending").length;
  const processingOrders = orders.filter((o) => o.status === "Processing").length;
  const deliveredOrders = orders.filter((o) => o.status === "Delivered").length;
  const cancelledOrders = orders.filter((o) => o.status === "Cancelled").length;

  const loadProducts = async () => {
    const { data, error } = await supabase.from("products").select("*");
    if (error) return console.error("Products error:", error);
    setProducts(data || []);
  };

  const loadOrders = async () => {
    const { data, error } = await supabase.from("orders").select("*").order("id", { ascending: false });
    if (error) return console.error("Orders error:", error);
    setOrders(data || []);
  };

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      setSession(currentSession);
      setAuthLoading(false);
      if (currentSession) await Promise.all([loadProducts(), loadOrders()]);
    };
    checkSession();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, currentSession) => {
      setSession(currentSession);
      setAuthLoading(false);
      if (currentSession) await Promise.all([loadProducts(), loadOrders()]);
      else { setProducts([]); setOrders([]); }
    });
    return () => subscription.unsubscribe();
  }, []);

  const loginAdmin = async (event) => {
    event.preventDefault();
    setLoginLoading(true); setLoginError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { setLoginError("Invalid email or password."); setLoginLoading(false); return; }
    setEmail(""); setPassword(""); setLoginLoading(false);
  };

  const logoutAdmin = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) alert("Logout failed");
  };

  const clearProductForm = () => {
    setProductNameEn(""); setProductNameAr(""); setDescriptionEn("");
    setDescriptionAr(""); setProductPrice(""); setImageUrl(""); setProductImage(null);
  };
  const startAddingProduct = () => {
    setEditingProductId(null); setAddingProduct(true); clearProductForm();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const startEditingProduct = (product) => {
    setAddingProduct(false); setEditingProductId(product.id);
    setProductNameEn(product.name_en || ""); setProductNameAr(product.name_ar || "");
    setDescriptionEn(product.description_en || ""); setDescriptionAr(product.description_ar || "");
    setProductPrice(product.price_iqd || ""); setImageUrl(product.image_urls?.[0] || "");
    setProductImage(null); window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const closeProductForm = () => {
    setEditingProductId(null); setAddingProduct(false); clearProductForm(); setUpdateLoading(false);
  };

  const uploadProductImage = async () => {
    if (!productImage) return imageUrl.trim();
    const extension = productImage.name.split(".").pop()?.toLowerCase() || "jpg";
    const unique = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2);
    const filePath = `products/${Date.now()}-${unique}.${extension}`;
    const { error } = await supabase.storage.from("product-images").upload(filePath, productImage, {
      cacheControl: "3600", upsert: false, contentType: productImage.type || undefined,
    });
    if (error) throw error;
    const { data } = supabase.storage.from("product-images").getPublicUrl(filePath);
    if (!data?.publicUrl) throw new Error("Could not create the public image URL.");
    return data.publicUrl;
  };

  const validateProduct = () => {
    if (!productNameEn.trim() && !productNameAr.trim()) { alert("Please enter at least one product name."); return false; }
    if (!productPrice || Number(productPrice) < 0) { alert("Please enter a valid product price."); return false; }
    return true;
  };
  const productPayload = (uploadedImageUrl) => ({
    name_en: productNameEn.trim(), name_ar: productNameAr.trim(),
    description_en: descriptionEn.trim(), description_ar: descriptionAr.trim(),
    price_iqd: Number(productPrice), image_urls: uploadedImageUrl ? [uploadedImageUrl] : [],
  });

  const createProduct = async () => {
    if (!validateProduct()) return;
    setUpdateLoading(true);
    try {
      const url = await uploadProductImage();
      const { data, error } = await supabase.from("products").insert([productPayload(url)]).select("*");
      if (error) throw error;
      if (!data?.length) throw new Error("The product was not added. Check the products INSERT policy.");
      setProducts((items) => [data[0], ...items]); closeProductForm(); alert("Product added");
    } catch (error) { console.error("Add product error:", error); alert(`Add failed: ${error.message}`); setUpdateLoading(false); }
  };

  const updateProduct = async () => {
    if (!editingProductId || !validateProduct()) return;
    setUpdateLoading(true);
    try {
      const url = await uploadProductImage();
      const { data, error } = await supabase.from("products").update(productPayload(url)).eq("id", editingProductId).select("*");
      if (error) throw error;
      if (!data?.length) throw new Error("The product was not updated. Check the products UPDATE policy.");
      setProducts((items) => items.map((p) => p.id === editingProductId ? data[0] : p));
      closeProductForm(); alert("Product updated");
    } catch (error) { console.error("Update error:", error); alert(`Update failed: ${error.message}`); setUpdateLoading(false); }
  };

  const deleteProduct = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    const { data, error } = await supabase.from("products").delete().eq("id", id).select("id");
    if (error) return alert(`Delete failed: ${error.message}`);
    if (!data?.length) return alert("The product was not deleted. Check the authenticated delete policy.");
    setProducts((items) => items.filter((p) => p.id !== id));
    if (editingProductId === id) closeProductForm();
    alert("Product deleted");
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    const { error } = await supabase.from("orders").update({ status: newStatus }).eq("id", orderId);
    if (error) return alert(`Status update failed: ${error.message}`);
    setOrders((items) => items.map((o) => o.id === orderId ? { ...o, status: newStatus } : o));
  };
  const getOrderTotal = (order) => Number(order.total || 0);

  if (authLoading) return <div style={{ padding: "40px" }}><h2>Loading...</h2></div>;
  if (!session) return (
    <div style={{ minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center", padding: "20px" }}>
      <form onSubmit={loginAdmin} style={{ width: "100%", maxWidth: "400px", padding: "30px", border: "1px solid #444", borderRadius: "12px" }}>
        <h1 style={{ marginBottom: "10px" }}>Admin Login</h1><p style={{ marginBottom: "25px" }}>Dermaé Administration</p>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Admin email" autoComplete="email" required style={{ ...fieldStyle, padding: "12px" }} />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" autoComplete="current-password" required style={{ ...fieldStyle, padding: "12px" }} />
        {loginError && <p style={{ color: "#ef4444", marginBottom: "12px" }}>{loginError}</p>}
        <button type="submit" disabled={loginLoading} style={{ ...buttonStyle("#2563eb", loginLoading), width: "100%", padding: "12px" }}>{loginLoading ? "Signing in..." : "Sign In"}</button>
      </form>
    </div>
  );

  const visibleOrders = orders.filter((o) => orderFilter === "All" || (o.status || "Pending") === orderFilter).filter((o) =>
    (o.customer_name || "").toLowerCase().includes(orderSearch.toLowerCase()) ||
    (o.customer_phone || o.phone || "").toLowerCase().includes(orderSearch.toLowerCase())
  );

  return (
    <div style={{ padding: "40px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "20px", flexWrap: "wrap" }}>
        <h1>Admin Dashboard</h1><button type="button" onClick={logoutAdmin} style={buttonStyle("#374151")}>Sign Out</button>
      </div>
      <div style={{ display: "flex", gap: "30px", marginBottom: "30px", flexWrap: "wrap" }}>
        <div><h3>Products</h3><p>{products.length}</p></div><div><h3>Orders</h3><p>{orders.length}</p></div>
        <div><h3>Revenue</h3><p>{orders.reduce((sum, o) => sum + getOrderTotal(o), 0).toLocaleString()} IQD</p></div>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "15px", flexWrap: "wrap", marginBottom: "15px" }}>
        <h2 style={{ margin: 0 }}>Products Management</h2><button type="button" onClick={startAddingProduct} style={buttonStyle("#16a34a")}>Add Product</button>
      </div>

      {(addingProduct || editingProductId) && (
        <div style={{ border: "1px solid #444", borderRadius: "10px", padding: "20px", marginBottom: "25px" }}>
          <h3>{editingProductId ? "Edit Product" : "Add Product"}</h3>
          <input value={productNameEn} onChange={(e) => setProductNameEn(e.target.value)} placeholder="Product Name English" style={fieldStyle} />
          <input value={productNameAr} onChange={(e) => setProductNameAr(e.target.value)} placeholder="Product Name Arabic" dir="rtl" style={fieldStyle} />
          <textarea value={descriptionEn} onChange={(e) => setDescriptionEn(e.target.value)} placeholder="Description English" rows="4" style={{ ...fieldStyle, resize: "vertical" }} />
          <textarea value={descriptionAr} onChange={(e) => setDescriptionAr(e.target.value)} placeholder="Description Arabic" rows="4" dir="rtl" style={{ ...fieldStyle, resize: "vertical" }} />
          <input type="number" min="0" value={productPrice} onChange={(e) => setProductPrice(e.target.value)} placeholder="Price IQD" style={fieldStyle} />
          <input type="file" accept="image/*" onChange={(e) => setProductImage(e.target.files?.[0] || null)} style={{ marginBottom: "15px" }} />

          {productImage && (
            <img
              src={URL.createObjectURL(productImage)}
              alt="Preview"
              style={{ display: "block", width: "120px", height: "120px", objectFit: "cover", borderRadius: "8px", marginBottom: "15px", border: "1px solid #444" }}
            />
          )}
          {imageUrl && !productImage && <p style={{ marginTop: 0, marginBottom: "15px", fontSize: "14px" }}>Current image will remain unless a new image is selected.</p>}
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <button type="button" onClick={editingProductId ? updateProduct : createProduct} disabled={updateLoading} style={buttonStyle("#16a34a", updateLoading)}>{updateLoading ? "Saving..." : editingProductId ? "Save Changes" : "Add Product"}</button>
            <button type="button" onClick={closeProductForm} disabled={updateLoading} style={buttonStyle("#6b7280", updateLoading)}>Cancel</button>
          </div>
        </div>
      )}

      {products.map((product) => (
        <div key={product.id} style={{ borderBottom: "1px solid #ccc", padding: "10px 0", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "15px" }}>
          <span>{product.name_en || product.name_ar}</span>
          <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
            <button type="button" onClick={() => startEditingProduct(product)} style={buttonStyle("#2563eb")}>Edit</button>
            <button type="button" onClick={() => deleteProduct(product.id)} style={buttonStyle("#dc2626")}>Delete</button>
          </div>
        </div>
      ))}

      <h2 style={{ marginTop: "40px" }}>Orders Management</h2>
      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "15px" }}>
        <div style={{ color: "#eab308", fontWeight: "bold" }}>Pending: {pendingOrders}</div><div style={{ color: "#3b82f6", fontWeight: "bold" }}>Processing: {processingOrders}</div>
        <div style={{ color: "#22c55e", fontWeight: "bold" }}>Delivered: {deliveredOrders}</div><div style={{ color: "#ef4444", fontWeight: "bold" }}>Cancelled: {cancelledOrders}</div>
      </div>
      <input type="text" placeholder="Search customer or phone..." value={orderSearch} onChange={(e) => setOrderSearch(e.target.value)} style={{ width: "100%", maxWidth: "350px", padding: "8px", marginBottom: "12px", borderRadius: "6px" }} />
      <div style={{ marginBottom: "20px" }}><select value={orderFilter} onChange={(e) => setOrderFilter(e.target.value)} style={{ padding: "8px", borderRadius: "6px" }}>
        <option value="All">All Orders</option><option value="Pending">Pending</option><option value="Processing">Processing</option><option value="Delivered">Delivered</option><option value="Cancelled">Cancelled</option>
      </select></div>
      {orders.length === 0 ? <p>No orders found.</p> : visibleOrders.map((order) => (
        <div key={order.id} style={{ border: "1px solid #444", borderRadius: "10px", padding: "15px", marginBottom: "12px" }}>
          <strong>Order #{order.order_number || order.id}</strong><p>Customer: {order.customer_name || "-"}</p><p>Phone: {order.customer_phone || order.phone || "-"}</p><p>Governorate: {order.customer_governorate || "-"}</p>
          <p style={{ margin: "8px 0 0" }}>Total: {getOrderTotal(order).toLocaleString()} IQD</p>
          <p style={{ margin: "6px 0 0", fontWeight: "bold", color: order.status === "Delivered" ? "#22c55e" : order.status === "Cancelled" ? "#ef4444" : order.status === "Processing" ? "#3b82f6" : "#eab308" }}>Status: {order.status || "Pending"}</p>
          <select value={order.status || "Pending"} onChange={(e) => updateOrderStatus(order.id, e.target.value)} style={{ marginTop: "8px", padding: "6px", borderRadius: "6px" }}>
            <option value="Pending">Pending</option><option value="Processing">Processing</option><option value="Delivered">Delivered</option><option value="Cancelled">Cancelled</option>
          </select>
        </div>
      ))}
    </div>
  );
}
