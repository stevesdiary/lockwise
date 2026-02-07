import { User } from '../../modules/auth/models/user.model';
import { Estate } from '../../modules/estate/models/estate.model';
import { Resident } from '../../modules/estate/models/resident.model';
import AccessLog from '../../modules/access/models/access-log.model';

export interface IBaseRepository<T> {
  create(data: Partial<T>): Promise<T>;
  findById(id: string): Promise<T | null>;
  update(id: string, data: Partial<T>): Promise<T | null>;
  delete(id: string): Promise<boolean>;
}

export interface IUserRepository extends IBaseRepository<User> {
  findByEmail(email: string): Promise<User | null>;
  findByEmailAndEstate(email: string, estateId: string): Promise<User | null>;
  findAllByEstate(estateId: string): Promise<User[]>;
}

export interface IEstateRepository extends IBaseRepository<Estate> {
  findByCode(estateCode: string): Promise<Estate | null>;
  findByInvitationCode(code: string): Promise<Estate | null>;
}

export interface IResidentRepository extends IBaseRepository<Resident> {
  findByEmail(email: string): Promise<Resident | null>;
  findAllByEstate(estateId: string): Promise<Resident[]>;
}

export interface IAccessRepository extends IBaseRepository<AccessLog> {
  findAllByEstate(estateId: string): Promise<AccessLog[]>;
  findAllByResident(residentId: string): Promise<AccessLog[]>;
}