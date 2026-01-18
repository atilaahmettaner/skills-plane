import { createTheme, MantineColorsTuple } from '@mantine/core';

const myColor: MantineColorsTuple = [
    '#e1ffff',
    '#ccfbff',
    '#99f3ff',
    '#61ebff',
    '#3ae5fe',
    '#22e1fe',
    '#0bddfe',
    '#00c4e3',
    '#00afcc',
    '#0098b3'
];

export const theme = createTheme({
    primaryColor: 'cyan',
    primaryShade: 6,
    defaultRadius: 'md',
    fontFamily: 'Inter, sans-serif',
    colors: {
        cyan: myColor,
    },
    components: {
        Card: {
            defaultProps: {
                bg: 'rgba(255, 255, 255, 0.03)',
            },
        },
    },
});
