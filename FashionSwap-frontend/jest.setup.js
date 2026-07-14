require('@testing-library/jest-dom');

// Suppress noisy Recharts ResponsiveContainer warning and React act() console errors in tests
const _origWarn = console.warn;
const _origError = console.error;

console.warn = (...args) => {
	try {
		const msg = args[0] ?? '';
		if (typeof msg === 'string' && msg.includes('The width(-1) and height(-1) of chart')) {
			return;
		}
	} catch (e) {}
	_origWarn.apply(console, args);
};

console.error = (...args) => {
	try {
		const msg = String(args[0] ?? '');
		if (msg.includes('not wrapped in act(') || msg.includes('The width(-1) and height(-1) of chart')) {
			return;
		}
	} catch (e) {}
	_origError.apply(console, args);
};
