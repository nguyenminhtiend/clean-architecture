import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsIn } from 'class-validator';

export class UpdateOrderDto {
  @ApiProperty({
    example: 'completed',
    required: true,
    enum: ['pending', 'completed', 'cancelled'],
    description: 'Order status',
  })
  @IsString()
  @IsNotEmpty()
  @IsIn(['pending', 'completed', 'cancelled'], {
    message: 'status must be one of: pending, completed, cancelled',
  })
  status: string;
}
