import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class UpdateOrderDto {
  @ApiProperty({ example: 'completed', required: false })
  @IsString()
  @IsOptional()
  status?: string;
}

