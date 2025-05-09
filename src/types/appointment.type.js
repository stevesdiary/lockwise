"use strict";
// import { AppointmentStatus } from "../appointment/appointment.model";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppointmentStatus = void 0;
var AppointmentStatus;
(function (AppointmentStatus) {
    AppointmentStatus["scheduled"] = "scheduled";
    AppointmentStatus["completed"] = "completed";
    AppointmentStatus["cancelled"] = "cancelled";
    AppointmentStatus["pending"] = "pending";
    AppointmentStatus["no_show"] = "no_show";
    AppointmentStatus["in_progress"] = "in_progress";
    AppointmentStatus["rescheduled"] = "rescheduled";
    AppointmentStatus["waiting_list"] = "waiting_list";
})(AppointmentStatus || (exports.AppointmentStatus = AppointmentStatus = {}));
