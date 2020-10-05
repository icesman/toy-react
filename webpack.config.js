/**
 * @author: iceman
 * @date: 2020/10/5.
 */
// eslint-disable-next-line no-undef
module.exports = {
	entry: {
		main: './src/index.js'
	},
	module: {
		rules: [
			{
				test: /\.js$/,
				use: {
					loader: 'babel-loader',
					options: {
						presets: ['@babel/preset-env'],
						plugins: [
							['@babel/plugin-transform-react-jsx', { pragma: 'createElement' }]
						]
					},
				},
			},
		],
	},
	mode: 'development',
	optimization: {
		minimize: false
	}
};