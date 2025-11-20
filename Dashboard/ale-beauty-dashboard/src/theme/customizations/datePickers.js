import { alpha } from '@mui/material/styles';
import { menuItemClasses } from '@mui/material/MenuItem';
import { pickersDayClasses, yearCalendarClasses } from '@mui/x-date-pickers';
import { gray, brand } from '../../shared-theme/themePrimitives';

export const datePickersCustomizations = {
  MuiPickerPopper: {
    styleOverrides: {
      paper: ({ theme }) => ({
        marginTop: 4,
        borderRadius: theme.shape.borderRadius,
        border: `1px solid ${(theme.vars || theme).palette.divider}`,
        backgroundImage: 'none',
        background: 'hsl(0, 0%, 100%)',
        boxShadow:
          'hsla(220, 30%, 5%, 0.07) 0px 4px 16px 0px, hsla(220, 25%, 10%, 0.07) 0px 8px 16px -5px',
        [`& .${menuItemClasses.root}`]: {
          borderRadius: 6,
          margin: '0 6px',
        },
        ...theme.applyStyles('dark', {
          background: gray[900],
          boxShadow:
            'hsla(220, 30%, 5%, 0.7) 0px 4px 16px 0px, hsla(220, 25%, 10%, 0.8) 0px 8px 16px -5px',
        }),
      }),
    },
  },

  /* ==== FLECHAS DEL CALENDARIO (Arrow Switcher) ==== */
  MuiPickersArrowSwitcher: {
    styleOverrides: {
      root: ({ theme }) => ({
        display: 'flex',
        alignItems: 'center',
        gap: 8,                          // separa los dos icon buttons
        // Evita que un borde se “pegue” al otro
        '& .MuiIconButton-root': {
          border: 'none !important',     // anula borde global de MuiIconButton
          backgroundColor: 'transparent',
          width: 34,
          height: 34,
          padding: 0,
          boxShadow: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'background-color 120ms, color 120ms',
          '&:hover': {
            backgroundColor: alpha(gray[200], 0.4),
          },
          '&:active': {
            backgroundColor: alpha(gray[300], 0.6),
          },
          '&:focus-visible': {
            outline: `3px solid ${alpha(brand[500], 0.45)}`,
            outlineOffset: '2px',
          },
          '& .MuiTouchRipple-root': {
            display: 'none',             // por si quedara ripple
          },
          ...theme.applyStyles('dark', {
            color: (theme.vars || theme).palette.grey[400],
            '&:hover': {
              backgroundColor: alpha(gray[700], 0.4),
            },
            '&:active': {
              backgroundColor: alpha(gray[600], 0.6),
            },
          }),
        },
        // Si hubiera un spacer generando línea visual, lo anulamos:
        '& .MuiPickersArrowSwitcher-spacer': {
          width: 0,
          display: 'none',
        },
      }),
      // Mantén spacer override por si internamente lo usan:
      spacer: { width: 0 },
      // Override directo del "button" (algunos builds de MUI x pickers lo usan):
      button: ({ theme }) => ({
        backgroundColor: 'transparent',
        color: (theme.vars || theme).palette.grey[500],
        border: 'none',
        width: 34,
        height: 34,
        padding: 0,
        '&:hover': {
          backgroundColor: alpha(gray[200], 0.4),
        },
        '&:active': {
          backgroundColor: alpha(gray[300], 0.6),
        },
        '&:focus-visible': {
          outline: `3px solid ${alpha(brand[500], 0.45)}`,
          outlineOffset: '2px',
        },
        ...theme.applyStyles('dark', {
          color: (theme.vars || theme).palette.grey[400],
          '&:hover': {
            backgroundColor: alpha(gray[700], 0.4),
          },
          '&:active': {
            backgroundColor: alpha(gray[600], 0.6),
          },
        }),
      }),

      /* --- Variante ALTERNATIVA “ghost” SIN hover gris (descomentar si la prefieres)
      button: ({ theme }) => ({
        backgroundColor: 'transparent',
        color: (theme.vars || theme).palette.grey[500],
        border: 'none',
        width: 34,
        height: 34,
        padding: 0,
        '&:hover': {
          backgroundColor: 'transparent',
          color: (theme.vars || theme).palette.text.primary,
        },
        '&:active': {
          backgroundColor: 'transparent',
          opacity: 0.6,
        },
        '&:focus-visible': {
          outline: `3px solid ${alpha(brand[500], 0.45)}`,
          outlineOffset: '2px',
        },
        ...theme.applyStyles('dark', {
          color: (theme.vars || theme).palette.grey[400],
          '&:hover': {
            backgroundColor: 'transparent',
            color: (theme.vars || theme).palette.text.primary,
          },
          '&:active': {
            opacity: 0.6,
          },
        }),
      }),
      */
    },
  },

  MuiPickersCalendarHeader: {
    styleOverrides: {
      switchViewButton: {
        padding: 0,
        border: 'none',
      },
    },
  },

  MuiMonthCalendar: {
    styleOverrides: {
      button: ({ theme }) => ({
        fontSize: theme.typography.body1.fontSize,
        color: (theme.vars || theme).palette.grey[600],
        padding: theme.spacing(0.5),
        borderRadius: theme.shape.borderRadius,
        '&:hover': {
          backgroundColor: (theme.vars || theme).palette.action.hover,
        },
        [`&.${yearCalendarClasses.selected}`]: {
          backgroundColor: gray[700],
          fontWeight: theme.typography.fontWeightMedium,
        },
        '&:focus': {
          outline: `3px solid ${alpha(brand[500], 0.5)}`,
          outlineOffset: '2px',
          backgroundColor: 'transparent',
          [`&.${yearCalendarClasses.selected}`]: { backgroundColor: gray[700] },
        },
        ...theme.applyStyles('dark', {
          color: (theme.vars || theme).palette.grey[300],
          '&:hover': {
            backgroundColor: (theme.vars || theme).palette.action.hover,
          },
          [`&.${yearCalendarClasses.selected}`]: {
            color: (theme.vars || theme).palette.common.black,
            fontWeight: theme.typography.fontWeightMedium,
            backgroundColor: gray[300],
          },
          '&:focus': {
            outline: `3px solid ${alpha(brand[500], 0.5)}`,
            outlineOffset: '2px',
            backgroundColor: 'transparent',
            [`&.${yearCalendarClasses.selected}`]: { backgroundColor: gray[300] },
          },
        }),
      }),
    },
  },

  MuiYearCalendar: {
    styleOverrides: {
      button: ({ theme }) => ({
        fontSize: theme.typography.body1.fontSize,
        color: (theme.vars || theme).palette.grey[600],
        padding: theme.spacing(0.5),
        borderRadius: theme.shape.borderRadius,
        height: 'fit-content',
        '&:hover': {
          backgroundColor: (theme.vars || theme).palette.action.hover,
        },
        [`&.${yearCalendarClasses.selected}`]: {
          backgroundColor: gray[700],
          fontWeight: theme.typography.fontWeightMedium,
        },
        '&:focus': {
          outline: `3px solid ${alpha(brand[500], 0.5)}`,
          outlineOffset: '2px',
          backgroundColor: 'transparent',
          [`&.${yearCalendarClasses.selected}`]: { backgroundColor: gray[700] },
        },
        ...theme.applyStyles('dark', {
          color: (theme.vars || theme).palette.grey[300],
          '&:hover': {
            backgroundColor: (theme.vars || theme).palette.action.hover,
          },
          [`&.${yearCalendarClasses.selected}`]: {
            color: (theme.vars || theme).palette.common.black,
            fontWeight: theme.typography.fontWeightMedium,
            backgroundColor: gray[300],
          },
          '&:focus': {
            outline: `3px solid ${alpha(brand[500], 0.5)}`,
            outlineOffset: '2px',
            backgroundColor: 'transparent',
            [`&.${yearCalendarClasses.selected}`]: { backgroundColor: gray[300] },
          },
        }),
      }),
    },
  },

  MuiPickersDay: {
    styleOverrides: {
      root: ({ theme }) => ({
        fontSize: theme.typography.body1.fontSize,
        color: (theme.vars || theme).palette.grey[600],
        padding: theme.spacing(0.5),
        borderRadius: theme.shape.borderRadius,
        '&:hover': {
          backgroundColor: (theme.vars || theme).palette.action.hover,
        },
        [`&.${pickersDayClasses.selected}`]: {
          backgroundColor: gray[700],
          fontWeight: theme.typography.fontWeightMedium,
        },
        '&:focus': {
          outline: `3px solid ${alpha(brand[500], 0.5)}`,
          outlineOffset: '2px',
          backgroundColor: 'transparent',
          [`&.${pickersDayClasses.selected}`]: { backgroundColor: gray[700] },
        },
        ...theme.applyStyles('dark', {
          color: (theme.vars || theme).palette.grey[300],
          '&:hover': {
            backgroundColor: (theme.vars || theme).palette.action.hover,
          },
          [`&.${pickersDayClasses.selected}`]: {
            color: (theme.vars || theme).palette.common.black,
            fontWeight: theme.typography.fontWeightMedium,
            backgroundColor: gray[300],
          },
          '&:focus': {
            outline: `3px solid ${alpha(brand[500], 0.5)}`,
            outlineOffset: '2px',
            backgroundColor: 'transparent',
            [`&.${pickersDayClasses.selected}`]: { backgroundColor: gray[300] },
          },
        }),
      }),
    },
  },
};