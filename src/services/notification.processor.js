// import { AppointmentNotificationQueue } from '../../config/queue';
// import { sendEmail } from './email.service';
// import { Appointment } from '../appointment/appointment.model';
// import { Hospital } from '../hospital/hospital.model';
// AppointmentNotificationQueue.process('newAppointment', async (job) => {
//   try {
//     const appointment = await Appointment.findByPk(job.data.appointmentId, {
//       include: ['patient', 'doctors', 'hospital']
//     });
//     if (!appointment) {
//       throw new Error('Appointment not found');
//     }
//     const emailContent = `
//       Dear ${appointment.patientFirstName},
//       Your appointment has been scheduled successfully.
//       Details:
//       Date: ${appointment.date}
//       Time: ${appointment.start_time}
//       Doctor: Dr. ${appointment.doctors.first_name} ${appointment.doctors.last_name}
//       Hospital: ${appointment.hospitalName}
//       Thank you for choosing our service.
//     `;
//     await sendEmail({
//       to: appointment.patient.user.email as string,
//       subject: 'Appointment Confirmation',
//       text: emailContent
//     });
//   } catch (error) {
//     console.error('Error processing new appointment notification:', error);
//     throw error;
//   }
// });
// AppointmentNotificationQueue.process('appointmentReminder', async (job) => {
//   try {
//     const appointment = await Appointment.findByPk(job.data.appointmentId, {
//       include: ['patient', 'doctors', 'hospital']
//     });
//     if (!appointment) {
//       throw new Error('Appointment not found');
//     }
//     const emailContent = `
//       Dear ${appointment.patient.user.first_name},
//       This is a reminder for your upcoming appointment in 30 minutes.
//       Details:
//       Time: ${appointment.start_time}
//       Doctor: Dr. ${appointment.doctors.first_name} ${appointment.doctors.last_name}
//       Hospital: ${appointment.hospital.name}
//       Please ensure you arrive on time.
//     `;
//     await sendEmail(appointment.patient.user.email, 'Appointment Reminder', emailContent);
//   } catch (error) {
//     console.error('Error processing appointment reminder:', error);
//     throw error;
//   }
// });
