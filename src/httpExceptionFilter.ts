import {
    ArgumentsHost,
    Catch,
    ExceptionFilter,
    HttpException,
    HttpStatus,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';

export interface HttpExceptionResponse {
    statusCode: number;
    message: string;
    error: string;
}

@Catch()
export class AllExceptionFilter implements ExceptionFilter {
    constructor(private readonly httpAdaptorHost: HttpAdapterHost) { }

    catch(exception: any, host: ArgumentsHost): void {
        const { httpAdapter } = this.httpAdaptorHost;
        const ctx = host.switchToHttp();

        const httpStatus =
            exception instanceof HttpException
                ? exception.getStatus()
                : HttpStatus.INTERNAL_SERVER_ERROR;

        console.log('EXception :: => ', exception);

        const exceptionResponse =
            exception instanceof HttpException
                ? ctx.getResponse()
                : String(exception);

        const responseBody = {
            statusCode: httpStatus,
            timeStamp: new Date().toISOString(),
            path: httpAdapter.getRequestUrl(ctx.getRequest()),
            message:
                (exceptionResponse as HttpExceptionResponse).message ||
                (exceptionResponse as HttpExceptionResponse).error ||
                exceptionResponse ||
                'Something went wrong!',
            errorResponse: exceptionResponse,
        };

        httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
    }
}
