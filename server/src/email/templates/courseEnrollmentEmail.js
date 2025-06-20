 const courseEnrollmentEmail = (courseName, name) => {
  return `<!DOCTYPE html>
  <html lang="en">
  
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Enrollment Confirmation</title>
      <style>
          body {
              background-color: #f4f6f8;
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              margin: 0;
              padding: 0;
              color: #333;
          }
  
          .email-container {
              max-width: 650px;
              margin: 40px auto;
              background-color: #ffffff;
              border-radius: 10px;
              overflow: hidden;
              box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          }
  
          .email-header {
              background-color: #111827;
              padding: 30px 20px;
              text-align: center;
              color: #ffffff;
          }
  
          .email-header img {
              max-width: 150px;
              margin-bottom: 10px;
          }
  
          .email-header h1 {
              font-size: 24px;
              margin: 0;
          }
  
          .email-body {
              padding: 30px 25px;
              line-height: 1.6;
              font-size: 16px;
              color: #4b5563;
          }
  
          .email-body .course-name {
              font-weight: 600;
              color: #111827;
          }
  
          .email-body p {
              margin: 10px 0;
          }
  
          .cta-button {
              display: inline-block;
              margin-top: 25px;
              padding: 12px 24px;
              background-color: #3b82f6;
              color: white;
              text-decoration: none;
              border-radius: 6px;
              font-weight: bold;
              transition: background-color 0.3s ease;
          }
  
          .cta-button:hover {
              background-color: #2563eb;
          }
  
          .email-footer {
              font-size: 13px;
              text-align: center;
              color: #9ca3af;
              padding: 20px;
          }
  
          .email-footer a {
              color: #6b7280;
              text-decoration: none;
          }
      </style>
  </head>
  
  <body>
      <div class="email-container">
          <div class="email-header">
           <a href="https://ibb.co/VYBQYvcQ"><img src="https://i.ibb.co/d4KL4QwL/Screenshot-2025-06-20-231953.png" alt="Screenshot-2025-06-20-231953" border="0"></a>
              <h1>Welcome to LearnSpark!</h1>
          </div>
  
          <div class="email-body">
              <p>Hi ${name},</p>
              <p>We're thrilled to confirm your enrollment in the course: <span class="course-name">"${courseName}"</span>.</p>
              <p>Your learning journey starts now. Visit your dashboard to access your course content, assignments, and more.</p>
              <a class="cta-button" href="https://study-notion-mern-stack.netlify.app/dashboard/enrolled-courses">View My Dashboard</a>
          </div>
  
          <div class="email-footer">
              <p>If you need support, feel free to reach out at <a href="mailto:gadeaniruddha2@gmail.com">gadeaniruddha2@gmail.com</a>.</p>
              <p>Thank you for choosing LearnSpark.</p>
          </div>
      </div>
  </body>
  
  </html>`;
};

export default courseEnrollmentEmail;
// This code defines an HTML email template for course enrollment confirmation.