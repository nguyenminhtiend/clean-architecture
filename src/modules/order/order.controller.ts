import { Controller, Get, Post, Patch, Body, Param, Query } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { CreateOrderDto, OrderResponseDto, UpdateOrderDto } from './dtos';
import { CreateOrderCommand, UpdateOrderCommand } from './commands';
import { GetOrderQuery, ListOrdersQuery } from './queries';

@ApiTags('orders')
@Controller('orders')
export class OrderController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new order' })
  @ApiResponse({
    status: 201,
    description: 'Order created successfully',
    type: OrderResponseDto,
  })
  async create(@Body() createOrderDto: CreateOrderDto): Promise<OrderResponseDto> {
    const command = new CreateOrderCommand(
      createOrderDto.customerName,
      createOrderDto.productId,
      createOrderDto.quantity,
    );

    return this.commandBus.execute(command);
  }

  @Get()
  @ApiOperation({ summary: 'List all orders' })
  @ApiQuery({ name: 'skip', required: false, type: Number })
  @ApiQuery({ name: 'take', required: false, type: Number })
  @ApiResponse({
    status: 200,
    description: 'Orders retrieved successfully',
    type: [OrderResponseDto],
  })
  async findAll(
    @Query('skip') skip?: number,
    @Query('take') take?: number,
  ): Promise<OrderResponseDto[]> {
    const query = new ListOrdersQuery(
      skip ? Number(skip) : undefined,
      take ? Number(take) : undefined,
    );

    return this.queryBus.execute(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an order by id' })
  @ApiParam({ name: 'id', description: 'Order ID' })
  @ApiResponse({
    status: 200,
    description: 'Order retrieved successfully',
    type: OrderResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async findOne(@Param('id') id: string): Promise<OrderResponseDto> {
    const query = new GetOrderQuery(id);
    return this.queryBus.execute(query);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an order' })
  @ApiParam({ name: 'id', description: 'Order ID' })
  @ApiResponse({
    status: 200,
    description: 'Order updated successfully',
    type: OrderResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async update(
    @Param('id') id: string,
    @Body() updateOrderDto: UpdateOrderDto,
  ): Promise<OrderResponseDto> {
    const command = new UpdateOrderCommand(id, updateOrderDto.status);
    return this.commandBus.execute(command);
  }
}
