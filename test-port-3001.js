// Quick test for port 3001
const testAPI = async () => {
  console.log('🧪 Testing API on port 3001...');
  
  try {
    // Test simple endpoint first
    const testResponse = await fetch('http://localhost:3001/api/test');
    console.log('Test endpoint status:', testResponse.status);
    
    if (testResponse.ok) {
      const testData = await testResponse.json();
      console.log('✅ Test endpoint working:', testData);
    }
  } catch (error) {
    console.log('❌ Test endpoint failed:', error.message);
  }

  try {
    // Test feedback submission
    const feedbackData = {
      name: "Port Test User",
      phoneNumber: "1234567890",
      teachingSkills: 9,
      realWorldExplanation: 8,
      overallSatisfaction: 9,
      realWorldTopics: true,
      futureTopics: ["JavaScript", "React"],
      teachingPace: "PERFECT",
      additionalComments: "Testing port 3001",
      sessionDuration: 120
    };

    console.log('🚀 Testing feedback submission...');
    const response = await fetch('http://localhost:3001/api/feedback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(feedbackData)
    });

    console.log('Feedback response status:', response.status);
    const result = await response.json();
    console.log('Feedback response:', result);

    if (result.success) {
      console.log('✅ Feedback submission successful!');
    } else {
      console.log('❌ Feedback submission failed:', result.error);
    }

  } catch (error) {
    console.error('❌ Network error:', error.message);
  }
};

// Run the test
testAPI();