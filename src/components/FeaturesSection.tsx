import React from 'react';
import { motion, useInView } from 'framer-motion';
import { Card } from './ui';

const FeaturesSection: React.FC = () => {
  const ref = React.useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  const features = [
    {
      icon: "⚡",
      title: "Quick & Easy",
      description: "Takes just 3-5 minutes to complete",
      color: "accent-blue",
      delay: 0
    },
    {
      icon: "🎯",
      title: "Focused Questions",
      description: "Targeted feedback on teaching effectiveness",
      color: "accent-green",
      delay: 0.2
    },
    {
      icon: "🔒",
      title: "Anonymous Option",
      description: "Share honest thoughts confidentially",
      color: "accent-orange",
      delay: 0.4
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { 
      opacity: 0, 
      y: 50,
      scale: 0.8
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        type: "spring" as const,
        stiffness: 100,
        damping: 12
      }
    }
  };

  return (
    <section ref={ref} className="py-20 relative">
      {/* Section Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary-dark/50 to-transparent" />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8 }}
        >
          <motion.h2 
            className="text-4xl md:text-5xl font-bold mb-6 lewish-text text-accent-green"
            whileHover={{ scale: 1.05 }}
          >
            SHARE YOUR EXPERIENCE
          </motion.h2>
          <motion.div
            className="w-24 h-1 bg-gradient-to-r from-accent-green to-accent-blue mx-auto mb-6"
            initial={{ width: 0 }}
            animate={isInView ? { width: 96 } : { width: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
          />
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Your honest feedback helps me improve my teaching methods, adjust my pace, 
            and ensure every concept connects to real-world engineering applications.
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          className="grid md:grid-cols-3 gap-8 mb-16"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ 
                y: -10,
                transition: { type: "spring", stiffness: 300 }
              }}
            >
              <Card variant="glass" className="p-8 text-center h-full relative overflow-hidden group">
                {/* Background glow effect */}
                <motion.div
                  className={`absolute inset-0 bg-${feature.color}/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                />
                
                <motion.div
                  className="text-6xl mb-6"
                  animate={{
                    rotate: [0, 10, -10, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    delay: feature.delay
                  }}
                >
                  {feature.icon}
                </motion.div>
                
                <h3 className={`text-xl font-semibold mb-4 text-${feature.color}`}>
                  {feature.title}
                </h3>
                
                <p className="text-gray-400 leading-relaxed">
                  {feature.description}
                </p>

                {/* Animated border */}
                <motion.div
                  className={`absolute bottom-0 left-0 h-1 bg-${feature.color}`}
                  initial={{ width: 0 }}
                  whileInView={{ width: "100%" }}
                  transition={{ duration: 0.8, delay: feature.delay + 0.5 }}
                />
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Stats Section */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center"
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          {[
            { number: "500+", label: "Students Taught", color: "accent-blue" },
            { number: "95%", label: "Satisfaction Rate", color: "accent-green" },
            { number: "10+", label: "Years Experience", color: "accent-orange" },
            { number: "100%", label: "Real-World Focus", color: "accent-blue" }
          ].map((stat, index) => (
            <motion.div
              key={index}
              className="relative"
              whileHover={{ scale: 1.1 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <motion.div
                className={`text-3xl md:text-4xl font-bold text-${stat.color} mb-2`}
                initial={{ scale: 0 }}
                animate={isInView ? { scale: 1 } : { scale: 0 }}
                transition={{ 
                  type: "spring", 
                  stiffness: 200, 
                  delay: 1 + index * 0.1 
                }}
              >
                {stat.number}
              </motion.div>
              <div className="text-gray-400 text-sm lewish-text">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturesSection;