export class ProviderConfigurationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ProviderConfigurationError'
  }
}

export class ProviderRequestError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ProviderRequestError'
  }
}
