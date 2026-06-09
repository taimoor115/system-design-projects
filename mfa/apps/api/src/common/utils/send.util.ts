import { ApiProperty } from '@nestjs/swagger';

export type SuccessResponse<T> = {
  success: true;
  data: T;
  message: string;
  error?: string;
  statusCode?: number;
};

export type FailureResponse = {
  success: false;
  data: null;
  message: string;
  error: string;
  statusCode?: number;
};

export class SendResponse<T> {
  @ApiProperty()
  success: boolean;

  @ApiProperty({ required: false })
  data?: T;

  @ApiProperty({ required: false })
  message?: string;

  @ApiProperty({ required: false })
  error?: string;

  @ApiProperty({ required: false })
  statusCode?: number;

  constructor(
    success: boolean,
    data?: T,
    message?: string,
    error?: string,
    statusCode?: number,
  ) {
    this.success = success;
    this.data = data;
    this.message = message;
    this.error = error;
    this.statusCode = statusCode;
  }

  static success<T>(
    data: T,
    message = 'Success',
    statusCode?: number,
  ): SuccessResponse<T> {
    return {
      success: true,
      data,
      message,
      statusCode,
    };
  }

  static fail(
    error: string,
    message = 'Failure',
    statusCode?: number,
  ): FailureResponse {
    return {
      success: false,
      data: null,
      message,
      error,
      statusCode,
    };
  }
}
