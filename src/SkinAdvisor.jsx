import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Plus, RotateCcw, Sparkles, X } from "lucide-react";
import "./SkinAdvisor.css";

const skinTypes = [
  { value: "oily", en: "Oily", ar: "دهنية", hintEn: "Shine and visible oil through the day", hintAr: "لمعان وزيوت واضحة خلال اليوم" },
  { value: "dry", en: "Dry", ar: "جافة", hintEn: "Tightness, dryness or flaking", hintAr: "شد أو جفاف أو تقشر" },
  { value: "combination", en: "Combination", ar: "مختلطة", hintEn: "Oil in some areas and dryness in others", hintAr: "دهون في مناطق وجفاف في مناطق أخرى" },
  { value: "sensitive", en: "Sensitive", ar: "حساسة", hintEn: "Easily irritated or reactive", hintAr: "سريعة التهيج أو التفاعل" },
];

const concerns = [
  { value: "dehydration", en: "Dehydration", ar: "نقص الترطيب" },
  { value: "blemishes", en: "Blemish-prone", ar: "عرضة للحبوب" },
  { value: "dullness", en: "Dullness", ar: "بهتان" },
  { value: "uneven", en: "Uneven appearance", ar: "مظهر غير متجانس" },
];

const priorities = [
  { value: "simple", en: "Keep it simple", ar: "روتين بسيط" },
  { value: "hydration", en: "More hydration", ar: "ترطيب أكثر" },
  { value: "balance", en: "Balanced daily care", ar: "عناية يومية متوازنة" },
];

function scoreProduct(product, answers) {
  const text = [product.name, product.name_en, product.name_ar, product.description, product.description_en, product.description_ar, product.category, ...(product.ingredients || [])].join(" ").toLowerCase();
  let score = 0;
  const has = (...terms) => terms.some((term) => text.includes(term));

  if (answers.skinType === "dry" || answers.concern === "dehydration" || answers.priority === "hydration") {
    if (has("hydr", "moist", "cream", "ceramide", "hyaluronic", "glycerin", "ترطيب", "مرطب")) score += 6;
  }
  if (answers.skinType === "oily" || answers.skinType === "combination" || answers.concern === "blemishes") {
    if (has("cleanser", "balance", "niacinamide", "serum", "غسول", "توازن", "سيروم")) score += 5;
  }
  if (answers.concern === "dullness" || answers.concern === "uneven") {
    if (has("radiance", "glow", "vitamin", "niacinamide", "إشراقة", "نضارة")) score += 5;
  }
  if (answers.skinType === "sensitive") {
    if (has("gentle", "aloe", "ceramide", "glycerin", "لطيف")) score += 5;
  }
  if (answers.priority === "simple" && has("cleanser", "moist", "serum", "غسول", "مرطب", "سيروم")) score += 2;
  if (product.image) score += 1;
  return score;
}

export default function SkinAdvisor({ open, onClose, products, isArabic, tr, formatIQD, onViewProduct, onAddToCart }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({ skinType: "", concern: "", priority: "" });
  const steps = [skinTypes, concerns, priorities];
  const keys = ["skinType", "concern", "priority"];
  const titles = [
    tr("How does your skin usually feel?", "كيف تكون بشرتك غالباً؟"),
    tr("What would you like to focus on?", "ما الذي تريد التركيز عليه؟"),
    tr("What matters most in your routine?", "ما الأولوية في روتينك؟"),
  ];

  const recommendations = useMemo(() => products
    .map((product) => ({ product, score: scoreProduct(product, answers) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(({ product }) => product), [products, answers]);

  const isResult = step === 3;
  const currentKey = keys[step];
  const canContinue = isResult || Boolean(answers[currentKey]);
  const reset = () => { setStep(0); setAnswers({ skinType: "", concern: "", priority: "" }); };
  const close = () => { onClose(); window.setTimeout(reset, 250); };

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="advisor-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={close}>
          <motion.section className="advisor-panel" initial={{ opacity: 0, y: 40, scale: .96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 35, scale: .97 }} transition={{ type: "spring", stiffness: 220, damping: 24 }} onClick={(event) => event.stopPropagation()} dir={isArabic ? "rtl" : "ltr"}>
            <button className="advisor-close" type="button" onClick={close} aria-label={tr("Close advisor", "إغلاق المستشار")}><X size={20}/></button>
            <div className="advisor-brand"><Sparkles size={17}/><span>DERMAÉ SMART ADVISOR</span></div>
            <div className="advisor-progress" aria-label={tr("Quiz progress", "تقدم الاختبار")}><motion.span animate={{ width: `${Math.min((step + 1) / 4 * 100, 100)}%` }}/></div>

            {!isResult ? (
              <motion.div key={step} className="advisor-question" initial={{ opacity: 0, x: isArabic ? -24 : 24 }} animate={{ opacity: 1, x: 0 }}>
                <span className="advisor-step">0{step + 1} / 03</span>
                <h2>{titles[step]}</h2>
                <p>{tr("Choose the option that feels closest. This is a product-discovery tool, not a medical assessment.", "اختر الخيار الأقرب لك. هذه أداة لاكتشاف المنتجات وليست تقييماً طبياً.")}</p>
                <div className="advisor-options">
                  {steps[step].map((option) => (
                    <button key={option.value} type="button" className={answers[currentKey] === option.value ? "selected" : ""} onClick={() => setAnswers((current) => ({ ...current, [currentKey]: option.value }))}>
                      <strong>{isArabic ? option.ar : option.en}</strong>
                      {(option.hintEn || option.hintAr) && <small>{isArabic ? option.hintAr : option.hintEn}</small>}
                    </button>
                  ))}
                </div>
                <div className="advisor-navigation">
                  <button type="button" className="advisor-back" onClick={() => setStep((value) => Math.max(0, value - 1))} disabled={step === 0}>{isArabic ? <ChevronRight size={17}/> : <ChevronLeft size={17}/>} {tr("Back", "رجوع")}</button>
                  <button type="button" className="advisor-next" onClick={() => setStep((value) => value + 1)} disabled={!canContinue}>{step === 2 ? tr("Build my routine", "ابنِ روتيني") : tr("Continue", "متابعة")} {isArabic ? <ChevronLeft size={17}/> : <ChevronRight size={17}/>}</button>
                </div>
              </motion.div>
            ) : (
              <motion.div className="advisor-results" initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }}>
                <span className="advisor-step">{tr("YOUR DERMAÉ EDIT", "مختارات Dermaé لك")}</span>
                <h2>{tr("A focused routine for you.", "روتين مركز يناسب اختياراتك.")}</h2>
                <p>{tr("These suggestions are based only on your quiz answers and the information available in the product catalogue.", "هذه الاقتراحات مبنية فقط على إجاباتك والمعلومات المتاحة في كتالوج المنتجات.")}</p>
                <div className="advisor-product-grid">
                  {recommendations.map((product, index) => (
                    <article key={product.id} className="advisor-product-card">
                      <button className="advisor-product-media" type="button" onClick={() => onViewProduct(product)}>
                        {product.image ? <img src={product.image} alt={isArabic ? product.name_ar || product.name : product.name_en || product.name}/> : <span>Dermaé</span>}
                        <b>0{index + 1}</b>
                      </button>
                      <div><small>{product.category || "Skincare"}</small><h3>{isArabic ? product.name_ar || product.name : product.name_en || product.name}</h3><strong>{formatIQD(product.price)}</strong></div>
                      <button className="advisor-add" type="button" onClick={() => onAddToCart(product)}><Plus size={16}/>{tr("Add", "إضافة")}</button>
                    </article>
                  ))}
                </div>
                <div className="advisor-disclaimer">{tr("For persistent irritation or skin concerns, consult a qualified healthcare professional.", "عند وجود تهيج مستمر أو مشكلة جلدية، استشر مختصاً صحياً مؤهلاً.")}</div>
                <button className="advisor-restart" type="button" onClick={reset}><RotateCcw size={16}/>{tr("Start again", "إعادة الاختبار")}</button>
              </motion.div>
            )}
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
