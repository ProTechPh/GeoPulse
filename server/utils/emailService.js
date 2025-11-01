import nodemailer from 'nodemailer'
import dotenv from 'dotenv'

dotenv.config()

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
})

// Verify transporter connection
transporter.verify((error, success) => {
  if (error) {
    console.log('SMTP connection error:', error)
  } else {
    console.log('SMTP server is ready to send messages')
  }
})

/**
 * Send incident alert email
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.incidentTitle - Incident title
 * @param {string} options.incidentCategory - Incident category
 * @param {string} options.incidentSeverity - Incident severity
 * @param {number} options.distance - Distance from user in meters
 * @param {string} options.mapUrl - URL to view incident on map
 */
export async function sendIncidentAlert({
  to,
  incidentTitle,
  incidentCategory,
  incidentSeverity,
  distance,
  mapUrl
}) {
  const severityColors = {
    low: '#10b981',
    medium: '#f59e0b',
    high: '#ef4444',
    critical: '#dc2626'
  }

  const mailOptions = {
    from: `GeoPulse System <${process.env.SMTP_USER}>`,
    to,
    subject: `🚨 New Incident Near You: ${incidentTitle}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            border: 1px solid #ddd;
            border-radius: 10px;
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            border-radius: 10px 10px 0 0;
            text-align: center;
          }
          .content {
            padding: 20px;
          }
          .severity-badge {
            display: inline-block;
            padding: 5px 15px;
            border-radius: 20px;
            color: white;
            font-weight: bold;
            text-transform: uppercase;
            background-color: ${severityColors[incidentSeverity] || '#6b7280'};
          }
          .button {
            display: inline-block;
            padding: 12px 30px;
            background-color: #667eea;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
          }
          .footer {
            text-align: center;
            padding: 20px;
            color: #666;
            font-size: 12px;
            border-top: 1px solid #ddd;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🚨 Incident Alert</h1>
          </div>
          <div class="content">
            <p>A new incident has been reported in your area:</p>
            
            <h2>${incidentTitle}</h2>
            
            <p><strong>Category:</strong> ${incidentCategory}</p>
            <p><strong>Severity:</strong> <span class="severity-badge">${incidentSeverity}</span></p>
            <p><strong>Distance:</strong> Approximately ${distance < 1000 ? distance + 'm' : (distance / 1000).toFixed(2) + 'km'} away</p>
            
            <center>
              <a href="${mapUrl}" class="button">View on Map</a>
            </center>
            
            <p style="margin-top: 30px; font-size: 14px; color: #666;">
              Stay safe and follow instructions from authorities.
            </p>
          </div>
          <div class="footer">
            <p>This is an automated alert from GeoPulse Incident Reporting System.</p>
            <p>You're receiving this because incident notifications are enabled in your account.</p>
          </div>
        </div>
      </body>
      </html>
    `
  }

  try {
    const info = await transporter.sendMail(mailOptions)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error('Error sending email:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Send status update email
 */
export async function sendStatusUpdate({ to, incidentTitle, oldStatus, newStatus, mapUrl }) {
  const mailOptions = {
    from: `GeoPulse System <${process.env.SMTP_USER}>`,
    to,
    subject: `Update: ${incidentTitle}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            border: 1px solid #ddd;
            border-radius: 10px;
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            border-radius: 10px 10px 0 0;
            text-align: center;
          }
          .content {
            padding: 20px;
          }
          .status-change {
            background-color: #f0f9ff;
            border-left: 4px solid #667eea;
            padding: 15px;
            margin: 20px 0;
          }
          .button {
            display: inline-block;
            padding: 12px 30px;
            background-color: #667eea;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
          }
          .footer {
            text-align: center;
            padding: 20px;
            color: #666;
            font-size: 12px;
            border-top: 1px solid #ddd;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📋 Status Update</h1>
          </div>
          <div class="content">
            <p>The incident you're following has been updated:</p>
            
            <h2>${incidentTitle}</h2>
            
            <div class="status-change">
              <p><strong>Status Changed:</strong></p>
              <p>${oldStatus} → ${newStatus}</p>
            </div>
            
            <center>
              <a href="${mapUrl}" class="button">View Details</a>
            </center>
          </div>
          <div class="footer">
            <p>GeoPulse Incident Reporting System</p>
          </div>
        </div>
      </body>
      </html>
    `
  }

  try {
    const info = await transporter.sendMail(mailOptions)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error('Error sending email:', error)
    return { success: false, error: error.message }
  }
}
