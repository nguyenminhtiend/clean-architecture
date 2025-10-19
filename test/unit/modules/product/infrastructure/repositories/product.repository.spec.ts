import { Test, TestingModule } from '@nestjs/testing';
import { ProductRepository } from '../../../../../../src/modules/product/infrastructure/repositories/product.repository';
import { PrismaService } from '../../../../../../src/prisma/prisma.service';
import { EntityNotFoundException } from '../../../../../../src/shared/exceptions/entity-not-found.exception';
import { Product } from '../../../../../../src/modules/product/entities/product.entity';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { PrismaClient } from '@prisma/client';
import { ProductFactory } from '../../../../../helpers';

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
    it('should create a product with all fields', async () => {
      // Arrange
      const createData = {
        name: 'Test Product',
        description: 'Test Description',
        price: 100,
        stock: 50,
      };

      const mockPrismaProduct = ProductFactory.createPrismaProduct(createData);
      (prismaMock.product.create as jest.Mock).mockResolvedValue(mockPrismaProduct);

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
      expect(result).toBeInstanceOf(Product);
      expect(result.name).toBe(createData.name);
    });

    it('should create product with null description', async () => {
      // Arrange
      const createData = {
        name: 'Test Product',
        description: null,
        price: 100,
        stock: 50,
      };

      const mockPrismaProduct = ProductFactory.createPrismaProduct({
        ...createData,
        description: null,
      });
      (prismaMock.product.create as jest.Mock).mockResolvedValue(mockPrismaProduct);

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

    it('should create product with default stock when not provided', async () => {
      // Arrange
      const createData = {
        name: 'Test Product',
        price: 100,
      };

      const mockPrismaProduct = ProductFactory.createPrismaProduct({
        ...createData,
        stock: 0,
      });
      (prismaMock.product.create as jest.Mock).mockResolvedValue(mockPrismaProduct);

      // Act
      const result = await repository.create(createData);

      // Assert
      expect(prismaMock.product.create).toHaveBeenCalledWith({
        data: {
          name: createData.name,
          description: null,
          price: createData.price,
          stock: 0,
        },
      });
      expect(result.stock).toBe(0);
    });
  });

  describe('findById', () => {
    it('should find a product by id', async () => {
      // Arrange
      const productId = 'test-id';
      const mockPrismaProduct = ProductFactory.createPrismaProduct({
        id: productId,
      });
      (prismaMock.product.findUnique as jest.Mock).mockResolvedValue(mockPrismaProduct);

      // Act
      const result = await repository.findById(productId);

      // Assert
      expect(prismaMock.product.findUnique).toHaveBeenCalledWith({
        where: { id: productId },
      });
      expect(result).toBeInstanceOf(Product);
      expect(result.id).toBe(productId);
    });

    it('should throw EntityNotFoundException when product not found', async () => {
      // Arrange
      const productId = 'non-existent-id';
      (prismaMock.product.findUnique as jest.Mock).mockResolvedValue(null);

      // Act & Assert
      await expect(repository.findById(productId)).rejects.toThrow(EntityNotFoundException);
      await expect(repository.findById(productId)).rejects.toThrow(
        `Product with id ${productId} not found`,
      );
    });
  });

  describe('findAll', () => {
    it('should find all products without pagination', async () => {
      // Arrange
      const mockProducts = [
        ProductFactory.createPrismaProduct({ id: '1', name: 'Product 1' }),
        ProductFactory.createPrismaProduct({ id: '2', name: 'Product 2' }),
      ];
      (prismaMock.product.findMany as jest.Mock).mockResolvedValue(mockProducts);

      // Act
      const result = await repository.findAll();

      // Assert
      expect(prismaMock.product.findMany).toHaveBeenCalledWith({
        skip: undefined,
        take: undefined,
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(Product);
      expect(result[0].name).toBe('Product 1');
    });

    it('should find all products with pagination', async () => {
      // Arrange
      const mockProducts = [ProductFactory.createPrismaProduct({ id: '1', name: 'Product 1' })];
      (prismaMock.product.findMany as jest.Mock).mockResolvedValue(mockProducts);

      // Act
      const result = await repository.findAll({ skip: 10, take: 5 });

      // Assert
      expect(prismaMock.product.findMany).toHaveBeenCalledWith({
        skip: 10,
        take: 5,
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toHaveLength(1);
    });

    it('should return empty array when no products found', async () => {
      // Arrange
      (prismaMock.product.findMany as jest.Mock).mockResolvedValue([]);

      // Act
      const result = await repository.findAll();

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe('update', () => {
    it('should update a product with all fields', async () => {
      // Arrange
      const productId = 'test-id';
      const updateData = {
        name: 'Updated Name',
        description: 'Updated Description',
        price: 200,
        stock: 100,
      };

      const existingProduct = ProductFactory.createPrismaProduct({
        id: productId,
      });
      const updatedProduct = ProductFactory.createPrismaProduct({
        ...existingProduct,
        ...updateData,
      });

      (prismaMock.product.findUnique as jest.Mock).mockResolvedValue(existingProduct);
      (prismaMock.product.update as jest.Mock).mockResolvedValue(updatedProduct);

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
      expect(result).toBeInstanceOf(Product);
      expect(result.name).toBe(updateData.name);
    });

    it('should update a product with partial fields', async () => {
      // Arrange
      const productId = 'test-id';
      const updateData = { name: 'New Name' };

      const existingProduct = ProductFactory.createPrismaProduct({
        id: productId,
      });
      const updatedProduct = ProductFactory.createPrismaProduct({
        ...existingProduct,
        name: 'New Name',
      });

      (prismaMock.product.findUnique as jest.Mock).mockResolvedValue(existingProduct);
      (prismaMock.product.update as jest.Mock).mockResolvedValue(updatedProduct);

      // Act
      const result = await repository.update(productId, updateData);

      // Assert
      expect(prismaMock.product.update).toHaveBeenCalledWith({
        where: { id: productId },
        data: updateData,
      });
      expect(result.name).toBe('New Name');
    });

    it('should throw EntityNotFoundException when product not found', async () => {
      // Arrange
      const productId = 'non-existent-id';
      const updateData = { name: 'New Name' };

      (prismaMock.product.findUnique as jest.Mock).mockResolvedValue(null);

      // Act & Assert
      await expect(repository.update(productId, updateData)).rejects.toThrow(
        EntityNotFoundException,
      );
      expect(prismaMock.product.update).not.toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('should delete a product', async () => {
      // Arrange
      const productId = 'test-id';
      const mockProduct = ProductFactory.createPrismaProduct({ id: productId });

      (prismaMock.product.findUnique as jest.Mock).mockResolvedValue(mockProduct);
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
      expect(result).toBeInstanceOf(Product);
      expect(result.id).toBe(productId);
    });

    it('should throw EntityNotFoundException when product not found', async () => {
      // Arrange
      const productId = 'non-existent-id';

      (prismaMock.product.findUnique as jest.Mock).mockResolvedValue(null);

      // Act & Assert
      await expect(repository.delete(productId)).rejects.toThrow(EntityNotFoundException);
      expect(prismaMock.product.delete).not.toHaveBeenCalled();
    });
  });
});
