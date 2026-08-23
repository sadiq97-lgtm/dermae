import { useRef } from "react";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import "./story.css";

function StoryStep({ step, index, progress, tr }) {
  const start = index / 3;
  const center = start + 0.16;
  const end = Math.min(1, start + 0.46);
  const opacity = useTransform(progress, [Math.max(0, start - 0.08), center, end], [0.28, 1, 0.28]);
  const x = useTransform(progress, [Math.max(0, start - 0.08), center, end], [20, 0, -10]);
  const scale = useTransform(progress, [Math.max(0, start - 0.08), center, end], [0.98, 1, 0.98]);

  return (
    <motion.article className="story-step" style={{ opacity, x, scale }}>
      <span>{step.no}</span>
      <div>
        <h3>{tr(step.en, step.ar)}</h3>
        <p>{tr(step.enText, step.arText)}</p>
      </div>
    </motion.article>
  );
}

export default function ScrollStory({ tr }) {
  const storyRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: storyRef,
    offset: ["start start", "end end"],
  });
  const progressScale = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 24,
    mass: 0.35,
  });
  const imageY = useTransform(scrollYProgress, [0, 1], ["0%", "-10%"]);
  const imageScale = useTransform(scrollYProgress, [0, 1], [1.08, 1]);

  const steps = [
    {
      no: "01",
      en: "Discover",
      ar: "اكتشف",
      enText: "Begin with a focused view of products made for a clear daily ritual.",
      arText: "ابدأ بمجموعة مركزة من المنتجات لروتين يومي واضح.",
    },
    {
      no: "02",
      en: "Choose",
      ar: "اختر",
      enText: "Compare essentials with the details needed to make a confident choice.",
      arText: "قارن بين المنتجات الأساسية مع التفاصيل التي تساعدك على الاختيار.",
    },
    {
      no: "03",
      en: "Build your ritual",
      ar: "ابنِ روتينك",
      enText: "Bring the right products together in an experience designed to feel effortless.",
      arText: "اجمع المنتجات المناسبة ضمن تجربة مصممة لتكون سهلة ومتكاملة.",
    },
  ];

  return (
    <section className="scroll-story" ref={storyRef}>
      <div className="story-sticky">
        <div className="story-visual">
          <motion.img
            style={{ y: imageY, scale: imageScale }}
            src="https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=1600&q=88"
            alt="Dermaé skincare collection"
            loading="lazy"
          />
          <div className="story-image-overlay" />
          <div className="story-vertical-label">DERMAÉ · CARE THAT SHOWS</div>
        </div>

        <div className="story-copy">
          <span className="eyebrow">{tr("THE DERMAÉ RITUAL", "روتين Dermaé")}</span>
          <h2>{tr("From discovery to daily care.", "من الاكتشاف إلى العناية اليومية.")}</h2>
          <div className="story-progress" aria-hidden="true">
            <motion.span style={{ scaleY: progressScale }} />
          </div>
          <div className="story-steps">
            {steps.map((step, index) => (
              <StoryStep key={step.no} step={step} index={index} progress={scrollYProgress} tr={tr} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
