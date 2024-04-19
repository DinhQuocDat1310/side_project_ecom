import { users } from './db/user';
import { Logger } from '@nestjs/common';
import { PrismaService } from '../src/prisma/service';

async function main() {
  const prisma = new PrismaService();
  const logger = new Logger();
  const user = await users();
  try {
    for (const dto of user) {
      await prisma.user.create({
        data: dto,
      });
    }
  } catch (error) {
    logger.error(error);
    process.exit(1);
  } finally {
    prisma.$disconnect();
  }
}

main();
  