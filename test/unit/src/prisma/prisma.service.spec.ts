import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../../../src/prisma/prisma.service';

describe('PrismaService', () => {
  let service: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaService],
    }).compile();

    service = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should have onModuleInit method', () => {
    expect(service.onModuleInit).toBeDefined();
    expect(typeof service.onModuleInit).toBe('function');
  });

  it('should have onModuleDestroy method', () => {
    expect(service.onModuleDestroy).toBeDefined();
    expect(typeof service.onModuleDestroy).toBe('function');
  });

  it('should call $connect on module init', async () => {
    // Arrange
    const connectSpy = jest
      .spyOn(service, '$connect')
      .mockResolvedValue(undefined);

    // Act
    await service.onModuleInit();

    // Assert
    expect(connectSpy).toHaveBeenCalled();
  });

  it('should call $disconnect on module destroy', async () => {
    // Arrange
    const disconnectSpy = jest
      .spyOn(service, '$disconnect')
      .mockResolvedValue(undefined);

    // Act
    await service.onModuleDestroy();

    // Assert
    expect(disconnectSpy).toHaveBeenCalled();
  });
});
