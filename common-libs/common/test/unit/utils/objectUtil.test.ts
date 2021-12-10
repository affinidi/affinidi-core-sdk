import { buildObjectSkeletonFromPaths, injectFieldForAllParentRoots } from '../../../src/utils/objectUtil'
import { expect } from 'chai'

describe('objectUtil', () => {
  describe('#buildObjectSkeletonFromPaths', () => {
    it('should build object that represents paths to fields', () => {
      const paths = ['address/buildingNumber', 'address/country', 'id/age', 'id/name/firstName', 'date']

      const representingPathsAsObject = buildObjectSkeletonFromPaths(paths)

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
