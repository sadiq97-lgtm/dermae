import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const brand = "Tamraya";
const arabicBrand = "تمرايه";
const ease = [0.16, 1, 0.3, 1];

export default function IntroLoader() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let frame;
    let timer;

    const reveal = () => {
      if (!cancelled) frame = requestAnimationFrame(() => setReady(true));
    };

    // Wait for both wordmark fonts before starting the existing animation.
    // A bounded fallback prevents the intro from staying blank on slow networks.
    if (!document.fonts?.load) {
      reveal();
    } else {
      const fontsReady = Promise.all([
        document.fonts.load('400 64px "DM Serif Display"', brand),
        document.fonts.load('700 40px "Aref Ruqaa"', arabicBrand),
      ]);
      const timeout = new Promise((resolve) => {
        timer = window.setTimeout(resolve, 1800);
      });
      Promise.race([fontsReady, timeout]).then(reveal, reveal);
    }

    return () => {
      cancelled = true;
      if (frame) cancelAnimationFrame(frame);
      if (timer) clearTimeout(timer);
    };
  }, []);

  return (
    <motion.div
      className="intro-loader"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.65, ease: "easeInOut" } }}
      style={{ perspective: 1400, overflow: "hidden", visibility: ready ? "visible" : "hidden" }}
    >
      <motion.div
        aria-hidden="true"
        initial={{ opacity: 0, scale: 0.45, rotate: -18 }}
        animate={{ opacity: [0, 0.7, 0.2], scale: [0.45, 1, 1.18], rotate: 0 }}
        transition={{ duration: 2.3, ease: [0.22, 1, 0.36, 1] }}
        style={{ position: "absolute", width: "min(68vw, 620px)", aspectRatio: "1", borderRadius: "50%", border: "1px solid rgba(168,195,160,.24)", boxShadow: "0 0 90px rgba(113,133,107,.18), inset 0 0 90px rgba(113,133,107,.10)" }}
      />
      <motion.div
        aria-hidden="true"
        initial={{ opacity: 0, scale: 0.2 }}
        animate={{ opacity: [0, 0.8, 0], scale: [0.2, 1.15, 1.65] }}
        transition={{ duration: 2.35, ease: [0.22, 1, 0.36, 1] }}
        style={{ position: "absolute", width: "min(52vw, 460px)", aspectRatio: "1", borderRadius: "50%", background: "radial-gradient(circle, rgba(168,195,160,.24) 0%, rgba(113,133,107,.10) 42%, transparent 72%)", filter: "blur(8px)" }}
      />
      <motion.div
        className="intro-loader-content"
        initial={false}
        animate={{ opacity: ready ? 1 : 0, rotateX: 0 }}
        transition={{ duration: 1.25, ease }}
        style={{ position: "relative", zIndex: 2, transformStyle: "preserve-3d", perspective: 1400, width: "min(92vw, 600px)", textAlign: "center", overflow: "visible" }}
      >
        <motion.span
          className="intro-loader-logo"
          aria-label={brand}
          initial={false}
          animate={ready ? "show" : "hidden"}
          variants={{ hidden: {}, show: { transition: { delayChildren: 0.12, staggerChildren: 0.075 } } }}
          style={{ display: "flex", justifyContent: "center", overflow: "visible", transformStyle: "preserve-3d", whiteSpace: "nowrap", fontFamily: '"DM Serif Display", Georgia, serif', fontWeight: 400, letterSpacing: "-0.025em", lineHeight: 1.25 }}
        >
          {Array.from(brand).map((letter, index) => (
            <motion.span
              key={`${letter}-${index}`}
              variants={{
                hidden: { opacity: 0, y: 54, rotateX: 75, filter: "blur(12px)", visibility: "hidden" },
                show: { opacity: 1, visibility: "visible", y: 0, rotateX: 0, filter: "blur(0px)", transition: { duration: 0.8, ease } },
              }}
              style={{ display: "inline-block", marginRight: index === brand.length - 1 ? 0 : "0.01em" }}
            >
              {letter}
            </motion.span>
          ))}
        </motion.span>

        {/* Arabic wordmark enters beneath the English logo using the same elegant reveal language. */}
        <motion.div
          lang="ar"
          dir="rtl"
          aria-label={arabicBrand}
          initial={{ opacity: 0, y: 28, rotateX: 45, filter: "blur(10px)" }}
          animate={ready ? { opacity: 1, y: 0, rotateX: 0, filter: "blur(0px)" } : { opacity: 0 }}
          transition={{ delay: 0.56, duration: 0.9, ease }}
          style={{ fontFamily: '"Aref Ruqaa", "Noto Naskh Arabic", serif', fontWeight: 700, fontSize: "clamp(29px, 8vw, 43px)", lineHeight: 1.65, letterSpacing: 0, color: "#53694d", whiteSpace: "nowrap", marginTop: "2px", marginBottom: "3px", transformOrigin: "center" }}
        >
          {arabicBrand}
        </motion.div>

        <motion.div
          aria-hidden="true"
          initial={{ x: "-135%", opacity: 0 }}
          animate={{ x: "135%", opacity: [0, 0.95, 0] }}
          transition={{ delay: 0.72, duration: 1.05, ease: "easeInOut" }}
          style={{ position: "absolute", top: "20%", left: 0, width: "42%", height: "45%", background: "linear-gradient(100deg, transparent, rgba(168,195,160,.08), rgba(168,195,160,.28), transparent)", filter: "blur(7px)", transform: "skewX(-18deg)", pointerEvents: "none", mixBlendMode: "screen" }}
        />
        <motion.div
          className="intro-loader-line"
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: [0, 1, 0.42], opacity: [0, 1, 0.65] }}
          transition={{ delay: 0.8, duration: 1.15, ease: [0.22, 1, 0.36, 1] }}
          style={{ transformOrigin: "center" }}
        />
        <motion.small
          initial={{ opacity: 0, y: 12, letterSpacing: "0.5em" }}
          animate={{ opacity: 1, y: 0, letterSpacing: "0.28em" }}
          transition={{ delay: 1.05, duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
        >
          CARE THAT SHOWS
        </motion.small>
      </motion.div>
      <motion.div
        aria-hidden="true"
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: [0, 1, 0], opacity: [0, 0.55, 0] }}
        transition={{ delay: 1.35, duration: 0.85, ease: "easeInOut" }}
        style={{ position: "absolute", left: "8%", right: "8%", height: 1, background: "linear-gradient(90deg, transparent, #a8c3a0, transparent)", boxShadow: "0 0 22px rgba(168,195,160,.55)" }}
      />
    </motion.div>
  );
}
