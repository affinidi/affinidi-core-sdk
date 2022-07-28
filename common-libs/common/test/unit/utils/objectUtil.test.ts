import { buildObjectSkeletonFromPaths, injectFieldForAllParentRoots } from '../../../src/utils/objectUtil'
import { expect } from 'chai'

const defaultValue = null as unknown

describe('objectUtil', () => {
  describe('#buildObjectSkeletonFromPaths', () => {
    it('should build object that represents paths to fields', () => {
      const originalObject = {
        date: defaultValue,
        address: {
          buildingNumber: defaultValue,
          country: defaultValue,
        },
        id: {
          age: defaultValue,
          name: {
            firstName: defaultValue,
          },
        },
      }
      const paths = ['address/buildingNumber', 'address/country', 'id/age', 'id/name/firstName', 'date']

      const representingPathsAsObject = buildObjectSkeletonFromPaths(paths, originalObject)

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

    it('should throw an exception for a missing path', () => {
      const originalObject = {
        date: defaultValue,
        address: {
          buildingNumber: defaultValue,
          country: defaultValue,
        },
        id: {
          age: defaultValue,
        },
      }
      const paths = ['address/buildingNumber', 'address/country', 'id/age', 'id/name/firstName', 'date']

      expect(() => buildObjectSkeletonFromPaths(paths, originalObject)).to.throw(
        'Field "id/name/firstName" not a part of credential',
      )
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
