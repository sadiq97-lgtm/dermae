import { useEffect, useMemo, useState } from "react";
import { Sparkles } from "lucide-react";
import { supabase } from "./lib/supabase";
import DermaeAIChat from "./DermaeAIChat";

const fallbackProducts = [
  { id:"demo-1", name:"Hydra Glow Serum", name_en:"Hydra Glow Serum", name_ar:"سيروم الإشراقة والترطيب", category:"Serums", price:45000, image:"https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=900&q=85", description:"A lightweight hydrating serum designed to restore moisture and give the skin a natural glow.", description_ar:"سيروم خفيف للترطيب واستعادة نضارة البشرة الطبيعية.", ingredients:["Hyaluronic Acid","Niacinamide","Vitamin B5"] },
  { id:"demo-2", name:"Pure Balance Cleanser", name_en:"Pure Balance Cleanser", name_ar:"غسول التوازن النقي", category:"Cleansers", price:32000, image:"https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=900&q=85", description:"A gentle daily cleanser that removes impurities while respecting the skin barrier.", description_ar:"غسول يومي لطيف يزيل الشوائب ويحافظ على حاجز البشرة.", ingredients:["Amino Acids","Aloe Vera","Glycerin"] },
  { id:"demo-3", name:"Radiance Cream", name_en:"Radiance Cream", name_ar:"كريم الإشراقة", category:"Moisturizers", price:52000, image:"https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?auto=format&fit=crop&w=900&q=85", description:"A rich moisturizer formulated to support a smooth, refreshed complexion.", description_ar:"مرطب غني يدعم نعومة البشرة ويمنحها مظهراً منتعشاً.", ingredients:["Ceramides","Shea Butter","Vitamin E"] },
];

export default function DermaeAIWidget() {
  const [open,setOpen]=useState(false);
  const [language,setLanguage]=useState(document.documentElement.lang === "ar" ? "ar" : "en");
  const [dbProducts,setDbProducts]=useState([]);
  const isAdmin=window.location.pathname.startsWith("/admin");

  useEffect(()=>{
    if(isAdmin) return;
    const observer=new MutationObserver(()=>setLanguage(document.documentElement.lang === "ar" ? "ar" : "en"));
    observer.observe(document.documentElement,{attributes:true,attributeFilter:["lang"]});
    (async()=>{const {data,error}=await supabase.from("products").select("*").order("id",{ascending:false});if(!error)setDbProducts((data||[]).map(item=>({id:`db-${item.id}`,name:item.name_en||item.name_ar||"Product",name_en:item.name_en||"",name_ar:item.name_ar||"",description:item.description_en||item.description_ar||"",description_en:item.description_en||"",description_ar:item.description_ar||"",category:item.category||"Skincare",price:Number(item.price_iqd||0),image:item.image_urls?.[0]||"",ingredients:[]})));})();
    return()=>observer.disconnect();
  },[isAdmin]);

  const products=useMemo(()=>[...dbProducts,...fallbackProducts],[dbProducts]);
  const isArabic=language==="ar";
  const tr=(en,ar)=>isArabic?ar:en;
  const formatIQD=(price)=>`${Number(price||0).toLocaleString("en-US")} IQD`;
  if(isAdmin) return null;

  return <>
    <button className="dermae-ai-launch" type="button" onClick={()=>setOpen(true)} aria-label={tr("Open Dermaé AI assistant","افتح مساعد Dermaé الذكي")}><Sparkles size={19}/><span>{tr("Ask Dermaé AI","اسأل Dermaé AI")}</span></button>
    <DermaeAIChat open={open} onClose={()=>setOpen(false)} products={products} isArabic={isArabic} tr={tr} formatIQD={formatIQD} onViewProduct={(product)=>{setOpen(false);window.location.href=`/product/${encodeURIComponent(product.id)}`;}} onAddToCart={()=>{setOpen(false);document.getElementById("shop")?.scrollIntoView({behavior:"smooth"});}} />
  </>;
}
