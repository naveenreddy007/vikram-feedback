import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  disabled?: boolean;
  label?: string;
}

const InteractiveToggle: React.FC<InteractiveToggleProps> = ({
  options,
  value,
  onChange,
  className = '',
  size = 'md',
  variant = 'buttons',
  disabled = false,
  label
}) => {
  const { feedback } = useHapticFeedback();

  const handleChange = (newValue: string | boolean) => {
    if (disabled) return;
    onChange(newValue);
    feedback.toggle();
  };

  const sizeClasses = {
    sm: { text: 'text-sm', padding: 'px-4 py-2.5', height: 'h-9' },
    md: { text: 'text-base', padding: 'px-6 py-3', height: 'h-11' },
    lg: { text: 'text-lg', padding: 'px-8 py-4', height: 'h-14' }
  };

  const switchSizes = {
    sm: { width: 'w-12', height: 'h-6', thumb: 'w-4 h-4', translate: 'translate-x-6' },
    md: { width: 'w-16', height: 'h-8', thumb: 'w-6 h-6', translate: 'translate-x-8' },
    lg: { width: 'w-20', height: 'h-10', thumb: 'w-8 h-8', translate: 'translate-x-10' }
  };

  const getColorClasses = (optionColor: string | undefined, isSelected: boolean) => {
    const colorMap: Record<string, { bg: string; text: string; ring: string; glow: string }> = {
      'accent-blue': {
        bg: isSelected ? 'bg-blue-500' : '',
        text: isSelected ? 'text-white' : '',
        ring: 'focus:ring-blue-400',
        glow: 'shadow-blue-500/25'
      },
      'accent-green': {
        bg: isSelected ? 'bg-emerald-500' : '',
        text: isSelected ? 'text-white' : '',
        ring: 'focus:ring-emerald-400',
        glow: 'shadow-emerald-500/25'
      },
      'accent-purple': {
        bg: isSelected ? 'bg-purple-500' : '',
        text: isSelected ? 'text-white' : '',
        ring: 'focus:ring-purple-400',
        glow: 'shadow-purple-500/25'
      },
      'accent-red': {
        bg: isSelected ? 'bg-red-500' : '',
        text: isSelected ? 'text-white' : '',
        ring: 'focus:ring-red-400',
        glow: 'shadow-red-500/25'
      }
    };

    const defaultColors = {
      bg: isSelected ? 'bg-blue-500' : '',
      text: isSelected ? 'text-white' : '',
      ring: 'focus:ring-blue-400',
      glow: 'shadow-blue-500/25'
    };

    return colorMap[optionColor || 'accent-blue'] || defaultColors;
  };

  if (variant === 'switch' && options.length === 2) {
    const isOn = value === options[1].value;
    const switchSize = switchSizes[size];
    const colors = getColorClasses(options[1].color, isOn);
    
    return (
      <div className={`inline-flex flex-col space-y-2 ${className}`}>
        {label && (
          <label className="text-sm font-medium text-gray-200 select-none">
            {label}
          </label>
        )}
        
        <div className="flex items-center space-x-4">
          <motion.span 
            className={`select-none transition-all duration-200 ${
              !isOn ? 'text-white font-medium' : 'text-gray-400'
            } ${disabled ? 'opacity-50' : ''}`}
            animate={{ scale: !isOn ? 1.05 : 1 }}
          >
            {options[0].label}
          </motion.span>
          
          <motion.button
            className={`
              relative ${switchSize.width} ${switchSize.height} rounded-full transition-all duration-300 
              focus:outline-none focus:ring-4 ${colors.ring} focus:ring-opacity-50
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              ${isOn 
                ? `bg-gradient-to-r from-${options[1].color || 'blue-500'} to-${options[1].color || 'blue-600'} shadow-lg ${colors.glow}` 
                : 'bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600'
              }
            `}
            onClick={() => handleChange(isOn ? options[0].value : options[1].value)}
            whileTap={{ scale: disabled ? 1 : 0.95 }}
            disabled={disabled}
          >
            <motion.div
              className={`${switchSize.thumb} bg-white rounded-full shadow-lg absolute top-1/2 transform -translate-y-1/2 left-1`}
              animate={{
                x: isOn ? switchSize.translate.replace('translate-x-', '').replace('px', '') + 'px' : '0px'
              }}
              transition={{
                type: "spring",
                stiffness: 700,
                damping: 30
              }}
            />
            
            {/* Inner glow effect */}
            <motion.div
              className="absolute inset-0 rounded-full"
              animate={{
                boxShadow: isOn 
                  ? `inset 0 0 10px rgba(59, 130, 246, 0.3)`
                  : 'inset 0 0 5px rgba(0, 0, 0, 0.2)'
              }}
              transition={{ duration: 0.3 }}
            />
          </motion.button>
          
          <motion.span 
            className={`select-none transition-all duration-200 ${
              isOn ? 'text-white font-medium' : 'text-gray-400'
            } ${disabled ? 'opacity-50' : ''}`}
            animate={{ scale: isOn ? 1.05 : 1 }}
          >
            {options[1].label}
          </motion.span>
        </div>
      </div>
    );
  }

  if (variant === 'cards') {
    return (
      <div className={`space-y-3 ${className}`}>
        {label && (
          <label className="text-sm font-medium text-gray-200 select-none block">
            {label}
          </label>
        )}
        
        <div className={`grid gap-4 ${options.length === 2 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'} ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
          {options.map((option, index) => {
            const isSelected = value === option.value;
            const colors = getColorClasses(option.color, isSelected);
            
            return (
              <motion.button
                key={String(option.value)}
                className={`
                  relative p-6 rounded-2xl border-2 transition-all duration-300 text-left group overflow-hidden
                  ${isSelected
                    ? `border-${option.color || 'blue-500'} bg-gradient-to-br from-${option.color || 'blue-500'}/10 to-${option.color || 'blue-500'}/5 shadow-lg ${colors.glow}`
                    : 'border-gray-700 bg-gray-900/50 hover:border-gray-600 hover:bg-gray-800/50'
                  }
                  focus:outline-none focus:ring-4 ${colors.ring} focus:ring-opacity-50
                `}
                onClick={() => handleChange(option.value)}
                whileHover={{ scale: disabled ? 1 : 1.02, y: -2 }}
                whileTap={{ scale: disabled ? 1 : 0.98 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                {/* Background gradient overlay */}
                <div className={`absolute inset-0 bg-gradient-to-br ${
                  isSelected ? `from-${option.color || 'blue-500'}/5 to-transparent` : 'from-gray-800/20 to-transparent'
                } transition-opacity duration-300`} />
                
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      {option.icon && (
                        <motion.span 
                          className="text-2xl filter"
                          animate={{ scale: isSelected ? 1.1 : 1 }}
                          transition={{ duration: 0.2 }}
                        >
                          {option.icon}
                        </motion.span>
                      )}
                      <span className={`font-semibold transition-colors duration-200 ${
                        isSelected ? `text-${option.color || 'blue-400'}` : 'text-white group-hover:text-gray-100'
                      }`}>
                        {option.label}
                      </span>
                    </div>
                    
                    {/* Selection indicator */}
                    <motion.div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        isSelected 
                          ? `border-${option.color || 'blue-500'} bg-${option.color || 'blue-500'}` 
                          : 'border-gray-500 group-hover:border-gray-400'
                      }`}
                      animate={{
                        scale: isSelected ? 1.1 : 1,
                        borderColor: isSelected ? colors.bg.replace('bg-', '') : undefined
                      }}
                      transition={{ duration: 0.2 }}
                    >
                      <AnimatePresence>
                        {isSelected && (
                          <motion.div
                            className="w-2.5 h-2.5 bg-white rounded-full"
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                          />
                        )}
                      </AnimatePresence>
                    </motion.div>
                  </div>
                  
                  {option.description && (
                    <motion.p 
                      className="text-gray-400 text-sm leading-relaxed"
                      animate={{ opacity: isSelected ? 1 : 0.8 }}
                    >
                      {option.description}
                    </motion.p>
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    );
  }

  // Default: buttons variant
  return (
    <div className={`space-y-3 ${className}`}>
      {label && (
        <label className="text-sm font-medium text-gray-200 select-none block">
          {label}
        </label>
      )}
      
      <div className={`flex flex-wrap gap-3 justify-center ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
        {options.map((option, index) => {
          const isSelected = value === option.value;
          const colors = getColorClasses(option.color, isSelected);
          
          return (
            <motion.button
              key={String(option.value)}
              className={`
                ${sizeClasses[size].padding} ${sizeClasses[size].height} ${sizeClasses[size].text}
                rounded-xl font-medium transition-all duration-300 flex items-center space-x-2
                focus:outline-none focus:ring-4 ${colors.ring} focus:ring-opacity-50 select-none
                ${isSelected
                  ? `bg-gradient-to-r from-${option.color || 'blue-500'} to-${option.color || 'blue-600'} text-white shadow-lg ${colors.glow} transform`
                  : 'bg-gray-800/60 text-gray-300 hover:bg-gray-700/80 hover:text-white backdrop-blur-sm border border-gray-700 hover:border-gray-600'
                }
              `}
              onClick={() => handleChange(option.value)}
              whileHover={{ 
                scale: disabled ? 1 : 1.05, 
                y: disabled ? 0 : -1,
                boxShadow: isSelected ? "0 8px 25px rgba(59, 130, 246, 0.3)" : "0 4px 15px rgba(0, 0, 0, 0.2)"
              }}
              whileTap={{ scale: disabled ? 1 : 0.95 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              {option.icon && (
                <motion.span 
                  className="text-xl"
                  animate={{ rotate: isSelected ? 360 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {option.icon}
                </motion.span>
              )}
              <span className="whitespace-nowrap">{option.label}</span>
              
              {/* Selection indicator dot */}
              <AnimatePresence>
                {isSelected && (
                  <motion.div
                    className="w-2 h-2 bg-white rounded-full ml-1"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    transition={{ duration: 0.2 }}
                  />
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default InteractiveToggle;