import { VCEmployeePersonV1, VCSEmployeePersonV1, getVCEmployeePersonV1Context } from './v1'
import { expandVC } from '../../testUtil.test'

describe('VCEmployeePersonV1', () => {
  it('expands correctly', async () => {
    expect.assertions(1)

    const expanded = await expandVC<VCEmployeePersonV1, VCSEmployeePersonV1>({
      type: 'EmployeeCredentialPersonV1',
      data: {
        '@type': ['Person', 'PersonE', 'EmployeePerson'],
        name: 'Bob Belcher',
        officialEmail: 'bob.b@affinidi.com',
        organizationName: 'Affinidi',
        title: 'Software Engineer',
        employmentType: 'Full-time',
        dateOfJoining: '15-02-2021',
        personalEmail: 'bob@gmail.com',
        phoneNumber: '123456789',
        employeeAddress: '9, 9th street, Koramangala, Bangalore',
        organizationAddress: '9, 9th street, Koramangala, Bangalore',
        organizationLogo: 'logo url here',
        dateOfRelieving: 'relieving date here',
        team: 'gde',
        responsibilities: 'writing code',
        otherDetails: {
          projects: ['onboarding'],
        },
      },
      context: getVCEmployeePersonV1Context(),
    })

    expect(expanded).toMatchInlineSnapshot()
  })
})
