const jwt = require('jsonwebtoken');

export class CryptHelper {
  constructor() { }

  /**
   * Create JWT token
   *
   * @param {string} prefix - prefix for token
   * @param {object} sub - subject payload
   * @param {number} expire - seconds
   * @param {string} secret - secret key from environment variables
   * @return {string}
   * @memberof CryptHelper
   */
  createJWT(prefix, sub, expire, secret) {
    const date = Math.floor(Date.now() / 1000); // in seconds
    return prefix + jwt.sign(
        {
          sub,
          iat: date,
          exp: date + expire,
        },
        secret
    );
  };
}
