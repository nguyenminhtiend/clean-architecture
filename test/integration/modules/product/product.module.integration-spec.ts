import { Test, TestingModule } from '@nestjs/testing';
import { ProductModule } from '../../../../src/modules/product/product.module';
import { ProductController } from '../../../../src/modules/product/product.controller';
import { PrismaService } from '../../../../src/prisma/prisma.service';
import { ProductFactory } from '../../../helpers';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { PrismaClient } from '@prisma/client';

describe('ProductModule Integration Tests', () => {
  let moduleRef: TestingModule;
  let controller: ProductController;
  let prismaMock: DeepMockProxy<PrismaClient>;

  beforeEach(async () => {
    prismaMock = mockDeep<PrismaClient>();

    moduleRef = await Test.createTestingModule({
      imports: [ProductModule],
    })
      .overrideProvider(PrismaService)
      .useValue(prismaMock)
      .compile();

    await moduleRef.init();

    controller = moduleRef.get<ProductController>(ProductController);
  });

  afterEach(async () => {
    await moduleRef.close();
    jest.clearAllMocks();
  });

  describe('Product Creation Flow', () => {
    it('should create a product through the full command flow', async () => {
      // Arrange
      const createDto = {
        name: 'Integration Test Product',
        description: 'Test Description',
        price: 150,
        stock: 20,
      };

      const mockPrismaProduct = ProductFactory.createPrismaProduct(createDto);
      (prismaMock.product.create as jest.Mock).mockResolvedValue(
        mockPrismaProduct,
      );

      // Act
      const result = await controller.create(createDto);

      // Assert
      expect(result).toBeDefined();
      expect(result.name).toBe(createDto.name);
      expect(result.price).toBe(createDto.price);
      expect(prismaMock.product.create).toHaveBeenCalled();
    });
  });

  describe('Product Query Flow', () => {
    it('should get a product through the full query flow', async () => {
      // Arrange
      const productId = 'test-product-id';
      const mockPrismaProduct = ProductFactory.createPrismaProduct({
        id: productId,
      });
      (prismaMock.product.findUnique as jest.Mock).mockResolvedValue(
        mockPrismaProduct,
      );

      // Act
      const result = await controller.findOne(productId);

      // Assert
      expect(result).toBeDefined();
      expect(result.id).toBe(productId);
      expect(prismaMock.product.findUnique).toHaveBeenCalledWith({
        where: { id: productId },
      });
    });

    it('should list all products through the full query flow', async () => {
      // Arrange
      const mockProducts = [
        ProductFactory.createPrismaProduct({ id: '1' }),
        ProductFactory.createPrismaProduct({ id: '2' }),
      ];
      (prismaMock.product.findMany as jest.Mock).mockResolvedValue(
        mockProducts,
      );

      // Act
      const result = await controller.findAll();

      // Assert
      expect(result).toBeDefined();
      expect(result).toHaveLength(2);
      expect(prismaMock.product.findMany).toHaveBeenCalled();
    });

    it('should list products with pagination', async () => {
      // Arrange
      const skip = 10;
      const take = 5;
      const mockProducts = [ProductFactory.createPrismaProduct({ id: '1' })];
      (prismaMock.product.findMany as jest.Mock).mockResolvedValue(
        mockProducts,
      );

      // Act
      const result = await controller.findAll(skip, take);

      // Assert
      expect(result).toBeDefined();
      expect(prismaMock.product.findMany).toHaveBeenCalledWith({
        skip: 10,
        take: 5,
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('Product Update Flow', () => {
    it('should update a product through the full command flow', async () => {
      // Arrange
      const productId = 'test-product-id';
      const updateDto = {
        name: 'Updated Product',
        price: 200,
      };

      const existingProduct = ProductFactory.createPrismaProduct({
        id: productId,
      });
      const updatedProduct = ProductFactory.createPrismaProduct({
        ...existingProduct,
        ...updateDto,
      });

      (prismaMock.product.findUnique as jest.Mock).mockResolvedValue(
        existingProduct,
      );
      (prismaMock.product.update as jest.Mock).mockResolvedValue(
        updatedProduct,
      );

      // Act
      const result = await controller.update(productId, updateDto);

      // Assert
      expect(result).toBeDefined();
      expect(result.name).toBe(updateDto.name);
      expect(result.price).toBe(updateDto.price);
      expect(prismaMock.product.update).toHaveBeenCalled();
    });
  });

  describe('Product Delete Flow', () => {
    it('should delete a product through the full command flow', async () => {
      // Arrange
      const productId = 'test-product-id';
      const mockProduct = ProductFactory.createPrismaProduct({ id: productId });

      (prismaMock.product.findUnique as jest.Mock).mockResolvedValue(
        mockProduct,
      );
      (prismaMock.product.delete as jest.Mock).mockResolvedValue(mockProduct);

      // Act
      await controller.remove(productId);

      // Assert
      expect(prismaMock.product.findUnique).toHaveBeenCalledWith({
        where: { id: productId },
      });
      expect(prismaMock.product.delete).toHaveBeenCalledWith({
        where: { id: productId },
      });
    });
  });
});
