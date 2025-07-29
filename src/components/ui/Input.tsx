import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onDrag' | 'onDragStart' | 'onDragEnd' | 'onAnimationStart' | 'onAnimationEnd' | 'onAnimationIteration'> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  icon,
  className = '',
  type = 'text',
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [hasValue, setHasValue] = useState(!!props.value || !!props.defaultValue);

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    props.onFocus?.(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    props.onBlur?.(e);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHasValue(!!e.target.value);
    props.onChange?.(e);
  };

  return (
    <div className="w-full">
      <div className="relative">
        {/* Floating Label */}
        {label && (
          <motion.label
            className={`absolute left-3 transition-all duration-300 pointer-events-none font-medium ${
              isFocused || hasValue
                ? 'top-2 text-xs text-accent-blue'
                : 'top-1/2 -translate-y-1/2 text-gray-400'
            }`}
            animate={{
              y: isFocused || hasValue ? -8 : 0,
              scale: isFocused || hasValue ? 0.85 : 1,
            }}
            transition={{ duration: 0.2 }}
          >
            {label}
          </motion.label>
        )}

        {/* Icon */}
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}

        {/* Input Field */}
        <motion.input
          type={type}
          className={`
            w-full glass-dark rounded-lg border transition-all duration-300
            ${label ? 'pt-6 pb-2 px-3' : 'py-3 px-3'}
            ${icon ? 'pl-10' : ''}
            ${error 
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' 
              : 'border-white/20 focus:border-accent-blue focus:ring-accent-blue/20'
            }
            focus:outline-none focus:ring-2 focus:ring-offset-0
            placeholder-gray-500 text-white bg-black/20 backdrop-blur-md
            ${className}
          `}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onChange={handleChange}
          whileFocus={{ scale: 1.02 }}
          {...props}
        />

        {/* Animated Border */}
        <motion.div
          className="absolute bottom-0 left-0 h-0.5 bg-accent-blue"
          initial={{ width: 0 }}
          animate={{ width: isFocused ? '100%' : 0 }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Helper Text or Error */}
      {(error || helperText) && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mt-2 text-sm ${error ? 'text-red-400' : 'text-gray-400'}`}
        >
          {error || helperText}
        </motion.p>
      )}
    </div>
  );
};

export default Input;