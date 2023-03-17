import _pbkdf2 from 'pbkdf2';

import { randomBytes } from './random';
import { LENGTH_1, LENGTH_16, KEY_LENGTH } from './constants';

export async function pbkdf2(password: Buffer): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    _pbkdf2.pbkdf2(
      password,
      randomBytes(LENGTH_16),
      LENGTH_1,
      KEY_LENGTH,
      (err, key) => {
        if (err) return reject(err);
        resolve(key);
      }
    );
  });
}
