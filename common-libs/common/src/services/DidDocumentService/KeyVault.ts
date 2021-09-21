/**
 * Abstraction of a key vault used for generating did documents
 */
export interface KeyVault {
  /**
   * Primary public key
   */
  primaryPublicKey: Buffer

  /**
   * Recovery public key if available
   */
  recoveryPublicKey: Buffer

  /**
   * Array of external keys to be added to the elem object
   */
  externalKeys: any[]

  /**
   * Object with any additional info
   */
  metadata?: Record<string, any>

  /**
   * Sign the given payload with the primary public key
   *
   * @param payload payload to be signed
   */
  sign(payload: Buffer): Buffer

  /**
   * Sign the given payload with the primary public key. Same as sign but async.
   *
   * @param payload payload to be signed
   */
  signAsync?(payload: Buffer): Promise<Buffer>
}
