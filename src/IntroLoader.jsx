import { motion } from "framer-motion";

const brand = "Dermaé";

export default function IntroLoader() {
  return (
    <motion.div
      className="intro-loader"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.65, ease: "easeInOut" } }}
      style={{ perspective: 1400, overflow: "hidden" }}
    >
      <motion.div
        aria-hidden="true"
        initial={{ opacity: 0, scale: 0.45, rotate: -18 }}
        animate={{ opacity: [0, 0.7, 0.2], scale: [0.45, 1, 1.18], rotate: 0 }}
        transition={{ duration: 2.3, ease: [0.22, 1, 0.36, 1] }}
        style={{
          position: "absolute",
          width: "min(68vw, 620px)",
          aspectRatio: "1",
          borderRadius: "50%",
          border: "1px solid rgba(196, 139, 255, 0.24)",
          boxShadow:
            "0 0 90px rgba(139, 92, 246, 0.14), inset 0 0 90px rgba(139, 92, 246, 0.08)",
        }}
      />

      <motion.div
        aria-hidden="true"
        initial={{ opacity: 0, scale: 0.2 }}
        animate={{ opacity: [0, 0.8, 0], scale: [0.2, 1.15, 1.65] }}
        transition={{ duration: 2.35, ease: [0.22, 1, 0.36, 1] }}
        style={{
          position: "absolute",
          width: "min(52vw, 460px)",
          aspectRatio: "1",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(168,85,247,.24) 0%, rgba(109,40,217,.08) 42%, transparent 72%)",
          filter: "blur(8px)",
        }}
      />

      <motion.div
        className="intro-loader-content"
        initial={{ opacity: 0, rotateX: 25, }}
        animate={{ opacity: 1, rotateX: 0, z: 0, scale: 1 }}
        transition={{ duration: 1.25, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: "relative",
          zIndex: 2,
          transformStyle: "preserve-3d",
          perspective: 1400,
        }}
      >
        <motion.span
          className="intro-loader-logo"
          aria-label={brand}
          initial="hidden"
          animate="show"
          variants={{
            hidden: {},
            show: { transition: { delayChildren: 0.12, staggerChildren: 0.075 } },
          }}
          style={{
            display: "flex",
            justifyContent: "center",
            overflow: "visible",
            transformStyle: "preserve-3d",
          }}
        >
          {Array.from(brand).map((letter, index) => (
            <motion.span
              key={`${letter}-${index}`}
              variants={{
                hidden: { opacity: 0, y: 54, rotateX: 75, filter: "blur(12px)" },
                show: {
                  opacity: 1,
                  y: 0,
                  rotateX: 0,
                  filter: "blur(0px)",
                  transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
                },
              }}
              style={{ display: "inline-block", marginRight: index === brand.length - 1 ? 0 : "0.01em" }}
            >
              {letter}
            </motion.span>
          ))}
        </motion.span>

        <motion.div
          aria-hidden="true"
          initial={{ x: "-135%", opacity: 0 }}
          animate={{ x: "135%", opacity: [0, 0.95, 0] }}
          transition={{ delay: 0.72, duration: 1.05, ease: "easeInOut" }}
          style={{
            position: "absolute",
            top: "20%",
            left: 0,
            width: "42%",
            height: "45%",
            background:
              "linear-gradient(100deg, transparent, rgba(255,255,255,.8), rgba(202,156,255,.55), transparent)",
            filter: "blur(7px)",
            transform: "skewX(-18deg)",
            pointerEvents: "none",
            mixBlendMode: "screen",
          }}
        />

        <motion.div
          className="intro-loader-line"
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: [0, 1, 0.42], opacity: [0, 1, 0.65] }}
          transition={{ delay: 0.55, duration: 1.35, ease: [0.22, 1, 0.36, 1] }}
          style={{ transformOrigin: "center" }}
        />

        <motion.small
          initial={{ opacity: 0, y: 12, letterSpacing: "0.5em" }}
          animate={{ opacity: 1, y: 0, letterSpacing: "0.28em" }}
          transition={{ delay: 0.95, duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
        >
          CARE THAT SHOWS
        </motion.small>
      </motion.div>

      <motion.div
        aria-hidden="true"
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: [0, 1, 0], opacity: [0, 0.55, 0] }}
        transition={{ delay: 1.35, duration: 0.85, ease: "easeInOut" }}
        style={{
          position: "absolute",
          left: "8%",
          right: "8%",
          height: 1,
          background: "linear-gradient(90deg, transparent, #c084fc, transparent)",
          boxShadow: "0 0 22px rgba(192,132,252,.9)",
        }}
      />
    </motion.div>
  );
}
