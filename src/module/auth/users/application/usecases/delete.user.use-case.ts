import { Inject, Injectable } from "@nestjs/common";
import {type IUserRepository, UserRepositoryName } from "../interfaces/user.interface.repository";

@Injectable()
export class DeleteUserUseCase {
  constructor(
    @Inject(UserRepositoryName)
    private readonly userRepository: IUserRepository,
  ) {}
  async execute(userId: string): Promise<boolean> {
    try {
      await this.userRepository.deleteUser(userId);
      return true;
    } catch (error) {
      console.error('Unable to delete user');
      return false;
    }
  }
}
