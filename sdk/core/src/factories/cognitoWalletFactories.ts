import { EventComponent } from '@affinidi/affinity-metrics-lib'

import { NetworkMemberWithCognito as Wallet } from '../CommonNetworkMember/NetworkMemberWithCognito'
import { KeyParamsOrOptions, MessageParameters, SdkOptions } from '../dto/shared.dto'
import { IPlatformCryptographyTools } from '../shared/interfaces'

export const createCognitoWalletFactories = (
  platformCryptographyTools: IPlatformCryptographyTools,
  eventComponent: EventComponent,
) => {
  const dependencies = { platformCryptographyTools, eventComponent }

  return {
    /**
     * @description Initiates passwordless login to Affinity
     * @param options - parameters with specified environment
     * @param login - email/phoneNumber, registered in Cognito
     * @param messageParameters - optional parameters with specified welcome message
     * @returns token
     */
    initiateLogInPasswordless: (inputOptions: SdkOptions, login: string, messageParameters?: MessageParameters) => {
      return Wallet.initiateLogInPasswordless(inputOptions, login, messageParameters)
    },

    /**
     * @description Completes login
     * @param options - parameters for BaseNetworkMember initialization
     * @param token - returned by initiateLogInPasswordless
     * @param confirmationCode - OTP sent by AWS Cognito/SES
     * @returns initialized instance of SDK
     */
    completeLogInPasswordless: (inputOptions: SdkOptions, token: string, confirmationCode: string) => {
      return Wallet.completeLogInPasswordless(dependencies, inputOptions, token, confirmationCode)
    },

    /**
     * @description Initiates reset password flow
     * @param options - parameters with specified environment
     * @param login - email/phoneNumber, registered in Cognito
     * @param messageParameters - optional parameters with specified welcome message
     * @returns token to be used with completeForgotPassword
     */
    initiateForgotPassword: (inputOptions: SdkOptions, login: string, messageParameters?: MessageParameters) => {
      return Wallet.initiateForgotPassword(inputOptions, login, messageParameters)
    },

    /**
     * @description Completes reset password flow
     * @param options - parameters with specified environment
     * @param forgotPasswordToken - token returned by initiateForgotPassword
     * @param confirmationCode - OTP sent by AWS Cognito/SES
     * @param newPassword - new password
     * @returns initialized instance of SDK
     */
    completeForgotPassword: (
      inputOptions: SdkOptions,
      forgotPasswordToken: string,
      confirmationCode: string,
      newPassword: string,
    ) => {
      return Wallet.completeForgotPassword(
        dependencies,
        inputOptions,
        forgotPasswordToken,
        confirmationCode,
        newPassword,
      )
    },

    /**
     * @description Logins to Affinity with login and password
     * @param options - optional parameters for BaseNetworkMember initialization
     * @param login - arbitrary username or email or phone number, registered in Cognito
     * @param password - password for Cognito user
     * @returns initialized instance of SDK
     */
    logInWithPassword: (inputOptions: SdkOptions, username: string, password: string) => {
      return Wallet.logInWithPassword(dependencies, inputOptions, username, password)
    },

    /**
     * @description Logins to Affinity with refreshToken
     * @param inputOptions - optional parameters for BaseNetworkMember initialization
     * @param refreshToken - refresh token
     * @returns initialized instance of SDK
     */
    logInWithRefreshToken: (inputOptions: SdkOptions, refreshToken: string) => {
      return Wallet.logInWithRefreshToken(dependencies, inputOptions, refreshToken)
    },

    /**
     * @description Initiates sign up flow to Affinity wallet, optionally with already created did
     * @param inputOptiosn - parameters with specified environment
     * @param username - arbitrary username
     * @param password - password
     * @param keyParamsOrOptions (optional) - { encryptedSeed, password } - previously created keys to be stored at wallet
     * @returns initialized instance of SDK
     */
    signUpWithUsername: (
      inputOptions: SdkOptions,
      username: string,
      password: string,
      keyParamsOrOptions?: KeyParamsOrOptions,
    ) => {
      return Wallet.signUpWithUsername(dependencies, inputOptions, username, password, keyParamsOrOptions)
    },

    /**
     * @description Initiates sign up flow
     * @param options - parameters with specified environment
     * @param email - email address
     * @param password (optional) - if not provided, a random password will be generated
     * @param messageParameters (optional) - parameters with specified welcome message
     * @returns token
     */
    initiateSignUpByEmail: (
      inputOptions: SdkOptions,
      email: string,
      password?: string | null,
      messageParameters?: MessageParameters,
    ) => {
      return Wallet.initiateSignUpByEmail(inputOptions, email, password, messageParameters)
    },

    /**
     * @description Initiates sign up flow
     * @param options - parameters with specified environment
     * @param phone - phone number
     * @param password (optional) - if not provided, a random password will be generated
     * @param messageParameters (optional) - parameters with specified welcome message
     * @returns token
     */
    initiateSignUpByPhone: (
      inputOptions: SdkOptions,
      phone: string,
      password?: string | null,
      messageParameters?: MessageParameters,
    ) => {
      return Wallet.initiateSignUpByPhone(inputOptions, phone, password, messageParameters)
    },

    /**
     * @description Completes sign up flow, optionally with already created did
     *       (as result created keys will be stored at the Affinity Wallet)
     * @param options - optional parameters for BaseNetworkMember initialization
     * @param token - Token returned by initiateSignUp method.
     * @param confirmationCode - OTP sent by AWS Cognito/SES.
     * @param keyParamsOrOptions (optional) - { encryptedSeed, password } - previously created keys to be stored at wallet.
     * @returns initialized instance of SDK
     */
    completeSignUp: (
      inputOptions: SdkOptions,
      signUpToken: string,
      confirmationCode: string,
      keyParamsOrOptions?: KeyParamsOrOptions,
    ) => {
      return Wallet.completeSignUp(dependencies, inputOptions, signUpToken, confirmationCode, keyParamsOrOptions)
    },

    /**
     * @description Resends OTP for sign up flow
     * @param inputOptions - parameters with specified environment
     * @param signUpToken - token returned by `initiateSignUp...`
     * @param messageParameters (optional) - parameters with specified welcome message
     */
    resendSignUp: (inputOptions: SdkOptions, signUpToken: string, messageParameters?: MessageParameters) => {
      return Wallet.resendSignUp(inputOptions, signUpToken, messageParameters)
    },

    /**
     * @description Initiates passwordless sign in of an existing user,
     * or signs up a new one, if user was not registered
     * @param options - optional parameters with specified environment
     * @param username - email or phone number
     * @param messageParameters - optional parameters with specified welcome message
     * @returns token
     */
    initiateSignInPasswordless: (inputOptions: SdkOptions, login: string, messageParameters?: MessageParameters) => {
      return Wallet.initiateSignInPasswordless(inputOptions, login, messageParameters)
    },

    /**
     * @description Completes sign in
     * @param options - optional parameters for BaseNetworkMember initialization
     * @param token - received from #signIn method
     * @param confirmationCode - OTP sent by AWS Cognito/SES
     * @returns an object with a flag, identifying whether new account was created, and initialized instance of SDK
     */
    completeSignInPasswordless: (options: SdkOptions, signInToken: string, confirmationCode: string) => {
      return Wallet.completeSignInPasswordless(dependencies, options, signInToken, confirmationCode)
    },

    /**
     * @description Creates a new instance of SDK from string returned by `serialize`
     * @param options - parameters for AffinityWallet initialization
     * @param serializedWallet
     * @returns initialized instance of SDK
     */
    deserializeSession: (inputOptions: SdkOptions, serializedSession: string) => {
      return Wallet.deserializeSession(dependencies, inputOptions, serializedSession)
    },
  }
}
