# 2.0.0-beta.5 (2020-08-20)
* `ElemDidDocument` abstracted to use a KeyVault to provide the relevant keys
# 2.0.0-beta.4 (2020-07-23)
* Fixed initializing `externalKeys` in `KeysService`
# 2.0.0-beta.3 (2020-07-19)
* Internal changes
# 2.0.0-beta.1 (2020-06-29)
* Improved type declarations
* Breaking changes
  * `KeysService.getSigningKey` and `getKey` made private. Use one of the following alternatives instead:
    * `getPublicKey`
    * `getPrivateKey`
    * `getPublicAndPrivateKeys`
    * `getAnchorTransactionPublicKey`
    * `getAnchorTransactionPrivateKey`
    * `getAnchorTransactionPublicAndPrivateKeys`
# 1.9.0 (2020-06-16)
* Declared input and output types on `KeysService` methods
* Implemented `KeysService.getOwnPublicKey` and `KeysService.getOwnPrivateKey`
# 1.8.0 (2020-06-04)
* Reorganized dependencies
# 1.6.0 (2020-02-16)
* Performance improvement. Add revocable credential context url to [local context](./src/_baseDocumentLoader/localContexts.ts) .
