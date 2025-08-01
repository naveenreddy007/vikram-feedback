import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    res.status(405).json({
      success: false,
      error: {
        code: 'METHOD_NOT_ALLOWED',
        message: `Method ${req.method} not allowed`
      }
    });
    return;
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
            overflow-x: auto;
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
            animation: glow 2s ease-in-out infinite alternate;
        }

        @keyframes glow {
            from { text-shadow: 0 0 20px rgba(0, 255, 136, 0.5); }
            to { text-shadow: 0 0 30px rgba(0, 255, 136, 0.8); }
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
            transition: all 0.3s ease;
        }

        .stat-card:hover {
            background: rgba(0, 255, 136, 0.15);
            transform: translateY(-5px);
            box-shadow: 0 5px 15px rgba(0, 255, 136, 0.3);
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
            font-size: 0.9rem;
        }

        .table-container {
            overflow-x: auto;
            border-radius: 10px;
            border: 1px solid rgba(0, 255, 136, 0.3);
            max-height: 70vh;
            overflow-y: auto;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            background: rgba(0, 0, 0, 0.9);
            min-width: 1200px;
        }

        th, td {
            padding: 12px 15px;
            text-align: left;
            border-bottom: 1px solid rgba(0, 255, 136, 0.2);
            font-size: 0.9rem;
            white-space: nowrap;
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
            padding: 4px 8px;
            border-radius: 4px;
        }

        .rating.high {
            background: rgba(0, 255, 0, 0.2);
            color: #00ff00;
            text-shadow: 0 0 5px rgba(0, 255, 0, 0.5);
        }

        .rating.medium {
            background: rgba(255, 255, 0, 0.2);
            color: #ffff00;
            text-shadow: 0 0 5px rgba(255, 255, 0, 0.5);
        }

        .rating.low {
            background: rgba(255, 102, 0, 0.2);
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

        .pace-too-fast {
            background: rgba(255, 136, 0, 0.2);
            color: #ff8800;
        }

        .pace-too-slow {
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
            z-index: 1000;
        }

        .refresh-btn:hover {
            background: rgba(0, 255, 136, 0.3);
            box-shadow: 0 0 15px rgba(0, 255, 136, 0.5);
        }

        .env-badge {
            position: fixed;
            top: 20px;
            left: 20px;
            background: rgba(255, 136, 0, 0.2);
            border: 1px solid rgba(255, 136, 0, 0.5);
            color: #ff8800;
            padding: 5px 10px;
            border-radius: 5px;
            font-size: 0.8rem;
            z-index: 1000;
        }

        .footer {
            text-align: center;
            margin-top: 30px;
            color: #666;
            font-size: 0.9rem;
            padding: 20px;
            border-top: 1px solid rgba(0, 255, 136, 0.2);
        }

        .footer a {
            color: #00ff88;
            text-decoration: none;
            margin: 0 10px;
            transition: color 0.3s ease;
        }

        .footer a:hover {
            color: #88ffaa;
            text-shadow: 0 0 5px rgba(0, 255, 136, 0.5);
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

            .stats {
                grid-template-columns: repeat(2, 1fr);
            }
        }

        /* Matrix rain effect */
        .matrix-rain {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: -1;
            opacity: 0.1;
        }
    </style>
</head>
<body>
    <div class="matrix-rain"></div>
    <div class="env-badge">🔧 Development</div>
    <a href="/api/get-data" class="refresh-btn">🔄 Refresh</a>
    
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
                '<div class="no-data">📝 No feedback data available yet.<br><br>Submit some feedback to see it here!<br><br><a href="/" style="color: #00ff88;">Go to Feedback Form</a></div>' :
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
                                <td><code>${feedback.id.slice(-8)}</code></td>
                                <td><strong>${feedback.name}</strong></td>
                                <td>${feedback.email || '<em>N/A</em>'}</td>
                                <td>${feedback.phoneNumber}</td>
                                <td><span class="rating ${feedback.teachingSkills >= 8 ? 'high' : feedback.teachingSkills >= 6 ? 'medium' : 'low'}">${feedback.teachingSkills}/10</span></td>
                                <td><span class="rating ${feedback.realWorldExplanation >= 8 ? 'high' : feedback.realWorldExplanation >= 6 ? 'medium' : 'low'}">${feedback.realWorldExplanation}/10</span></td>
                                <td><span class="rating ${feedback.overallSatisfaction >= 8 ? 'high' : feedback.overallSatisfaction >= 6 ? 'medium' : 'low'}">${feedback.overallSatisfaction}/10</span></td>
                                <td>${feedback.realWorldTopics ? '✅ Yes' : '❌ No'}</td>
                                <td class="topics" title="${feedback.futureTopics.join(', ')}">${feedback.futureTopics.join(', ')}</td>
                                <td><span class="pace pace-${feedback.teachingPace.toLowerCase().replace('_', '-')}">${feedback.teachingPace.replace('_', ' ')}</span></td>
                                <td class="comments" title="${feedback.additionalComments || 'No comments'}">${feedback.additionalComments || '<em>No comments</em>'}</td>
                                <td><span class="device-type device-${feedback.deviceType.toLowerCase()}">${feedback.deviceType}</span></td>
                                <td>${Math.floor(feedback.sessionDuration / 60)}m ${feedback.sessionDuration % 60}s</td>
                                <td class="timestamp">${new Date(feedback.submittedAt).toLocaleString()}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>`
            }
        </div>
        
        <div class="footer">
            Last updated: ${new Date().toLocaleString()}<br>
            <a href="/api/feedback">📊 JSON API</a>
            <a href="/?admin=true">🔐 Admin Dashboard</a>
            <a href="/">🏠 Home</a>
        </div>
    </div>

    <script>
        // Auto-refresh every 30 seconds
        setTimeout(() => {
            window.location.reload();
        }, 30000);
        
        // Matrix rain effect
        function createMatrixRain() {
            const matrixContainer = document.querySelector('.matrix-rain');
            const chars = '01';
            
            setInterval(() => {
                const span = document.createElement('span');
                span.textContent = chars[Math.floor(Math.random() * chars.length)];
                span.style.position = 'absolute';
                span.style.left = Math.random() * window.innerWidth + 'px';
                span.style.top = '-20px';
                span.style.color = 'rgba(0, 255, 136, 0.3)';
                span.style.fontSize = '14px';
                span.style.fontFamily = 'Courier New, monospace';
                span.style.animation = 'fall 3s linear forwards';
                
                matrixContainer.appendChild(span);
                
                setTimeout(() => {
                    span.remove();
                }, 3000);
            }, 100);
        }
        
        // Add CSS for falling animation
        const style = document.createElement('style');
        style.textContent = \`
            @keyframes fall {
                to {
                    transform: translateY(\${window.innerHeight + 20}px);
                    opacity: 0;
                }
            }
        \`;
        document.head.appendChild(style);
        
        createMatrixRain();
    </script>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(html);

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
            background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
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
            box-shadow: 0 0 30px rgba(255, 68, 68, 0.2);
        }
        h1 { 
            color: #ff4444; 
            margin-bottom: 20px; 
            text-shadow: 0 0 10px rgba(255, 68, 68, 0.5);
        }
        .error-message { 
            color: #ffaaaa; 
            margin-bottom: 20px; 
            line-height: 1.6;
        }
        .retry-btn {
            background: rgba(255, 68, 68, 0.2);
            border: 1px solid #ff4444;
            color: #ff4444;
            padding: 10px 20px;
            border-radius: 5px;
            text-decoration: none;
            display: inline-block;
            margin-top: 20px;
            transition: all 0.3s ease;
        }
        .retry-btn:hover {
            background: rgba(255, 68, 68, 0.3);
            box-shadow: 0 0 15px rgba(255, 68, 68, 0.5);
        }
    </style>
</head>
<body>
    <div class="error-container">
        <h1>❌ Database Error</h1>
        <div class="error-message">Unable to fetch feedback data from the database.</div>
        <div class="error-message">Please check your database connection and try again.</div>
        <div class="error-message">Error: ${error.message}</div>
        <a href="/api/get-data" class="retry-btn">🔄 Retry</a>
        <a href="/" class="retry-btn" style="margin-left: 10px;">🏠 Home</a>
    </div>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html');
    res.status(500).send(errorHtml);
  } finally {
    await prisma.$disconnect();
  }
}