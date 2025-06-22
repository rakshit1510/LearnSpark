const paymentSuccessEmail = (name, amount, orderId, paymentId) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Payment Confirmation</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          background-color: #f4f4f4;
          padding: 20px;
          color: #333;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #ffffff;
          padding: 30px;
          border-radius: 8px;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        h2 {
          color: #4caf50;
        }
        .details {
          margin-top: 20px;
          line-height: 1.6;
        }
        .footer {
          margin-top: 30px;
          font-size: 0.9rem;
          color: #888;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h2>Payment Received Successfully</h2>
        <p>Hi <strong>${name}</strong>,</p>
        <p>Thank you for your payment. Here are the details of your transaction:</p>
        <div class="details">
          <p><strong>Amount Paid:</strong> ₹${amount.toFixed(2)}</p>
          <p><strong>Order ID:</strong> ${orderId}</p>
          <p><strong>Payment ID:</strong> ${paymentId}</p>
        </div>
        <p>If you have any questions or concerns, feel free to contact our support team.</p>
        <div class="footer">
          <p>— LearnSpark Team</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

export default paymentSuccessEmail;
