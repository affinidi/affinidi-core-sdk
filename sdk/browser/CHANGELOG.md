# release 0.10.0 (2020-08-17)

## Update interface

### init - Initialize from user access token

Returns SDK instance when user is logged in and throws `COR-9 / UnprocessableEntityError`
if user is logged out.

```ts
const affinityWallet = await AffinityWallet.init(options)
```

`options` - optional, if not defined default settings will be used
