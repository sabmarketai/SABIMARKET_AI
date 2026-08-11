import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { TransactionsService } from 'src/transactions/transactions.service';
import { PrismaService } from 'src/prisma/prisma.service';

describe('AiController', () => {
  let controller: AiController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AiController],
      providers: [
        AiService,
        {
          provide: ConfigService,
          useValue: { get: () => undefined },
        },
        {
          provide: TransactionsService,
          useValue: {},
        },
        {
          provide: PrismaService,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<AiController>(AiController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
