import { VCExperiencePersonV1, VCSExperiencePersonV1, getVCExperiencePersonV1Context } from './v1'
import { expandVC } from '../../testUtil.test'

describe('VCExperiencePersonV1', () => {
  it('expands correctly', async () => {
    expect.assertions(1)

    const expanded = await expandVC<VCExperiencePersonV1, VCSExperiencePersonV1>({
      type: 'ExperienceCredentialPersonV1',
      data: {
        '@type': ['Person', 'PersonE', 'ExperiencePerson'],
        name: 'Bob Belcher',
        officialEmail: 'bob.b@affinidi.com',
        organizationName: 'Affinidi',
        title: 'Software Engineer',
        employmentType: 'Full-time',
        dateOfJoining: '15-02-2021',
        personalEmail: 'bob@gmail.com',
        phoneNumber: '123456789',
        EmployeeAddress: '9, 9th street, Koramangala, Bangalore',
        organizationAddress: '9, 9th street, Koramangala, Bangalore',
        organizationLogo: 'logo url here',
        dateOfRelieving: 'relieving date here',
        team: 'gde',
        responsibilities: 'writing code',
        otherDetails: {
          projects: ['onboarding'],
        },
      },
      context: getVCExperiencePersonV1Context(),
    })

    expect(expanded).toMatchInlineSnapshot()
  })
})
