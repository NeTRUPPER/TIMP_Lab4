module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '^axios$': '<rootDir>/src/__mocks__/axios.js'
  },
  transformIgnorePatterns: [
    '/node_modules/(?!(axios)/)',
  ],
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest'
  }
}; 