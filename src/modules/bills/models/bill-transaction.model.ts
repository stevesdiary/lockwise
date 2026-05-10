import { Table, Column, Model, DataType, ForeignKey, Default, PrimaryKey } from 'sequelize-typescript';
import { User } from '../../auth/models/user.model';
import { Estate } from '../../estate/models/estate.model';

@Table({ tableName: 'bill_transactions', underscored: true, timestamps: true })
export class BillTransaction extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @Column(DataType.STRING)
  declare request_id: string;

  @ForeignKey(() => User)
  @Column(DataType.UUID)
  declare user_id: string;

  @ForeignKey(() => Estate)
  @Column({ type: DataType.UUID, allowNull: true })
  declare estate_id: string;

  @Column(DataType.STRING)
  declare service_id: string;

  @Column(DataType.STRING)
  declare provider_name: string;

  @Column(DataType.STRING)
  declare billers_code: string;

  @Column(DataType.STRING)
  declare variation_code: string;

  @Column(DataType.DECIMAL(12, 2))
  declare amount: number;

  @Column(DataType.STRING)
  declare phone: string;

  @Default('vtpass')
  @Column(DataType.ENUM('vtpass', 'kuda'))
  declare provider: string;

  @Column(DataType.ENUM('pending', 'success', 'failed'))
  declare status: string;

  @Column({ type: DataType.STRING, allowNull: true })
  declare token: string | null;

  @Column({ type: DataType.STRING, allowNull: true })
  declare vtpass_transaction_id: string | null;

  @Column({ type: DataType.STRING, allowNull: true })
  declare response_code: string | null;

  @Column({ type: DataType.STRING, allowNull: true })
  declare response_description: string | null;
}
