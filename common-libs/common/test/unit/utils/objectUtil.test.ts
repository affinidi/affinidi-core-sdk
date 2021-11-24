import {
  buildObjectSkeletonFromPaths,
  injectFieldForAllParentRoots,
  validateObjectHasPaths,
} from '../../../src/utils/objectUtil'
import { expect } from 'chai'

describe('objectUtil', () => {
  describe('#buildObjectSkeletonFromPaths', () => {
    it('should build object that represents paths to fields', () => {
      const paths = ['address.buildingNumber', 'address.country', 'id.age', 'id.name.firstName', 'date']

      const representingPathsAsObject = buildObjectSkeletonFromPaths(paths)

      console.log(representingPathsAsObject)
      expect(representingPathsAsObject).to.deep.equal({
        date: {},
        address: {
          buildingNumber: {},
          country: {},
        },
        id: {
          age: {},
          name: {
            firstName: {},
          },
        },
      })
    })
  })

  describe('#validateObjectHasPaths', () => {
    const target = {
      address: {
        buildingNumber: 124,
        country: 'Narnia',
      },
      id: {
        age: 137,
        name: {
          firstName: 'Bob',
          secondName: 'Bobbkings',
        },
      },
    }
    it('should return undefined if all paths represented in target', () => {
      const paths = ['address.buildingNumber', 'address.country', 'id.age', 'id.name.firstName']

      const result = validateObjectHasPaths(target, paths)

      expect(result).to.be.undefined
    })

    it('should return list of errors', () => {
      const paths = ['address.buildingNumber', 'address.country', 'id.name.middleName', 'non.exists']

      const result = validateObjectHasPaths(target, paths)

      expect(result).to.be.equal([
        { field: 'middleName', path: 'id.name.middleName' },
        { field: 'non', path: 'non.exists' },
      ])
    })
  })

  describe('#injectFieldForAllParentRoots', () => {
    it('should inject @explicit = true for all parent levels of object', () => {
      const target = {
        address: {
          buildingNumber: {},
          country: {},
        },
        id: {
          age: {},
          name: {
            firstName: {},
          },
        },
      }

      const result = injectFieldForAllParentRoots(target, '@explicit', true)

      expect(result).to.deep.equal({
        address: {
          buildingNumber: {},
          country: {},
          '@explicit': true,
        },
        id: {
          age: {},
          name: {
            firstName: {},
            '@explicit': true,
          },
          '@explicit': true,
        },
        '@explicit': true,
      })
    })
  })
})
