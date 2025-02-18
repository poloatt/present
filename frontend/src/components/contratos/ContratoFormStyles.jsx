import { styled, alpha } from '@mui/material/styles';
import { Dialog, TextField, Box, Chip, ToggleButton } from '@mui/material';

export const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: 0,
    backgroundColor: theme.palette.background.default,
    [theme.breakpoints.down('sm')]: {
      margin: 0,
      maxHeight: '100%',
      height: '100%',
      width: '100%',
      maxWidth: '100%'
    },
    [theme.breakpoints.up('sm')]: {
      minWidth: '600px',
      maxWidth: '800px'
    }
  }
}));

export const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: 0,
    backgroundColor: alpha(theme.palette.background.paper, 0.9),
    '& fieldset': {
      borderColor: theme.palette.divider
    },
    '&:hover fieldset': {
      borderColor: 'rgba(255, 255, 255, 0.2)'
    },
    '&.Mui-focused fieldset': {
      borderColor: theme.palette.primary.main
    }
  },
  '& .MuiInputLabel-root': {
    transform: 'translate(14px, -9px) scale(0.75)',
    '&.Mui-focused, &.MuiFormLabel-filled': {
      transform: 'translate(14px, -9px) scale(0.75)'
    }
  },
  '& .MuiInputLabel-shrink': {
    transform: 'translate(14px, -9px) scale(0.75)'
  }
}));

export const FormSection = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(2)
}));

export const StyledToggleButton = styled(ToggleButton)(({ theme, customcolor }) => ({
  flex: 1,
  height: 40,
  borderRadius: 0,
  border: 'none',
  backgroundColor: 'transparent',
  color: theme.palette.text.secondary,
  transition: 'all 0.2s ease',
  textTransform: 'none',
  padding: theme.spacing(1),
  minWidth: 40,
  '&:hover': {
    backgroundColor: 'transparent',
    '& .MuiSvgIcon-root': {
      color: customcolor
    },
    '& .MuiTypography-root': {
      color: customcolor,
      marginLeft: theme.spacing(1)
    }
  },
  '&.Mui-selected': {
    backgroundColor: 'transparent',
    '& .MuiSvgIcon-root': {
      color: customcolor
    },
    '& .MuiTypography-root': {
      color: customcolor,
      marginLeft: theme.spacing(1),
      display: 'block !important'
    }
  },
  '& .MuiSvgIcon-root': {
    fontSize: '1.2rem',
    transition: 'color 0.2s ease'
  },
  '& .MuiTypography-root': {
    fontSize: '0.875rem',
    transition: 'all 0.2s ease',
    marginLeft: 0
  }
}));

export const CategoryChip = styled(Chip)(({ theme, customcolor }) => ({
  borderRadius: 0,
  height: 40,
  minWidth: 40,
  padding: 0,
  transition: 'all 0.2s ease',
  backgroundColor: 'transparent',
  border: 'none',
  color: theme.palette.text.secondary,
  '& .MuiChip-icon': {
    margin: 0,
    fontSize: '1.25rem',
    transition: 'all 0.2s ease'
  },
  '& .MuiChip-label': {
    display: 'none',
    transition: 'all 0.2s ease',
    padding: theme.spacing(0, 1),
    color: theme.palette.text.secondary
  },
  '&:hover': {
    backgroundColor: 'transparent',
    '& .MuiChip-label': {
      display: 'block'
    },
    '& .MuiChip-icon': {
      color: customcolor
    }
  },
  '&.selected': {
    backgroundColor: 'transparent',
    '& .MuiChip-icon': {
      color: customcolor
    },
    '& .MuiChip-label': {
      display: 'block'
    }
  }
})); 