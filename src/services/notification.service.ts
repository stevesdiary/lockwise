// import { AppointmentNotificationQueue } from '../../config/queue';
// import { sendEmail } from './email.service';
// import { Appointment } from '../appointment/appointment.model';

// export const NotificationService = {
//   async scheduleAppointmentNotifications(appointment: Appointment) {
//     try {
//       // Immediate notification for scheduled appointment
//       await AppointmentNotificationQueue.add('newAppointment', {
//         appointmentId: appointment.id,
//         type: 'scheduled'
//       });

//       // Calculate time for 30 minutes before appointment
//       const appointmentTime = new Date(`${appointment.date} ${appointment.start_time}`);
//       const reminderTime = new Date(appointmentTime.getTime() - 30 * 60 * 1000);

//       // Schedule reminder notification
//       await AppointmentNotificationQueue.add('appointmentReminder', {
//         appointmentId: appointment.id,
//         type: 'reminder'
//       }, {
//         delay: Math.max(0, reminderTime.getTime() - Date.now())
//       });

//       return true;
//     } catch (error) {
//       console.error('Error scheduling notifications:', error);
//       return false;
//     }
//   }
// };