import { Table, Model, Column, DataType } from 'sequelize-typescript';

export interface NewsletterSubscriberAttributes {
  id: string;
  email: string;
  first_name: string | null;
  status: 'subscribed' | 'unsubscribed';
  source: string;
  subscribed_at: Date;
  unsubscribed_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export type NewsletterSubscriberCreationAttributes = Omit<NewsletterSubscriberAttributes, 'id' | 'created_at' | 'updated_at' | 'subscribed_at'> & {
  subscribed_at?: Date;
};

@Table({
  tableName: 'newsletter_subscribers',
  timestamps: true,
  underscored: true,
  freezeTableName: true,
})
export class NewsletterSubscriber extends Model<NewsletterSubscriberAttributes, NewsletterSubscriberCreationAttributes> {
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    defaultValue: DataType.UUIDV4,
  })
  declare id: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
    unique: true,
  })
  declare email: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: true,
  })
  declare first_name: string | null;

  @Column({
    type: DataType.ENUM('subscribed', 'unsubscribed'),
    allowNull: false,
    defaultValue: 'subscribed',
  })
  declare status: 'subscribed' | 'unsubscribed';

  @Column({
    type: DataType.STRING(50),
    allowNull: false,
    defaultValue: 'landing_page',
  })
  declare source: string;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: DataType.NOW,
  })
  declare subscribed_at: Date;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  declare unsubscribed_at: Date | null;
}
