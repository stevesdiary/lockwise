import { AutoIncrement, Column, DataType, Table, Model, BelongsTo } from "sequelize-typescript";
import { Resident } from "../resident/resident.model";
import { Estate } from "./estate.model";

export class AccessLog extends Model<AccessLog> {
	@Column({
		type: DataType.NUMBER,
		primaryKey: true,
		defaultValue: DataType.NUMBER,
		allowNull: false,
		autoIncrement: true
	})
	declare log_id: string;

	@Column({
		type: DataType.STRING,
		allowNull: false,
	})
	declare visitor_name: string;
	
	@Column({
		type: DataType.DATE,
		allowNull: false,
	})
	declare schedule_in: Date;

	@Column({
		type: DataType.DATE,
		allowNull: false,
	})
	declare schedule_out: Date;

	@Column({
		type: DataType.DATE
	})
	declare entry_time: Date;

	@Column({
		type: DataType.ENUM("guest", "resident", "staff", "delivery", "maintenance", "security", "others"),
		allowNull: false,
		defaultValue: "guest"
	})
	declare access_type: string;

	@Column({
		type: DataType.ENUM("RFID", "QR_code", "access_code", "manual_approval"),
		allowNull: false,
		defaultValue: "access_code"
	})
	declare verification_method: string;

	@Column({
		type: DataType.STRING
	})
	declare vehicle_number: string;

	@Column({
		type: DataType.ENUM("approved", "pending", "denied"),
		allowNull: false,
	})
	declare status: string;

	@Column({
		type: DataType.TEXT
	})
	declare remarks: string;

	@Column({
		type: DataType.DATE
	})
	declare exit_time: Date;

	@Column({
		type: DataType.STRING,
		allowNull: false,
	})
	declare estate_id: string;

	@Column({
		type: DataType.STRING,
		allowNull: false,
	})
	declare resident_id: string;

	@BelongsTo(() => Resident, {
		foreignKey: "resident_id",
		targetKey: "resident_id",
	})
	declare resident: Resident;

	@BelongsTo(() => Estate, {
		foreignKey: "estate_id",
		targetKey: "estate_id",
	})
	declare estate: Estate;

	@Column({
		type: DataType.STRING,
		allowNull: false,
	})
	declare verified_by: string;
}
