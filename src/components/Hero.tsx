import React, { useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { Button } from './ui';

interface HeroProps {
  onStartReview: () => void;
}

const Hero: React.FC<HeroProps> = ({ onStartReview }) => {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });

  const isInView = useInView(heroRef, { once: true, amount: 0.3 });

  // Parallax effects
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.8]);

  // Typing animation for subtitle
  const subtitle = "Engineering Excellence Through Real-World Learning";
  const [displayedSubtitle, setDisplayedSubtitle] = React.useState("");
  const [currentIndex, setCurrentIndex] = React.useState(0);

  useEffect(() => {
    if (!isInView) return;

    const timer = setTimeout(() => {
      if (currentIndex < subtitle.length) {
        setDisplayedSubtitle(subtitle.slice(0, currentIndex + 1));
        setCurrentIndex(currentIndex + 1);
      }
    }, 50);

    return () => clearTimeout(timer);
  }, [currentIndex, isInView, subtitle]);

  // Floating elements animation
  const floatingVariants = {
    animate: {
      y: [0, -20, 0],
      rotate: [0, 5, -5, 0],
      transition: {
        duration: 6,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  return (
    <motion.section 
      ref={heroRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{ y, opacity, scale }}
    >
      {/* Floating Mathematical Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          className="absolute top-20 left-10 text-accent-blue/30 text-4xl font-accent"
          variants={floatingVariants}
          animate="animate"
          style={{ animationDelay: '0s' }}
        >
          ∫
        </motion.div>
        <motion.div
          className="absolute top-32 right-20 text-accent-green/30 text-3xl font-accent"
          variants={floatingVariants}
          animate="animate"
          style={{ animationDelay: '2s' }}
        >
          Σ
        </motion.div>
        <motion.div
          className="absolute bottom-40 left-1/4 text-accent-orange/30 text-5xl font-accent"
          variants={floatingVariants}
          animate="animate"
          style={{ animationDelay: '4s' }}
        >
          π
        </motion.div>
        <motion.div
          className="absolute top-1/2 right-10 text-accent-blue/20 text-2xl font-accent"
          variants={floatingVariants}
          animate="animate"
          style={{ animationDelay: '1s' }}
        >
          E=mc²
        </motion.div>
      </div>

      <div className="container mx-auto px-4 text-center relative z-10">
        {/* Main Title */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-8"
        >
          <motion.h1 
            className="text-6xl md:text-8xl lg:text-9xl lewish-text text-accent-blue mb-6 relative"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <motion.span
              className="inline-block"
              animate={{
                textShadow: [
                  "0 0 10px #00d4ff",
                  "0 0 20px #00d4ff, 0 0 30px #00d4ff",
                  "0 0 10px #00d4ff"
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              VIKRAM
            </motion.span>
            
            {/* Animated underline */}
            <motion.div
              className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 h-1 bg-gradient-to-r from-accent-blue via-accent-green to-accent-orange"
              initial={{ width: 0 }}
              animate={isInView ? { width: "80%" } : { width: 0 }}
              transition={{ duration: 1.5, delay: 1 }}
            />
          </motion.h1>

          {/* Animated Subtitle */}
          <motion.h2 
            className="text-2xl md:text-4xl font-accent text-white mb-6 min-h-[3rem]"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            {displayedSubtitle}
            <motion.span
              className="inline-block w-1 h-8 bg-accent-green ml-1"
              animate={{ opacity: [1, 0, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
          </motion.h2>
        </motion.div>

        {/* Description */}
        <motion.p 
          className="text-lg md:text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, delay: 1.2 }}
        >
          Your feedback shapes the future of engineering education. Help me understand how I can better connect 
          theoretical concepts with real-world applications and prepare you for tomorrow's challenges.
        </motion.p>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.8, delay: 1.6 }}
          className="flex flex-col sm:flex-row gap-6 justify-center items-center"
        >
          <Button 
            variant="primary" 
            size="lg"
            onClick={onStartReview}
            className="text-xl px-12 py-4 lewish-text relative overflow-hidden group"
          >
            <motion.span
              className="relative z-10"
              whileHover={{ scale: 1.05 }}
            >
              START REVIEW ✨
            </motion.span>
            
            {/* Button glow effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-accent-blue to-accent-green opacity-0 group-hover:opacity-20"
              animate={{
                x: ["-100%", "100%"],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "linear"
              }}
            />
          </Button>

          <motion.div
            className="flex items-center text-gray-400 text-sm"
            whileHover={{ scale: 1.05, color: "#00d4ff" }}
          >
            <span className="mr-2">⚡</span>
            Takes only 3-5 minutes
          </motion.div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          initial={{ opacity: 0, y: -20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }}
          transition={{ duration: 0.8, delay: 2 }}
        >
          <motion.div
            className="flex flex-col items-center text-gray-400 cursor-pointer"
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            onClick={() => {
              window.scrollTo({ 
                top: window.innerHeight, 
                behavior: 'smooth' 
              });
            }}
          >
            <span className="text-sm mb-2 lewish-text">SCROLL</span>
            <div className="w-6 h-10 border-2 border-gray-400 rounded-full flex justify-center">
              <motion.div
                className="w-1 h-3 bg-accent-blue rounded-full mt-2"
                animate={{ y: [0, 12, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            </div>
          </motion.div>
        </motion.div>
      </div>
    </motion.section>
  );
};

export default Hero;