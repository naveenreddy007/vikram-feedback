import React from 'react';
import { motion, useInView } from 'framer-motion';
import { Card } from './ui';

const AboutSection: React.FC = () => {
  const ref = React.useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  const teachingAreas = [
    {
      title: "Real-world engineering applications",
      icon: "🔧",
      description: "Connecting theory to practical industry solutions"
    },
    {
      title: "Practical problem-solving techniques",
      icon: "🧠",
      description: "Developing critical thinking and analytical skills"
    },
    {
      title: "Industry-relevant technologies",
      icon: "⚙️",
      description: "Staying current with modern engineering tools"
    },
    {
      title: "Future-ready skills and concepts",
      icon: "🚀",
      description: "Preparing students for tomorrow's challenges"
    }
  ];

  const feedbackBenefits = [
    {
      title: "Improve teaching methods",
      icon: "📈",
      description: "Refine approaches based on student needs"
    },
    {
      title: "Adjust explanation pace",
      icon: "⏱️",
      description: "Find the perfect speed for learning"
    },
    {
      title: "Focus on relevant topics",
      icon: "🎯",
      description: "Prioritize what matters most to students"
    },
    {
      title: "Enhance learning experience",
      icon: "✨",
      description: "Create more engaging and effective lessons"
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { 
      opacity: 0, 
      x: -30,
      scale: 0.9
    },
    visible: { 
      opacity: 1, 
      x: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12
      }
    }
  };

  return (
    <section ref={ref} className="py-20 relative">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* What I Teach */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
            transition={{ duration: 0.8 }}
          >
            <Card variant="glass" className="p-8 h-full">
              <motion.div
                className="flex items-center mb-8"
                whileHover={{ scale: 1.05 }}
              >
                <motion.div
                  className="text-4xl mr-4"
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                >
                  🎓
                </motion.div>
                <h3 className="text-2xl font-bold text-accent-blue lewish-text">
                  WHAT I TEACH
                </h3>
              </motion.div>

              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate={isInView ? "visible" : "hidden"}
                className="space-y-6"
              >
                {teachingAreas.map((area, index) => (
                  <motion.div
                    key={index}
                    variants={itemVariants}
                    className="flex items-start group"
                    whileHover={{ x: 10 }}
                  >
                    <motion.span 
                      className="text-2xl mr-4 mt-1"
                      whileHover={{ scale: 1.2, rotate: 15 }}
                    >
                      {area.icon}
                    </motion.span>
                    <div>
                      <h4 className="text-accent-green font-semibold mb-2 group-hover:text-accent-blue transition-colors">
                        {area.title}
                      </h4>
                      <p className="text-gray-400 text-sm">
                        {area.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>

              {/* Animated progress bars */}
              <div className="mt-8 space-y-4">
                {[
                  { skill: "Real-World Application", level: 95, color: "accent-blue" },
                  { skill: "Student Engagement", level: 90, color: "accent-green" },
                  { skill: "Industry Relevance", level: 88, color: "accent-orange" }
                ].map((skill, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-300">{skill.skill}</span>
                      <span className={`text-${skill.color}`}>{skill.level}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <motion.div
                        className={`h-2 bg-${skill.color} rounded-full`}
                        initial={{ width: 0 }}
                        animate={isInView ? { width: `${skill.level}%` } : { width: 0 }}
                        transition={{ duration: 1.5, delay: 0.5 + index * 0.2 }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* Your Feedback Helps */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <Card variant="glass" className="p-8 h-full">
              <motion.div
                className="flex items-center mb-8"
                whileHover={{ scale: 1.05 }}
              >
                <motion.div
                  className="text-4xl mr-4"
                  animate={{ 
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  💡
                </motion.div>
                <h3 className="text-2xl font-bold text-accent-orange lewish-text">
                  YOUR FEEDBACK HELPS
                </h3>
              </motion.div>

              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate={isInView ? "visible" : "hidden"}
                className="space-y-6"
              >
                {feedbackBenefits.map((benefit, index) => (
                  <motion.div
                    key={index}
                    variants={itemVariants}
                    className="flex items-start group"
                    whileHover={{ x: 10 }}
                  >
                    <motion.span 
                      className="text-2xl mr-4 mt-1"
                      whileHover={{ scale: 1.2, rotate: -15 }}
                    >
                      {benefit.icon}
                    </motion.span>
                    <div>
                      <h4 className="text-accent-blue font-semibold mb-2 group-hover:text-accent-orange transition-colors">
                        {benefit.title}
                      </h4>
                      <p className="text-gray-400 text-sm">
                        {benefit.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>

              {/* Feedback Impact Visualization */}
              <div className="mt-8">
                <h4 className="text-lg font-semibold text-white mb-4">Feedback Impact</h4>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { metric: "Response Rate", value: "85%", icon: "📊" },
                    { metric: "Implementation", value: "90%", icon: "⚡" },
                    { metric: "Student Satisfaction", value: "95%", icon: "😊" },
                    { metric: "Course Updates", value: "Monthly", icon: "🔄" }
                  ].map((metric, index) => (
                    <motion.div
                      key={index}
                      className="text-center p-3 bg-white/5 rounded-lg"
                      whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.1)" }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                      transition={{ delay: 1 + index * 0.1 }}
                    >
                      <div className="text-2xl mb-1">{metric.icon}</div>
                      <div className="text-accent-green font-bold">{metric.value}</div>
                      <div className="text-xs text-gray-400">{metric.metric}</div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;