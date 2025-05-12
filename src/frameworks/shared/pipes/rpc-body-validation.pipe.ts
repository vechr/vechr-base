import { ArgumentMetadata, PipeTransform } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { RpcBadRequestException } from '../exceptions';

interface ClassConstructor {
  new (...args: any[]): any;
}

@Injectable()
export class RpcBodyValidationPipe implements PipeTransform<any> {
  async transform(value: any, { metatype, type }: ArgumentMetadata) {
    const body = value.body;

    if (!body) {
      return value;
    }

    // Check if the request is RPC
    if (type === 'custom') {
      return value;
    }

    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }

    if (Object.keys(body).includes('id')) {
      body.id = body.id; // Doing Some convert ID in here!
    }

    const object = plainToInstance(metatype, body);
    const errors = await validate(object);

    const customErrors = errors.map((err) => ({
      field: err.property,
      value: err.value,
      errors: err.constraints,
    }));

    if (errors.length > 0) {
      throw new RpcBadRequestException({
        message: 'Validation failed!',
        params: customErrors,
      });
    }
    return value;
  }

  private toValidate(metatype: ClassConstructor): boolean {
    const types: ClassConstructor[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }
}
