// frontend/src/components/dashboards/ClientsDashboard.jsx

import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Button,
  Tabs,
  Tab,
  Chip,
  IconButton,
  Tooltip,
  Avatar,
  Card,
  CardContent,
  CardMedia,
  CardActionArea,
  Divider,
  LinearProgress,
  CircularProgress,
  Fade,
  Grow,
  Zoom,
  Stack,
  ButtonGroup,
  Badge,
  ToggleButton,
  ToggleButtonGroup,
  useTheme,
  useMediaQuery,
  Alert,
  Skeleton,
  Menu,
  MenuItem,
  CardActions,
  InputAdornment,
  TextField,
  FormControl,
  InputLabel,
  Select,
  Collapse,
  AvatarGroup,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Rating,
} from '@mui/material';
import { styled, keyframes, alpha } from '@mui/material/styles';
import {
  Add,
  FilterList,
  Download,
  Visibility,
  Edit,
  TrendingUp,
  TrendingDown,
  Person,
  RemoveRedEye,
  FavoriteBorder,
  Favorite,
  DateRange,
  CameraAlt,
  Email,
  Phone,
  LocationOn,
  LocalFireDepartment,
  Whatshot,
  NewReleases,
  AutoAwesome,
  Star,
  AttachMoney,
  Schedule,
  Groups,
  Assessment,
  Check,
  Close,
  MoreVert,
  Search,
  Sort,
  ViewList,
  ViewModule,
  Share,
  Print,
  Business,
  Home,
  PersonAdd,
  Message,
  Timer,
  History,
  WorkHistory,
  Timeline,
  ShowChart,
  Speed,
  Category,
  Apartment,
  Villa,
  ContactMail,
  QrCode2,
  CloudUpload,
  Notifications,
  Badge as BadgeIcon,
  EmojiEvents,
  Cake,
  HandshakeOutlined,
  TrendingFlat,
  AccountBalance,
  CreditCard,
  Receipt,
  Assignment,
  CalendarMonth,
  SupportAgent,
  VerifiedUser,
  ThumbUp,
  Psychology,
  PersonSearch,
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useSnackbar } from 'notistack';
import { format } from 'date-fns';
import { safeFormatDate } from '../../utils/safeDateUtils';
import { useNavigate } from 'react-router-dom';
import { clientsAPI } from '../../services/api';
import ClientForm from '../forms/ClientForm';
import { motion, AnimatePresence } from 'framer-motion';
import CountUp from 'react-countup';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Treemap,
} from 'recharts';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, EffectFade } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';

// Styled Components
const HeroSection = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(135deg, #1565C0 0%, #42A5F5 100%)',
  color: 'white',
  padding: theme.spacing(6),
  borderRadius: theme.spacing(3),
  position: 'relative',
  overflow: 'hidden',
  marginBottom: theme.spacing(4),
  boxShadow: '0 20px 60px rgba(21, 101, 192, 0.3)',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: -50,
    right: -50,
    width: 200,
    height: 200,
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '50%',
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: -30,
    left: -30,
    width: 150,
    height: 150,
    background: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '50%',
  },
}));

const StatsCard = styled(Card)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.9)',
  backdropFilter: 'blur(10px)',
  borderRadius: theme.spacing(2),
  boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
  transition: 'all 0.3s ease',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
  },
}));

const pulseAnimation = keyframes`
  0% {
    box-shadow: 0 0 0 0 rgba(21, 101, 192, 0.4);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(21, 101, 192, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(21, 101, 192, 0);
  }
`;

const floatAnimation = keyframes`
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
`;

const ClientCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'all 0.3s ease',
  borderRadius: theme.spacing(2),
  overflow: 'hidden',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
    '& .client-avatar': {
      transform: 'scale(1.1)',
    },
    '& .action-buttons': {
      opacity: 1,
    },
  },
}));

const StatusChip = styled(Chip)(({ status, theme }) => ({
  fontWeight: 600,
  ...(status === 'Active' && {
    backgroundColor: alpha(theme.palette.success.main, 0.1),
    color: theme.palette.success.main,
    border: `1px solid ${alpha(theme.palette.success.main, 0.3)}`,
  }),
  ...(status === 'Past Client' && {
    backgroundColor: alpha(theme.palette.info.main, 0.1),
    color: theme.palette.info.main,
    border: `1px solid ${alpha(theme.palette.info.main, 0.3)}`,
  }),
  ...(status === 'Prospect' && {
    backgroundColor: alpha(theme.palette.warning.main, 0.1),
    color: theme.palette.warning.main,
    border: `1px solid ${alpha(theme.palette.warning.main, 0.3)}`,
  }),
}));

const MetricBox = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.spacing(2),
  background: alpha(theme.palette.background.paper, 0.8),
  backdropFilter: 'blur(10px)',
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  transition: 'all 0.3s ease',
  '&:hover': {
    background: theme.palette.background.paper,
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
  },
}));

const ClientsDashboard = () => {
  const [tabValue, setTabValue] = useState(0);
  const [openForm, setOpenForm] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [selectedFilters, setSelectedFilters] = useState({
    type: [],
    preferredContact: [],
    tags: [],
  });
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [compareMode, setCompareMode] = useState(false);
  const [selectedForCompare, setSelectedForCompare] = useState([]);
  const [actionsAnchorEl, setActionsAnchorEl] = useState(null);
  const [favorites, setFavorites] = useState([]);
  
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  // Filter map for tabs
  const filterMap = ['all', 'Active', 'Past Client', 'Prospect'];
  const currentFilter = filterMap[tabValue];

  // Fetch clients data
  const { data: clientsData, isLoading } = useQuery(
    ['clients', currentFilter, selectedFilters, searchTerm, sortBy],
    async () => {
      try {
        const params = {};
        if (currentFilter !== 'all') params.status = currentFilter;
        
        const response = await clientsAPI.getAll(params);
        
        if (response.data) {
          let clients = Array.isArray(response.data) ? response.data : response.data.data || [];
          
          // Apply local filters
          if (searchTerm) {
            clients = clients.filter(client => 
              client.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
              client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
              client.phone?.includes(searchTerm)
            );
          }
          
          // Apply advanced filters
          if (selectedFilters.type.length > 0) {
            clients = clients.filter(client => 
              selectedFilters.type.includes(client.type)
            );
          }
          
          // Sort clients
          clients.sort((a, b) => {
            switch (sortBy) {
              case 'recent':
                return new Date(b.createdAt) - new Date(a.createdAt);
              case 'name':
                return (a.name || '').localeCompare(b.name || '');
              case 'value':
                return (b.lifetimeValue || 0) - (a.lifetimeValue || 0);
              case 'activity':
                return new Date(b.lastContactDate) - new Date(a.lastContactDate);
              default:
                return 0;
            }
          });
          
          return clients;
        }
        return [];
      } catch (error) {
        console.error('Error fetching clients:', error);
        return getMockData();
      }
    },
    {
      refetchInterval: 30000,
      retry: 1,
    }
  );

  // Mock data fallback
  const getMockData = () => [
    {
      id: '1',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@email.com',
      phone: '(555) 123-4567',
      type: 'Buyer',
      status: 'Active',
      preferredContact: 'Email',
      lifetimeValue: 450000,
      lastContactDate: new Date('2024-01-10'),
      createdAt: new Date('2023-06-15'),
      tags: ['first-time', 'pre-approved'],
      avatar: 'https://i.pravatar.cc/150?u=sarah',
      transactions: 2,
      rating: 5,
    },
    {
      id: '2',
      name: 'Michael Chen',
      email: 'michael.chen@email.com',
      phone: '(555) 234-5678',
      type: 'Seller',
      status: 'Active',
      preferredContact: 'Phone',
      lifetimeValue: 750000,
      lastContactDate: new Date('2024-01-08'),
      createdAt: new Date('2023-08-20'),
      tags: ['investor', 'repeat-client'],
      avatar: 'https://i.pravatar.cc/150?u=michael',
      transactions: 5,
      rating: 5,
    },
    {
      id: '3',
      name: 'Emily Davis',
      email: 'emily.davis@email.com',
      phone: '(555) 345-6789',
      type: 'Both',
      status: 'Past Client',
      preferredContact: 'Text',
      lifetimeValue: 325000,
      lastContactDate: new Date('2023-12-15'),
      createdAt: new Date('2023-04-10'),
      tags: ['referral-source'],
      avatar: 'https://i.pravatar.cc/150?u=emily',
      transactions: 3,
      rating: 4,
    },
  ];

  const clients = clientsData || [];

  // Calculate statistics
  const stats = {
    totalClients: clients.length,
    activeClients: clients.filter(c => c.status === 'Active').length,
    totalValue: clients.reduce((sum, c) => sum + (c.lifetimeValue || 0), 0),
    avgRating: clients.reduce((sum, c) => sum + (c.rating || 0), 0) / clients.length || 0,
  };

  // Chart data
  const clientTypeData = [
    { name: 'Buyers', value: clients.filter(c => c.type === 'Buyer').length, color: '#1565C0' },
    { name: 'Sellers', value: clients.filter(c => c.type === 'Seller').length, color: '#42A5F5' },
    { name: 'Both', value: clients.filter(c => c.type === 'Both').length, color: '#90CAF9' },
  ];

  const monthlyData = [
    { month: 'Aug', clients: 12, value: 450 },
    { month: 'Sep', clients: 15, value: 580 },
    { month: 'Oct', clients: 18, value: 690 },
    { month: 'Nov', clients: 22, value: 820 },
    { month: 'Dec', clients: 20, value: 750 },
    { month: 'Jan', clients: 25, value: 950 },
  ];

  const toggleFavorite = (clientId) => {
    setFavorites(prev => 
      prev.includes(clientId) 
        ? prev.filter(id => id !== clientId)
        : [...prev, clientId]
    );
  };

  const handleCompareToggle = (clientId) => {
    if (selectedForCompare.includes(clientId)) {
      setSelectedForCompare(prev => prev.filter(id => id !== clientId));
    } else if (selectedForCompare.length < 3) {
      setSelectedForCompare(prev => [...prev, clientId]);
    } else {
      enqueueSnackbar('You can compare up to 3 clients at a time', { variant: 'info' });
    }
  };

  const handleBulkAction = (action) => {
    switch (action) {
      case 'export':
        enqueueSnackbar('Exporting selected clients...', { variant: 'info' });
        break;
      case 'email':
        enqueueSnackbar('Opening email composer...', { variant: 'info' });
        break;
      case 'delete':
        enqueueSnackbar('Delete functionality not implemented', { variant: 'warning' });
        break;
    }
    setActionsAnchorEl(null);
  };

  const renderGridView = () => (
    <Grid container spacing={3}>
      <AnimatePresence>
        {clients.map((client, index) => (
          <Grid item xs={12} sm={6} md={4} key={client.id}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <ClientCard>
                <Box sx={{ p: 2, position: 'relative' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar
                      src={client.avatar}
                      className="client-avatar"
                      sx={{
                        width: 60,
                        height: 60,
                        mr: 2,
                        transition: 'transform 0.3s ease',
                        border: '3px solid',
                        borderColor: 'primary.main',
                      }}
                    >
                      {client.name?.[0]}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {client.name}
                      </Typography>
                      <StatusChip
                        size="small"
                        label={client.status}
                        status={client.status}
                      />
                    </Box>
                    <IconButton
                      size="small"
                      onClick={() => toggleFavorite(client.id)}
                      sx={{ color: favorites.includes(client.id) ? 'error.main' : 'action.disabled' }}
                    >
                      {favorites.includes(client.id) ? <Favorite /> : <FavoriteBorder />}
                    </IconButton>
                  </Box>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Stack spacing={1}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Email sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {client.email}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Phone sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {client.phone}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <AttachMoney sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        Lifetime: ${(client.lifetimeValue || 0).toLocaleString()}
                      </Typography>
                    </Box>
                  </Stack>
                  
                  <Box sx={{ mt: 2 }}>
                    <Rating value={client.rating || 0} readOnly size="small" />
                  </Box>
                  
                  <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {client.tags?.map((tag, idx) => (
                      <Chip
                        key={idx}
                        label={tag}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: '0.75rem' }}
                      />
                    ))}
                  </Box>
                  
                  <Box
                    className="action-buttons"
                    sx={{
                      display: 'flex',
                      gap: 1,
                      mt: 2,
                      opacity: 0,
                      transition: 'opacity 0.3s ease',
                    }}
                  >
                    <Button
                      size="small"
                      variant="contained"
                      startIcon={<RemoveRedEye />}
                      onClick={() => navigate(`/clients/${client.id}`)}
                      fullWidth
                    >
                      View Details
                    </Button>
                    {compareMode && (
                      <IconButton
                        size="small"
                        color={selectedForCompare.includes(client.id) ? 'primary' : 'default'}
                        onClick={() => handleCompareToggle(client.id)}
                      >
                        <Check />
                      </IconButton>
                    )}
                  </Box>
                </Box>
              </ClientCard>
            </motion.div>
          </Grid>
        ))}
      </AnimatePresence>
    </Grid>
  );

  const columns = [
    {
      field: 'name',
      headerName: 'Name',
      flex: 1,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Avatar src={params.row.avatar} sx={{ width: 32, height: 32 }}>
            {params.value?.[0]}
          </Avatar>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {params.value}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {params.row.type}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => (
        <StatusChip label={params.value} status={params.value} size="small" />
      ),
    },
    {
      field: 'email',
      headerName: 'Email',
      flex: 1,
    },
    {
      field: 'phone',
      headerName: 'Phone',
      width: 150,
    },
    {
      field: 'lifetimeValue',
      headerName: 'Lifetime Value',
      width: 150,
      renderCell: (params) => `$${(params.value || 0).toLocaleString()}`,
    },
    {
      field: 'lastContactDate',
      headerName: 'Last Contact',
      width: 120,
      renderCell: (params) => params.value ? safeFormatDate(params.value, 'MMM d, yyyy') : '-',
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={1}>
          <IconButton
            size="small"
            onClick={() => navigate(`/clients/${params.row.id}`)}
          >
            <RemoveRedEye />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => {
              setSelectedClient(params.row);
              setOpenForm(true);
            }}
          >
            <Edit />
          </IconButton>
        </Stack>
      ),
    },
  ];

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Hero Section */}
      <HeroSection>
        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} md={8}>
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Typography variant="h3" sx={{ fontWeight: 700, mb: 2 }}>
                Client Management
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9, mb: 3 }}>
                Build lasting relationships and grow your business
              </Typography>
              <Stack direction="row" spacing={2} flexWrap="wrap">
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<PersonAdd />}
                  onClick={() => setOpenForm(true)}
                  sx={{
                    backgroundColor: 'white',
                    color: 'primary.main',
                    '&:hover': {
                      backgroundColor: 'grey.100',
                    },
                  }}
                >
                  Add New Client
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  startIcon={<CloudUpload />}
                  sx={{
                    borderColor: 'white',
                    color: 'white',
                    '&:hover': {
                      borderColor: 'white',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    },
                  }}
                >
                  Import Clients
                </Button>
              </Stack>
            </motion.div>
          </Grid>
          <Grid item xs={12} md={4}>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <MetricBox>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
                      <CountUp end={stats.totalClients} duration={2} />
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Clients
                    </Typography>
                  </MetricBox>
                </Grid>
                <Grid item xs={6}>
                  <MetricBox>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: 'success.main' }}>
                      <CountUp end={stats.activeClients} duration={2} />
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Active Clients
                    </Typography>
                  </MetricBox>
                </Grid>
                <Grid item xs={6}>
                  <MetricBox>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: 'warning.main' }}>
                      ${stats.totalValue > 1000000 ? 
                        <CountUp end={stats.totalValue / 1000000} decimals={1} duration={2} suffix="M" /> :
                        <CountUp end={stats.totalValue / 1000} duration={2} suffix="K" />
                      }
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Value
                    </Typography>
                  </MetricBox>
                </Grid>
                <Grid item xs={6}>
                  <MetricBox>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Rating value={stats.avgRating} readOnly size="small" />
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {stats.avgRating.toFixed(1)}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Avg Rating
                    </Typography>
                  </MetricBox>
                </Grid>
              </Grid>
            </motion.div>
          </Grid>
        </Grid>
      </HeroSection>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={8}>
          <StatsCard>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                Client Growth Trend
              </Typography>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={monthlyData}>
                  <defs>
                    <linearGradient id="colorClients" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1565C0" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#1565C0" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" stroke="#666" />
                  <YAxis stroke="#666" />
                  <RechartsTooltip />
                  <Area
                    type="monotone"
                    dataKey="clients"
                    stroke="#1565C0"
                    fillOpacity={1}
                    fill="url(#colorClients)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </StatsCard>
        </Grid>
        <Grid item xs={12} md={4}>
          <StatsCard>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                Client Distribution
              </Typography>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={clientTypeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {clientTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
              <Stack spacing={1} sx={{ mt: 2 }}>
                {clientTypeData.map((item) => (
                  <Box key={item.name} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: item.color }} />
                      <Typography variant="body2">{item.name}</Typography>
                    </Box>
                    <Typography variant="body2" fontWeight={600}>{item.value}</Typography>
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </StatsCard>
        </Grid>
      </Grid>

      {/* Filters and Controls */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search clients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={8}>
            <Stack direction="row" spacing={2} justifyContent="flex-end" flexWrap="wrap">
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Sort By</InputLabel>
                <Select
                  value={sortBy}
                  label="Sort By"
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <MenuItem value="recent">Most Recent</MenuItem>
                  <MenuItem value="name">Name</MenuItem>
                  <MenuItem value="value">Lifetime Value</MenuItem>
                  <MenuItem value="activity">Last Activity</MenuItem>
                </Select>
              </FormControl>
              
              <ToggleButtonGroup
                value={viewMode}
                exclusive
                onChange={(e, newMode) => newMode && setViewMode(newMode)}
                size="small"
              >
                <ToggleButton value="grid">
                  <ViewModule />
                </ToggleButton>
                <ToggleButton value="list">
                  <ViewList />
                </ToggleButton>
              </ToggleButtonGroup>
              
              <Button
                variant="outlined"
                startIcon={<FilterList />}
                onClick={(e) => setFilterAnchorEl(e.currentTarget)}
              >
                Filters
              </Button>
              
              <Button
                variant={compareMode ? "contained" : "outlined"}
                onClick={() => {
                  setCompareMode(!compareMode);
                  setSelectedForCompare([]);
                }}
              >
                Compare
              </Button>
              
              <IconButton onClick={(e) => setActionsAnchorEl(e.currentTarget)}>
                <MoreVert />
              </IconButton>
            </Stack>
          </Grid>
        </Grid>
        
        <Collapse in={showAdvancedFilters}>
          <Box sx={{ mt: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Client Type</InputLabel>
                  <Select
                    multiple
                    value={selectedFilters.type}
                    onChange={(e) => setSelectedFilters({ ...selectedFilters, type: e.target.value })}
                    renderValue={(selected) => selected.join(', ')}
                  >
                    {['Buyer', 'Seller', 'Both'].map((type) => (
                      <MenuItem key={type} value={type}>
                        {type}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        </Collapse>
      </Paper>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={(e, newValue) => setTabValue(newValue)}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label={`All Clients (${clients.length})`} />
          <Tab label={`Active (${clients.filter(c => c.status === 'Active').length})`} />
          <Tab label={`Past Clients (${clients.filter(c => c.status === 'Past Client').length})`} />
          <Tab label={`Prospects (${clients.filter(c => c.status === 'Prospect').length})`} />
        </Tabs>
      </Paper>

      {/* Content Area */}
      {isLoading ? (
        <Grid container spacing={3}>
          {[1, 2, 3, 4].map((i) => (
            <Grid item xs={12} sm={6} md={4} key={i}>
              <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 2 }} />
            </Grid>
          ))}
        </Grid>
      ) : viewMode === 'grid' ? (
        renderGridView()
      ) : (
        <Paper sx={{ height: 600 }}>
          <DataGrid
            rows={clients}
            columns={columns}
            pageSize={10}
            rowsPerPageOptions={[10, 25, 50]}
            checkboxSelection={compareMode}
            disableSelectionOnClick
            sx={{
              '& .MuiDataGrid-row:hover': {
                backgroundColor: alpha(theme.palette.primary.main, 0.04),
              },
            }}
          />
        </Paper>
      )}

      {/* Comparison Panel */}
      <AnimatePresence>
        {compareMode && selectedForCompare.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
          >
            <Paper
              sx={{
                position: 'fixed',
                bottom: 20,
                left: '50%',
                transform: 'translateX(-50%)',
                p: 2,
                boxShadow: 3,
                borderRadius: 2,
                zIndex: 1000,
              }}
            >
              <Stack direction="row" spacing={2} alignItems="center">
                <Typography variant="body2">
                  {selectedForCompare.length} clients selected
                </Typography>
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => {
                    enqueueSnackbar('Opening comparison view...', { variant: 'info' });
                  }}
                >
                  Compare Now
                </Button>
                <IconButton
                  size="small"
                  onClick={() => {
                    setCompareMode(false);
                    setSelectedForCompare([]);
                  }}
                >
                  <Close />
                </IconButton>
              </Stack>
            </Paper>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filter Menu */}
      <Menu
        anchorEl={filterAnchorEl}
        open={Boolean(filterAnchorEl)}
        onClose={() => setFilterAnchorEl(null)}
      >
        <MenuItem onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}>
          Advanced Filters
        </MenuItem>
        <MenuItem onClick={() => setSelectedFilters({ type: [], preferredContact: [], tags: [] })}>
          Clear Filters
        </MenuItem>
      </Menu>

      {/* Actions Menu */}
      <Menu
        anchorEl={actionsAnchorEl}
        open={Boolean(actionsAnchorEl)}
        onClose={() => setActionsAnchorEl(null)}
      >
        <MenuItem onClick={() => handleBulkAction('export')}>
          <Download sx={{ mr: 1 }} /> Export
        </MenuItem>
        <MenuItem onClick={() => handleBulkAction('email')}>
          <Email sx={{ mr: 1 }} /> Send Email
        </MenuItem>
        <MenuItem onClick={() => enqueueSnackbar('Report generated', { variant: 'success' })}>
          <Assessment sx={{ mr: 1 }} /> Generate Report
        </MenuItem>
      </Menu>

      {/* Speed Dial */}
      <SpeedDial
        ariaLabel="Client actions"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        icon={<SpeedDialIcon />}
      >
        <SpeedDialAction
          icon={<PersonAdd />}
          tooltipTitle="Add Client"
          onClick={() => setOpenForm(true)}
        />
        <SpeedDialAction
          icon={<CloudUpload />}
          tooltipTitle="Import Clients"
          onClick={() => enqueueSnackbar('Import feature coming soon', { variant: 'info' })}
        />
        <SpeedDialAction
          icon={<QrCode2 />}
          tooltipTitle="Scan Business Card"
          onClick={() => enqueueSnackbar('QR scanner coming soon', { variant: 'info' })}
        />
      </SpeedDial>

      {/* Client Form Dialog */}
      <ClientForm
        open={openForm}
        onClose={() => {
          setOpenForm(false);
          setSelectedClient(null);
        }}
        client={selectedClient}
        onSuccess={() => {
          queryClient.invalidateQueries('clients');
          enqueueSnackbar(selectedClient ? 'Client updated successfully' : 'Client added successfully', { variant: 'success' });
        }}
      />
    </Container>
  );
};

export default ClientsDashboard;