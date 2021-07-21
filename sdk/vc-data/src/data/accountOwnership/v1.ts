import { CreateThing, createContextEntry } from '../util'

export type AccountOwnershipV1 = CreateThing<
  'AccountOwnership',
  {
    accountName: 'github' | 'twitter',
    accountType: 'github' | 'twitter',
    metaData: AccountOwnershipGithubV1
  }
  >

export type AccountOwnershipGithubV1 = CreateThing<
  'AccountOwnershipGithub',
  {
    id?: number
    login?: string
    url?: string
    name?: string
    email?: string
    followers?: number
    following?: number
    twitterUsername?: string
    repos?: Array<UserRepoGithubV1>
  }
  >

type UserRepoGithubV1 = CreateThing<
  'UserRepoGithub',
  {
    id?: number
    // eslint-disable-next-line camelcase
    full_name?: string
    owner?: RepoOwnerGithubV1
    url?: string
    // eslint-disable-next-line camelcase
    forks_count?: number
    // eslint-disable-next-line camelcase
    stargazers_count?: number
    // eslint-disable-next-line camelcase
    watchers_count?: number
  }
  >

type RepoOwnerGithubV1 = CreateThing<'RepoOwnerGithub',
  {
    login?: string
  }
  >

export const getHelperContextEntries = () => {
  const accountOwnershipGithubEntry = createContextEntry<AccountOwnershipGithubV1>({
    type: 'AccountOwnershipGithub',
    typeIdBase: 'affSchema',
    fields: {
      id: 'affSchema',
      login: 'affSchema',
      url: 'affSchema',
      name: 'affSchema',
      email: 'affSchema',
      followers: 'affSchema',
      following: 'affSchema',
      twitterUsername: 'affSchema',
      repos: 'affSchema',
    },
  })

  const userRepoGithubEntry = createContextEntry<UserRepoGithubV1>({
    type: 'UserRepoGithub',
    typeIdBase: 'affSchema',
    fields: {
      id: 'affSchema',
      full_name: 'affSchema',
      owner: 'affSchema',
      url: 'affSchema',
      forks_count: 'affSchema',
      stargazers_count: 'affSchema',
      watchers_count: 'affSchema',
    },
  })

  const repoOwnerEntry = createContextEntry<RepoOwnerGithubV1>({
    type: 'RepoOwnerGithub',
    typeIdBase: 'affSchema',
    fields: {
      login: 'affSchema',
    },
  })

  const accountOwnershipEntry = createContextEntry<AccountOwnershipV1>({
    type: 'AccountOwnership',
    typeIdBase: 'affSchema',
    fields: {
      accountName: 'affSchema',
      accountType: 'affSchema',
      metaData: 'affSchema'
    },
    vocab: 'schema',
  })

  return [
    accountOwnershipGithubEntry,
    userRepoGithubEntry,
    repoOwnerEntry,
    accountOwnershipEntry
  ]
}
