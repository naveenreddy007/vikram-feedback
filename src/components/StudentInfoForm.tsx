import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, Input, Card } from './ui';
import useHapticFeedback from '../hooks/useHapticFeedback';

interface StudentInfo {
  name: string;
  email: string;
  phoneNumber: string;
}

interface StudentInfoFormProps {
  onNext: (data: StudentInfo) => void;
  onBack: () => void;
}

const StudentInfoForm: React.FC<StudentInfoFormProps> = ({ onNext, onBack }) => {
  const [formData, setFormData] = useState<StudentInfo>({
    name: '',
    email: '',
    phoneNumber: ''
  });

  const [errors, setErrors] = useState<Partial<StudentInfo>>({});
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Progressive form revelation - show fields one by one
  const formFields = [
    {
      key: 'name' as keyof StudentInfo,
      // label: 'Your Full Name',
      type: 'text',
      placeholder: 'Enter your full name',
      icon: '👤',
      required: true,
      validation: (value: string) => {
        if (!value.trim()) return 'Name is required';
        if (value.trim().length < 2) return 'Name must be at least 2 characters';
        if (!/^[a-zA-Z\s]+$/.test(value)) return 'Name can only contain letters and spaces';
        return '';
      }
    },
    {
      key: 'phoneNumber' as keyof StudentInfo,
      // label: 'Phone Number',
      type: 'tel',
      placeholder: 'Enter your phone number',
      icon: '📱',
      required: true,
      validation: (value: string) => {
        if (!value.trim()) return 'Phone number is required';
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        if (!phoneRegex.test(value.replace(/[\s\-\(\)]/g, ''))) {
          return 'Please enter a valid phone number';
        }
        return '';
      }
    },
    {
      key: 'email' as keyof StudentInfo,
      // label: 'Email Address (Optional)',
      type: 'email',
      placeholder: 'your@email.com',
      icon: '📧',
      required: false,
      validation: (value: string) => {
        if (!value.trim()) return ''; // Optional field
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) return 'Please enter a valid email address';
        return '';
      }
    }
  ];

  const { feedback } = useHapticFeedback();

  // Real-time validation
  const validateField = (key: keyof StudentInfo, value: string) => {
    const field = formFields.find(f => f.key === key);
    if (!field) return '';
    return field.validation(value);
  };

  const handleInputChange = (key: keyof StudentInfo, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    
    // Clear error when user starts typing
    if (errors[key]) {
      setErrors(prev => ({ ...prev, [key]: '' }));
    }

    // Real-time validation
    const error = validateField(key, value);
    if (error) {
      setErrors(prev => ({ ...prev, [key]: error }));
    }

    // Progressive revelation - move to next field when current is valid
    const currentField = formFields[currentStep];
    if (currentField && currentField.key === key && !error && value.trim()) {
      if (currentStep < formFields.length - 1) {
        setTimeout(() => {
          setCurrentStep(prev => prev + 1);
          feedback.fieldComplete();
        }, 500);
      }
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<StudentInfo> = {};
    let isValid = true;

    formFields.forEach(field => {
      const error = field.validation(formData[field.key]);
      if (error) {
        newErrors[field.key] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      feedback.error();
      return;
    }

    setIsSubmitting(true);
    feedback.formSubmit();

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsSubmitting(false);
    onNext(formData);
  };

  // Auto-advance to next step when all visible fields are complete
  useEffect(() => {
    const visibleFields = formFields.slice(0, currentStep + 1);
    const allVisibleComplete = visibleFields.every(field => {
      const value = formData[field.key];
      return field.required ? value.trim() && !validateField(field.key, value) : true;
    });

    if (allVisibleComplete && currentStep < formFields.length - 1) {
      const timer = setTimeout(() => {
        setCurrentStep(prev => prev + 1);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [formData, currentStep]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1
      }
    }
  };

  const fieldVariants = {
    hidden: { 
      opacity: 0, 
      y: 50,
      scale: 0.9
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        type: "spring" as const,
        stiffness: 100,
        damping: 15
      }
    },
    exit: {
      opacity: 0,
      y: -20,
      scale: 0.95,
      transition: { duration: 0.2 }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        className="w-full max-w-2xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Header */}
        <div className="text-center mb-8">
          <Button 
            variant="secondary" 
            size="sm"
            onClick={onBack}
            className="mb-6"
          >
            ← Back to Home
          </Button>
          
          <motion.h1 
            className="text-4xl md:text-5xl lewish-text text-accent-blue mb-4"
            animate={{
              textShadow: [
                "0 0 10px #00d4ff",
                "0 0 20px #00d4ff, 0 0 30px #00d4ff",
                "0 0 10px #00d4ff"
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            STUDENT INFORMATION
          </motion.h1>
          
          <p className="text-gray-300 text-lg">
            Let's get to know you better! Your information helps personalize the feedback experience.
          </p>

          {/* Progress Indicator */}
          <div className="flex justify-center mt-6 space-x-2">
            {formFields.map((_, index) => (
              <motion.div
                key={index}
                className={`w-3 h-3 rounded-full ${
                  index <= currentStep ? 'bg-accent-blue' : 'bg-gray-600'
                }`}
                animate={{
                  scale: index === currentStep ? 1.2 : 1,
                  backgroundColor: index <= currentStep ? '#00d4ff' : '#4b5563'
                }}
                transition={{ duration: 0.3 }}
              />
            ))}
          </div>
        </div>

        {/* Form */}
        <Card variant="glass" className="p-8">
          <form onSubmit={handleSubmit}>
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-8"
            >
              <AnimatePresence mode="wait">
                {formFields.map((field, index) => (
                  index <= currentStep && (
                    <motion.div
                      key={field.key}
                      variants={fieldVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      layout
                    >
                      <div className="relative">
                        <Input
                          label={field.label}
                          type={field.type}
                          placeholder={field.placeholder}
                          value={formData[field.key]}
                          onChange={(e) => handleInputChange(field.key, e.target.value)}
                          error={errors[field.key]}
                          icon={
                            <motion.span
                              className="text-xl"
                              animate={{ rotate: [0, 10, -10, 0] }}
                              transition={{ duration: 2, repeat: Infinity, delay: index * 0.5 }}
                            >
                              {field.icon}
                            </motion.span>
                          }
                          className="text-lg"
                        />
                        
                        {/* Field completion indicator */}
                        <AnimatePresence>
                          {formData[field.key] && !errors[field.key] && (
                            <motion.div
                              className="absolute -right-2 top-1/2 transform -translate-y-1/2"
                              initial={{ scale: 0, rotate: -180 }}
                              animate={{ scale: 1, rotate: 0 }}
                              exit={{ scale: 0, rotate: 180 }}
                              transition={{ type: "spring", stiffness: 200 }}
                            >
                              <div className="w-8 h-8 bg-accent-green rounded-full flex items-center justify-center">
                                <span className="text-white text-sm">✓</span>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  )
                ))}
              </AnimatePresence>
            </motion.div>

            {/* Submit Button */}
            <AnimatePresence>
              {currentStep >= formFields.length - 1 && (
                <motion.div
                  className="mt-12 text-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    isLoading={isSubmitting}
                    className="px-12 py-4 text-xl lewish-text"
                  >
                    {isSubmitting ? 'PROCESSING...' : 'CONTINUE TO FEEDBACK ✨'}
                  </Button>
                  
                  <motion.p
                    className="text-gray-400 text-sm mt-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                  >
                    Your information is secure and will only be used for feedback purposes
                  </motion.p>
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </Card>

        {/* Help Text */}
        <motion.div
          className="text-center mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <p className="text-gray-500 text-sm">
            Having trouble? The form will guide you through each step automatically.
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default StudentInfoForm;