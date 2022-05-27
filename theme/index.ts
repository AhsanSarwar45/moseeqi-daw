import { extendTheme, theme as base } from '@chakra-ui/react';

const Theme = extendTheme({
	styles: {
		global: {
			'html, body': {
				height: '100%'
			},
			body: {
				margin: '0px'
			}
		}
	},
	colors: {
		brand: {
			primary: '#2B2E4A',
			secondary: '#E84545',
			accent1: '#903749',
			accent2: '#53354A'
		},

		text: {
			primary: "white",
			secondary: "rgba(255,255,255,0.6)",
			inactive: "rgba(255,255,255,0.3)",
		},

		primary: {
			100: '#50568b',
			200: '#474c7a',
			300: '#3e426a',
			400: '#34385a',
			500: '#2B2E4A', //background color
			600: '#22243a', // hover color
			700: '#181a2a', // active color
			800: '#0f101a',
			900: '#060609'
		},

		secondary: {
			100: '#f3a0a0',
			200: '#f08989',
			300: '#ee7272',
			400: '#eb5c5c',
			500: '#e84545', //background color
			600: '#de1c1c', // hover color
			700: '#b11616', // active color
			800: '#841010',
			900: '#560b0b'
		}
	},
	fonts: {
		heading: 'Open Sans, ${base.fonts?.heading}',
		body: 'Open Sans, ${base.fonts?.heading}'
	},
	components: {
		Button: {
			baseStyle: {
				borderRadius: 'sm',
				fontWeight: 'bold'
			}
		},
		Input: {
			sizes: {
				md: {
					field: {
						height: 12,
						borderRadius: 'sm'
					}
				}
			},
			defaultProps: {}
		},

		Text: {
			baseStyle: {
				textColor: 'text.primary',
			}
		},

		MenuItem: {
			defaultProps: {
				textColor: 'text.primary',
			}
		}
	}
});

export default Theme;
