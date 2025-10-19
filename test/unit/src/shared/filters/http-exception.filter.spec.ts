import { ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import {
  HttpExceptionFilter,
  AllExceptionsFilter,
} from '../../../../../src/shared/filters/http-exception.filter';
import { Response } from 'express';

describe('HttpExceptionFilter', () => {
  let filter: HttpExceptionFilter;
  let mockResponse: Partial<Response>;
  let mockArgumentsHost: ArgumentsHost;

  beforeEach(() => {
    filter = new HttpExceptionFilter();

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    mockArgumentsHost = {
      switchToHttp: jest.fn().mockReturnValue({
        getResponse: () => mockResponse,
      }),
    } as any;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should catch HttpException with string message', () => {
    // Arrange
    const exception = new HttpException('Test error message', HttpStatus.BAD_REQUEST);

    // Act
    filter.catch(exception, mockArgumentsHost);

    // Assert
    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(mockResponse.json).toHaveBeenCalledWith({
      statusCode: HttpStatus.BAD_REQUEST,
      timestamp: expect.any(String),
      message: 'Test error message',
    });
  });

  it('should catch HttpException with object response', () => {
    // Arrange
    const exceptionResponse = {
      message: 'Validation failed',
      errors: ['name is required', 'price must be positive'],
    };
    const exception = new HttpException(exceptionResponse, HttpStatus.BAD_REQUEST);

    // Act
    filter.catch(exception, mockArgumentsHost);

    // Assert
    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(mockResponse.json).toHaveBeenCalledWith({
      statusCode: HttpStatus.BAD_REQUEST,
      timestamp: expect.any(String),
      message: 'Validation failed',
      errors: ['name is required', 'price must be positive'],
    });
  });

  it('should catch HttpException with 404 status', () => {
    // Arrange
    const exception = new HttpException('Not Found', HttpStatus.NOT_FOUND);

    // Act
    filter.catch(exception, mockArgumentsHost);

    // Assert
    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    expect(mockResponse.json).toHaveBeenCalledWith({
      statusCode: HttpStatus.NOT_FOUND,
      timestamp: expect.any(String),
      message: 'Not Found',
    });
  });

  it('should catch HttpException with 500 status', () => {
    // Arrange
    const exception = new HttpException('Internal Server Error', HttpStatus.INTERNAL_SERVER_ERROR);

    // Act
    filter.catch(exception, mockArgumentsHost);

    // Assert
    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(mockResponse.json).toHaveBeenCalledWith({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      timestamp: expect.any(String),
      message: 'Internal Server Error',
    });
  });
});

describe('AllExceptionsFilter', () => {
  let filter: AllExceptionsFilter;
  let mockResponse: Partial<Response>;
  let mockArgumentsHost: ArgumentsHost;

  beforeEach(() => {
    filter = new AllExceptionsFilter();

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    mockArgumentsHost = {
      switchToHttp: jest.fn().mockReturnValue({
        getResponse: () => mockResponse,
      }),
    } as any;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should catch HttpException', () => {
    // Arrange
    const exception = new HttpException('Test error', HttpStatus.BAD_REQUEST);

    // Act
    filter.catch(exception, mockArgumentsHost);

    // Assert
    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(mockResponse.json).toHaveBeenCalledWith({
      statusCode: HttpStatus.BAD_REQUEST,
      timestamp: expect.any(String),
      message: 'Test error',
    });
  });

  it('should catch generic Error as internal server error', () => {
    // Arrange
    const exception = new Error('Unexpected error');

    // Act
    filter.catch(exception, mockArgumentsHost);

    // Assert
    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(mockResponse.json).toHaveBeenCalledWith({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      timestamp: expect.any(String),
      message: 'Unexpected error',
    });
  });

  it('should catch unknown error as internal server error with default message', () => {
    // Arrange
    const exception = 'Some unknown error type';

    // Act
    filter.catch(exception, mockArgumentsHost);

    // Assert
    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(mockResponse.json).toHaveBeenCalledWith({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      timestamp: expect.any(String),
      message: 'Internal server error',
    });
  });

  it('should catch null exception as internal server error', () => {
    // Arrange
    const exception = null;

    // Act
    filter.catch(exception, mockArgumentsHost);

    // Assert
    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(mockResponse.json).toHaveBeenCalledWith({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      timestamp: expect.any(String),
      message: 'Internal server error',
    });
  });

  it('should catch undefined exception as internal server error', () => {
    // Arrange
    const exception = undefined;

    // Act
    filter.catch(exception, mockArgumentsHost);

    // Assert
    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(mockResponse.json).toHaveBeenCalledWith({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      timestamp: expect.any(String),
      message: 'Internal server error',
    });
  });
});
