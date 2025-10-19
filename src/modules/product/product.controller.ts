import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { CreateProductDto, UpdateProductDto, ProductResponseDto } from './dtos';
import { CreateProductCommand, UpdateProductCommand, DeleteProductCommand } from './commands';
import { GetProductQuery, ListProductsQuery } from './queries';

@ApiTags('products')
@Controller('products')
export class ProductController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new product' })
  @ApiResponse({
    status: 201,
    description: 'Product created successfully',
    type: ProductResponseDto,
  })
  async create(@Body() createProductDto: CreateProductDto): Promise<ProductResponseDto> {
    const command = new CreateProductCommand(
      createProductDto.name,
      createProductDto.description,
      createProductDto.price,
      createProductDto.stock,
    );

    return this.commandBus.execute(command);
  }

  @Get()
  @ApiOperation({ summary: 'List all products' })
  @ApiQuery({ name: 'skip', required: false, type: Number })
  @ApiQuery({ name: 'take', required: false, type: Number })
  @ApiResponse({
    status: 200,
    description: 'Products retrieved successfully',
    type: [ProductResponseDto],
  })
  async findAll(
    @Query('skip') skip?: number,
    @Query('take') take?: number,
  ): Promise<ProductResponseDto[]> {
    const query = new ListProductsQuery(
      skip ? Number(skip) : undefined,
      take ? Number(take) : undefined,
    );

    return this.queryBus.execute(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a product by id' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiResponse({
    status: 200,
    description: 'Product retrieved successfully',
    type: ProductResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async findOne(@Param('id') id: string): Promise<ProductResponseDto> {
    const query = new GetProductQuery(id);
    return this.queryBus.execute(query);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a product' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiResponse({
    status: 200,
    description: 'Product updated successfully',
    type: ProductResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ): Promise<ProductResponseDto> {
    const command = new UpdateProductCommand(
      id,
      updateProductDto.name,
      updateProductDto.description,
      updateProductDto.price,
      updateProductDto.stock,
    );

    return this.commandBus.execute(command);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a product' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiResponse({ status: 204, description: 'Product deleted successfully' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async remove(@Param('id') id: string): Promise<void> {
    const command = new DeleteProductCommand(id);
    await this.commandBus.execute(command);
  }
}
