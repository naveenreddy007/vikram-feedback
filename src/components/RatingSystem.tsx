import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useHapticFeedback from '../hooks/useHapticFeedback';

interface RatingSystemProps {
  question: string;
  description?: string;
  onRatingChange: (rating: number) => void;
  maxRating?: number;
  currentRating?: number;
  showMotivationalMessage?: boolean;
}

const RatingSystem: React.FC<RatingSystemProps> = ({
  question,
  description,
  onRatingChange,
  maxRating = 10,
  currentRating = 0,
  showMotivationalMessage = true
}) => {
  const [hoveredRating, setHoveredRating] = useState(0);
  const [selectedRating, setSelectedRating] = useState(currentRating);
  const [showParticles, setShowParticles] = useState(false);
  const { feedback } = useHapticFeedback();

  // Motivational messages based on rating
  const getMotivationalMessage = (rating: number) => {
    if (rating >= 9) return { text: "🌟 Absolutely Amazing! You're inspiring!", color: "accent-green" };
    if (rating >= 7) return { text: "🚀 Excellent work! Keep it up!", color: "accent-blue" };
    if (rating >= 5) return { text: "👍 Good job! There's room to grow!", color: "accent-orange" };
    if (rating >= 3) return { text: "💪 Thanks for the feedback! I'll improve!", color: "accent-orange" };
    if (rating >= 1) return { text: "🎯 Every feedback helps me grow!", color: "accent-blue" };
    return { text: "", color: "accent-blue" };
  };

  const handleRatingClick = (rating: number) => {
    setSelectedRating(rating);
    onRatingChange(rating);
    feedback.ratingSelect(rating);
    
    // Trigger particle effect
    setShowParticles(true);
    setTimeout(() => setShowParticles(false), 1000);
  };

  const handleRatingHover = (rating: number) => {
    setHoveredRating(rating);
    feedback.tap();
  };

  const currentDisplayRating = hoveredRating || selectedRating;
  const motivationalMessage = getMotivationalMessage(currentDisplayRating);

  // Generate particles for animation
  const generateParticles = () => {
    return Array.from({ length: 12 }, (_, i) => (
      <motion.div
        key={i}
        className="absolute w-2 h-2 bg-accent-blue rounded-full"
        initial={{
          x: 0,
          y: 0,
          scale: 0,
          opacity: 1
        }}
        animate={{
          x: (Math.random() - 0.5) * 200,
          y: (Math.random() - 0.5) * 200,
          scale: [0, 1, 0],
          opacity: [1, 1, 0]
        }}
        transition={{
          duration: 1,
          delay: i * 0.05,
          ease: "easeOut"
        }}
      />
    ));
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Question */}
      <motion.div
        className="text-center mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h3 className="text-2xl md:text-3xl font-bold text-white mb-4 lewish-text">
          {question}
        </h3>
        {description && (
          <p className="text-gray-300 text-lg">
            {description}
          </p>
        )}
      </motion.div>

      {/* Rating Scale */}
      <div className="relative">
        <motion.div
          className="flex justify-center items-center space-x-2 md:space-x-4 mb-8"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {Array.from({ length: maxRating }, (_, index) => {
            const rating = index + 1;
            const isActive = rating <= currentDisplayRating;
            const isHovered = rating <= hoveredRating;
            const isSelected = rating <= selectedRating;

            const getButtonStyles = () => {
              if (isActive) {
                if (motivationalMessage.color === 'accent-green') {
                  return 'bg-accent-green border-accent-green text-black shadow-lg';
                } else if (motivationalMessage.color === 'accent-blue') {
                  return 'bg-accent-blue border-accent-blue text-black shadow-lg';
                } else if (motivationalMessage.color === 'accent-orange') {
                  return 'bg-accent-orange border-accent-orange text-black shadow-lg';
                }
              }
              return 'bg-transparent border-gray-600 text-gray-400 hover:border-gray-400';
            };

            return (
              <motion.button
                key={rating}
                className={`
                  relative w-12 h-12 md:w-16 md:h-16 rounded-full border-2 font-bold text-lg md:text-xl
                  transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-primary-dark
                  ${getButtonStyles()}
                `}
                whileHover={{ 
                  scale: 1.1,
                }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleRatingClick(rating)}
                onMouseEnter={() => handleRatingHover(rating)}
                onMouseLeave={() => setHoveredRating(0)}
              >
                {rating}
                
                {/* Glow effect */}
                <motion.div
                  className="absolute inset-0 rounded-full"
                  animate={{
                    boxShadow: isActive 
                      ? `0 0 20px rgba(0, 212, 255, 0.5), inset 0 0 20px rgba(255, 255, 255, 0.1)`
                      : '0 0 0px transparent'
                  }}
                  transition={{ duration: 0.3 }}
                />

                {/* Particle explosion on selection */}
                <AnimatePresence>
                  {showParticles && isSelected && rating === selectedRating && (
                    <div className="absolute inset-0 pointer-events-none">
                      {generateParticles()}
                    </div>
                  )}
                </AnimatePresence>
              </motion.button>
            );
          })}
        </motion.div>

        {/* Rating Labels */}
        <div className="flex justify-between text-sm text-gray-400 mb-6">
          <span>Poor</span>
          <span>Excellent</span>
        </div>

        {/* Current Rating Display */}
        <AnimatePresence>
          {currentDisplayRating > 0 && (
            <motion.div
              className="text-center mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                className={`text-6xl md:text-8xl font-bold mb-2 ${
                  motivationalMessage.color === 'accent-green' ? 'text-accent-green' :
                  motivationalMessage.color === 'accent-blue' ? 'text-accent-blue' :
                  'text-accent-orange'
                }`}
                animate={{ 
                  scale: [1, 1.1, 1]
                }}
                transition={{ duration: 0.6 }}
              >
                {currentDisplayRating}
              </motion.div>
              <div className="text-gray-300 text-lg">
                out of {maxRating}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Motivational Message */}
        <AnimatePresence>
          {showMotivationalMessage && currentDisplayRating > 0 && motivationalMessage.text && (
            <motion.div
              className="text-center"
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: -20 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <motion.div
                className={`inline-block px-6 py-3 rounded-full glass-dark border ${
                  motivationalMessage.color === 'accent-green' ? 'border-accent-green/30' :
                  motivationalMessage.color === 'accent-blue' ? 'border-accent-blue/30' :
                  'border-accent-orange/30'
                }`}
                animate={{
                  boxShadow: `0 0 20px rgba(0, 212, 255, 0.2)`
                }}
              >
                <motion.p
                  className={`font-semibold text-lg ${
                    motivationalMessage.color === 'accent-green' ? 'text-accent-green' :
                    motivationalMessage.color === 'accent-blue' ? 'text-accent-blue' :
                    'text-accent-orange'
                  }`}
                  animate={{
                    scale: [1, 1.05, 1]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {motivationalMessage.text}
                </motion.p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Interactive Background Elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {currentDisplayRating > 0 && (
            <>
              {/* Floating elements based on rating */}
              {Array.from({ length: Math.min(currentDisplayRating, 5) }, (_, i) => (
                <motion.div
                  key={i}
                  className={`absolute w-4 h-4 rounded-full ${
                    motivationalMessage.color === 'accent-green' ? 'bg-accent-green/20' :
                    motivationalMessage.color === 'accent-blue' ? 'bg-accent-blue/20' :
                    'bg-accent-orange/20'
                  }`}
                  style={{
                    left: `${20 + i * 15}%`,
                    top: `${30 + (i % 2) * 40}%`
                  }}
                  animate={{
                    y: [0, -20, 0],
                    opacity: [0.3, 0.7, 0.3],
                    scale: [1, 1.2, 1]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    delay: i * 0.5
                  }}
                />
              ))}
            </>
          )}
        </div>
      </div>

      {/* Rating Description */}
      <AnimatePresence>
        {selectedRating > 0 && (
          <motion.div
            className="text-center mt-8 p-4 glass-dark rounded-lg"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <p className="text-gray-300">
              You rated this <span className={`font-semibold ${
                motivationalMessage.color === 'accent-green' ? 'text-accent-green' :
                motivationalMessage.color === 'accent-blue' ? 'text-accent-blue' :
                'text-accent-orange'
              }`}>
                {selectedRating} out of {maxRating}
              </span>
            </p>
            <p className="text-sm text-gray-400 mt-2">
              {selectedRating >= 8 && "This feedback means a lot! Thank you for recognizing the effort."}
              {selectedRating >= 6 && selectedRating < 8 && "Great to hear! I'll keep working to make it even better."}
              {selectedRating >= 4 && selectedRating < 6 && "Thanks for the honest feedback. I'll focus on improving this area."}
              {selectedRating < 4 && "I appreciate your honesty. This helps me understand what needs immediate attention."}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RatingSystem;