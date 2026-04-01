import { Module } from '@nestjs/common';
import { UserRepository } from '@/modules/user/repository/user-repository';
import { UserService } from '@/modules/user/service/user-service/user-service';

@Module({
  providers: [UserRepository, UserService],
  exports: [UserRepository, UserService],
})
export class UserModule {}
