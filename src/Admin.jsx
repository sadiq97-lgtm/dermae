import { supabase } from "./lib/supabase";
import { useEffect, useState } from "react";

export default function Admin() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    loadProducts();
    loadOrders();
  }, []);

  const loadProducts = async () => {
    const { data } = await supabase
      .from("products")
      .select("*");

    setProducts(data || []);
  };

  const loadOrders = async () => {
    const { data } = await supabase
      .from("orders")
      .select("*");

    setOrders(data || []);
  };

  return (
    <div style={{ padding: "40px" }}>
      <h1>Admin Dashboard</h1>

      <div
        style={{
          display: "flex",
          gap: "30px",
          marginBottom: "30px",
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
                (sum, order) => sum + (Number(order.total) || 0),
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
          }}
        >
          {product.name_en || product.name_ar}
        </div>
      ))}
    </div>
  );
}