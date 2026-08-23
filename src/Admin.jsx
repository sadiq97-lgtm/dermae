import { supabase } from "./lib/supabase";
import { useEffect, useMemo, useState } from "react";

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

  if (authLoading) {
    return <div style={{ padding: "40px" }}><h2>Loading...</h2></div>;
  }

  if (!session) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center", padding: "20px" }}>
        <form onSubmit={loginAdmin} style={{ width: "100%", maxWidth: "400px", padding: "30px", border: "1px solid #444", borderRadius: "12px" }}>
          <h1 style={{ marginBottom: "10px" }}>Admin Login</h1>
          <p style={{ marginBottom: "25px" }}>Dermaé Administration</p>
          <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Admin email" autoComplete="email" required style={{ ...fieldStyle, padding: "12px" }} />
          <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Password" autoComplete="current-password" required style={{ ...fieldStyle, padding: "12px" }} />
          {loginError && <p style={{ color: "#ef4444", marginBottom: "12px" }}>{loginError}</p>}
          <button type="submit" disabled={loginLoading} style={{ ...buttonStyle("#2563eb", loginLoading), width: "100%", padding: "12px" }}>
            {loginLoading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div style={{ padding: "40px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "20px", flexWrap: "wrap" }}>
        <h1>Admin Dashboard</h1>
        <button type="button" onClick={logoutAdmin} style={buttonStyle("#374151")}>Sign Out</button>
      </div>

      <div style={{ display: "flex", gap: "30px", marginBottom: "30px", flexWrap: "wrap" }}>
        <div><h3>Products</h3><p>{products.length}</p></div>
        <div><h3>Orders</h3><p>{orders.length}</p></div>
        <div><h3>Revenue</h3><p>{orders.reduce((sum, order) => sum + getOrderTotal(order), 0).toLocaleString()} IQD</p></div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "15px", flexWrap: "wrap", marginBottom: "15px" }}>
        <h2 style={{ margin: 0 }}>Products Management</h2>
        <button type="button" onClick={startAddingProduct} style={buttonStyle("#16a34a")}>Add Product</button>
      </div>

      {(addingProduct || editingProductId) && (
        <div style={{ border: "1px solid #444", borderRadius: "10px", padding: "20px", marginBottom: "25px" }}>
          <h3>{editingProductId ? "Edit Product" : "Add Product"}</h3>
          <input value={productNameEn} onChange={(event) => setProductNameEn(event.target.value)} placeholder="Product Name English" style={fieldStyle} />
          <input value={productNameAr} onChange={(event) => setProductNameAr(event.target.value)} placeholder="Product Name Arabic" dir="rtl" style={fieldStyle} />
          <textarea value={descriptionEn} onChange={(event) => setDescriptionEn(event.target.value)} placeholder="Description English" rows="4" style={{ ...fieldStyle, resize: "vertical" }} />
          <textarea value={descriptionAr} onChange={(event) => setDescriptionAr(event.target.value)} placeholder="Description Arabic" rows="4" dir="rtl" style={{ ...fieldStyle, resize: "vertical" }} />
          <input type="number" min="0" value={productPrice} onChange={(event) => setProductPrice(event.target.value)} placeholder="Price IQD" style={fieldStyle} />
          <input key={imageInputKey} type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={handleImageChange} style={{ marginBottom: "15px" }} />
          <p style={{ marginTop: 0, fontSize: "13px", opacity: 0.75 }}>JPG, PNG, WEBP, or GIF. Maximum 5 MB.</p>

          {imagePreviewUrl && (
            <div style={{ marginBottom: "15px" }}>
              <p style={{ margin: "0 0 6px" }}>New image preview:</p>
              <img src={imagePreviewUrl} alt="Selected product preview" style={{ display: "block", width: "120px", height: "120px", objectFit: "cover", borderRadius: "8px", border: "1px solid #444" }} />
              <button type="button" onClick={resetImageSelection} style={{ ...buttonStyle("#6b7280"), marginTop: "8px" }}>Remove selected image</button>
            </div>
          )}

          {imageUrl && !productImage && (
            <div style={{ marginBottom: "15px" }}>
              <p style={{ margin: "0 0 6px" }}>Current image:</p>
              <img src={imageUrl} alt="Current product" style={{ display: "block", width: "120px", height: "120px", objectFit: "cover", borderRadius: "8px", border: "1px solid #444" }} />
              <p style={{ margin: "6px 0 0", fontSize: "13px" }}>This image remains unless a new image is selected.</p>
            </div>
          )}

          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <button type="button" onClick={editingProductId ? updateProduct : createProduct} disabled={updateLoading} style={buttonStyle("#16a34a", updateLoading)}>
              {updateLoading ? "Saving..." : editingProductId ? "Save Changes" : "Add Product"}
            </button>
            <button type="button" onClick={closeProductForm} disabled={updateLoading} style={buttonStyle("#6b7280", updateLoading)}>Cancel</button>
          </div>
        </div>
      )}

      <input type="text" placeholder="Search products..." value={productSearch} onChange={(event) => setProductSearch(event.target.value)} style={{ width: "100%", maxWidth: "350px", padding: "8px", marginBottom: "12px", borderRadius: "6px" }} />

      {visibleProducts.length === 0 ? (
        <p>No products found.</p>
      ) : (
        visibleProducts.map((product) => (
          <div key={product.id} style={{ borderBottom: "1px solid #ccc", padding: "10px 0", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "15px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
              {product.image_urls?.[0] ? (
                <img src={product.image_urls[0]} alt="" style={{ width: "48px", height: "48px", objectFit: "cover", borderRadius: "6px", flexShrink: 0 }} />
              ) : (
                <div style={{ width: "48px", height: "48px", border: "1px solid #555", borderRadius: "6px", display: "grid", placeItems: "center", fontSize: "10px", flexShrink: 0 }}>No image</div>
              )}
              <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{product.name_en || product.name_ar}</span>
            </div>
            <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
              <button type="button" onClick={() => startEditingProduct(product)} disabled={deletingProductId === product.id} style={buttonStyle("#2563eb", deletingProductId === product.id)}>Edit</button>
              <button type="button" onClick={() => deleteProduct(product)} disabled={deletingProductId === product.id} style={buttonStyle("#dc2626", deletingProductId === product.id)}>
                {deletingProductId === product.id ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        ))
      )}

      <h2 style={{ marginTop: "40px" }}>Orders Management</h2>
      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "15px" }}>
        <div style={{ color: "#eab308", fontWeight: "bold" }}>Pending: {pendingOrders}</div>
        <div style={{ color: "#3b82f6", fontWeight: "bold" }}>Processing: {processingOrders}</div>
        <div style={{ color: "#22c55e", fontWeight: "bold" }}>Delivered: {deliveredOrders}</div>
        <div style={{ color: "#ef4444", fontWeight: "bold" }}>Cancelled: {cancelledOrders}</div>
      </div>

      <input type="text" placeholder="Search customer, phone, or order..." value={orderSearch} onChange={(event) => setOrderSearch(event.target.value)} style={{ width: "100%", maxWidth: "350px", padding: "8px", marginBottom: "12px", borderRadius: "6px" }} />
      <div style={{ marginBottom: "20px" }}>
        <select value={orderFilter} onChange={(event) => setOrderFilter(event.target.value)} style={{ padding: "8px", borderRadius: "6px" }}>
          <option value="All">All Orders</option>
          <option value="Pending">Pending</option>
          <option value="Processing">Processing</option>
          <option value="Delivered">Delivered</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>

      {orders.length === 0 ? (
        <p>No orders found.</p>
      ) : visibleOrders.length === 0 ? (
        <p>No orders match the selected filters.</p>
      ) : (
        visibleOrders.map((order) => (
          <div key={order.id} style={{ border: "1px solid #444", borderRadius: "10px", padding: "15px", marginBottom: "12px" }}>
            <strong>Order #{order.order_number || order.id}</strong>
            <p>Customer: {order.customer_name || "-"}</p>
            <p>Phone: {order.customer_phone || order.phone || "-"}</p>
            <p>Governorate: {order.customer_governorate || "-"}</p>
            <p style={{ margin: "8px 0 0" }}>Total: {getOrderTotal(order).toLocaleString()} IQD</p>
            <p style={{ margin: "6px 0 0", fontWeight: "bold", color: order.status === "Delivered" ? "#22c55e" : order.status === "Cancelled" ? "#ef4444" : order.status === "Processing" ? "#3b82f6" : "#eab308" }}>
              Status: {order.status || "Pending"}
            </p>
            <select value={order.status || "Pending"} disabled={updatingOrderId === order.id} onChange={(event) => updateOrderStatus(order.id, event.target.value)} style={{ marginTop: "8px", padding: "6px", borderRadius: "6px", opacity: updatingOrderId === order.id ? 0.7 : 1 }}>
              <option value="Pending">Pending</option>
              <option value="Processing">Processing</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        ))
      )}
    </div>
  );
}
