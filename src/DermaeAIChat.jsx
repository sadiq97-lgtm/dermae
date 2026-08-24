import { useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bot, ChevronRight, LoaderCircle, Plus, Send, Sparkles, X } from "lucide-react";
import "./DermaeAIChat.css";

const starterMessages = (tr) => [
  { role: "assistant", content: tr("Hi, I’m Dermaé AI. Ask me about the products in this store or tell me what kind of routine you are looking for. I can guide product discovery, but I cannot diagnose or treat skin conditions.", "مرحباً، أنا Dermaé AI. اسألني عن منتجات المتجر أو أخبرني بنوع الروتين الذي تبحث عنه. أساعدك في اكتشاف المنتجات، لكن لا أقدم تشخيصاً أو علاجاً طبياً.") },
];

export default function DermaeAIChat({ open, onClose, products, isArabic, tr, formatIQD, onViewProduct, onAddToCart }) {
  const [messages, setMessages] = useState(() => starterMessages(tr));
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);
  const productMap = useMemo(() => new Map(products.map((product) => [String(product.id), product])), [products]);

  const productContext = useMemo(() => products.slice(0, 30).map((product) => ({
    id: String(product.id),
    name: product.name_en || product.name || "",
    name_ar: product.name_ar || "",
    category: product.category || "Skincare",
    price_iqd: Number(product.price || 0),
    description: product.description_en || product.description || "",
    description_ar: product.description_ar || "",
    ingredients: product.ingredients || [],
  })), [products]);

  const scrollDown = () => window.setTimeout(() => scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" }), 60);

  const sendMessage = async (event) => {
    event?.preventDefault();
    const text = input.trim();
    if (!text || loading) return;
    const userMessage = { role: "user", content: text.slice(0, 700) };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);
    scrollDown();

    try {
      const response = await fetch("/api/dermae-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          language: isArabic ? "ar" : "en",
          messages: nextMessages.slice(-8).map(({ role, content }) => ({ role, content })),
          products: productContext,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || "AI request failed");
      setMessages((current) => [...current, {
        role: "assistant",
        content: data.reply,
        productIds: Array.isArray(data.productIds) ? data.productIds : [],
      }]);
    } catch (error) {
      setMessages((current) => [...current, { role: "assistant", content: tr("I couldn’t connect to Dermaé AI. Please try again, or use the Skin Advisor quiz for an instant recommendation.", "تعذر الاتصال بـ Dermaé AI. حاول مرة أخرى، أو استخدم اختبار مستشار البشرة للحصول على اقتراح فوري.") }]);
      console.error("Dermaé AI error:", error);
    } finally {
      setLoading(false);
      scrollDown();
    }
  };

  const suggestions = [
    tr("Build a simple hydration routine", "ابنِ لي روتين ترطيب بسيط"),
    tr("Which cleanser is best for daily use?", "أي غسول مناسب للاستخدام اليومي؟"),
    tr("Compare the featured products", "قارن بين المنتجات المختارة"),
  ];

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="ai-chat-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
          <motion.section className="ai-chat-panel" initial={{ opacity: 0, y: 45, scale: .96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 35, scale: .97 }} transition={{ type: "spring", stiffness: 230, damping: 25 }} onClick={(event) => event.stopPropagation()} dir={isArabic ? "rtl" : "ltr"}>
            <header className="ai-chat-header">
              <div className="ai-chat-avatar"><Bot size={21}/><span/></div>
              <div><strong>Dermaé AI</strong><small>{tr("Product guidance · Online", "إرشاد المنتجات · متصل")}</small></div>
              <button type="button" onClick={onClose} aria-label={tr("Close AI chat", "إغلاق المحادثة")}><X size={20}/></button>
            </header>

            <div className="ai-chat-notice"><Sparkles size={14}/>{tr("Product discovery only. Not medical advice.", "لاكتشاف المنتجات فقط، وليس نصيحة طبية.")}</div>

            <div className="ai-chat-messages" ref={scrollRef}>
              {messages.map((message, index) => (
                <motion.div key={`${message.role}-${index}`} className={`ai-message ai-message-${message.role}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <p>{message.content}</p>
                  {message.productIds?.length > 0 && <div className="ai-recommended-products">{message.productIds.map((id) => {
                    const product = productMap.get(String(id));
                    if (!product) return null;
                    const name = isArabic ? product.name_ar || product.name : product.name_en || product.name;
                    return <article key={id}><button className="ai-product-main" type="button" onClick={() => onViewProduct(product)}>{product.image ? <img src={product.image} alt={name}/> : <span>Dermaé</span>}<div><small>{product.category}</small><strong>{name}</strong><b>{formatIQD(product.price)}</b></div><ChevronRight size={16}/></button><button className="ai-product-add" type="button" onClick={() => onAddToCart(product)}><Plus size={15}/></button></article>;
                  })}</div>}
                </motion.div>
              ))}
              {loading && <div className="ai-thinking"><LoaderCircle size={17}/><span>{tr("Dermaé AI is thinking", "Dermaé AI يفكر")}</span></div>}
            </div>

            {messages.length < 3 && <div className="ai-suggestions">{suggestions.map((suggestion) => <button type="button" key={suggestion} onClick={() => setInput(suggestion)}>{suggestion}</button>)}</div>}

            <form className="ai-chat-form" onSubmit={sendMessage}>
              <textarea value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); sendMessage(event); } }} maxLength={700} placeholder={tr("Ask about a product or routine...", "اسأل عن منتج أو روتين...")} rows="1"/>
              <button type="submit" disabled={!input.trim() || loading} aria-label={tr("Send message", "إرسال الرسالة")}><Send size={18}/></button>
            </form>
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
