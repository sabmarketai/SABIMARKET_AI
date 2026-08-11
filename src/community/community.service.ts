import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from 'src/prisma/prisma.service';

import { CreateCommunityPostDto } from './dto/create-community-post.dto';
import { UpdateCommunityPostDto } from './dto/update-community-post.dto';

const AUTHOR_SELECT = {
  select: {
    id: true,
    full_name: true,
    market_location: true,
  },
};

@Injectable()
export class CommunityService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateCommunityPostDto) {
    return this.prisma.community_posts.create({
      data: {
        user_id: userId,
        title: dto.title,
        content: dto.content,
      },
      include: { users: AUTHOR_SELECT },
    });
  }

  async findAll() {
    return this.prisma.community_posts.findMany({
      orderBy: { created_at: 'desc' },
      include: { users: AUTHOR_SELECT },
    });
  }

  async findOne(id: bigint) {
    const post = await this.prisma.community_posts.findUnique({
      where: { id },
      include: { users: AUTHOR_SELECT },
    });

    if (!post) {
      throw new NotFoundException('Community post not found');
    }

    return post;
  }

  async update(id: bigint, userId: string, dto: UpdateCommunityPostDto) {
    await this.assertOwnership(id, userId);

    return this.prisma.community_posts.update({
      where: { id },
      data: {
        title: dto.title,
        content: dto.content,
      },
      include: { users: AUTHOR_SELECT },
    });
  }

  async remove(id: bigint, userId: string) {
    await this.assertOwnership(id, userId);

    return this.prisma.community_posts.delete({
      where: { id },
    });
  }

  private async assertOwnership(id: bigint, userId: string) {
    const post = await this.prisma.community_posts.findUnique({
      where: { id },
    });

    if (!post) {
      throw new NotFoundException('Community post not found');
    }

    if (post.user_id !== userId) {
      throw new ForbiddenException('You do not have access to this post');
    }

    return post;
  }
}
