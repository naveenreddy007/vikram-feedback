// Using built-in fetch API (Node.js 18+)

async function testAdminDashboard() {
  try {
    console.log('Testing admin dashboard API...');
    console.log('Fetching from: http://localhost:3001/api/admin/dashboard');
    
    // Test the admin dashboard API endpoint
    const response = await fetch('http://localhost:3001/api/admin/dashboard');
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    console.log('✅ Admin dashboard API response:');
    console.log('Total feedback:', data.totalFeedback);
    console.log('Average overall satisfaction:', data.averageRating);
    console.log('Teaching pace stats:', data.teachingPaceStats);
    console.log('Device type stats:', data.deviceTypeStats);
    console.log('Real world topics stats:', data.realWorldTopicsStats);
    console.log('Recent feedback count:', data.recentFeedback?.length || 0);
    
    if (data.recentFeedback && data.recentFeedback.length > 0) {
      console.log('\nRecent feedback entries:');
      data.recentFeedback.forEach((feedback, index) => {
        console.log(`${index + 1}. ${feedback.name} - ${feedback.overallSatisfaction}/10`);
      });
    }
    
    console.log('\n🎉 Admin dashboard API is working correctly!');
    
  } catch (error) {
    console.error('❌ Error testing admin dashboard:', error.message);
  }
}

testAdminDashboard();