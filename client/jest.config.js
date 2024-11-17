export default {
	testEnvironment: 'jest-environment-jsdom',
	transform: {
		'^.+\\.(js|jsx)$': 'babel-jest',
	},
	moduleFileExtensions: ['js', 'json', 'jsx'],
	moduleNameMapper: {
		'\\.(jpg|jpeg|png|gif|svg)$': 'jest-transform-stub',
		'\\.(css|less|scss|sass)$': 'identity-obj-proxy',
	},
};
