import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, Card } from './ui';
import RatingSystem from './RatingSystem';
import TypewriterText from './TypewriterText';
import InteractiveToggle from './InteractiveToggle';
import DynamicParticles from './DynamicParticles';
import useHapticFeedback from '../hooks/useHapticFeedback';
import apiService from '../services/api';

interface FeedbackData {
  teachingSkills: number;
  realWorldExplanation: number;
  overallSatisfaction: number;
  realWorldTopics: boolean | null;
  futureTopics: string[];
  teachingPace: 'TOO_FAST' | 'PERFECT' | 'TOO_SLOW' | null;
  additionalComments: string;
}

interface FeedbackQuestionsProps {
  studentInfo: {
    name: string;
    email?: string;
    phoneNumber: string;
  };
  onSubmit: (data: FeedbackData) => void;
  onBack: () => void;
}

const FeedbackQuestions: React.FC<FeedbackQuestionsProps> = ({
  studentInfo,
  onSubmit,
  onBack
}) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [feedbackData, setFeedbackData] = useState<FeedbackData>({
    teachingSkills: 0,
    realWorldExplanation: 0,
    overallSatisfaction: 0,
    realWorldTopics: null,
    futureTopics: [],
    teachingPace: null,
    additionalComments: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showTypewriter, setShowTypewriter] = useState(true);
  const [particleTrigger, setParticleTrigger] = useState(false);
  const [sessionStartTime] = useState(Date.now());
  const [submitError, setSubmitError] = useState<string | null>(null);
  const { feedback } = useHapticFeedback();

  const questions = [
    {
      id: 'teachingSkills',
      type: 'rating',
      question: 'How would you rate my teaching skills?',
      description: 'Consider clarity, engagement, and knowledge delivery',
      key: 'teachingSkills' as keyof FeedbackData
    },
    {
      id: 'realWorldExplanation',
      type: 'rating',
      question: 'How well do I explain real-world applications?',
      description: 'Rate how effectively I connect theory to practical examples',
      key: 'realWorldExplanation' as keyof FeedbackData
    },
    {
      id: 'overallSatisfaction',
      type: 'rating',
      question: 'What is your overall satisfaction with my teaching?',
      description: 'Your general experience and learning outcomes',
      key: 'overallSatisfaction' as keyof FeedbackData
    },
    {
      id: 'realWorldTopics',
      type: 'boolean',
      question: 'Would you like me to explain more real-world topics?',
      description: 'Should I focus more on practical applications?',
      key: 'realWorldTopics' as keyof FeedbackData
    },
    {
      id: 'teachingPace',
      type: 'choice',
      question: 'How do you find my teaching pace?',
      description: 'Is the speed of explanation comfortable for you?',
      key: 'teachingPace' as keyof FeedbackData,
      options: [
        { value: 'TOO_FAST', label: 'Too Fast ⚡', color: 'accent-orange' },
        { value: 'PERFECT', label: 'Perfect 🎯', color: 'accent-green' },
        { value: 'TOO_SLOW', label: 'Too Slow 🐌', color: 'accent-blue' }
      ]
    },
    {
      id: 'futureTopics',
      type: 'text',
      question: 'What topics would you like me to cover in the future?',
      description: "Suggest any engineering topics or technologies you're interested in",
      key: 'futureTopics' as keyof FeedbackData,
      multiline: true
    },
    {
      id: 'additionalComments',
      type: 'text',
      question: 'Any additional comments or suggestions?',
      description: 'Share any other thoughts that could help me improve',
      key: 'additionalComments' as keyof FeedbackData,
      multiline: true
    }
  ];

  const currentQuestionData = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  const handleRatingChange = (rating: number) => {
    setFeedbackData(prev => ({
      ...prev,
      [currentQuestionData.key]: rating
    }));
  };

  const handleBooleanChoice = (choice: boolean) => {
    setFeedbackData(prev => ({
      ...prev,
      [currentQuestionData.key]: choice
    }));
    feedback.click();
  };

  const handleChoiceSelect = (value: string) => {
    setFeedbackData(prev => ({
      ...prev,
      [currentQuestionData.key]: value
    }));
    feedback.click();
  };

  const handleTextChange = (value: string) => {
    if (currentQuestionData.key === 'futureTopics') {
      const topics = value.split(',').map(topic => topic.trim()).filter(topic => topic);
      setFeedbackData(prev => ({
        ...prev,
        [currentQuestionData.key]: topics
      }));
    } else {
      setFeedbackData(prev => ({
        ...prev,
        [currentQuestionData.key]: value
      }));
    }
  };

  const canProceed = () => {
    const current = feedbackData[currentQuestionData.key];
    if (currentQuestionData.type === 'rating') {
      return typeof current === 'number' && current > 0;
    }
    if (currentQuestionData.type === 'boolean' || currentQuestionData.type === 'choice') {
      return current !== null;
    }
    return true; // Text fields are optional
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setShowTypewriter(true);
      setParticleTrigger(true);
      feedback.success();
      setTimeout(() => setParticleTrigger(false), 1000);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
      setShowTypewriter(true);
      feedback.tap();
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError(null);
    feedback.formSubmit();
    
    try {
      // Calculate session duration in seconds
      const sessionDuration = Math.floor((Date.now() - sessionStartTime) / 1000);
      
      const submitData = {
        ...studentInfo,
        ...feedbackData,
        realWorldTopics: feedbackData.realWorldTopics ?? false,
        teachingPace: feedbackData.teachingPace ?? 'PERFECT',
        sessionDuration
      };

      // Submit to API
      const response = await apiService.submitFeedback(submitData);
      
      if (response.success) {
        feedback.success();
        onSubmit(feedbackData);
      } else {
        throw new Error(response.error?.message || 'Failed to submit feedback');
      }
    } catch (error) {
      console.error('Failed to submit feedback:', error);
      feedback.error();
      setSubmitError(error instanceof Error ? error.message : 'Failed to submit feedback. Please try again.');
      setIsSubmitting(false);
    }
  };

  const renderQuestion = () => {
    switch (currentQuestionData.type) {
      case 'rating':
        return (
          <RatingSystem
            question={currentQuestionData.question}
            description={currentQuestionData.description}
            onRatingChange={handleRatingChange}
            currentRating={feedbackData[currentQuestionData.key] as number}
          />
        );

      case 'boolean':
        return (
          <div className="text-center relative">
            {/* Dynamic Particles */}
            <DynamicParticles 
              intensity={0.5} 
              color="#00d4ff" 
              trigger={particleTrigger}
            />
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4"
            >
              <TypewriterText
                text={currentQuestionData.question}
                className="text-2xl md:text-3xl font-bold text-white lewish-text"
                speed={30}
                onComplete={() => setShowTypewriter(false)}
              />
            </motion.div>
            
            <motion.p 
              className="text-gray-300 text-lg mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: showTypewriter ? 0 : 1 }}
              transition={{ delay: 0.5 }}
            >
              {currentQuestionData.description}
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: showTypewriter ? 0 : 1, scale: showTypewriter ? 0.8 : 1 }}
              transition={{ delay: 1 }}
            >
              <InteractiveToggle
                options={[
                  { value: true, label: 'Yes, Please!', icon: '👍', color: 'accent-green', description: 'I would love more real-world examples' },
                  { value: false, label: "No, Thanks", icon: "👎", color: "accent-orange", description: "Current balance is perfect" }
                ]}
                value={feedbackData[currentQuestionData.key] as boolean}
                onChange={(value) => handleBooleanChoice(value as boolean)}
                variant="cards"
                className="max-w-2xl mx-auto"
              />
            </motion.div>
          </div>
        );

      case 'choice':
        return (
          <div className="text-center relative">
            {/* Dynamic Particles */}
            <DynamicParticles 
              intensity={0.3} 
              color="#39ff14" 
              trigger={particleTrigger}
            />
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4"
            >
              <TypewriterText
                text={currentQuestionData.question}
                className="text-2xl md:text-3xl font-bold text-white lewish-text"
                speed={25}
                onComplete={() => setShowTypewriter(false)}
              />
            </motion.div>
            
            <motion.p 
              className="text-gray-300 text-lg mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: showTypewriter ? 0 : 1 }}
              transition={{ delay: 0.5 }}
            >
              {currentQuestionData.description}
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: showTypewriter ? 0 : 1, scale: showTypewriter ? 0.8 : 1 }}
              transition={{ delay: 1 }}
            >
              <InteractiveToggle
                options={currentQuestionData.options?.map(option => ({
                  value: option.value,
                  label: option.label,
                  color: option.color,
                  description: option.value === 'TOO_FAST' ? 'Please slow down a bit' :
                              option.value === 'PERFECT' ? 'The pace is just right' :
                              'Could go a bit faster'
                })) || []}
                value={feedbackData[currentQuestionData.key] as string}
                onChange={(value) => handleChoiceSelect(value as string)}
                variant="cards"
                className="max-w-3xl mx-auto"
              />
            </motion.div>
          </div>
        );

      case 'text':
        return (
          <div className="text-center max-w-2xl mx-auto relative">
            {/* Dynamic Particles */}
            <DynamicParticles 
              intensity={0.2} 
              color="#ff6b35" 
              trigger={particleTrigger}
            />
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4"
            >
              <TypewriterText
                text={currentQuestionData.question}
                className="text-2xl md:text-3xl font-bold text-white lewish-text"
                speed={20}
                onComplete={() => setShowTypewriter(false)}
              />
            </motion.div>
            
            <motion.p 
              className="text-gray-300 text-lg mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: showTypewriter ? 0 : 1 }}
              transition={{ delay: 0.5 }}
            >
              {currentQuestionData.description}
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: showTypewriter ? 0 : 1, scale: showTypewriter ? 0.95 : 1 }}
              transition={{ delay: 1 }}
            >
              <motion.textarea
                className="w-full p-4 glass-dark rounded-lg border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-blue focus:border-accent-blue resize-none transition-all duration-300"
                rows={currentQuestionData.multiline ? 4 : 2}
                placeholder={currentQuestionData.key === 'futureTopics' 
                  ? 'AI, Machine Learning, IoT, Robotics, etc.' 
                  : 'Your thoughts and suggestions...'
                }
                value={currentQuestionData.key === 'futureTopics' 
                  ? (feedbackData[currentQuestionData.key] as string[]).join(', ')
                  : feedbackData[currentQuestionData.key] as string
                }
                onChange={(e) => handleTextChange(e.target.value)}
                whileFocus={{ 
                  scale: 1.02,
                  boxShadow: "0 0 20px rgba(0, 212, 255, 0.3)"
                }}
              />
              
              {/* Character count for text areas */}
              {currentQuestionData.multiline && (
                <motion.div
                  className="text-right text-sm text-gray-500 mt-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.5 }}
                >
                  {currentQuestionData.key === 'futureTopics' 
                    ? `${(feedbackData[currentQuestionData.key] as string[]).join(', ').length} characters`
                    : `${(feedbackData[currentQuestionData.key] as string).length} characters`
                  }
                </motion.div>
              )}
            </motion.div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <Button 
            variant="secondary" 
            size="sm"
            onClick={onBack}
            className="mb-6"
          >
            ← Back to Form
          </Button>
          
          <motion.h1 
            className="text-3xl md:text-4xl lewish-text text-accent-blue mb-4"
            animate={{
              textShadow: [
                "0 0 10px #00d4ff",
                "0 0 20px #00d4ff, 0 0 30px #00d4ff",
                "0 0 10px #00d4ff"
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            FEEDBACK FOR VIKRAM
          </motion.h1>
          
          <p className="text-gray-300 text-lg mb-4">
            Welcome, <span className="text-accent-green font-semibold">{studentInfo.name}</span>!
          </p>

          {/* Progress Bar */}
          <div className="max-w-md mx-auto mb-6">
            <div className="flex justify-between text-sm text-gray-400 mb-2">
              <span>Question {currentQuestion + 1} of {questions.length}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <motion.div
                className="h-2 bg-gradient-to-r from-accent-blue to-accent-green rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        </div>

        {/* Question Card */}
        <Card variant="glass" className="p-8 mb-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.4 }}
            >
              {renderQuestion()}
            </motion.div>
          </AnimatePresence>
        </Card>

        {/* Error Display */}
        <AnimatePresence>
          {submitError && (
            <motion.div
              className="mb-6"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card variant="glass" className="p-4 border-red-500/50 bg-red-500/10">
                <div className="flex items-center space-x-3">
                  <div className="text-red-400 text-xl">⚠️</div>
                  <div>
                    <h4 className="text-red-400 font-semibold">Submission Failed</h4>
                    <p className="text-red-300 text-sm">{submitError}</p>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setSubmitError(null)}
                    className="ml-auto"
                  >
                    ✕
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <Button
            variant="secondary"
            onClick={handlePrevious}
            disabled={currentQuestion === 0 || isSubmitting}
            className={currentQuestion === 0 || isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}
          >
            ← Previous
          </Button>

          <div className="flex space-x-2">
            {questions.map((_, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentQuestion
                    ? 'bg-accent-blue scale-125'
                    : index < currentQuestion
                    ? 'bg-accent-green'
                    : 'bg-gray-600'
                }`}
              />
            ))}
          </div>

          {currentQuestion < questions.length - 1 ? (
            <Button
              variant="primary"
              onClick={handleNext}
              disabled={!canProceed()}
              className={!canProceed() ? 'opacity-50 cursor-not-allowed' : ''}
            >
              Next →
            </Button>
          ) : (
            <Button
              variant="accent"
              onClick={handleSubmit}
              isLoading={isSubmitting}
              disabled={!canProceed()}
              className="lewish-text"
            >
              {isSubmitting ? 'SUBMITTING...' : 'SUBMIT FEEDBACK ✨'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default FeedbackQuestions;