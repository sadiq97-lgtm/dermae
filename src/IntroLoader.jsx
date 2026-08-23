import { motion } from "framer-motion";

export default function IntroLoader() {
  return (
    <motion.div
      className="intro-loader"
      initial={{ opacity: 1 }}
      exit={{
        opacity: 0,
        transition: { duration: 0.7 },
      }}
    >
      <motion.div
        className="intro-loader-content"
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.8,
          ease: [0.22, 1, 0.36, 1],
        }}
      >
        <motion.span
          className="intro-loader-logo"
          initial={{
            opacity: 0,
            letterSpacing: "0.15em",
          }}
          animate={{
            opacity: 1,
            letterSpacing: "-0.05em",
          }}
          transition={{ duration: 1 }}
        >
          Dermaé
        </motion.span>

        <motion.div
          className="intro-loader-line"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{
            delay: 0.3,
            duration: 0.9,
            ease: [0.22, 1, 0.36, 1],
          }}
        />

        <motion.small
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          CARE THAT SHOWS
        </motion.small>
      </motion.div>
    </motion.div>
  );
}