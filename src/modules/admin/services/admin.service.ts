import { User } from '../../auth/models/user.model';
import { Role } from '../../auth/models/role.model';
import crypto from 'crypto';

type UserRole = 'resident' | 'admin' | 'manager' | 'security' | 'super_admin' | 'customer_service';
const getBcrypt = async () => (await import('bcryptjs')).default;

export const adminService = {
  async createAdmin(data: {
    title?: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    password: string;
    admin_secret: string;
  }) {
    // Verify admin secret key
    if (data.admin_secret !== process.env.ADMIN_SECRET_KEY) {
      return {
        statusCode: 403,
        message: 'Invalid admin secret key'
      };
    }

    // Check if admin already exists
    const existingAdmin = await User.findOne({ where: { email: data.email } });
    if (existingAdmin) {
      return {
        statusCode: 400,
        message: 'Admin with this email already exists'
      };
    }

    // Hash password
    const bcrypt = await getBcrypt();
    const hashedPassword = await bcrypt.hash(data.password, 12);

    // Get or create admin role
    const [adminRole] = await Role.findOrCreate({
      where: { role: 'admin' as UserRole },
      defaults: { role: 'admin' as UserRole } as any
    });

    // Create admin user
    const admin = await User.create({
      title: data.title,
      first_name: data.first_name,
      last_name: data.last_name,
      email: data.email,
      phone: data.phone,
      password: hashedPassword,
      role_id: adminRole.id,
      verified: false,
      status: 'pending'
    } as any);

    return {
      statusCode: 201,
      message: 'Admin created successfully',
      data: {
        id: admin.id,
        email: admin.email,
        role_id: admin.role_id
      }
    };
  },

  async createCustomerServiceAgent(adminId: string, data: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    password: string;
  }) {
    // Verify requester is admin
    const admin = await User.findByPk(adminId, { include: [Role] });
    if (!admin || admin.role?.role !== 'admin') {
      return {
        statusCode: 403,
        message: 'Only admins can create customer service agents'
      };
    }

    const existingUser = await User.findOne({ where: { email: data.email } });
    if (existingUser) {
      return {
        statusCode: 400,
        message: 'User with this email already exists'
      };
    }

    const bcrypt = await getBcrypt();
    const hashedPassword = await bcrypt.hash(data.password, 12);

    // Get or create customer_service role
    const [csRole] = await Role.findOrCreate({
      where: { role: 'customer_service' as UserRole },
      defaults: { role: 'customer_service' as UserRole } as any
    });

    const agent = await User.create({
      first_name: data.first_name,
      last_name: data.last_name,
      email: data.email,
      phone: data.phone,
      password: hashedPassword,
      role_id: csRole.id,
      verified: false,
      status: 'pending'
    } as any);

    return {
      statusCode: 201,
      message: 'Customer service agent created successfully',
      data: {
        id: agent.id,
        email: agent.email,
        role_id: agent.role_id
      }
    };
  }
};
