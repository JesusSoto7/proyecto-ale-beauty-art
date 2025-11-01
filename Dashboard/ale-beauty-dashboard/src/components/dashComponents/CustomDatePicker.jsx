import * as React from 'react';
import dayjs from 'dayjs';
import Button from '@mui/material/Button';
import CalendarTodayRoundedIcon from '@mui/icons-material/CalendarTodayRounded';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TextField } from '@mui/material';

export default function CustomDatePicker() {
  const [value, setValue] = React.useState(dayjs());
  const [showPicker, setShowPicker] = React.useState(false);

  if (showPicker) {
    return (
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DatePicker
          value={value}
          onChange={(newValue) => {
            setValue(newValue);
            setShowPicker(false);
          }}
          onClose={() => setShowPicker(false)}
          renderInput={(params) => (
            <TextField {...params} style={{ display: 'none' }} />
          )}
          open={showPicker}
        />
      </LocalizationProvider>
    );
  }

  return (
    <Button
      variant="outlined"
      size="small"
      startIcon={<CalendarTodayRoundedIcon fontSize="small" />}
      sx={{ minWidth: 'fit-content' }}
      onClick={() => setShowPicker(true)}
    >
      {value ? value.format('MMM DD, YYYY') : 'Select Date'}
    </Button>
  );
}
