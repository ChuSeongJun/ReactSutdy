module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'jest-environment-jsdom',
    transform: {
        '\\.[jt]sx?$': 'babel-jest',
    }
};
