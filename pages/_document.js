// pages/_document.js
import Document, { Html, Head, Main, NextScript } from 'next/document';

export default class MyDocument extends Document {
	render() {
		return (
			<Html>
				<Head />
				<body>
					<Main />
					<NextScript />
					<style global jsx>{`
						html,
						body,
						body > div:first-child,
						div#__next,
						div#__next > div {
							height: 100%;
						}
					`}</style>
				</body>
			</Html>
		);
	}
}
