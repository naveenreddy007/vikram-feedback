import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button, Card, PageTransition } from './components/ui'
import ThreeBackground from './components/ThreeBackground'
import ParticleSystem from './components/ParticleSystem'
import Hero from './components/Hero'
import FeaturesSection from './components/FeaturesSection'
import AboutSection from './components/AboutSection'
import StudentInfoForm from './components/StudentInfoForm'
import FeedbackQuestions from './components/FeedbackQuestions'
import AdminLogin from './components/AdminLogin'
import AdminDashboard from './components/AdminDashboard'
import useResponsive3D from './hooks/useResponsive3D'
import './App.css'

interface StudentInfo {
  name: string;
  email?: string;
  phoneNumber: string;
}



function App() {
  const [currentStep, setCurrentStep] = useState('landing') // landing, form, feedback, success, admin-login, admin-dashboard
  const [studentInfo, setStudentInfo] = useState<StudentInfo | null>(null)
  const [adminUser, setAdminUser] = useState<any>(null)
  const responsive3D = useResponsive3D()

  // Check for existing admin session on app load
  useEffect(() => {
    const token = localStorage.getItem('adminToken')
    const user = localStorage.getItem('adminUser')
    
    if (token && user) {
      setAdminUser(JSON.parse(user))
      setCurrentStep('admin-dashboard')
    }

    // Check URL for admin access
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('admin') === 'true') {
      setCurrentStep('admin-login')
    }
  }, [])

  const handleStartReview = () => {
    setCurrentStep('form')
  }

  const handleStudentInfoSubmit = (data: StudentInfo) => {
    setStudentInfo(data)
    setCurrentStep('feedback')
  }

  const handleBackToLanding = () => {
    setCurrentStep('landing')
  }

  const handleFeedbackSubmit = () => {
    setCurrentStep('success')
  }

  const handleAdminLogin = (user: any) => {
    setAdminUser(user)
    setCurrentStep('admin-dashboard')
  }

  const handleAdminLogout = () => {
    localStorage.removeItem('adminToken')
    localStorage.removeItem('adminUser')
    setAdminUser(null)
    setCurrentStep('landing')
  }

  return (
    <PageTransition className="min-h-screen bg-primary-dark text-white overflow-hidden">
      {/* Advanced 3D Background Effects */}
      {responsive3D.enableComplexShapes && <ThreeBackground />}
      {responsive3D.enableParticles && (
        <ParticleSystem 
          particleCount={responsive3D.particleCount}
          interactive={responsive3D.enableInteraction}
        />
      )}
      
      {/* Fallback CSS Background Effects for low-performance devices */}
      {!responsive3D.enableParticles && !responsive3D.enableComplexShapes && (
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-32 h-32 bg-accent-blue/10 rounded-full blur-xl animate-float"></div>
          <div className="absolute top-40 right-20 w-24 h-24 bg-accent-green/10 rounded-full blur-lg animate-float" style={{animationDelay: '2s'}}></div>
          <div className="absolute bottom-32 left-1/4 w-40 h-40 bg-accent-orange/10 rounded-full blur-2xl animate-float" style={{animationDelay: '4s'}}></div>
        </div>
      )}

      <div className="relative z-10">
        {currentStep === 'landing' && (
          <>
            <Hero onStartReview={handleStartReview} />
            <FeaturesSection />
            <AboutSection />
          </>
        )}

        {currentStep === 'form' && (
          <StudentInfoForm
            onNext={handleStudentInfoSubmit}
            onBack={handleBackToLanding}
          />
        )}

        {currentStep === 'feedback' && studentInfo && (
          <FeedbackQuestions
            studentInfo={studentInfo}
            onSubmit={handleFeedbackSubmit}
            onBack={() => setCurrentStep('form')}
          />
        )}

        {currentStep === 'success' && (
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-2xl mx-auto text-center">
              <Card variant="glass" className="p-12">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                  className="text-6xl mb-6"
                >
                  🎉
                </motion.div>
                
                <h2 className="text-4xl font-bold lewish-text text-accent-green mb-6">
                  THANK YOU!
                </h2>
                
                <p className="text-xl text-gray-300 mb-8">
                  Your feedback has been submitted successfully, <span className="text-accent-blue font-semibold">{studentInfo?.name}</span>!
                </p>
                
                <div className="space-y-4 mb-8">
                  <p className="text-gray-400">
                    Your insights will help Vikram improve his teaching methods and create better learning experiences for all students.
                  </p>
                  <div className="flex justify-center space-x-8 text-sm">
                    <div className="text-center">
                      <div className="text-2xl mb-1">⚡</div>
                      <div className="text-accent-blue">Quick Response</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl mb-1">🎯</div>
                      <div className="text-accent-green">Valuable Insights</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl mb-1">🚀</div>
                      <div className="text-accent-orange">Future Improvements</div>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button 
                    variant="primary"
                    size="lg"
                    onClick={handleBackToLanding}
                    className="lewish-text"
                  >
                    RETURN HOME ✨
                  </Button>
                  
                  <Button 
                    variant="secondary"
                    size="lg"
                    onClick={() => setCurrentStep('admin-login')}
                    className="lewish-text"
                  >
                    ADMIN LOGIN 🔐
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        )}

        {currentStep === 'admin-login' && (
          <AdminLogin
            onLogin={handleAdminLogin}
            onBack={handleBackToLanding}
          />
        )}

        {currentStep === 'admin-dashboard' && adminUser && (
          <AdminDashboard
            adminUser={adminUser}
            onLogout={handleAdminLogout}
          />
        )}
      </div>
    </PageTransition>
  )
}

export default App