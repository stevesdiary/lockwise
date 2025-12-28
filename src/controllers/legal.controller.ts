import { Request, Response } from 'express';

export const legalController = {
  getTermsAndConditions(req: Request, res: Response) {
    res.status(200).json({
      status: 'success',
      data: {
        title: 'Terms and Conditions',
        lastUpdated: '2025-01-01',
        content: {
          acceptance: 'By accessing and using Lockwise, you accept and agree to be bound by these terms.',
          services: 'Lockwise provides property access management services including access code generation, resident management, and security features.',
          userResponsibilities: [
            'Maintain confidentiality of your account credentials',
            'Use the service only for lawful purposes',
            'Not share access codes with unauthorized persons',
            'Report security breaches immediately'
          ],
          dataUsage: 'We collect and process data as described in our Privacy Policy.',
          liability: 'Lockwise is not liable for unauthorized access resulting from user negligence.',
          termination: 'We reserve the right to terminate accounts that violate these terms.',
          changes: 'We may update these terms at any time. Continued use constitutes acceptance of changes.'
        }
      }
    });
  },

  getPrivacyPolicy(req: Request, res: Response) {
    res.status(200).json({
      status: 'success',
      data: {
        title: 'Privacy Policy',
        lastUpdated: '2025-01-01',
        content: {
          introduction: 'Lockwise is committed to protecting your privacy and personal data.',
          dataCollection: {
            personalInfo: ['Name', 'Email', 'Phone number', 'Address'],
            usageData: ['Login times', 'Access logs', 'Device information'],
            locationData: ['Estate location', 'Address coordinates']
          },
          dataUsage: [
            'Provide and maintain our services',
            'Manage access control and security',
            'Send notifications and alerts',
            'Improve our services',
            'Comply with legal obligations'
          ],
          dataSharing: 'We do not sell your data. We share data only with estate managers and as required by law.',
          dataRetention: 'We retain your data for as long as your account is active or as needed to provide services.',
          userRights: [
            'Access your personal data',
            'Request data correction',
            'Request data deletion',
            'Opt-out of marketing communications',
            'Export your data'
          ],
          security: 'We implement industry-standard security measures including encryption, secure authentication, and regular security audits.',
          cookies: 'We use cookies for authentication and to improve user experience.',
          contact: 'For privacy concerns, contact us at privacy@lockwise.com'
        }
      }
    });
  }
};