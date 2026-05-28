'use strict';
const { randomUUID } = require('crypto');

module.exports = {
  up: async (queryInterface) => {
    const now = new Date();

    // FAQs require a valid `created_by` user id because of FK constraints.
    // Prefer admin/manager accounts; fallback to any existing user.
    const preferredCreator = await queryInterface.sequelize.query(
      `SELECT id
       FROM users
       WHERE user_type IN ('admin', 'manager')
       ORDER BY created_at ASC
       LIMIT 1`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    const fallbackCreator = preferredCreator.length
      ? preferredCreator
      : await queryInterface.sequelize.query(
          `SELECT id
           FROM users
           ORDER BY created_at ASC
           LIMIT 1`,
          { type: queryInterface.sequelize.QueryTypes.SELECT }
        );

    if (!fallbackCreator.length) {
      console.warn('Skipping FAQ seed: no users found. Rerun after creating a user.');
      return;
    }

    const createdBy = fallbackCreator[0].id;

    const faqs = [
      {
        question: 'How do I create an access code for a visitor?',
        answer: 'Go to Home and tap Access Code. Enter the visitor name, choose validity period, and generate the code.',
        category: 'access_codes',
        order_index: 1
      },
      {
        question: 'Can I revoke an access code after sharing it?',
        answer: 'Yes. Open the generated access code and use Revoke Access to invalidate it immediately.',
        category: 'access_codes',
        order_index: 2
      },
      {
        question: 'Why is my access code showing as expired?',
        answer: 'Access codes automatically expire at the selected end time. Create a new one if the previous code has expired.',
        category: 'access_codes',
        order_index: 3
      },
      {
        question: 'How do I update my profile information?',
        answer: 'Open Profile from the sidebar, tap Edit Profile, update your details, and save.',
        category: 'general',
        order_index: 1
      },
      {
        question: 'How do I contact estate support?',
        answer: 'Use the Support section in the sidebar to create a ticket or contact your estate management team.',
        category: 'general',
        order_index: 2
      },
      {
        question: 'What should I do if I suspect unauthorized access?',
        answer: 'Immediately revoke active codes, notify security, and report the incident through Support.',
        category: 'security',
        order_index: 1
      },
      {
        question: 'How does Lockwise protect my account?',
        answer: 'Lockwise uses authenticated sessions, role-based permissions, and monitored access operations.',
        category: 'security',
        order_index: 2
      },
      {
        question: 'I am not receiving notifications. What can I do?',
        answer: 'Check app notification permissions on your phone, then log out and log in again to refresh device registration.',
        category: 'technical',
        order_index: 1
      },
      {
        question: 'Why am I unable to upload my profile photo?',
        answer: 'Ensure your image is valid and under size limits, and confirm your internet connection is stable.',
        category: 'technical',
        order_index: 2
      },
      {
        question: 'How are payment reminders handled?',
        answer: 'Payment reminders are sent through your configured channels and can be viewed in your notifications.',
        category: 'payments',
        order_index: 1
      }
    ];

    const existingFaqs = await queryInterface.sequelize.query(
      'SELECT question FROM faqs',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    const existingQuestions = new Set(existingFaqs.map((f) => f.question));

    const rowsToInsert = faqs
      .filter((faq) => !existingQuestions.has(faq.question))
      .map((faq) => ({
        id: randomUUID(),
        ...faq,
        is_active: true,
        created_by: createdBy,
        created_at: now,
        updated_at: now
      }));

    if (rowsToInsert.length > 0) {
      await queryInterface.bulkInsert('faqs', rowsToInsert);
    }
  },

  down: async (queryInterface) => {
    const questions = [
      'How do I create an access code for a visitor?',
      'Can I revoke an access code after sharing it?',
      'Why is my access code showing as expired?',
      'How do I update my profile information?',
      'How do I contact estate support?',
      'What should I do if I suspect unauthorized access?',
      'How does Lockwise protect my account?',
      'I am not receiving notifications. What can I do?',
      'Why am I unable to upload my profile photo?',
      'How are payment reminders handled?'
    ];

    await queryInterface.bulkDelete('faqs', {
      question: questions
    }, {});
  }
};
