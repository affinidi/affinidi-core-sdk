# Affinity SDK for Node

> WARNING **Action required from you**  
> Update your services to use Affinidi SDK v6.0.4 or above.  
> Note please pay attention to the changelog while upgrading the version of SDK as some methods may be changed or deprecated.
> If you are using Affinidi SDK below v6, your application doesn’t support Affinidi Vault and hence we cannot migrate you out of the Bloom Vault.  
> With Affinidi SDK v6.0.4 onwards, we have also introduced automatic trigger of migration to Affinidi Vault and that is why we ask you to upgrade to that version or above.  
> Otherwise your credentials will never be migrated. The migration will not anyhow impact SDK performance negatively.  
> Furthermore, if you have more than 100 credentials in Bloom Vault the performance should be increased after migration.

Node SDK extends CORE SDK. Make sure to check the [CORE SDK documentation](https://www.npmjs.com/package/@affinidi/wallet-core-sdk).

## How to install

```shell script
npm i --save @affinidi/wallet-node-sdk
```

## Setup Integration Tests

Test credentials should be added to the top level `.env` file. These contain usernames and passwords of pre-populated accounts on the staging environment. Reach out to a team member for instructions on how to set up this file, or to obtain a copy.

## How to use

Please refer to [`@affinidi/wallet-core-sdk` README](https://github.com/affinityproject/affinidi-core-sdk/tree/master/sdk/core)
