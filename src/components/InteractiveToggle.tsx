import React from 'react';
import { motion } from 'framer-motion';
import useHapticFeedback from '../hooks/useHapticFeedback';

interface ToggleOption {
  value: string | boolean;
  label: string;
  icon?: string;
  color?: string;
  description?: string;
}

interface InteractiveToggleProps {
  options: ToggleOption[];
  value: string | boolean | null;
  onChange: (value: string | boolean) => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'switch' | 'buttons' | 'cards';
}

const InteractiveToggle: React.FC<InteractiveToggleProps> = ({
  options,
  value,
  onChange,
  className = '',
  size = 'md',
  variant = 'buttons'
}) => {
  const { feedback } = useHapticFeedback();

  const handleChange = (newValue: string | boolean) => {
    onChange(newValue);
    feedback.toggle();
  };

  const sizeClasses = {
    sm: 'text-sm px-3 py-2',
    md: 'text-base px-4 py-3',
    lg: 'text-lg px-6 py-4'
  };

  if (variant === 'switch' && options.length === 2) {
    const isOn = value === options[1].value;
    
    return (
      <div className={`flex items-center space-x-4 ${className}`}>
        <span className={`text-gray-300 ${!isOn ? 'text-white font-semibold' : ''}`}>
          {options[0].label}
        </span>
        
        <motion.button
          className={`
            relative w-16 h-8 rounded-full p-1 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-accent-blue focus:ring-offset-2 focus:ring-offset-primary-dark
            ${isOn ? 'bg-accent-green' : 'bg-gray-600'}
          `}
          onClick={() => handleChange(isOn ? options[0].value : options[1].value)}
          whileTap={{ scale: 0.95 }}
        >
          <motion.div
            className="w-6 h-6 bg-white rounded-full shadow-lg"
            animate={{
              x: isOn ? 32 : 0
            }}
            transition={{
              type: "spring",
              stiffness: 500,
              damping: 30
            }}
          />
          
          {/* Glow effect */}
          <motion.div
            className="absolute inset-0 rounded-full"
            animate={{
              boxShadow: isOn 
                ? '0 0 20px rgba(57, 255, 20, 0.5)'
                : '0 0 10px rgba(107, 114, 128, 0.3)'
            }}
            transition={{ duration: 0.3 }}
          />
        </motion.button>
        
        <span className={`text-gray-300 ${isOn ? 'text-white font-semibold' : ''}`}>
          {options[1].label}
        </span>
      </div>
    );
  }

  if (variant === 'cards') {
    return (
      <div className={`grid gap-4 ${options.length === 2 ? 'grid-cols-2' : 'grid-cols-1'} ${className}`}>
        {options.map((option) => (
          <motion.button
            key={String(option.value)}
            className={`
              p-6 rounded-xl border-2 transition-all duration-300 text-left
              ${value === option.value
                ? `border-${option.color || 'accent-blue'} bg-${option.color || 'accent-blue'}/10`
                : 'border-gray-600 hover:border-gray-500'
              }
            `}
            onClick={() => handleChange(option.value)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center space-x-3 mb-2">
              {option.icon && (
                <span className="text-2xl">{option.icon}</span>
              )}
              <span className={`font-semibold ${value === option.value ? `text-${option.color || 'accent-blue'}` : 'text-white'}`}>
                {option.label}
              </span>
            </div>
            
            {option.description && (
              <p className="text-gray-400 text-sm">
                {option.description}
              </p>
            )}
            
            {/* Selection indicator */}
            <motion.div
              className={`absolute top-2 right-2 w-6 h-6 rounded-full border-2 ${
                value === option.value 
                  ? `border-${option.color || 'accent-blue'} bg-${option.color || 'accent-blue'}` 
                  : 'border-gray-500'
              }`}
              animate={{
                scale: value === option.value ? 1 : 0.8,
                opacity: value === option.value ? 1 : 0.5
              }}
            >
              {value === option.value && (
                <motion.div
                  className="w-2 h-2 bg-white rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1 }}
                />
              )}
            </motion.div>
          </motion.button>
        ))}
      </div>
    );
  }

  // Default: buttons variant
  return (
    <div className={`flex flex-wrap gap-3 justify-center ${className}`}>
      {options.map((option) => (
        <motion.button
          key={String(option.value)}
          className={`
            ${sizeClasses[size]} rounded-xl font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-primary-dark
            ${value === option.value
              ? `bg-${option.color || 'accent-blue'} text-black shadow-lg focus:ring-${option.color || 'accent-blue'}`
              : 'glass-dark text-white hover:bg-white/10 focus:ring-white/50'
            }
          `}
          onClick={() => handleChange(option.value)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center space-x-2">
            {option.icon && (
              <span className="text-xl">{option.icon}</span>
            )}
            <span>{option.label}</span>
          </div>
        </motion.button>
      ))}
    </div>
  );
};

export default InteractiveToggle;