/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';


declare interface IUser {
  name: string;
  age: number;
} 

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  getUser(): IUser {
    return {
      name: 'John Doe',
      age: 30,
    };
  }
}
