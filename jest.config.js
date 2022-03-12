module.exports = {
  roots: ['<rootDir>/test'],
  collectCoverage: true,
  testMatch: [
    "**/__tests__/**/*.+(ts|js)",
    "**/?(*.)+(spec|test).+(ts|js)"
  ],
  transform: {
    "^.+\\.(ts)$": "ts-jest"
  },
}
