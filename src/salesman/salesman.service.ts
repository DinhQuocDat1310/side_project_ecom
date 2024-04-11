import { User } from '@prisma/client';
import { PrismaService } from './../prisma/service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class SalesmanService {
  constructor(private readonly prismaService: PrismaService) {}

  createSalesman = async (user: User) => {};
}
