import { supabase } from "./lib/supabase";
import { useEffect, useState } from "react";

export default function Admin() {
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session: currentSession },
      } = await supabase.auth.getSession();

      setSession(currentSession);
      setAuthLoading(false);

      if (currentSession) {
        await loadProducts();
        await loadOrders();
      }
    };

    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      async (_event, currentSession) => {
        setSession(currentSession);
        setAuthLoading(false);

        if (currentSession) {
          await loadProducts();
          await loadOrders();
        } else {
          setProducts([]);
          setOrders([]);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loadProducts = async () => {
    const { data, error } = await supabase
      .from("products")
      .select("*");

    if (error) {
      console.error("Products error:", error);
      return;
    }

    setProducts(data || []);
  };

  const loadOrders = async () => {
    const { data, error } = await supabase
      .from("orders")
      .select("*");

    if (error) {
      console.error("Orders error:", error);
      return;
    }

    setOrders(data || []);
  };

  const loginAdmin = async (event) => {
    event.preventDefault();

    setLoginLoading(true);
    setLoginError("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

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

    if (error) {
      console.error("Logout error:", error);
      alert("Logout failed");
    }
  };

  const deleteProduct = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this product?"
    );

    if (!confirmed) return;

    const { data: deletedRows, error } = await supabase
      .from("products")
      .delete()
      .eq("id", id)
      .select("id");

    if (error) {
      console.error("Delete error:", error);
      alert(`Delete failed: ${error.message}`);
      return;
    }

    if (!deletedRows || deletedRows.length === 0) {
      alert(
        "The product was not deleted. Check the authenticated delete policy."
      );
      return;
    }

    setProducts((currentProducts) =>
      currentProducts.filter((product) => product.id !== id)
    );

    alert("Product deleted");
  };

  if (authLoading) {
    return (
      <div style={{ padding: "40px" }}>
        <h2>Loading...</h2>
      </div>
    );
  }

  if (!session) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "20px",
        }}
      >
        <form
          onSubmit={loginAdmin}
          style={{
            width: "100%",
            maxWidth: "400px",
            padding: "30px",
            border: "1px solid #444",
            borderRadius: "12px",
          }}
        >
          <h1 style={{ marginBottom: "10px" }}>
            Admin Login
          </h1>

          <p style={{ marginBottom: "25px" }}>
            Dermaé Administration
          </p>

          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Admin email"
            autoComplete="email"
            required
            style={{
              width: "100%",
              padding: "12px",
              marginBottom: "12px",
              boxSizing: "border-box",
            }}
          />

          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Password"
            autoComplete="current-password"
            required
            style={{
              width: "100%",
              padding: "12px",
              marginBottom: "12px",
              boxSizing: "border-box",
            }}
          />

          {loginError && (
            <p
              style={{
                color: "#ef4444",
                marginBottom: "12px",
              }}
            >
              {loginError}
            </p>
          )}

          <button
            type="submit"
            disabled={loginLoading}
            style={{
              width: "100%",
              padding: "12px",
              background: "#2563eb",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: loginLoading ? "not-allowed" : "pointer",
              opacity: loginLoading ? 0.7 : 1,
            }}
          >
            {loginLoading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div style={{ padding: "40px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "20px",
          flexWrap: "wrap",
        }}
      >
        <h1>Admin Dashboard</h1>

        <button
          onClick={logoutAdmin}
          style={{
            background: "#374151",
            color: "white",
            border: "none",
            borderRadius: "6px",
            padding: "9px 14px",
            cursor: "pointer",
          }}
        >
          Sign Out
        </button>
      </div>

      <div
        style={{
          display: "flex",
          gap: "30px",
          marginBottom: "30px",
          flexWrap: "wrap",
        }}
      >
        <div>
          <h3>Products</h3>
          <p>{products.length}</p>
        </div>

        <div>
          <h3>Orders</h3>
          <p>{orders.length}</p>
        </div>

        <div>
          <h3>Revenue</h3>
          <p>
            {orders
              .reduce(
                (sum, order) =>
                  sum + (Number(order.total) || 0),
                0
              )
              .toLocaleString()}{" "}
            IQD
          </p>
        </div>
      </div>

      <h2>Products Management</h2>

      {products.map((product) => (
        <div
          key={product.id}
          style={{
            borderBottom: "1px solid #ccc",
            padding: "10px 0",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "15px",
          }}
        >
          <span>
            {product.name_en || product.name_ar}
          </span>

          <button
            onClick={() => deleteProduct(product.id)}
            style={{
              background: "#dc2626",
              color: "white",
              border: "none",
              borderRadius: "6px",
              padding: "7px 12px",
              cursor: "pointer",
            }}
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}