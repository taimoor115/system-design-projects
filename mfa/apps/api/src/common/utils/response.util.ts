import { ApiProperty } from '@nestjs/swagger';

export class ApiResponseDto<T> {
  @ApiProperty()
  success: boolean;

  @ApiProperty({ required: false })
  data?: T;

  @ApiProperty({ required: false })
  message?: string;

  @ApiProperty({ required: false })
  error?: string;

  constructor(success: boolean, data?: T, message?: string, error?: string) {
    this.success = success;
    this.data = data;
    this.message = message;
    this.error = error;
  }

  static success<T>(data: T, message = 'Success'): ApiResponseDto<T> {
    return new ApiResponseDto(true, data, message);
  }

  static fail(error: string, message = 'Failure'): ApiResponseDto<null> {
    return new ApiResponseDto(false, null, message, error);
  }
}
