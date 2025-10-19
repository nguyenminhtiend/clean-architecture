import { Test, TestingModule } from '@nestjs/testing';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { OrderController } from '../../../../src/modules/order/order.controller';
import { CreateOrderCommand, UpdateOrderCommand } from '../../../../src/modules/order/commands';
import { GetOrderQuery, ListOrdersQuery } from '../../../../src/modules/order/queries';
import { OrderFactory } from '../../../helpers';

describe('OrderController', () => {
  let controller: OrderController;
  let commandBus: jest.Mocked<CommandBus>;
  let queryBus: jest.Mocked<QueryBus>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrderController],
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

    controller = module.get<OrderController>(OrderController);
    commandBus = module.get(CommandBus);
    queryBus = module.get(QueryBus);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create an order', async () => {
      // Arrange
      const createDto = {
        customerName: 'John Doe',
        productId: 'product-123',
        quantity: 2,
      };

      const mockOrder = OrderFactory.createOrder({
        customerName: createDto.customerName,
        totalAmount: 200,
      });

      commandBus.execute.mockResolvedValue({
        id: mockOrder.id,
        customerName: mockOrder.customerName,
        totalAmount: mockOrder.totalAmount,
        status: mockOrder.status,
        items: JSON.parse(mockOrder.items),
        createdAt: mockOrder.createdAt,
        updatedAt: mockOrder.updatedAt,
      });

      // Act
      const result = await controller.create(createDto);

      // Assert
      expect(commandBus.execute).toHaveBeenCalledWith(expect.any(CreateOrderCommand));
      const executedCommand = commandBus.execute.mock.calls[0][0] as CreateOrderCommand;
      expect(executedCommand.customerName).toBe(createDto.customerName);
      expect(executedCommand.productId).toBe(createDto.productId);
      expect(executedCommand.quantity).toBe(createDto.quantity);
      expect(result.customerName).toBe(createDto.customerName);
    });
  });

  describe('findAll', () => {
    it('should list all orders without pagination', async () => {
      // Arrange
      const mockOrders = [
        OrderFactory.createOrder({ id: '1', customerName: 'Customer 1' }),
        OrderFactory.createOrder({ id: '2', customerName: 'Customer 2' }),
      ];

      queryBus.execute.mockResolvedValue(
        mockOrders.map((o) => ({
          id: o.id,
          customerName: o.customerName,
          totalAmount: o.totalAmount,
          status: o.status,
          items: JSON.parse(o.items),
          createdAt: o.createdAt,
          updatedAt: o.updatedAt,
        })),
      );

      // Act
      const result = await controller.findAll();

      // Assert
      expect(queryBus.execute).toHaveBeenCalledWith(expect.any(ListOrdersQuery));
      const executedQuery = queryBus.execute.mock.calls[0][0] as ListOrdersQuery;
      expect(executedQuery.skip).toBeUndefined();
      expect(executedQuery.take).toBeUndefined();
      expect(result).toHaveLength(2);
    });

    it('should list orders with pagination', async () => {
      // Arrange
      const mockOrders = [OrderFactory.createOrder({ id: '1', customerName: 'Customer 1' })];

      queryBus.execute.mockResolvedValue(
        mockOrders.map((o) => ({
          id: o.id,
          customerName: o.customerName,
          totalAmount: o.totalAmount,
          status: o.status,
          items: JSON.parse(o.items),
          createdAt: o.createdAt,
          updatedAt: o.updatedAt,
        })),
      );

      // Act
      const result = await controller.findAll(10, 5);

      // Assert
      expect(queryBus.execute).toHaveBeenCalledWith(expect.any(ListOrdersQuery));
      const executedQuery = queryBus.execute.mock.calls[0][0] as ListOrdersQuery;
      expect(executedQuery.skip).toBe(10);
      expect(executedQuery.take).toBe(5);
      expect(result).toHaveLength(1);
    });
  });

  describe('findOne', () => {
    it('should get an order by id', async () => {
      // Arrange
      const orderId = 'test-id';
      const mockOrder = OrderFactory.createOrder({ id: orderId });

      queryBus.execute.mockResolvedValue({
        id: mockOrder.id,
        customerName: mockOrder.customerName,
        totalAmount: mockOrder.totalAmount,
        status: mockOrder.status,
        items: JSON.parse(mockOrder.items),
        createdAt: mockOrder.createdAt,
        updatedAt: mockOrder.updatedAt,
      });

      // Act
      const result = await controller.findOne(orderId);

      // Assert
      expect(queryBus.execute).toHaveBeenCalledWith(expect.any(GetOrderQuery));
      const executedQuery = queryBus.execute.mock.calls[0][0] as GetOrderQuery;
      expect(executedQuery.id).toBe(orderId);
      expect(result.id).toBe(orderId);
    });
  });

  describe('update', () => {
    it('should update an order', async () => {
      // Arrange
      const orderId = 'test-id';
      const updateDto = {
        status: 'completed',
      };

      const mockOrder = OrderFactory.createOrder({
        id: orderId,
        status: 'completed',
      });

      commandBus.execute.mockResolvedValue({
        id: mockOrder.id,
        customerName: mockOrder.customerName,
        totalAmount: mockOrder.totalAmount,
        status: mockOrder.status,
        items: JSON.parse(mockOrder.items),
        createdAt: mockOrder.createdAt,
        updatedAt: mockOrder.updatedAt,
      });

      // Act
      const result = await controller.update(orderId, updateDto);

      // Assert
      expect(commandBus.execute).toHaveBeenCalledWith(expect.any(UpdateOrderCommand));
      const executedCommand = commandBus.execute.mock.calls[0][0] as UpdateOrderCommand;
      expect(executedCommand.id).toBe(orderId);
      expect(executedCommand.status).toBe(updateDto.status);
      expect(result.status).toBe('completed');
    });
  });
});
