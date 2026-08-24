import { useEffect, useMemo, useState } from "react";
import {
  Search, Heart, ShoppingBag, User, Menu, X, Star, ChevronRight,
  Plus, Minus, Trash2, Sparkles, Truck, ShieldCheck, MessageCircle,
  Home, Grid2X2,
} from "lucide-react";
import { motion, MotionConfig, useMotionValue, useSpring, useTransform } from "framer-motion";
import "./App.css";
import "./mobile.css";
import "./premium.css";
import "./featured.css";
import "./community.css";
import "./floating-card.css";
import { supabase } from "./lib/supabase";
import ScrollStory from "./ScrollStory";
import heroVideo from "./assets/hero-video.mp4";
import IntroLoader from "./IntroLoader";

const fallbackProducts = [
  { id:"demo-1", name:"Hydra Glow Serum", name_en:"Hydra Glow Serum", name_ar:"سيروم الإشراقة والترطيب", brand:"Dermaé", category:"Serums", gender:"Women", price:45000, oldPrice:55000, rating:4.9, reviews:128, badge:"BESTSELLER", image:"https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=900&q=85", description:"A lightweight hydrating serum designed to restore moisture and give the skin a natural glow.", description_ar:"سيروم خفيف للترطيب واستعادة نضارة البشرة الطبيعية.", ingredients:["Hyaluronic Acid","Niacinamide","Vitamin B5"] },
  { id:"demo-2", name:"Pure Balance Cleanser", name_en:"Pure Balance Cleanser", name_ar:"غسول التوازن النقي", brand:"Dermaé", category:"Cleansers", gender:"Unisex", price:32000, oldPrice:null, rating:4.8, reviews:94, badge:"NEW", image:"https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=900&q=85", description:"A gentle daily cleanser that removes impurities while respecting the skin barrier.", description_ar:"غسول يومي لطيف يزيل الشوائب ويحافظ على حاجز البشرة.", ingredients:["Amino Acids","Aloe Vera","Glycerin"] },
  { id:"demo-3", name:"Radiance Cream", name_en:"Radiance Cream", name_ar:"كريم الإشراقة", brand:"Dermaé", category:"Moisturizers", gender:"Women", price:52000, oldPrice:62000, rating:4.9, reviews:176, badge:"POPULAR", image:"https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?auto=format&fit=crop&w=900&q=85", description:"A rich moisturizer formulated to support a smooth, refreshed complexion.", description_ar:"مرطب غني يدعم نعومة البشرة ويمنحها مظهراً منتعشاً.", ingredients:["Ceramides","Shea Butter","Vitamin E"] },
];

const categories = ["All","Serums","Cleansers","Moisturizers","Sun Care","Treatments","Skincare"];
const categoryAr = { All:"الكل", Serums:"سيرومات", Cleansers:"منظفات", Moisturizers:"مرطبات", "Sun Care":"عناية شمسية", Treatments:"علاجات", Skincare:"العناية بالبشرة" };
const genderOptions = [{value:"All",en:"All",ar:"الكل"},{value:"Women",en:"Women",ar:"نساء"},{value:"Men",en:"Men",ar:"رجال"}];
const formatIQD = (price) => `${Number(price || 0).toLocaleString("en-US")} IQD`;

const reveal = { hidden:{opacity:0,y:55}, show:{opacity:1,y:0,transition:{duration:.75,ease:[.22,1,.36,1]}} };
const stagger = { hidden:{}, show:{transition:{staggerChildren:.11,delayChildren:.08}} };

function MagneticLink({ href, className, children }) {
  const magneticX = useMotionValue(0);
  const magneticY = useMotionValue(0);
  const x = useSpring(magneticX, { stiffness: 260, damping: 20, mass: 0.35 });
  const y = useSpring(magneticY, { stiffness: 260, damping: 20, mass: 0.35 });

  const handlePointerMove = (event) => {
    if (event.pointerType !== "mouse") return;
    const rect = event.currentTarget.getBoundingClientRect();
    const offsetX = event.clientX - rect.left - rect.width / 2;
    const offsetY = event.clientY - rect.top - rect.height / 2;
    magneticX.set(offsetX * 0.18);
    magneticY.set(offsetY * 0.22);
  };

  const resetPosition = () => {
    magneticX.set(0);
    magneticY.set(0);
  };

  return (
    <motion.a
      href={href}
      className={`${className} magnetic-button`}
      style={{ x, y }}
      onPointerMove={handlePointerMove}
      onPointerLeave={resetPosition}
      onPointerCancel={resetPosition}
      whileHover={{ scale: 1.035 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
    >
      <span className="magnetic-button-content">{children}</span>
    </motion.a>
  );
}

function HeroImage({ product, isArabic, tr, addToCart, setSelectedProduct }) {
  const mx = useMotionValue(0), my = useMotionValue(0);
  const sx = useSpring(mx,{stiffness:90,damping:18}), sy = useSpring(my,{stiffness:90,damping:18});
  const rotateY = useTransform(sx,[-.5,.5],[-5,5]);
  const rotateX = useTransform(sy,[-.5,.5],[5,-5]);
  const x = useTransform(sx,[-.5,.5],[-12,12]);
  const y = useTransform(sy,[-.5,.5],[-12,12]);
  const move = (e) => { const r=e.currentTarget.getBoundingClientRect(); mx.set((e.clientX-r.left)/r.width-.5); my.set((e.clientY-r.top)/r.height-.5); };
  const reset = () => { mx.set(0); my.set(0); };
  return <motion.div className="hero-image" initial={{opacity:0,x:120}} animate={{opacity:1,x:0}} transition={{duration:1.05,ease:[.22,1,.36,1]}} onMouseMove={move} onMouseLeave={reset} style={{perspective:1000}}>
    <motion.div className="hero-image-card" style={{rotateX,rotateY,x,y,transformStyle:"preserve-3d"}} whileHover={{scale:1.025}} transition={{type:"spring",stiffness:180,damping:20}}>
      <video
  className="hero-video"
  autoPlay
  muted
  loop
  playsInline
>
  <source src={heroVideo} type="video/mp4" />
</video>
      {product && (
        <motion.div
          className="hero-floating-card"
          initial={{ opacity: 0, y: 24, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 1.05, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          whileHover={{ y: -7, scale: 1.02 }}
          onClick={() => setSelectedProduct(product)}
          role="button"
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") setSelectedProduct(product);
          }}
        >
          <div className="hero-floating-top">
            <span className="hero-floating-badge">{tr("BEST SELLER", "الأكثر مبيعاً")}</span>
            <span className="hero-floating-rating"><Star size={12} fill="currentColor" /> {product.rating || 5}</span>
          </div>
          <div className="hero-floating-main">
            {product.image && <img src={product.image} alt="" aria-hidden="true" />}
            <div>
              <small>{tr("FEATURED RITUAL", "روتين مختار")}</small>
              <h3>{isArabic ? product.name_ar || product.name : product.name_en || product.name}</h3>
              <strong>{formatIQD(product.price)}</strong>
            </div>
          </div>
          <div className="hero-floating-actions">
            <span>{tr("View details", "عرض التفاصيل")} <ChevronRight size={14} /></span>
            <motion.button
              type="button"
              whileTap={{ scale: 0.88 }}
              onClick={(event) => {
                event.stopPropagation();
                addToCart(product, event.currentTarget.closest(".hero-floating-card"));
              }}
              aria-label={tr("Add featured product to cart", "أضف المنتج المختار إلى السلة")}
            >
              <Plus size={17} />
            </motion.button>
          </div>
        </motion.div>
      )}
    </motion.div>
  </motion.div>;
}

function launchCartFlight(product, sourceElement) {
  if (!sourceElement || typeof window === "undefined") return false;
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return false;

  const mobileTarget = document.querySelector(".mobile-bottom-nav [data-cart-target]");
  const desktopTarget = document.querySelector(".header-actions [data-cart-target]");
  const target = window.matchMedia("(max-width: 768px)").matches ? mobileTarget : desktopTarget;
  if (!target) return false;

  const sourceImage = sourceElement.matches?.("img")
    ? sourceElement
    : sourceElement.querySelector?.("img");
  const sourceRect = (sourceImage || sourceElement).getBoundingClientRect();
  const targetRect = target.getBoundingClientRect();
  if (!sourceRect.width || !targetRect.width) return false;

  const flyer = document.createElement("div");
  flyer.className = "cart-flight-item";
  if (product?.image) {
    const image = document.createElement("img");
    image.src = product.image;
    image.alt = "";
    flyer.appendChild(image);
  } else {
    flyer.textContent = "+1";
  }

  const startSize = Math.min(Math.max(sourceRect.width * 0.28, 46), 82);
  flyer.style.setProperty("--flight-size", `${startSize}px`);
  flyer.style.left = `${sourceRect.left + sourceRect.width / 2 - startSize / 2}px`;
  flyer.style.top = `${sourceRect.top + sourceRect.height / 2 - startSize / 2}px`;
  document.body.appendChild(flyer);

  const deltaX = targetRect.left + targetRect.width / 2 - (sourceRect.left + sourceRect.width / 2);
  const deltaY = targetRect.top + targetRect.height / 2 - (sourceRect.top + sourceRect.height / 2);

  const animation = flyer.animate([
    { transform: "translate3d(0,0,0) scale(1) rotate(0deg)", opacity: 1, offset: 0 },
    { transform: `translate3d(${deltaX * 0.46}px,${Math.min(deltaY * 0.2, -70)}px,0) scale(.86) rotate(-8deg)`, opacity: 1, offset: .42 },
    { transform: `translate3d(${deltaX}px,${deltaY}px,0) scale(.18) rotate(10deg)`, opacity: .18, offset: 1 },
  ], {
    duration: 720,
    easing: "cubic-bezier(.22,1,.36,1)",
    fill: "forwards",
  });

  target.classList.remove("cart-target-pop");
  void target.offsetWidth;
  window.setTimeout(() => target.classList.add("cart-target-pop"), 520);
  animation.finished.finally(() => flyer.remove());
  return true;
}

function App() {
  const [language,setLanguage]=useState("en"), [dbProducts,setDbProducts]=useState([]), [activeCategory,setActiveCategory]=useState("All");
  const [showLoader, setShowLoader] = useState(true);

useEffect(() => {
  const timer = setTimeout(() => {
    setShowLoader(false);
  }, 2500);

  return () => clearTimeout(timer);
}, []);
  const [search,setSearch]=useState(""), [sortBy,setSortBy]=useState("default"), [gender,setGender]=useState("All");
  const [selectedProduct,setSelectedProduct]=useState(null), [mobileMenu,setMobileMenu]=useState(false), [cartOpen,setCartOpen]=useState(false), [checkoutOpen,setCheckoutOpen]=useState(false);
  const [cart,setCart]=useState([]), [wishlist,setWishlist]=useState([]), [placingOrder,setPlacingOrder]=useState(false);
  const [customerName,setCustomerName]=useState(""), [customerPhone,setCustomerPhone]=useState(""), [customerGovernorate,setCustomerGovernorate]=useState(""), [customerAddress,setCustomerAddress]=useState("");
  const [newsletterEmail,setNewsletterEmail]=useState("");
  const isArabic=language==="ar"; const tr=(en,ar)=>isArabic?ar:en;

  useEffect(()=>{ (async()=>{ const {data,error}=await supabase.from("products").select("*").order("id",{ascending:false}); if(error){console.error("Products error:",error);return;} setDbProducts((data||[]).map(item=>({id:`db-${item.id}`,databaseId:item.id,name:item.name_en||item.name_ar||"Unnamed Product",name_en:item.name_en||"",name_ar:item.name_ar||"",description:item.description_en||item.description_ar||"",description_en:item.description_en||"",description_ar:item.description_ar||"",brand:"Dermaé",category:item.category||"Skincare",gender:item.gender||"Unisex",price:Number(item.price_iqd||0),oldPrice:null,rating:5,reviews:0,badge:"NEW",image:item.image_urls?.[0]||"",ingredients:[]}))); })(); },[]);
  useEffect(()=>{document.documentElement.dir=isArabic?"rtl":"ltr";document.documentElement.lang=language;return()=>{document.documentElement.dir="ltr";document.documentElement.lang="en";}},[isArabic,language]);
  useEffect(()=>{document.body.style.overflow=cartOpen||checkoutOpen||selectedProduct||mobileMenu?"hidden":"";return()=>{document.body.style.overflow=""}},[cartOpen,checkoutOpen,selectedProduct,mobileMenu]);

  const allProducts=useMemo(()=>[...dbProducts,...fallbackProducts],[dbProducts]);
  const featuredProducts=useMemo(()=>allProducts.filter(product=>product.image).slice(0,3),[allProducts]);
  const filteredProducts=useMemo(()=>{const q=search.trim().toLowerCase();return allProducts.filter(p=>(activeCategory==="All"||p.category===activeCategory)&&(gender==="All"||p.gender===gender||p.gender==="Unisex")&&(!q||[p.name,p.name_en,p.name_ar,p.category,p.brand].join(" ").toLowerCase().includes(q))).sort((a,b)=>sortBy==="low-high"?a.price-b.price:sortBy==="high-low"?b.price-a.price:0)},[allProducts,activeCategory,gender,search,sortBy]);
  const addToCart=(p,sourceElement=null)=>{
    setCart(c=>{const e=c.find(i=>i.id===p.id);return e?c.map(i=>i.id===p.id?{...i,quantity:i.quantity+1}:i):[...c,{...p,quantity:1}]});
    const animated=launchCartFlight(p,sourceElement);
    window.setTimeout(()=>setCartOpen(true),animated?760:0);
  };
  const updateQuantity=(id,n)=>setCart(a=>a.map(i=>i.id===id?{...i,quantity:i.quantity+n}:i).filter(i=>i.quantity>0));
  const removeFromCart=id=>setCart(a=>a.filter(i=>i.id!==id));
  const toggleWishlist=id=>setWishlist(a=>a.includes(id)?a.filter(i=>i!==id):[...a,id]);
  const cartCount=cart.reduce((s,i)=>s+i.quantity,0), cartSubtotal=cart.reduce((s,i)=>s+i.price*i.quantity,0), delivery=cartSubtotal>=100000?0:5000, orderTotal=cartSubtotal+delivery;
  const placeOrder=async()=>{if(!customerName.trim()||!customerPhone.trim()||!customerGovernorate.trim()||!customerAddress.trim()){alert(tr("Please complete all checkout fields.","يرجى إكمال جميع حقول الطلب."));return}if(!cart.length||placingOrder)return;setPlacingOrder(true);const {error}=await supabase.from("orders").insert([{customer_name:customerName.trim(),customer_phone:customerPhone.trim(),customer_governorate:customerGovernorate.trim(),customer_address:customerAddress.trim(),items:cart,total:orderTotal,status:"Pending"}]);if(error){console.error("Order error:",error);alert(error.message||tr("Order failed","فشل إرسال الطلب"));setPlacingOrder(false);return}alert(tr("Order placed successfully","تم إرسال الطلب بنجاح"));setCart([]);setCustomerName("");setCustomerPhone("");setCustomerGovernorate("");setCustomerAddress("");setCheckoutOpen(false);setCartOpen(false);setPlacingOrder(false)};
  const scrollToShop=()=>document.getElementById("shop")?.scrollIntoView({behavior:"smooth"});
  const subscribeNewsletter=(event)=>{event.preventDefault();const email=newsletterEmail.trim();if(!email||!email.includes("@")){alert(tr("Please enter a valid email address.","يرجى إدخال بريد إلكتروني صحيح."));return;}alert(tr("Thank you for joining Dermaé.","شكراً لانضمامك إلى مجتمع Dermaé."));setNewsletterEmail("");};

  if (showLoader) {
    return <IntroLoader />;
  }

  return <MotionConfig reducedMotion="user"><div className="app" dir={isArabic?"rtl":"ltr"} onPointerMove={(event)=>{if(event.pointerType!=="mouse")return;document.documentElement.style.setProperty("--cursor-x",`${event.clientX}px`);document.documentElement.style.setProperty("--cursor-y",`${event.clientY}px`);}}>
    <motion.div className="cursor-glow" aria-hidden="true" initial={{opacity:0}} animate={{opacity:1}}/>
    <motion.div className="top-bar" initial={{y:-40,opacity:0}} animate={{y:0,opacity:1}} transition={{duration:.6}}><span>{tr("Free delivery on orders over 100,000 IQD","توصيل مجاني للطلبات فوق 100,000 دينار")}</span><span className="top-bar-right"><span className="care-tagline">Care That Shows™</span><button className="language-button" onClick={()=>setLanguage(isArabic?"en":"ar")}>{isArabic?"English":"العربية"}</button><button className="admin-link" onClick={()=>{window.location.href="/admin"}}>Admin</button></span></motion.div>
    <motion.header className="header" initial={{y:-30,opacity:0}} animate={{y:0,opacity:1}} transition={{duration:.65,delay:.15}}><button className="mobile-menu-button" onClick={()=>setMobileMenu(true)} aria-label="Open menu"><Menu size={23}/></button><a className="logo" href="#home"><span className="logo-main">Dermaé</span><span className="logo-sub">CARE THAT SHOWS</span></a><nav className={`nav ${mobileMenu?"nav-open":""}`}><button className="mobile-nav-close" onClick={()=>setMobileMenu(false)}><X/></button>{[["#home","Home","الرئيسية"],["#shop","Shop","المتجر"],["#about","Our Story","قصتنا"],["#contact","Contact","تواصل معنا"]].map(([h,e,a])=><a key={h} href={h} onClick={()=>setMobileMenu(false)}>{tr(e,a)}</a>)}</nav>{mobileMenu&&<button className="mobile-menu-overlay" onClick={()=>setMobileMenu(false)} aria-label="Close menu"/>}<div className="header-actions"><button className="icon-button desktop-only" onClick={()=>document.querySelector(".search-box input")?.focus()}><Search size={20}/></button><button className="icon-button desktop-only"><User size={20}/></button><motion.button whileTap={{scale:.88}} className="icon-button cart-button" data-cart-target onClick={()=>setCartOpen(true)}><ShoppingBag size={21}/>{cartCount>0&&<span className="cart-count">{cartCount}</span>}</motion.button></div></motion.header>

    <main>
      <section className="hero" id="home"><motion.div className="hero-content" variants={stagger} initial="hidden" animate="show"><motion.span variants={reveal} className="eyebrow"><Sparkles size={15}/>{tr("PREMIUM SKINCARE","عناية فائقة بالبشرة")}</motion.span><motion.h1 variants={reveal}>{tr("Care","عناية")}<br/><em>{tr("That Shows.","تظهر نتائجها.")}</em></motion.h1><motion.p variants={reveal}>{tr("Thoughtfully crafted skincare for every kind of skin. Discover a simple ritual designed to make your natural beauty visible.","عناية بالبشرة مصممة بعناية لكل أنواع البشرة. اكتشف روتيناً بسيطاً يساعد على إبراز جمالك الطبيعي.")}</motion.p><motion.div variants={reveal} className="hero-buttons"><MagneticLink href="#shop" className="primary-button">{tr("Shop Collection","تسوق المنتجات")}<ChevronRight size={18}/></MagneticLink><MagneticLink href="#about" className="secondary-button">{tr("Discover Dermaé","اكتشف Dermaé")}<ChevronRight size={18}/></MagneticLink></motion.div><motion.div variants={reveal} className="hero-features"><div><ShieldCheck size={19}/>{tr("Clean formulas","تركيبات نظيفة")}</div><div><Sparkles size={19}/>{tr("Premium care","عناية فاخرة")}</div><div><Truck size={19}/>{tr("Iraq delivery","توصيل داخل العراق")}</div></motion.div></motion.div><HeroImage product={featuredProducts[0]} isArabic={isArabic} tr={tr} addToCart={addToCart} setSelectedProduct={setSelectedProduct}/></section>

      <motion.section className="brand-strip premium-marquee" initial={{opacity:0}} whileInView={{opacity:1}} viewport={{once:true,amount:.5}} transition={{duration:.8}} aria-label={tr("Dermaé values","قيم Dermaé")}>
        <div className="marquee-track">
          {[0,1].map((copy) => (
            <div className="marquee-group" key={copy} aria-hidden={copy === 1}>
              <span>{tr("THOUGHTFUL FORMULAS","تركيبات مدروسة")}</span><b>✦</b>
              <span>{tr("PREMIUM DAILY CARE","عناية يومية فاخرة")}</span><b>✦</b>
              <span>{tr("MADE FOR EVERY RITUAL","مصمم لكل روتين")}</span><b>✦</b>
              <span>{tr("DELIVERY ACROSS IRAQ","توصيل إلى أنحاء العراق")}</span><b>✦</b>
            </div>
          ))}
        </div>
      </motion.section>

      <motion.section className="featured-section" initial="hidden" whileInView="show" viewport={{once:true,amount:.12}} variants={stagger}>
        <motion.div className="featured-heading" variants={reveal}><div><span className="eyebrow">{tr("FEATURED EDIT","مختارات Dermaé")}</span><h2>{tr("The ritual, in focus.","روتينك، بصورة أوضح.")}</h2></div><p>{tr("Three essentials selected to turn everyday care into a considered ritual.","ثلاثة منتجات مختارة لتحوّل العناية اليومية إلى روتين متكامل.")}</p></motion.div>
        <div className="featured-stack">{featuredProducts.map((product,index)=>{const displayName=isArabic?product.name_ar||product.name:product.name_en||product.name;return <motion.article className={`featured-card featured-card-${index+1}`} key={`featured-${product.id}`} variants={reveal} whileHover={{y:-8}} transition={{type:"spring",stiffness:180,damping:22}}><button className="featured-media" onClick={()=>setSelectedProduct(product)} aria-label={tr(`View ${displayName}`,`عرض ${displayName}`)}><motion.img src={product.image} alt={displayName} loading="lazy" whileHover={{scale:1.055}} transition={{duration:.65,ease:[.22,1,.36,1]}}/><span className="featured-number">0{index+1}</span><span className="featured-view">{tr("View product","عرض المنتج")} <ChevronRight size={15}/></span></button><div className="featured-info"><div><span>{isArabic?categoryAr[product.category]||product.category:product.category}</span><h3>{displayName}</h3></div><div className="featured-action"><strong>{formatIQD(product.price)}</strong><motion.button whileTap={{scale:.9}} onClick={(event)=>addToCart(product,event.currentTarget.closest(".featured-card"))} aria-label={tr(`Add ${displayName} to cart`,`أضف ${displayName} إلى السلة`)}><Plus size={18}/></motion.button></div></div></motion.article>})}</div>
        <motion.a variants={reveal} whileHover={{x:isArabic?-6:6}} className="featured-shop-link" href="#shop">{tr("Shop the full collection","تسوّق المجموعة الكاملة")} <ChevronRight size={18}/></motion.a>
      </motion.section>

      <motion.section className="why-section" initial="hidden" whileInView="show" viewport={{once:true,amount:.18}} variants={stagger}>
        <motion.div className="why-heading" variants={reveal}>
          <span className="eyebrow">{tr("WHY DERMAÉ","لماذا Dermaé")}</span>
          <h2>{tr("Skincare, made more intentional.","عناية بالبشرة بتفاصيل أكثر وعناية أكبر.")}</h2>
          <p>{tr("A refined ritual built around clarity, comfort and products that belong together.","روتين أنيق يجمع الوضوح والراحة ومنتجات مصممة لتكمل بعضها.")}</p>
        </motion.div>
        <div className="why-grid">
          {[
            { icon: ShieldCheck, no:"01", en:"Thoughtful selection", ar:"اختيار مدروس", enText:"A focused collection designed to keep your routine simple.", arText:"مجموعة مركزة تجعل روتين العناية أبسط." },
            { icon: Sparkles, no:"02", en:"Premium experience", ar:"تجربة فاخرة", enText:"Considered details from discovery to daily use.", arText:"تفاصيل مدروسة من لحظة الاكتشاف حتى الاستخدام اليومي." },
            { icon: Grid2X2, no:"03", en:"Ritual-first care", ar:"عناية مبنية على الروتين", enText:"Products presented to help you build a coherent ritual.", arText:"منتجات تساعدك على بناء روتين متكامل وواضح." },
            { icon: Truck, no:"04", en:"Iraq delivery", ar:"توصيل داخل العراق", enText:"A local shopping experience with delivery across Iraq.", arText:"تجربة تسوق محلية مع توصيل إلى أنحاء العراق." },
          ].map(({icon:Icon,no,en,ar,enText,arText}) => (
            <motion.article className="why-card" variants={reveal} whileHover={{y:-8}} key={no}>
              <div className="why-card-top"><span>{no}</span><Icon size={24}/></div>
              <h3>{tr(en,ar)}</h3><p>{tr(enText,arText)}</p>
            </motion.article>
          ))}
        </div>
      </motion.section>

      <motion.section className="promise-section" initial="hidden" whileInView="show" viewport={{once:true,amount:.2}} variants={stagger}>
        <motion.div className="promise-visual" variants={{hidden:{opacity:0,scale:.94},show:{opacity:1,scale:1,transition:{duration:1,ease:[.22,1,.36,1]}}}}>
          <motion.img src="https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=1400&q=88" alt="Dermaé skincare ritual" loading="lazy" whileHover={{scale:1.035}} transition={{duration:.7}}/>
          <div className="promise-stamp"><span>DERMAÉ</span><small>{tr("CARE THAT SHOWS","عناية تظهر نتائجها")}</small></div>
        </motion.div>
        <motion.div className="promise-copy" variants={{hidden:{opacity:0,x:isArabic?-70:70},show:{opacity:1,x:0,transition:{duration:.9,ease:[.22,1,.36,1]}}}}>
          <span className="eyebrow">{tr("OUR PROMISE","وعدنا")}</span>
          <h2>{tr("Less noise. More meaningful care.","ضجيج أقل. عناية أكثر معنى.")}</h2>
          <p>{tr("Dermaé brings products, education and an elevated shopping experience into one calm destination. Every detail is designed to help skincare feel easier to understand and more beautiful to use.","تجمع Dermaé المنتجات والمعلومات وتجربة تسوق راقية في وجهة هادئة واحدة. صُممت كل التفاصيل لتجعل العناية بالبشرة أوضح وأسهل وأكثر جمالاً في الاستخدام.")}</p>
          <div className="promise-points"><span>01 <b>{tr("Discover","اكتشف")}</b></span><span>02 <b>{tr("Choose","اختر")}</b></span><span>03 <b>{tr("Build your ritual","ابنِ روتينك")}</b></span></div>
          <motion.a whileHover={{x:isArabic?-6:6}} href="#shop" className="text-link">{tr("Explore the collection","استكشف المجموعة")}<ChevronRight size={17}/></motion.a>
        </motion.div>
      </motion.section>

      <section className="shop-section" id="shop"><motion.div className="section-heading" variants={reveal} initial="hidden" whileInView="show" viewport={{once:true,amount:.25}}><div><span className="eyebrow">{tr("THE COLLECTION","المجموعة")}</span><h2>{tr("Find your ritual.","اكتشف روتينك المثالي")}</h2></div><p>{tr("High-performance essentials designed to work beautifully together.","منتجات أساسية عالية الأداء مصممة لتعمل بتناغم تام.")}</p></motion.div>
        <div className="shop-controls mobile-shop-controls"><div className="search-box"><Search size={18}/><input type="search" placeholder={tr("Search products...","ابحث عن المنتجات...")} value={search} onChange={e=>setSearch(e.target.value)}/></div><select className="sort-select" value={sortBy} onChange={e=>setSortBy(e.target.value)} aria-label="Sort products"><option value="default">{tr("Recommended","مقترحة")}</option><option value="low-high">{tr("Price: Low to High","السعر: من الأقل")}</option><option value="high-low">{tr("Price: High to Low","السعر: من الأعلى")}</option></select><div className="gender-buttons">{genderOptions.map(o=><button key={o.value} className={gender===o.value?"active":""} onClick={()=>setGender(o.value)}>{isArabic?o.ar:o.en}</button>)}</div></div>
        <div className="category-list">{categories.map(c=><motion.button whileTap={{scale:.94}} key={c} className={activeCategory===c?"active":""} onClick={()=>setActiveCategory(c)}>{isArabic?categoryAr[c]||c:c}</motion.button>)}</div><p className="products-count">{tr(`Showing ${filteredProducts.length} products`,`عرض ${filteredProducts.length} منتج`)}</p>
        {filteredProducts.length===0?<div className="empty-products"><h3>{tr("No products found","لا توجد منتجات مطابقة")}</h3><p>{tr("Try another search or category.","جرّب بحثاً أو تصنيفاً آخر.")}</p></div>:<motion.div className="products-grid" variants={stagger} initial="hidden" whileInView="show" viewport={{once:true,amount:.08}}>{filteredProducts.map(product=>{const liked=wishlist.includes(product.id),displayName=isArabic?product.name_ar||product.name:product.name_en||product.name;return <motion.article variants={reveal} whileHover={{y:-10}} transition={{type:"spring",stiffness:220,damping:22}} className="product-card" key={product.id} onClick={()=>setSelectedProduct(product)}><div className="product-image">{product.image?<motion.img whileHover={{scale:1.06}} transition={{duration:.45}} src={product.image} alt={displayName} loading="lazy"/>:<div className="product-image-placeholder">Dermaé</div>}<span className="product-badge">{product.badge}</span><motion.button whileTap={{scale:.78}} className={`wishlist-button ${liked?"liked":""}`} onClick={e=>{e.stopPropagation();toggleWishlist(product.id)}} aria-label="Wishlist"><Heart size={18} fill={liked?"currentColor":"none"}/></motion.button><button className="quick-view" onClick={e=>{e.stopPropagation();setSelectedProduct(product)}}>{tr("Quick View","عرض سريع")}</button></div><div className="product-info"><span className="product-category">{isArabic?categoryAr[product.category]||product.category:product.category}</span><h3>{displayName}</h3><div className="rating"><Star size={14} fill="currentColor"/><span>{product.rating}</span><small>({product.reviews})</small></div><div className="product-bottom"><div className="price"><strong>{formatIQD(product.price)}</strong>{product.oldPrice&&<del>{formatIQD(product.oldPrice)}</del>}</div><motion.button whileHover={{scale:1.06}} whileTap={{scale:.92}} className="add-button" onClick={e=>{e.stopPropagation();addToCart(product,e.currentTarget.closest(".product-card"))}}><Plus size={18}/><span>{tr("Add","إضافة")}</span></motion.button></div></div></motion.article>})}</motion.div>}
      </section>

      <motion.section className="about-section" id="about" initial="hidden" whileInView="show" viewport={{once:true,amount:.2}} variants={stagger}><motion.div variants={{hidden:{opacity:0,x:-70},show:{opacity:1,x:0,transition:{duration:.85}}}} className="about-image"><motion.img whileHover={{scale:1.04}} transition={{duration:.55}} src="https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=1600&q=90" alt="Skincare ritual" loading="lazy"/></motion.div><motion.div variants={{hidden:{opacity:0,x:70},show:{opacity:1,x:0,transition:{duration:.85}}}} className="about-content"><span className="eyebrow">{tr("OUR PHILOSOPHY","فلسفتنا")}</span><h2>{tr("Beautiful skin starts with care.","بشرة جميلة تبدأ مع العناية.")}</h2><p>{tr("Dermaé was created around one simple idea: skincare should feel considered, effective and beautiful.","تم إنشاء Dermaé حول فكرة بسيطة: يجب أن تكون العناية بالبشرة فعالة وجميلة ومصممة بعناية.")}</p><a href="#shop" className="text-link">{tr("Explore our products","استكشف منتجاتنا")}<ChevronRight size={17}/></a></motion.div></motion.section>
    </main>
<ScrollStory tr={tr} />
    <motion.section className="testimonials-section" initial="hidden" whileInView="show" viewport={{once:true,amount:.16}} variants={stagger}>
      <motion.div className="testimonials-heading" variants={reveal}><span className="eyebrow">{tr("COMMUNITY NOTES","آراء المجتمع")}</span><h2>{tr("Care, reflected back.","العناية كما يصفها عملاؤنا.")}</h2><p>{tr("Sample review cards for the design preview. Replace these with verified customer feedback before publishing.","نماذج مراجعات لمعاينة التصميم. استبدلها بآراء موثقة من العملاء قبل النشر.")}</p></motion.div>
      <div className="testimonials-grid">{[{quoteEn:"The routine feels clear, elegant and easy to follow.",quoteAr:"الروتين واضح وأنيق وسهل المتابعة.",name:"Sample 01"},{quoteEn:"A calm shopping experience with thoughtful product details.",quoteAr:"تجربة تسوق هادئة مع تفاصيل مدروسة للمنتجات.",name:"Sample 02"},{quoteEn:"The collection makes daily skincare feel more intentional.",quoteAr:"المجموعة تجعل العناية اليومية أكثر ترتيباً ووضوحاً.",name:"Sample 03"}].map((item,index)=><motion.article className="testimonial-card" variants={reveal} whileHover={{y:-8}} key={item.name}><div className="testimonial-top"><span className="testimonial-stars" aria-label="5 stars">★★★★★</span><span className="sample-label">{tr("SAMPLE","نموذج")}</span></div><blockquote>“{tr(item.quoteEn,item.quoteAr)}”</blockquote><div className="testimonial-person"><span>0{index+1}</span><strong>{item.name}</strong></div></motion.article>)}</div>
    </motion.section>
    <motion.section className="newsletter-section" initial={{opacity:0,y:50}} whileInView={{opacity:1,y:0}} viewport={{once:true,amount:.25}} transition={{duration:.85,ease:[.22,1,.36,1]}}><div className="newsletter-orb" aria-hidden="true"/><div className="newsletter-copy"><span className="eyebrow">{tr("THE DERMAÉ LETTER","رسائل Dermaé")}</span><h2>{tr("Stay close to what’s next.","كن أول من يعرف الجديد.")}</h2><p>{tr("New arrivals, considered rituals and occasional notes from Dermaé.","إصدارات جديدة وروتينات مختارة ورسائل مميزة من Dermaé.")}</p></div><form className="newsletter-form" onSubmit={subscribeNewsletter}><label htmlFor="newsletter-email">{tr("Email address","البريد الإلكتروني")}</label><div><input id="newsletter-email" type="email" autoComplete="email" placeholder="name@example.com" value={newsletterEmail} onChange={event=>setNewsletterEmail(event.target.value)}/><motion.button whileHover={{scale:1.02}} whileTap={{scale:.97}} type="submit">{tr("Join the community","انضم إلى المجتمع")}<ChevronRight size={18}/></motion.button></div><small>{tr("By subscribing, you agree to receive Dermaé updates.","بالاشتراك، أنت توافق على استلام تحديثات Dermaé.")}</small></form></motion.section>
    <footer className="premium-footer" id="contact"><div className="footer-main"><div className="footer-identity"><a className="footer-logo" href="#home">Dermaé</a><p>{tr("Care that shows, in every detail.","عناية تظهر في كل التفاصيل.")}</p><span>{tr("Iraq · Online skincare destination","العراق · وجهة إلكترونية للعناية بالبشرة")}</span></div><div className="footer-column"><h3>{tr("Explore","استكشف")}</h3><a href="#home">{tr("Home","الرئيسية")}</a><a href="#shop">{tr("Shop","المتجر")}</a><a href="#about">{tr("Our story","قصتنا")}</a></div><div className="footer-column"><h3>{tr("Connect","تواصل")}</h3><a href="#contact">Instagram</a><a href="#contact">Facebook</a><a href="#contact">TikTok</a></div><div className="footer-column footer-service"><h3>{tr("Care","الخدمة")}</h3><a href="#shop">{tr("Delivery","التوصيل")}</a><a href="#shop">{tr("Product guide","دليل المنتجات")}</a><a href="https://wa.me/9640000000000" target="_blank" rel="noreferrer">WhatsApp</a></div></div><div className="footer-wordmark" aria-hidden="true">Dermaé</div><div className="footer-bottom"><span>{tr("© 2026 Dermaé. All rights reserved.","© 2026 Dermaé. جميع الحقوق محفوظة.")}</span><a href="#home">{tr("Back to top","العودة للأعلى")} ↑</a></div></footer>
    <motion.a whileHover={{scale:1.1,y:-3}} whileTap={{scale:.92}} className="whatsapp-button" href="https://wa.me/9640000000000" target="_blank" rel="noreferrer" aria-label="WhatsApp"><MessageCircle size={24}/></motion.a>

    {selectedProduct&&<motion.div className="modal-overlay" onClick={()=>setSelectedProduct(null)} initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}><motion.div className="product-modal mobile-product-modal" onClick={e=>e.stopPropagation()} initial={{opacity:0,y:35,scale:.96}} animate={{opacity:1,y:0,scale:1}}><button className="modal-close" onClick={()=>setSelectedProduct(null)}><X size={22}/></button><div className="modal-image">{selectedProduct.image?<img src={selectedProduct.image} alt={selectedProduct.name}/>:<div className="product-image-placeholder">Dermaé</div>}</div><div className="modal-content"><span className="product-category">{selectedProduct.category}</span><h2>{isArabic?selectedProduct.name_ar||selectedProduct.name:selectedProduct.name_en||selectedProduct.name}</h2><div className="rating"><Star size={15} fill="currentColor"/><span>{selectedProduct.rating}</span><small>({selectedProduct.reviews})</small></div><div className="modal-price">{formatIQD(selectedProduct.price)}</div><p>{isArabic?selectedProduct.description_ar||selectedProduct.description:selectedProduct.description_en||selectedProduct.description}</p>{selectedProduct.ingredients?.length>0&&<div className="ingredients"><h4>{tr("Key ingredients","المكونات الأساسية")}</h4><div>{selectedProduct.ingredients.map(i=><span key={i}>{i}</span>)}</div></div>}<button className="modal-add" onClick={(event)=>{addToCart(selectedProduct,event.currentTarget.closest(".product-modal"));setSelectedProduct(null)}}>{tr("Add to Shopping Bag","أضف إلى سلة التسوق")}</button></div></motion.div></motion.div>}

    {cartOpen&&<motion.div className="cart-overlay" onClick={()=>setCartOpen(false)} initial={{opacity:0}} animate={{opacity:1}}><motion.aside className="cart-drawer" onClick={e=>e.stopPropagation()} initial={{x:isArabic?"-100%":"100%"}} animate={{x:0}} transition={{type:"spring",stiffness:260,damping:30}}><div className="cart-header"><div><span className="eyebrow">{tr("YOUR BAG","سلتك")}</span><h2>{tr("Shopping Bag","سلة التسوق")}</h2></div><button onClick={()=>setCartOpen(false)}><X size={22}/></button></div>{cart.length===0?<div className="empty-cart"><ShoppingBag size={42}/><h3>{tr("Your bag is empty","سلتك فارغة")}</h3><button onClick={()=>setCartOpen(false)} className="primary-button">{tr("Continue Shopping","متابعة التسوق")}</button></div>:<><div className="cart-items">{cart.map(item=><div className="cart-item" key={item.id}>{item.image?<img src={item.image} alt={item.name}/>:<div className="cart-thumb-placeholder">Dermaé</div>}<div className="cart-item-info"><h4>{isArabic?item.name_ar||item.name:item.name_en||item.name}</h4><span>{formatIQD(item.price)}</span><div className="quantity"><button onClick={()=>updateQuantity(item.id,-1)}><Minus size={14}/></button><span>{item.quantity}</span><button onClick={()=>updateQuantity(item.id,1)}><Plus size={14}/></button></div></div><button className="remove-item" onClick={()=>removeFromCart(item.id)}><Trash2 size={17}/></button></div>)}</div><div className="cart-summary"><div><span>{tr("Subtotal","المجموع الفرعي")}</span><strong>{formatIQD(cartSubtotal)}</strong></div><div><span>{tr("Delivery","التوصيل")}</span><strong>{delivery===0?tr("FREE","مجاني"):formatIQD(delivery)}</strong></div><div className="cart-total"><span>{tr("Total","المجموع")}</span><strong>{formatIQD(orderTotal)}</strong></div><button className="checkout-button" onClick={()=>{setCartOpen(false);setCheckoutOpen(true)}}>{tr("Proceed to Checkout","إكمال الطلب")}<ChevronRight size={18}/></button></div></>}</motion.aside></motion.div>}

    {checkoutOpen&&<motion.div className="modal-overlay" onClick={()=>setCheckoutOpen(false)} initial={{opacity:0}} animate={{opacity:1}}><motion.div className="checkout-modal" onClick={e=>e.stopPropagation()} initial={{opacity:0,y:35,scale:.96}} animate={{opacity:1,y:0,scale:1}}><button className="modal-close" onClick={()=>setCheckoutOpen(false)}><X size={22}/></button><h2>{tr("Checkout","إكمال الطلب")}</h2><input type="text" placeholder={tr("Full Name","الاسم الكامل")} value={customerName} onChange={e=>setCustomerName(e.target.value)}/><input type="tel" inputMode="tel" placeholder={tr("Phone Number","رقم الهاتف")} value={customerPhone} onChange={e=>setCustomerPhone(e.target.value)}/><input type="text" placeholder={tr("Governorate","المحافظة")} value={customerGovernorate} onChange={e=>setCustomerGovernorate(e.target.value)}/><textarea placeholder={tr("Full Address","العنوان الكامل")} value={customerAddress} onChange={e=>setCustomerAddress(e.target.value)}/><div className="checkout-summary"><span>{tr("Items","القطع")}: {cartCount}</span><strong>{formatIQD(orderTotal)}</strong></div><button className="checkout-button" disabled={placingOrder} onClick={placeOrder}>{placingOrder?tr("Sending...","جار الإرسال..."):tr("Place Order","إرسال الطلب")}</button></motion.div></motion.div>}

    <nav className="mobile-bottom-nav" aria-label="Mobile navigation"><a href="#home"><Home size={21}/><span>{tr("Home","الرئيسية")}</span></a><button onClick={scrollToShop}><Grid2X2 size={21}/><span>{tr("Shop","المتجر")}</span></button><button onClick={scrollToShop}><Heart size={21}/><span>{tr("Wishlist","المفضلة")}</span>{wishlist.length>0&&<b>{wishlist.length}</b>}</button><button onClick={()=>setCartOpen(true)}><ShoppingBag size={21}/><span>{tr("Cart","السلة")}</span>{cartCount>0&&<b>{cartCount}</b>}</button></nav>
  </div></MotionConfig>;
}

export default App;
