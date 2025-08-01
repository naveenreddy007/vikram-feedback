import { Handler } from '@netlify/functions';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const handler: Handler = async (event, context) => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'text/html',
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({
        success: false,
        error: {
          code: 'METHOD_NOT_ALLOWED',
          message: `Method ${event.httpMethod} not allowed`
        }
      })
    };
  }

  try {
    // Fetch all feedback data
    const feedbackData = await prisma.studentFeedback.findMany({
      orderBy: {
        submittedAt: 'desc'
      }
    });

    // Generate HTML table
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Feedback Data - Teacher Review System</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
            color: #00ff88;
            font-family: 'Courier New', monospace;
            min-height: 100vh;
            padding: 20px;
        }

        .container {
            max-width: 100%;
            margin: 0 auto;
            background: rgba(0, 0, 0, 0.8);
            border-radius: 10px;
            padding: 30px;
            box-shadow: 0 0 30px rgba(0, 255, 136, 0.2);
            border: 1px solid rgba(0, 255, 136, 0.3);
        }

        h1 {
            text-align: center;
            margin-bottom: 30px;
            font-size: 2.5rem;
            text-shadow: 0 0 20px rgba(0, 255, 136, 0.5);
            color: #00ff88;
        }

        .stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }

        .stat-card {
            background: rgba(0, 255, 136, 0.1);
            border: 1px solid rgba(0, 255, 136, 0.3);
            border-radius: 8px;
            padding: 20px;
            text-align: center;
        }

        .stat-number {
            font-size: 2rem;
            font-weight: bold;
            color: #00ff88;
            text-shadow: 0 0 10px rgba(0, 255, 136, 0.5);
        }

        .stat-label {
            color: #88ffaa;
            margin-top: 5px;
        }

        .table-container {
            overflow-x: auto;
            border-radius: 10px;
            border: 1px solid rgba(0, 255, 136, 0.3);
        }

        table {
            width: 100%;
            border-collapse: collapse;
            background: rgba(0, 0, 0, 0.9);
        }

        th, td {
            padding: 12px 15px;
            text-align: left;
            border-bottom: 1px solid rgba(0, 255, 136, 0.2);
            font-size: 0.9rem;
        }

        th {
            background: rgba(0, 255, 136, 0.2);
            color: #00ff88;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 1px;
            text-shadow: 0 0 5px rgba(0, 255, 136, 0.5);
            position: sticky;
            top: 0;
            z-index: 10;
        }

        tr:hover {
            background: rgba(0, 255, 136, 0.05);
            transform: scale(1.01);
            transition: all 0.3s ease;
        }

        td {
            color: #88ffaa;
        }

        .rating {
            color: #00ff88;
            font-weight: bold;
        }

        .rating.high {
            color: #00ff00;
            text-shadow: 0 0 5px rgba(0, 255, 0, 0.5);
        }

        .rating.medium {
            color: #ffff00;
            text-shadow: 0 0 5px rgba(255, 255, 0, 0.5);
        }

        .rating.low {
            color: #ff6600;
            text-shadow: 0 0 5px rgba(255, 102, 0, 0.5);
        }

        .device-type {
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 0.8rem;
            font-weight: bold;
        }

        .device-mobile {
            background: rgba(0, 255, 136, 0.2);
            color: #00ff88;
        }

        .device-desktop {
            background: rgba(0, 136, 255, 0.2);
            color: #0088ff;
        }

        .device-tablet {
            background: rgba(255, 136, 0, 0.2);
            color: #ff8800;
        }

        .pace {
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 0.8rem;
            font-weight: bold;
        }

        .pace-perfect {
            background: rgba(0, 255, 0, 0.2);
            color: #00ff00;
        }

        .pace-fast {
            background: rgba(255, 136, 0, 0.2);
            color: #ff8800;
        }

        .pace-slow {
            background: rgba(255, 0, 0, 0.2);
            color: #ff0000;
        }

        .topics {
            max-width: 200px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        .comments {
            max-width: 300px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        .timestamp {
            color: #66cc88;
            font-size: 0.8rem;
        }

        .no-data {
            text-align: center;
            padding: 50px;
            color: #666;
            font-size: 1.2rem;
        }

        @media (max-width: 768px) {
            .container {
                padding: 15px;
            }
            
            h1 {
                font-size: 1.8rem;
            }
            
            th, td {
                padding: 8px 10px;
                font-size: 0.8rem;
            }
        }

        .refresh-btn {
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(0, 255, 136, 0.2);
            border: 1px solid rgba(0, 255, 136, 0.5);
            color: #00ff88;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            font-family: 'Courier New', monospace;
            text-decoration: none;
            transition: all 0.3s ease;
        }

        .refresh-btn:hover {
            background: rgba(0, 255, 136, 0.3);
            box-shadow: 0 0 15px rgba(0, 255, 136, 0.5);
        }
    </style>
</head>
<body>
    <a href="/api/get/data" class="refresh-btn">🔄 Refresh</a>
    
    <div class="container">
        <h1>📊 Feedback Database</h1>
        
        <div class="stats">
            <div class="stat-card">
                <div class="stat-number">${feedbackData.length}</div>
                <div class="stat-label">Total Feedback</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${feedbackData.length > 0 ? (feedbackData.reduce((sum, f) => sum + f.teachingSkills, 0) / feedbackData.length).toFixed(1) : '0'}</div>
                <div class="stat-label">Avg Teaching Skills</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${feedbackData.length > 0 ? (feedbackData.reduce((sum, f) => sum + f.realWorldExplanation, 0) / feedbackData.length).toFixed(1) : '0'}</div>
                <div class="stat-label">Avg Real World</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${feedbackData.length > 0 ? (feedbackData.reduce((sum, f) => sum + f.overallSatisfaction, 0) / feedbackData.length).toFixed(1) : '0'}</div>
                <div class="stat-label">Avg Satisfaction</div>
            </div>
        </div>

        <div class="table-container">
            ${feedbackData.length === 0 ? 
                '<div class="no-data">No feedback data available yet. Submit some feedback to see it here!</div>' :
                `<table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th>Teaching Skills</th>
                            <th>Real World</th>
                            <th>Satisfaction</th>
                            <th>Real World Topics</th>
                            <th>Future Topics</th>
                            <th>Teaching Pace</th>
                            <th>Comments</th>
                            <th>Device</th>
                            <th>Session Duration</th>
                            <th>Submitted At</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${feedbackData.map(feedback => `
                            <tr>
                                <td>${feedback.id.slice(-8)}</td>
                                <td>${feedback.name}</td>
                                <td>${feedback.email || 'N/A'}</td>
                                <td>${feedback.phoneNumber}</td>
                                <td><span class="rating ${feedback.teachingSkills >= 8 ? 'high' : feedback.teachingSkills >= 6 ? 'medium' : 'low'}">${feedback.teachingSkills}/10</span></td>
                                <td><span class="rating ${feedback.realWorldExplanation >= 8 ? 'high' : feedback.realWorldExplanation >= 6 ? 'medium' : 'low'}">${feedback.realWorldExplanation}/10</span></td>
                                <td><span class="rating ${feedback.overallSatisfaction >= 8 ? 'high' : feedback.overallSatisfaction >= 6 ? 'medium' : 'low'}">${feedback.overallSatisfaction}/10</span></td>
                                <td>${feedback.realWorldTopics ? '✅ Yes' : '❌ No'}</td>
                                <td class="topics" title="${feedback.futureTopics.join(', ')}">${feedback.futureTopics.join(', ')}</td>
                                <td><span class="pace pace-${feedback.teachingPace.toLowerCase().replace('_', '-')}">${feedback.teachingPace.replace('_', ' ')}</span></td>
                                <td class="comments" title="${feedback.additionalComments}">${feedback.additionalComments || 'No comments'}</td>
                                <td><span class="device-type device-${feedback.deviceType.toLowerCase()}">${feedback.deviceType}</span></td>
                                <td>${Math.floor(feedback.sessionDuration / 60)}m ${feedback.sessionDuration % 60}s</td>
                                <td class="timestamp">${new Date(feedback.submittedAt).toLocaleString()}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>`
            }
        </div>
        
        <div style="text-align: center; margin-top: 30px; color: #666; font-size: 0.9rem;">
            Last updated: ${new Date().toLocaleString()} | 
            <a href="/api/feedback" style="color: #00ff88;">JSON API</a> | 
            <a href="/?admin=true" style="color: #00ff88;">Admin Dashboard</a>
        </div>
    </div>

    <script>
        // Auto-refresh every 30 seconds
        setTimeout(() => {
            window.location.reload();
        }, 30000);
        
        // Add some matrix-like effect
        setInterval(() => {
            const chars = '01';
            const randomChar = chars[Math.floor(Math.random() * chars.length)];
            const x = Math.random() * window.innerWidth;
            const y = Math.random() * window.innerHeight;
            
            const span = document.createElement('span');
            span.textContent = randomChar;
            span.style.position = 'fixed';
            span.style.left = x + 'px';
            span.style.top = y + 'px';
            span.style.color = 'rgba(0, 255, 136, 0.3)';
            span.style.fontSize = '12px';
            span.style.pointerEvents = 'none';
            span.style.zIndex = '-1';
            
            document.body.appendChild(span);
            
            setTimeout(() => {
                span.remove();
            }, 2000);
        }, 500);
    </script>
</body>
</html>`;

    return {
      statusCode: 200,
      headers,
      body: html
    };

  } catch (error) {
    console.error('Database Error:', error);
    
    const errorHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Error - Feedback Data</title>
    <style>
        body {
            background: #0a0a0a;
            color: #ff4444;
            font-family: 'Courier New', monospace;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
        }
        .error-container {
            text-align: center;
            padding: 40px;
            border: 1px solid #ff4444;
            border-radius: 10px;
            background: rgba(255, 68, 68, 0.1);
        }
        h1 { color: #ff4444; margin-bottom: 20px; }
        .error-message { color: #ffaaaa; margin-bottom: 20px; }
        .retry-btn {
            background: rgba(255, 68, 68, 0.2);
            border: 1px solid #ff4444;
            color: #ff4444;
            padding: 10px 20px;
            border-radius: 5px;
            text-decoration: none;
            display: inline-block;
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <div class="error-container">
        <h1>❌ Database Error</h1>
        <div class="error-message">Unable to fetch feedback data from the database.</div>
        <div class="error-message">Please check your database connection and try again.</div>
        <a href="/api/get/data" class="retry-btn">🔄 Retry</a>
    </div>
</body>
</html>`;

    return {
      statusCode: 500,
      headers,
      body: errorHtml
    };
  } finally {
    await prisma.$disconnect();
  }
};