import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async updateProfile(
    userId: string,
    dto: UpdateUserProfileDto,
  ) {
    const user = await this.prisma.users.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.prisma.users.update({
      where: {
        id: userId,
      },
      data: {
        ...(dto.phoneNumber !== undefined && {
          phone_number: dto.phoneNumber,
        }),

        ...(dto.marketLocation !== undefined && {
          market_location: dto.marketLocation,
        }),

        ...(dto.fullName !== undefined && {
          full_name: dto.fullName,
        }),
      },
    });
  }
}







// import { Injectable } from '@nestjs/common';

// @Injectable()
// export class UsersService {}
