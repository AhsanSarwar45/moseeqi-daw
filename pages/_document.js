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
					<style jsx global>{`
						/* Other global styles such as 'html, body' etc... */

						#__next {
							height: 100%;
						}
					`}</style>
				</body>
			</Html>
		);
	}
}
