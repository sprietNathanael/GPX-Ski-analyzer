import { SupportedColorScheme } from '@mui/material';
import { blue, pink } from '@mui/material/colors';
import { enUS, frFR } from '@mui/material/locale';
import { createTheme } from '@mui/material/styles';

export default function globalTheme(theme: SupportedColorScheme, locale: string) {
	let currentLocales: object[] = [enUS];

	const baseTheme = createTheme();

	switch (locale) {
		case 'fr':
			currentLocales = [frFR];
			break;
		case 'en':
			currentLocales = [enUS];
			break;
	}
	const mainTheme = createTheme(
		{
			palette: {
				mode: theme,
				primary: blue,
				secondary: pink,
				// error: red,
				// Used by `getContrastText()` to maximize the contrast between the background and
				// the text.
				contrastThreshold: 3,
				// Used to shift a color's luminance by approximately
				// two indexes within its tonal palette.
				// E.g., shift from Red 500 to Red 300 or Red 700.
				tonalOffset: 0.2,
			},
		},
		...currentLocales
	);
	return mainTheme;
}
