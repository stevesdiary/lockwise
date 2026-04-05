'use strict';

const { randomUUID } = require('crypto');

const FAQS = [
  { question: 'How do I create an access code for a visitor?', answer: 'Go to Home and tap Access Code. Enter the visitor name, choose validity period, and generate the code.', category: 'access_codes', order_index: 1 },
  { question: 'Can I revoke an access code after sharing it?', answer: 'Yes. Open the generated access code and use Revoke Access to invalidate it immediately.', category: 'access_codes', order_index: 2 },
  { question: 'Why is my access code showing as expired?', answer: 'Access codes automatically expire at the selected end time. Create a new one if the previous code has expired.', category: 'access_codes', order_index: 3 },
  { question: 'Can a visitor use the same access code multiple times?', answer: 'By default each code is single-use. When creating a code you can enable Multiple Entry and set a maximum number of entries, or leave it unlimited for recurring visitors.', category: 'access_codes', order_index: 4 },
  { question: 'How do I update my profile information?', answer: 'Open Profile from the sidebar, tap Edit Profile, update your details, and save.', category: 'general', order_index: 1 },
  { question: 'How do I contact estate support?', answer: 'Use the Help & Support option in the sidebar to start a WhatsApp chat or send an email to our support team.', category: 'general', order_index: 2 },
  { question: 'What should I do if I suspect unauthorized access?', answer: 'Immediately revoke active codes, notify security, and report the incident through Support.', category: 'security', order_index: 1 },
  { question: 'How does Lockwise protect my account?', answer: 'Lockwise uses authenticated sessions, role-based permissions, and monitored access operations.', category: 'security', order_index: 2 },
  { question: 'I am not receiving notifications. What can I do?', answer: 'Check app notification permissions on your phone, then log out and log in again to refresh device registration.', category: 'technical', order_index: 1 },
  { question: 'Why am I unable to upload my profile photo?', answer: 'Ensure your image is valid and under 5 MB, and confirm your internet connection is stable.', category: 'technical', order_index: 2 },
  { question: 'How are payment reminders handled?', answer: 'Payment reminders are sent through your configured channels and can be viewed in your notifications.', category: 'payments', order_index: 1 },
  { question: 'What payment methods are accepted?', answer: 'Lockwise accepts payments via Paystack, which supports all major Nigerian debit/credit cards.', category: 'payments', order_index: 2 },
];

module.exports = {
  async up(queryInterface) {
    const now = new Date();

    // Prefer an admin/manager user as created_by; fall back to any user.
    const [creators] = await queryInterface.sequelize.query(
      `SELECT id FROM users WHERE user_type IN ('admin', 'manager') ORDER BY created_at ASC LIMIT 1`
    );
    const [fallback] = await queryInterface.sequelize.query(
      `SELECT id FROM users ORDER BY created_at ASC LIMIT 1`
    );

    const createdBy = (creators[0] || fallback[0])?.id;
    if (!createdBy) {
      console.warn('Skipping FAQ seed: no users found.');
      return;
    }

    const existing = await queryInterface.sequelize.query(
      `SELECT question FROM faqs`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );
    const existingSet = new Set(existing.map((r) => r.question));

    const rows = FAQS
      .filter((f) => !existingSet.has(f.question))
      .map((f) => ({ id: randomUUID(), ...f, is_active: true, created_by: createdBy, created_at: now, updated_at: now }));

    if (rows.length > 0) {
      await queryInterface.bulkInsert('faqs', rows);
      console.log(`✓ Seeded ${rows.length} FAQs`);
    }
  },

  async down(queryInterface) {
    const questions = FAQS.map((f) => f.question);
    await queryInterface.bulkDelete('faqs', { question: questions }, {});
  }
};
