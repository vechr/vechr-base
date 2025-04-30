import randomstring from 'randomstring';
import { SHA512, MD5 } from 'crypto-js';

export const rand = (len?: number): Promise<string> =>
  new Promise((res, rej) => {
    try {
      res(randomstring.generate(len || 16));
    } catch (error) {
      rej(error);
    }
  });

export const generateSalt = (): Promise<string> =>
  new Promise((res, rej) => {
    try {
      res(rand());
    } catch (error) {
      rej(error);
    }
  });

export const md5 = (plain: any): Promise<string> =>
  new Promise((res, rej) => {
    try {
      res(MD5(plain).toString());
    } catch (error) {
      rej(error);
    }
  });

export const sha512 = (plain: any): Promise<string> =>
  new Promise((res, rej) => {
    try {
      res(SHA512(plain).toString());
    } catch (error) {
      rej(error);
    }
  });
