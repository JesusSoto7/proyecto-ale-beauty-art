import * as React from 'react';
import PropTypes from 'prop-types';
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { SparkLineChart } from '@mui/x-charts/SparkLineChart';
import { areaElementClasses } from '@mui/x-charts/LineChart';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import Avatar from '@mui/material/Avatar';
import Skeleton from '@mui/material/Skeleton';

function AreaGradient({ color, id }) {
  return (
    <defs>
      <linearGradient id={id} x1="50%" y1="0%" x2="50%" y2="100%">
        <stop offset="0%" stopColor={color} stopOpacity={0.3} />
        <stop offset="100%" stopColor={color} stopOpacity={0} />
      </linearGradient>
    </defs>
  );
}

AreaGradient.propTypes = {
  color: PropTypes.string.isRequired,
  id: PropTypes.string.isRequired,
};

function StatCard({
  title, value, interval, trend, data, labels, subtitle, percentText, deltaText, icon, hideArrow, chipColor, loading
}) {
  const theme = useTheme();

  const trendColors = {
    up:
      theme.palette.mode === 'light'
        ? theme.palette.success.main
        : theme.palette.success.light,
    down:
      theme.palette.mode === 'light'
        ? theme.palette.error.main
        : theme.palette.error.light,
    neutral:
      theme.palette.mode === 'light'
        ? theme.palette.grey[400]
        : theme.palette.grey[700],
  };

  const labelColors = {
    up: 'success',
    down: 'error',
    neutral: 'default',
  };

  const color = labelColors[trend] || 'default';
  const chartColor = trendColors[trend] || trendColors.neutral;
  const trendValues = { up: '+25%', down: '-25%', neutral: '+5%' };
  const chipDisplayColor = chipColor || color;
  // safe id for gradient (no spaces or $)
  const safeId = `area-gradient-${String(value).replace(/[^a-zA-Z0-9]/g, '-')}`;

  const IconComponent = icon || ShoppingBagOutlinedIcon;

  return (
    <Card
      variant="outlined"
      sx={{
        height: '100%',
        flexGrow: 1,
        borderRadius: 2,
        border: (theme) => `1px solid ${theme.palette.mode === 'light' ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.06)'}`,
        backgroundColor: (theme) => theme.palette.mode === 'light' ? theme.palette.background.paper : '#0f1113',
      }}
    >
      <CardContent>
        {/* Header */}
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Avatar sx={{ bgcolor: (theme) => theme.palette.mode === 'light' ? theme.palette.grey[100] : theme.palette.grey[900], width: 40, height: 40 }}>
              {loading
                ? <Skeleton variant="circular" width={28} height={28} />
                : <IconComponent fontSize="small" />
              }
            </Avatar>
            <Stack>
              <Typography component="h2" variant="subtitle2" sx={{ color: (theme) => theme.palette.mode === 'light' ? 'text.primary' : '#fff' }}>
                {loading ? <Skeleton width={100} /> : title}
              </Typography>
              {subtitle ? (
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {subtitle}
                </Typography>
              ) : null}
            </Stack>
          </Stack>
          {!hideArrow && !loading && (
            <ChevronRightIcon sx={{ color: 'text.secondary' }} />
          )}
        </Stack>

        {/* Content */}
        <Stack direction="column" sx={{ gap: 1 }}>
          <Stack sx={{ justifyContent: 'space-between' }}>
            <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h4" component="p" sx={{ color: (theme) => theme.palette.mode === 'light' ? 'text.primary' : '#fff' }}>
                {loading ? <Skeleton width={48} /> : value}
              </Typography>
              {loading
                ? <Skeleton variant="rectangular" width={60} height={28} sx={{ borderRadius: 1 }} />
                : <Chip size="small" color={chipDisplayColor} label={percentText || trendValues[trend]} />
              }
            </Stack>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {loading ? <Skeleton width={80} /> : interval.replace(/\s*de\s*/gi, ' ')}
            </Typography>
          </Stack>
          <Box sx={{ width: '100%', height: 56 }}>
            {loading
              ? <Skeleton variant="rectangular" width="100%" height={56} />
              : <SparkLineChart
                color={chartColor}
                data={data || []}
                area
                showHighlight
                showTooltip
                xAxis={{
                  scaleType: 'band',
                  data: labels.map(l => l.replace(/\s*de\s*/gi, ' ')),
                }}
                sx={{
                  [`& .${areaElementClasses.root}`]: {
                    fill: `url(#${safeId})`,
                  },
                  '& svg': {
                    width: '100%',
                    height: '56px',
                  },
                }}
              >
                <AreaGradient color={chartColor} id={safeId} />
              </SparkLineChart>
            }
          </Box>
          {/* Pie del card */}
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Stack direction="row" spacing={1} alignItems="center">
              {loading
                ? <Skeleton variant="rectangular" width={24} height={24} sx={{ borderRadius: '50%' }} />
                : (trend === 'up'
                  ? <ArrowUpwardIcon fontSize="small" sx={{ color: chartColor }} />
                  : (trend === 'down'
                    ? <ArrowDownwardIcon fontSize="small" sx={{ color: chartColor }} />
                    : <Box sx={{ width: 20 }} />)
                )
              }
              <Typography variant="body2" sx={{ color: (theme) => theme.palette.mode === 'light' ? 'text.primary' : '#fff', fontWeight: 600 }}>
                {loading ? <Skeleton width={38} /> : (percentText || trendValues[trend])}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {loading ? <Skeleton width={32} /> : deltaText}
              </Typography>
            </Stack>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}

StatCard.propTypes = {
  data: PropTypes.arrayOf(PropTypes.number),
  labels: PropTypes.arrayOf(PropTypes.string),
  interval: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  trend: PropTypes.oneOf(['down', 'neutral', 'up']).isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  subtitle: PropTypes.string,
  percentText: PropTypes.string,
  deltaText: PropTypes.string,
  icon: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),
  hideArrow: PropTypes.bool,
  chipColor: PropTypes.string,
  loading: PropTypes.bool,
};

StatCard.defaultProps = {
  data: [],
  labels: [],
  subtitle: '',
  percentText: '',
  deltaText: '',
  icon: null,
  hideArrow: false,
  chipColor: undefined,
  loading: false,
};

export default StatCard;