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
						#__next {
						@apply flex flex-col h-screen;
						}

					`}</style>
				</body>
			</Html>
		);
	}
}
