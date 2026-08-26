import "@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    });
  }

  try {
    const order = await req.json();

    const botToken = Deno.env.get("TELEGRAM_BOT_TOKEN");
    const chatId = Deno.env.get("TELEGRAM_CHAT_ID");

    if (!botToken || !chatId) {
      throw new Error("Telegram secrets are missing");
    }

    const items = Array.isArray(order.items)
      ? order.items
          .map(
            (item: {
              name?: string;
              name_en?: string;
              name_ar?: string;
              quantity?: number;
              price?: number;
            }) => {
              const productName =
                item.name_ar ||
                item.name_en ||
                item.name ||
                "Product";

              return `• ${productName} × ${item.quantity || 1}`;
            }
          )
          .join("\n")
      : "No item details";

    const total = Number(order.total || 0).toLocaleString("en-US");

    const message = `
🛍️ طلب جديد من Dermaé

👤 الاسم: ${order.customer_name || "-"}
📞 الهاتف: ${order.customer_phone || "-"}
📍 المحافظة: ${order.customer_governorate || "-"}
🏠 العنوان: ${order.customer_address || "-"}

📦 المنتجات:
${items}

💰 المجموع: ${total} IQD
✅ الحالة: ${order.status || "Pending"}
`;

    const telegramResponse = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
        }),
      }
    );

    const telegramResult = await telegramResponse.json();

    if (!telegramResponse.ok || !telegramResult.ok) {
      throw new Error(
        telegramResult.description || "Telegram notification failed"
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error";

    console.error("Telegram notification error:", message);

    return new Response(
      JSON.stringify({
        success: false,
        error: message,
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
