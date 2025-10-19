import { Test, TestingModule } from '@nestjs/testing';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ProductController } from '../../../../src/modules/product/product.controller';
import {
  CreateProductCommand,
  UpdateProductCommand,
  DeleteProductCommand,
} from '../../../../src/modules/product/commands';
import { GetProductQuery, ListProductsQuery } from '../../../../src/modules/product/queries';
import { ProductFactory } from '../../../helpers';

describe('ProductController', () => {
  let controller: ProductController;
  let commandBus: jest.Mocked<CommandBus>;
  let queryBus: jest.Mocked<QueryBus>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductController],
      providers: [
        {
          provide: CommandBus,
          useValue: {
            execute: jest.fn(),
          },
        },
        {
          provide: QueryBus,
          useValue: {
            execute: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ProductController>(ProductController);
    commandBus = module.get(CommandBus);
    queryBus = module.get(QueryBus);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a product', async () => {
      // Arrange
      const createDto = {
        name: 'Test Product',
        description: 'Test Description',
        price: 100,
        stock: 50,
      };

      const mockProduct = ProductFactory.createProduct(createDto);
      commandBus.execute.mockResolvedValue({
        id: mockProduct.id,
        name: mockProduct.name,
        description: mockProduct.description,
        price: mockProduct.price,
        stock: mockProduct.stock,
        createdAt: mockProduct.createdAt,
        updatedAt: mockProduct.updatedAt,
      });

      // Act
      const result = await controller.create(createDto);

      // Assert
      expect(commandBus.execute).toHaveBeenCalledWith(expect.any(CreateProductCommand));
      const executedCommand = commandBus.execute.mock.calls[0][0] as CreateProductCommand;
      expect(executedCommand.name).toBe(createDto.name);
      expect(executedCommand.description).toBe(createDto.description);
      expect(executedCommand.price).toBe(createDto.price);
      expect(executedCommand.stock).toBe(createDto.stock);
      expect(result.name).toBe(createDto.name);
    });
  });

  describe('findAll', () => {
    it('should list all products without pagination', async () => {
      // Arrange
      const mockProducts = [
        ProductFactory.createProduct({ id: '1', name: 'Product 1' }),
        ProductFactory.createProduct({ id: '2', name: 'Product 2' }),
      ];

      queryBus.execute.mockResolvedValue(
        mockProducts.map((p) => ({
          id: p.id,
          name: p.name,
          description: p.description,
          price: p.price,
          stock: p.stock,
          createdAt: p.createdAt,
          updatedAt: p.updatedAt,
        })),
      );

      // Act
      const result = await controller.findAll();

      // Assert
      expect(queryBus.execute).toHaveBeenCalledWith(expect.any(ListProductsQuery));
      const executedQuery = queryBus.execute.mock.calls[0][0] as ListProductsQuery;
      expect(executedQuery.skip).toBeUndefined();
      expect(executedQuery.take).toBeUndefined();
      expect(result).toHaveLength(2);
    });

    it('should list products with pagination', async () => {
      // Arrange
      const mockProducts = [ProductFactory.createProduct({ id: '1', name: 'Product 1' })];

      queryBus.execute.mockResolvedValue(
        mockProducts.map((p) => ({
          id: p.id,
          name: p.name,
          description: p.description,
          price: p.price,
          stock: p.stock,
          createdAt: p.createdAt,
          updatedAt: p.updatedAt,
        })),
      );

      // Act
      const result = await controller.findAll(10, 5);

      // Assert
      expect(queryBus.execute).toHaveBeenCalledWith(expect.any(ListProductsQuery));
      const executedQuery = queryBus.execute.mock.calls[0][0] as ListProductsQuery;
      expect(executedQuery.skip).toBe(10);
      expect(executedQuery.take).toBe(5);
      expect(result).toHaveLength(1);
    });
  });

  describe('findOne', () => {
    it('should get a product by id', async () => {
      // Arrange
      const productId = 'test-id';
      const mockProduct = ProductFactory.createProduct({ id: productId });

      queryBus.execute.mockResolvedValue({
        id: mockProduct.id,
        name: mockProduct.name,
        description: mockProduct.description,
        price: mockProduct.price,
        stock: mockProduct.stock,
        createdAt: mockProduct.createdAt,
        updatedAt: mockProduct.updatedAt,
      });

      // Act
      const result = await controller.findOne(productId);

      // Assert
      expect(queryBus.execute).toHaveBeenCalledWith(expect.any(GetProductQuery));
      const executedQuery = queryBus.execute.mock.calls[0][0] as GetProductQuery;
      expect(executedQuery.id).toBe(productId);
      expect(result.id).toBe(productId);
    });
  });

  describe('update', () => {
    it('should update a product', async () => {
      // Arrange
      const productId = 'test-id';
      const updateDto = {
        name: 'Updated Name',
        description: 'Updated Description',
        price: 200,
        stock: 100,
      };

      const mockProduct = ProductFactory.createProduct({
        id: productId,
        ...updateDto,
      });

      commandBus.execute.mockResolvedValue({
        id: mockProduct.id,
        name: mockProduct.name,
        description: mockProduct.description,
        price: mockProduct.price,
        stock: mockProduct.stock,
        createdAt: mockProduct.createdAt,
        updatedAt: mockProduct.updatedAt,
      });

      // Act
      const result = await controller.update(productId, updateDto);

      // Assert
      expect(commandBus.execute).toHaveBeenCalledWith(expect.any(UpdateProductCommand));
      const executedCommand = commandBus.execute.mock.calls[0][0] as UpdateProductCommand;
      expect(executedCommand.id).toBe(productId);
      expect(executedCommand.name).toBe(updateDto.name);
      expect(executedCommand.description).toBe(updateDto.description);
      expect(executedCommand.price).toBe(updateDto.price);
      expect(executedCommand.stock).toBe(updateDto.stock);
      expect(result.name).toBe(updateDto.name);
    });
  });

  describe('remove', () => {
    it('should delete a product', async () => {
      // Arrange
      const productId = 'test-id';
      commandBus.execute.mockResolvedValue(undefined);

      // Act
      await controller.remove(productId);

      // Assert
      expect(commandBus.execute).toHaveBeenCalledWith(expect.any(DeleteProductCommand));
      const executedCommand = commandBus.execute.mock.calls[0][0] as DeleteProductCommand;
      expect(executedCommand.id).toBe(productId);
    });
  });
});
