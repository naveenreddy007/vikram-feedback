import React, { useState } from 'react';
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
    setTimeout(() => setShowParticles(false), 800);
  };

  const currentDisplayRating = selectedRating;
  const motivationalMessage = getMotivationalMessage(currentDisplayRating);

  // Generate contained particles for animation
  const generateParticles = () => {
    return Array.from({ length: 8 }, (_, i) => (
      <motion.div
        key={i}
        className="absolute w-1.5 h-1.5 bg-accent-blue rounded-full"
        initial={{
          x: 0,
          y: 0,
          scale: 0,
          opacity: 1
        }}
        animate={{
          x: (Math.random() - 0.5) * 60,
          y: (Math.random() - 0.5) * 60,
          scale: [0, 1, 0],
          opacity: [1, 0.8, 0]
        }}
        transition={{
          duration: 0.8,
          delay: i * 0.05,
          ease: "easeOut"
        }}
      />
    ));
  };

  return (
    <div className="w-full max-w-2xl mx-auto overflow-hidden">
      {/* Question */}
      <div className="text-center mb-6">
        <h3 className="text-xl md:text-2xl font-bold text-white mb-3 lewish-text">
          {question}
        </h3>
        {description && (
          <p className="text-gray-300 text-base">
            {description}
          </p>
        )}
      </div>

      {/* Rating Scale Container */}
      <div className="relative overflow-hidden">
        <div className="flex justify-center items-center space-x-1 md:space-x-2 mb-6">
          {Array.from({ length: maxRating }, (_, index) => {
            const rating = index + 1;
            const isActive = rating <= currentDisplayRating;
            const isSelected = rating <= selectedRating;

            const getButtonStyles = () => {
              if (isActive) {
                if (motivationalMessage.color === 'accent-green') {
                  return 'bg-accent-green border-accent-green text-black shadow-md';
                } else if (motivationalMessage.color === 'accent-blue') {
                  return 'bg-accent-blue border-accent-blue text-black shadow-md';
                } else if (motivationalMessage.color === 'accent-orange') {
                  return 'bg-accent-orange border-accent-orange text-black shadow-md';
                }
              }
              return 'bg-transparent border-gray-600 text-gray-400';
            };

            return (
              <div key={rating} className="relative">
                <motion.button
                  className={`
                    relative w-10 h-10 md:w-12 md:h-12 rounded-full border-2 font-bold text-sm md:text-base
                    transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400/50
                    ${getButtonStyles()}
                  `}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleRatingClick(rating)}
                >
                  {rating}
                  
                  {/* Subtle glow effect */}
                  {isActive && (
                    <div 
                      className="absolute inset-0 rounded-full opacity-30"
                      style={{
                        boxShadow: `0 0 8px ${
                          motivationalMessage.color === 'accent-green' ? '#10b981' :
                          motivationalMessage.color === 'accent-blue' ? '#00d4ff' :
                          '#f59e0b'
                        }`
                      }}
                    />
                  )}
                </motion.button>

                {/* Contained particle explosion */}
                <AnimatePresence>
                  {showParticles && isSelected && rating === selectedRating && (
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                      {generateParticles()}
                    </div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        {/* Rating Labels */}
        <div className="flex justify-between text-xs text-gray-500 mb-4">
          <span>Poor</span>
          <span>Excellent</span>
        </div>

        {/* Current Rating Display */}
        <AnimatePresence>
          {currentDisplayRating > 0 && (
            <motion.div
              className="text-center mb-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <div
                className={`text-3xl md:text-4xl font-bold mb-1 ${
                  motivationalMessage.color === 'accent-green' ? 'text-accent-green' :
                  motivationalMessage.color === 'accent-blue' ? 'text-accent-blue' :
                  'text-accent-orange'
                }`}
              >
                {currentDisplayRating}
              </div>
              <div className="text-gray-400 text-sm">
                out of {maxRating}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Motivational Message */}
        <AnimatePresence>
          {showMotivationalMessage && currentDisplayRating > 0 && motivationalMessage.text && (
            <motion.div
              className="text-center mb-4"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
            >
              <div
                className={`inline-block px-4 py-2 rounded-full glass-dark border ${
                  motivationalMessage.color === 'accent-green' ? 'border-accent-green/30' :
                  motivationalMessage.color === 'accent-blue' ? 'border-accent-blue/30' :
                  'border-accent-orange/30'
                }`}
              >
                <p
                  className={`font-medium text-sm ${
                    motivationalMessage.color === 'accent-green' ? 'text-accent-green' :
                    motivationalMessage.color === 'accent-blue' ? 'text-accent-blue' :
                    'text-accent-orange'
                  }`}
                >
                  {motivationalMessage.text}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Subtle Background Elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
          {currentDisplayRating > 0 && (
            <>
              {Array.from({ length: Math.min(currentDisplayRating, 3) }, (_, i) => (
                <motion.div
                  key={i}
                  className={`absolute w-2 h-2 rounded-full opacity-20 ${
                    motivationalMessage.color === 'accent-green' ? 'bg-accent-green' :
                    motivationalMessage.color === 'accent-blue' ? 'bg-accent-blue' :
                    'bg-accent-orange'
                  }`}
                  style={{
                    left: `${25 + i * 20}%`,
                    top: `${20 + (i % 2) * 30}%`
                  }}
                  animate={{
                    y: [0, -8, 0],
                    opacity: [0.1, 0.3, 0.1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.3
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
            className="text-center mt-4 p-3 glass-dark rounded-lg"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <p className="text-gray-300 text-sm">
              You rated this <span className={`font-semibold ${
                motivationalMessage.color === 'accent-green' ? 'text-accent-green' :
                motivationalMessage.color === 'accent-blue' ? 'text-accent-blue' :
                'text-accent-orange'
              }`}>
                {selectedRating} out of {maxRating}
              </span>
            </p>
            <p className="text-xs text-gray-400 mt-1">
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