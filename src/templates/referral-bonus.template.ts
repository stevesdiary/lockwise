export const referralBonusTemplate = (data: { name: string; bonus_amount: number; estate_name: string }) => ({
  subject: 'You Earned a Referral Bonus! 🎉',
  html: `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #4CAF50; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .bonus-amount { font-size: 32px; color: #4CAF50; font-weight: bold; text-align: center; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Congratulations ${data.name}!</h1>
        </div>
        <div class="content">
          <p>Great news! You've earned a referral bonus.</p>
          <div class="bonus-amount">₦${data.bonus_amount.toLocaleString()}</div>
          <p><strong>Estate:</strong> ${data.estate_name}</p>
          <p>This bonus has been added to your account and will be processed in the next payout cycle.</p>
          <p>Keep referring more estates to earn even more bonuses!</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} Lockwise. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `
});