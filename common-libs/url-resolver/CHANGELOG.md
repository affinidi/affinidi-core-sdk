# release 1.2.0 (2022-09-06)
* upgraded to npm 8;
* updated `ts-node` and `mocha` versions;
* eliminated pointing to `tsconfig.json`(this file name used by ts-node by default, but for node 16+ throws error) file in tests commands.
# release 1.1.3 (2022-04-04)
Remove unused service 
  - user auth 
  - sff-issuer 
# release 1.1.2 (2021-03-12)
Local urls are never used with NODE_ENV set to 'test'
# release 1.1.1 (2021-11-29)
Added support for migration service
# release 1.1.0 (2021-11-12)
Resolve internal urls instead of public depends on env
# release 1.0.0 (2021-10-28)
Initial commit
