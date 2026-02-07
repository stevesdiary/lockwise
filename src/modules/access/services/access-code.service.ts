import AccessCode from '../models/access-code.model';

export class AccessCodeService {
  async generateCode(data: any) {
    return await AccessCode.create(data);
  }

  async validateCode(code: string) {
    return await AccessCode.findOne({ where: { code } });
  }
}

export default new AccessCodeService();
