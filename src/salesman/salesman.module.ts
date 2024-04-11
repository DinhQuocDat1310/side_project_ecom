import { Module } from '@nestjs/common';
import { SalesmanService } from './salesman.service';
import { SalesmanResolver } from './salesman.resolver';
import { PrismaService } from 'src/prisma/service';

@Module({
  providers: [SalesmanResolver, SalesmanService, PrismaService],
})
export class SalesmanModule {}
