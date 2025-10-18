import { Test, TestingModule } from '@nestjs/testing';
import { ProductRepository } from '../../../../../../src/modules/product/infrastructure/repositories/product.repository';
import { PrismaService } from '../../../../../../src/prisma/prisma.service';
import { EntityNotFoundException } from '../../../../../../src/shared/exceptions/entity-not-found.exception';
import { ProductFactory } from '../../../../../helpers';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { PrismaClient } from '@prisma/client';

describe('ProductRepository', () => {
  let repository: ProductRepository;
  let prismaMock: DeepMockProxy<PrismaClient>;

  beforeEach(async () => {
    prismaMock = mockDeep<PrismaClient>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductRepository,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    repository = module.get<ProductRepository>(ProductRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a product successfully', async () => {
      // Arrange
      const createData = {
        name: 'Test Product',
        description: 'Test Description',
        price: 100,
        stock: 10,
      };

      const mockPrismaProduct = ProductFactory.createPrismaProduct(createData);
      (prismaMock.product.create as jest.Mock).mockResolvedValue(
        mockPrismaProduct,
      );

      // Act
      const result = await repository.create(createData);

      // Assert
      expect(prismaMock.product.create).toHaveBeenCalledWith({
        data: {
          name: createData.name,
          description: createData.description,
          price: createData.price,
          stock: createData.stock,
        },
      });
      expect(result.name).toBe(createData.name);
      expect(result.price).toBe(createData.price);
    });

    it('should create product with default stock when not provided', async () => {
      // Arrange
      const createData = {
        name: 'Test Product',
        description: 'Test Description',
        price: 100,
        stock: undefined as any,
      };

      const mockPrismaProduct = ProductFactory.createPrismaProduct({
        ...createData,
        stock: 0,
      });
      (prismaMock.product.create as jest.Mock).mockResolvedValue(
        mockPrismaProduct,
      );

      // Act
      const result = await repository.create(createData);

      // Assert
      expect(prismaMock.product.create).toHaveBeenCalledWith({
        data: {
          name: createData.name,
          description: createData.description,
          price: createData.price,
          stock: 0,
        },
      });
      expect(result.stock).toBe(0);
    });

    it('should create product with null description', async () => {
      // Arrange
      const createData = {
        name: 'Test Product',
        description: null,
        price: 100,
        stock: 10,
      };

      const mockPrismaProduct = ProductFactory.createPrismaProduct(createData);
      (prismaMock.product.create as jest.Mock).mockResolvedValue(
        mockPrismaProduct,
      );

      // Act
      const result = await repository.create(createData);

      // Assert
      expect(prismaMock.product.create).toHaveBeenCalledWith({
        data: {
          name: createData.name,
          description: null,
          price: createData.price,
          stock: createData.stock,
        },
      });
      expect(result.description).toBeNull();
    });
  });

  describe('findById', () => {
    it('should return a product when found', async () => {
      // Arrange
      const productId = 'test-product-id';
      const mockPrismaProduct = ProductFactory.createPrismaProduct({
        id: productId,
      });
      (prismaMock.product.findUnique as jest.Mock).mockResolvedValue(
        mockPrismaProduct,
      );

      // Act
      const result = await repository.findById(productId);

      // Assert
      expect(prismaMock.product.findUnique).toHaveBeenCalledWith({
        where: { id: productId },
      });
      expect(result.id).toBe(productId);
    });

    it('should throw EntityNotFoundException when product not found', async () => {
      // Arrange
      const productId = 'non-existent-id';
      (prismaMock.product.findUnique as jest.Mock).mockResolvedValue(null);

      // Act & Assert
      await expect(repository.findById(productId)).rejects.toThrow(
        EntityNotFoundException,
      );
      expect(prismaMock.product.findUnique).toHaveBeenCalledWith({
        where: { id: productId },
      });
    });
  });

  describe('findAll', () => {
    it('should return all products', async () => {
      // Arrange
      const mockProducts = [
        ProductFactory.createPrismaProduct({ id: '1' }),
        ProductFactory.createPrismaProduct({ id: '2' }),
      ];
      (prismaMock.product.findMany as jest.Mock).mockResolvedValue(
        mockProducts,
      );

      // Act
      const result = await repository.findAll();

      // Assert
      expect(prismaMock.product.findMany).toHaveBeenCalledWith({
        skip: undefined,
        take: undefined,
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toHaveLength(2);
    });

    it('should return paginated products', async () => {
      // Arrange
      const params = { skip: 10, take: 5 };
      const mockProducts = [
        ProductFactory.createPrismaProduct({ id: '1' }),
        ProductFactory.createPrismaProduct({ id: '2' }),
      ];
      (prismaMock.product.findMany as jest.Mock).mockResolvedValue(
        mockProducts,
      );

      // Act
      const result = await repository.findAll(params);

      // Assert
      expect(prismaMock.product.findMany).toHaveBeenCalledWith({
        skip: 10,
        take: 5,
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toHaveLength(2);
    });
  });

  describe('update', () => {
    it('should update a product successfully', async () => {
      // Arrange
      const productId = 'test-product-id';
      const updateData = {
        name: 'Updated Product',
        price: 150,
      };

      const existingProduct = ProductFactory.createPrismaProduct({
        id: productId,
      });
      const updatedProduct = ProductFactory.createPrismaProduct({
        ...existingProduct,
        ...updateData,
      });

      (prismaMock.product.findUnique as jest.Mock).mockResolvedValue(
        existingProduct,
      );
      (prismaMock.product.update as jest.Mock).mockResolvedValue(
        updatedProduct,
      );

      // Act
      const result = await repository.update(productId, updateData);

      // Assert
      expect(prismaMock.product.findUnique).toHaveBeenCalledWith({
        where: { id: productId },
      });
      expect(prismaMock.product.update).toHaveBeenCalledWith({
        where: { id: productId },
        data: updateData,
      });
      expect(result.name).toBe(updateData.name);
      expect(result.price).toBe(updateData.price);
    });

    it('should throw error when updating non-existent product', async () => {
      // Arrange
      const productId = 'non-existent-id';
      const updateData = { name: 'Updated Product' };

      (prismaMock.product.findUnique as jest.Mock).mockResolvedValue(null);

      // Act & Assert
      await expect(repository.update(productId, updateData)).rejects.toThrow(
        EntityNotFoundException,
      );
      expect(prismaMock.product.update).not.toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('should delete a product successfully', async () => {
      // Arrange
      const productId = 'test-product-id';
      const mockProduct = ProductFactory.createPrismaProduct({ id: productId });

      (prismaMock.product.findUnique as jest.Mock).mockResolvedValue(
        mockProduct,
      );
      (prismaMock.product.delete as jest.Mock).mockResolvedValue(mockProduct);

      // Act
      const result = await repository.delete(productId);

      // Assert
      expect(prismaMock.product.findUnique).toHaveBeenCalledWith({
        where: { id: productId },
      });
      expect(prismaMock.product.delete).toHaveBeenCalledWith({
        where: { id: productId },
      });
      expect(result.id).toBe(productId);
    });

    it('should throw error when deleting non-existent product', async () => {
      // Arrange
      const productId = 'non-existent-id';

      (prismaMock.product.findUnique as jest.Mock).mockResolvedValue(null);

      // Act & Assert
      await expect(repository.delete(productId)).rejects.toThrow(
        EntityNotFoundException,
      );
      expect(prismaMock.product.delete).not.toHaveBeenCalled();
    });
  });
});
