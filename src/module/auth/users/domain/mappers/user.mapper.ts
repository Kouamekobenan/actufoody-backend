import { UserDto } from '../../application/dtos/user.dto';
import { Admin as UserPrisma } from '@prisma/client';
import { Admin } from '../entities/user.entity';

export class UserMapper {
  toPersitence(data: UserDto): any {
    return {
      email: data.email,
      password: data.password,
      name: data.name,
    };
  }

  toAplication(Userdata: UserPrisma): Admin {
    return new Admin(
      Userdata.id,
      Userdata.name,
      Userdata.email,
      Userdata.password,
      Userdata.createdAt,
      Userdata.updatedAt,
      Userdata.role,
    );
  }

  toUpdateUser(userData: UserDto): any {
    return {
      email: userData.email,
      password: userData.password,
      name: userData.name,
    };
  }
}
