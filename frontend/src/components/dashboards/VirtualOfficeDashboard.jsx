import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Avatar,
  Card,
  CardContent,
  LinearProgress,
  Chip,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Alert,
  Badge,
  Tooltip,
  Zoom,
  Fade,
  Button,
  IconButton,
  ToggleButton,
  ToggleButtonGroup,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Stack,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  SmartToy,
  Business,
  ViewList,
  ViewModule,
  Close,
  Send,
  Work,
  Analytics,
  Task,
  Schedule,
  CheckCircle,
  Warning,
  Celebration,
  Speed,
  Assessment,
  Groups,
  Email,
  Phone,
  ExpandMore,
  AccountTree,
  Psychology,
  TrendingUp,
  Assignment,
  Chat,
  Edit,
  Save,
  Cancel,
  MeetingRoom,
  HomeWork,
  Coffee,
  Computer,
  PhoneInTalk,
  Group,
} from '@mui/icons-material';
import { useQuery } from 'react-query';
import { format } from 'date-fns';
import Confetti from 'react-confetti';
import websocketService from '../../services/websocket';
import { aiAPI } from '../../services/api';

// Office areas with 3D-like positioning
const officeAreas = {
  reception: {
    name: 'Reception',
    x: 15,
    y: 15,
    width: 25,
    height: 20,
    color: 'rgba(25, 118, 210, 0.1)',
    border: '#1976d2',
    icon: <MeetingRoom />,
    description: 'Main entrance and Alex\'s desk'
  },
  buyerDept: {
    name: 'Buyer Department',
    x: 60,
    y: 10,
    width: 35,
    height: 40,
    color: 'rgba(46, 125, 50, 0.05)',
    border: '#2e7d32',
    icon: <HomeWork />,
    description: 'Buyer team offices'
  },
  listingDept: {
    name: 'Listing Department',
    x: 5,
    y: 55,
    width: 35,
    height: 40,
    color: 'rgba(237, 108, 2, 0.05)',
    border: '#ed6c02',
    icon: <Business />,
    description: 'Listing team offices'
  },
  operationsDept: {
    name: 'Operations',
    x: 60,
    y: 55,
    width: 35,
    height: 40,
    color: 'rgba(156, 39, 176, 0.05)',
    border: '#9c27b0',
    icon: <Computer />,
    description: 'Operations team offices'
  },
  conferenceRoom: {
    name: 'Conference Room',
    x: 42,
    y: 35,
    width: 16,
    height: 20,
    color: 'rgba(33, 150, 243, 0.1)',
    border: '#2196f3',
    icon: <Group />,
    description: 'Team meetings'
  },
  breakRoom: {
    name: 'Break Room',
    x: 42,
    y: 15,
    width: 16,
    height: 15,
    color: 'rgba(255, 152, 0, 0.05)',
    border: '#ff9800',
    icon: <Coffee />,
    description: 'Relaxation area'
  },
  ceoOffice: {
    name: 'CEO Office',
    x: 80,
    y: 5,
    width: 15,
    height: 15,
    color: 'rgba(211, 47, 47, 0.1)',
    border: '#d32f2f',
    icon: <Business />,
    description: 'Your office'
  }
};

// Agent locations based on their current activity
const getAgentLocation = (agent, activity) => {
  if (!activity) return agent.defaultLocation;
  
  switch (activity.type) {
    case 'phone_call':
      return { area: `${agent.department}Dept`, subArea: 'privateOffice' };
    case 'team_meeting':
      return { area: 'conferenceRoom', subArea: 'meeting' };
    case 'break':
      return { area: 'breakRoom', subArea: 'relaxing' };
    case 'client_meeting':
      return { area: 'conferenceRoom', subArea: 'client' };
    default:
      return agent.defaultLocation;
  }
};

// Agent data with locations
const agentProfiles = {
  alex_executive: {
    id: 'alex_executive',
    name: 'Alex',
    title: 'Executive Assistant',
    department: 'management',
    icon: '🤖',
    color: '#1976d2',
    image: 'https://i.pravatar.cc/300?img=1',
    defaultLocation: { area: 'reception', x: 20, y: 50 },
    stage: 2,
    model: 'GPT-4',
    apiEndpoint: '/api/v1/ai/alex',
    responsibilities: [
      'Oversight of all AI managers',
      'Weekly reporting and summaries',
      'Command processing from CEO',
      'Time-based check-ins',
      'Intelligence hub operations'
    ],
    metrics: {
      tasksToday: 47,
      avgResponseTime: '1.2m',
      efficiency: '97%',
      lastActive: '2 minutes ago'
    }
  },
  buyer_manager: {
    id: 'buyer_manager',
    name: 'Buyer Manager',
    title: 'Buyer Department Head',
    department: 'buyer',
    icon: '👔',
    color: '#2e7d32',
    image: 'https://i.pravatar.cc/300?img=2',
    defaultLocation: { area: 'buyerDept', x: 20, y: 20 },
    stage: 2,
    model: 'Claude-3-Sonnet',
    apiEndpoint: '/api/v1/ai/buyer-manager',
    metrics: {
      tasksToday: 23,
      avgResponseTime: '2.1m',
      efficiency: '94%',
      lastActive: '5 minutes ago'
    }
  },
  buyer_qualifier: {
    id: 'buyer_qualifier',
    name: 'Ella',
    title: 'Lead Response Specialist',
    department: 'buyer',
    icon: '📞',
    color: '#2e7d32',
    image: 'https://i.pravatar.cc/300?img=5',
    defaultLocation: { area: 'buyerDept', x: 60, y: 30 },
    stage: 1,
    model: 'GPT-3.5',
    apiEndpoint: '/api/v1/ai/ella',
    metrics: {
      tasksToday: 89,
      avgResponseTime: '1.8m',
      efficiency: '96%',
      lastActive: 'Active now'
    }
  },
  buyer_nurture: {
    id: 'buyer_nurture',
    name: 'Noah',
    title: 'Relationship Manager',
    department: 'buyer',
    icon: '💌',
    color: '#2e7d32',
    image: 'https://i.pravatar.cc/300?img=3',
    defaultLocation: { area: 'buyerDept', x: 30, y: 70 },
    stage: 1,
    model: 'GPT-3.5',
    apiEndpoint: '/api/v1/ai/noah',
    metrics: {
      tasksToday: 156,
      avgResponseTime: 'N/A',
      efficiency: '99%',
      lastActive: '10 minutes ago'
    }
  },
  showing_coordinator: {
    id: 'showing_coordinator',
    name: 'Sofia',
    title: 'Appointment Specialist',
    department: 'buyer',
    icon: '🗓️',
    color: '#2e7d32',
    image: 'https://i.pravatar.cc/300?img=9',
    defaultLocation: { area: 'buyerDept', x: 70, y: 70 },
    stage: 1,
    model: 'GPT-3.5',
    apiEndpoint: '/api/v1/ai/sofia',
    metrics: {
      tasksToday: 34,
      avgResponseTime: '3.5m',
      efficiency: '92%',
      lastActive: '15 minutes ago'
    }
  },
  listing_manager: {
    id: 'listing_manager',
    name: 'Liam',
    title: 'Listing Department Head',
    department: 'listing',
    icon: '👔',
    color: '#ed6c02',
    image: 'https://i.pravatar.cc/300?img=4',
    defaultLocation: { area: 'listingDept', x: 20, y: 20 },
    stage: 2,
    model: 'Claude-3-Sonnet',
    apiEndpoint: '/api/v1/ai/liam',
    metrics: {
      tasksToday: 31,
      avgResponseTime: '2.5m',
      efficiency: '93%',
      lastActive: '8 minutes ago'
    }
  },
  listing_launch: {
    id: 'listing_launch',
    name: 'Luna',
    title: 'MLS Optimization Expert',
    department: 'listing',
    icon: '🚀',
    color: '#ed6c02',
    image: 'https://i.pravatar.cc/300?img=20',
    defaultLocation: { area: 'listingDept', x: 60, y: 30 },
    stage: 1,
    model: 'GPT-4',
    apiEndpoint: '/api/v1/ai/luna',
    metrics: {
      tasksToday: 12,
      avgResponseTime: '5m',
      efficiency: '98%',
      lastActive: '20 minutes ago'
    }
  },
  market_analyst: {
    id: 'market_analyst',
    name: 'Marcus',
    title: 'Market Intelligence',
    department: 'listing',
    icon: '📊',
    color: '#ed6c02',
    image: 'https://i.pravatar.cc/300?img=7',
    defaultLocation: { area: 'listingDept', x: 30, y: 70 },
    stage: 2,
    model: 'GPT-4',
    apiEndpoint: '/api/v1/ai/marcus',
    metrics: {
      tasksToday: 18,
      avgResponseTime: '8m',
      efficiency: '95%',
      lastActive: '30 minutes ago'
    }
  },
  listing_marketing: {
    id: 'listing_marketing',
    name: 'Maya',
    title: 'Digital Marketing Specialist',
    department: 'listing',
    icon: '📢',
    color: '#ed6c02',
    image: 'https://i.pravatar.cc/300?img=21',
    defaultLocation: { area: 'listingDept', x: 70, y: 70 },
    stage: 1,
    model: 'GPT-3.5',
    apiEndpoint: '/api/v1/ai/maya',
    metrics: {
      tasksToday: 67,
      avgResponseTime: '4m',
      efficiency: '91%',
      lastActive: '5 minutes ago'
    }
  },
  ops_manager: {
    id: 'ops_manager',
    name: 'Oscar',
    title: 'Operations Department Head',
    department: 'operations',
    icon: '👔',
    color: '#9c27b0',
    image: 'https://i.pravatar.cc/300?img=8',
    defaultLocation: { area: 'operationsDept', x: 20, y: 20 },
    stage: 2,
    model: 'Claude-3-Sonnet',
    apiEndpoint: '/api/v1/ai/oscar',
    metrics: {
      tasksToday: 28,
      avgResponseTime: '3m',
      efficiency: '96%',
      lastActive: '12 minutes ago'
    }
  },
  transaction_coordinator: {
    id: 'transaction_coordinator',
    name: 'Tara',
    title: 'Escrow Management',
    department: 'operations',
    icon: '📄',
    color: '#9c27b0',
    image: 'https://i.pravatar.cc/300?img=22',
    defaultLocation: { area: 'operationsDept', x: 60, y: 30 },
    stage: 1,
    model: 'GPT-3.5',
    apiEndpoint: '/api/v1/ai/tara',
    metrics: {
      tasksToday: 45,
      avgResponseTime: '2.8m',
      efficiency: '94%',
      lastActive: 'Active now'
    }
  },
  compliance_officer: {
    id: 'compliance_officer',
    name: 'Carlos',
    title: 'Legal & Compliance',
    department: 'operations',
    icon: '✅',
    color: '#9c27b0',
    image: 'https://i.pravatar.cc/300?img=11',
    defaultLocation: { area: 'operationsDept', x: 30, y: 70 },
    stage: 1,
    model: 'GPT-4',
    apiEndpoint: '/api/v1/ai/carlos',
    metrics: {
      tasksToday: 23,
      avgResponseTime: '6m',
      efficiency: '99%',
      lastActive: '18 minutes ago'
    }
  },
  financial_analyst: {
    id: 'financial_analyst',
    name: 'Finn',
    title: 'Commission & Finance',
    department: 'operations',
    icon: '💰',
    color: '#9c27b0',
    image: 'https://i.pravatar.cc/300?img=12',
    defaultLocation: { area: 'operationsDept', x: 70, y: 70 },
    stage: 1,
    model: 'GPT-3.5',
    apiEndpoint: '/api/v1/ai/finn',
    metrics: {
      tasksToday: 19,
      avgResponseTime: '4.5m',
      efficiency: '97%',
      lastActive: '25 minutes ago'
    }
  },
  database_specialist: {
    id: 'database_specialist',
    name: 'Olivia',
    title: 'CRM & Database Admin',
    department: 'support',
    icon: '💾',
    color: '#757575',
    image: 'https://i.pravatar.cc/300?img=23',
    defaultLocation: { area: 'breakRoom', x: 50, y: 50 },
    stage: 1,
    model: 'GPT-3.5',
    apiEndpoint: '/api/v1/ai/olivia',
    metrics: {
      tasksToday: 38,
      avgResponseTime: '3.2m',
      efficiency: '95%',
      lastActive: '10 minutes ago'
    }
  }
};

// Department configurations
const departments = {
  management: { name: 'Executive', color: '#1976d2', icon: '🏢' },
  buyer: { name: 'Buyer Department', color: '#2e7d32', icon: '🏠' },
  listing: { name: 'Listing Department', color: '#ed6c02', icon: '📋' },
  operations: { name: 'Operations Department', color: '#9c27b0', icon: '⚙️' },
  support: { name: 'Support', color: '#757575', icon: '🔧' }
};

const VirtualOfficeDashboard = () => {
  const [viewMode, setViewMode] = useState('office');
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editedAgent, setEditedAgent] = useState(null);
  const [dmMessage, setDmMessage] = useState('');
  const [activities, setActivities] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [teamStats, setTeamStats] = useState({
    activeAgents: 12,
    totalTasks: 247,
    efficiency: 94.2,
    avgResponseTime: 2.1
  });
  const [agentLocations, setAgentLocations] = useState({});

  // Initialize agent locations
  useEffect(() => {
    const initialLocations = {};
    Object.entries(agentProfiles).forEach(([id, agent]) => {
      initialLocations[id] = agent.defaultLocation;
    });
    setAgentLocations(initialLocations);
  }, []);

  // Simulate agent movements
  useEffect(() => {
    const moveInterval = setInterval(() => {
      // Randomly move an agent
      const agents = Object.keys(agentProfiles);
      const randomAgent = agents[Math.floor(Math.random() * agents.length)];
      const agent = agentProfiles[randomAgent];
      
      // Simulate different activities
      const activities = [
        { type: 'phone_call', duration: 5000 },
        { type: 'team_meeting', duration: 10000 },
        { type: 'break', duration: 3000 },
        { type: 'working', duration: 0 }
      ];
      
      const activity = activities[Math.floor(Math.random() * activities.length)];
      const newLocation = getAgentLocation(agent, activity);
      
      setAgentLocations(prev => ({
        ...prev,
        [randomAgent]: newLocation
      }));
      
      // Return to default after activity
      if (activity.duration > 0) {
        setTimeout(() => {
          setAgentLocations(prev => ({
            ...prev,
            [randomAgent]: agent.defaultLocation
          }));
        }, activity.duration);
      }
    }, 8000);
    
    return () => clearInterval(moveInterval);
  }, []);

  // Subscribe to WebSocket events
  useEffect(() => {
    const handleActivity = (data) => {
      setActivities(prev => [{
        id: Date.now(),
        ...data,
        timestamp: new Date()
      }, ...prev].slice(0, 20));
    };

    const handleAchievement = (data) => {
      setAchievements(prev => [...prev, data]);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000);
    };

    const handleTeamStatus = (data) => {
      setTeamStats(data);
    };

    websocketService.on('ai:activity', handleActivity);
    websocketService.on('ai:achievement', handleAchievement);
    websocketService.on('ai:teamStatus', handleTeamStatus);

    return () => {
      websocketService.off('ai:activity', handleActivity);
      websocketService.off('ai:achievement', handleAchievement);
      websocketService.off('ai:teamStatus', handleTeamStatus);
    };
  }, []);

  // Get agent status
  const getAgentStatus = (agentId) => {
    const activity = activities.find(a => a.agentId === agentId);
    if (!activity) return 'idle';
    
    const timeDiff = Date.now() - new Date(activity.timestamp).getTime();
    if (timeDiff < 10000) return activity.status;
    return 'idle';
  };

  // Handle agent profile click
  const handleAgentClick = (agent) => {
    setSelectedAgent(agent);
    setEditMode(false);
    setEditedAgent(null);
    setDmMessage('');
  };

  // Render office view
  const renderOfficeView = () => (
    <Paper
      sx={{
        position: 'relative',
        height: 700,
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        overflow: 'hidden',
        borderRadius: 3,
        boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
      }}
    >
      {/* 3D effect background */}
      <Box
        sx={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          background: `
            repeating-linear-gradient(
              0deg,
              transparent,
              transparent 2px,
              rgba(0,0,0,0.03) 2px,
              rgba(0,0,0,0.03) 4px
            ),
            repeating-linear-gradient(
              90deg,
              transparent,
              transparent 2px,
              rgba(0,0,0,0.03) 2px,
              rgba(0,0,0,0.03) 4px
            )
          `,
          backgroundSize: '50px 50px'
        }}
      />

      {/* Office areas */}
      {Object.entries(officeAreas).map(([areaId, area]) => (
        <Box
          key={areaId}
          sx={{
            position: 'absolute',
            left: `${area.x}%`,
            top: `${area.y}%`,
            width: `${area.width}%`,
            height: `${area.height}%`,
            backgroundColor: area.color,
            border: `2px solid ${area.border}`,
            borderRadius: 2,
            transition: 'all 0.3s ease',
            '&:hover': {
              boxShadow: `0 4px 20px ${area.color}`,
              transform: 'translateY(-2px)'
            }
          }}
        >
          {/* Area label */}
          <Box
            sx={{
              position: 'absolute',
              top: 8,
              left: 8,
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              bgcolor: 'white',
              px: 1.5,
              py: 0.5,
              borderRadius: 1,
              boxShadow: 1
            }}
          >
            {area.icon}
            <Typography variant="caption" fontWeight={600}>
              {area.name}
            </Typography>
          </Box>

          {/* Special room features */}
          {areaId === 'conferenceRoom' && (
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '60%',
                height: '40%',
                bgcolor: '#8b6914',
                borderRadius: '50%',
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)'
              }}
            />
          )}
        </Box>
      ))}

      {/* Render agents */}
      {Object.entries(agentProfiles).map(([agentId, agent]) => {
        const status = getAgentStatus(agentId);
        const isActive = status === 'working';
        const currentActivity = activities.find(a => a.agentId === agentId);
        const location = agentLocations[agentId] || agent.defaultLocation;
        const area = officeAreas[location.area];
        
        // Calculate absolute position
        const agentX = area.x + (area.width * (location.x || 50) / 100);
        const agentY = area.y + (area.height * (location.y || 50) / 100);

        return (
          <Card
            key={agentId}
            onClick={() => handleAgentClick(agent)}
            sx={{
              position: 'absolute',
              left: `${agentX}%`,
              top: `${agentY}%`,
              transform: 'translate(-50%, -50%)',
              width: 140,
              cursor: 'pointer',
              transition: 'all 0.5s ease',
              bgcolor: 'white',
              boxShadow: isActive ? '0 0 20px rgba(76, 175, 80, 0.5)' : 3,
              border: isActive ? '2px solid #4caf50' : 'none',
              '&:hover': {
                transform: 'translate(-50%, -50%) scale(1.05)',
                boxShadow: '0 8px 30px rgba(0,0,0,0.15)'
              }
            }}
          >
            <Box sx={{ p: 1.5 }}>
              {/* Agent avatar */}
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Badge
                  badgeContent={isActive ? '●' : ''}
                  color="success"
                  variant="dot"
                  invisible={!isActive}
                  sx={{
                    '& .MuiBadge-dot': {
                      animation: isActive ? 'pulse 2s infinite' : 'none',
                    }
                  }}
                >
                  <Avatar
                    src={agent.image}
                    sx={{
                      width: 40,
                      height: 40,
                      border: `2px solid ${agent.color}`
                    }}
                  >
                    <Typography fontSize="18px">{agent.icon}</Typography>
                  </Avatar>
                </Badge>
                <Box sx={{ ml: 1, flex: 1 }}>
                  <Typography variant="subtitle2" sx={{ lineHeight: 1.2 }}>
                    {agent.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                    {agent.title}
                  </Typography>
                </Box>
              </Box>

              {/* Activity status */}
              {currentActivity && (
                <Box
                  sx={{
                    bgcolor: location.area === 'conferenceRoom' 
                      ? 'info.light' 
                      : location.area === 'breakRoom'
                      ? 'warning.light'
                      : 'action.hover',
                    borderRadius: 1,
                    p: 0.5,
                    mt: 0.5
                  }}
                >
                  <Typography variant="caption" sx={{ fontSize: '0.65rem' }}>
                    {location.area === 'conferenceRoom' && '🤝 In meeting'}
                    {location.area === 'breakRoom' && '☕ On break'}
                    {location.area.includes('Dept') && currentActivity.type === 'phone_call' && '📞 On call'}
                    {currentActivity.currentTask && !['conferenceRoom', 'breakRoom'].includes(location.area) && 
                      currentActivity.currentTask.substring(0, 20) + '...'}
                  </Typography>
                  {currentActivity.progress > 0 && (
                    <LinearProgress
                      variant="determinate"
                      value={currentActivity.progress}
                      sx={{ mt: 0.5, height: 3 }}
                    />
                  )}
                </Box>
              )}
            </Box>
          </Card>
        );
      })}

      {/* Office time */}
      <Box
        sx={{
          position: 'absolute',
          top: 16,
          right: 16,
          bgcolor: 'white',
          px: 2,
          py: 1,
          borderRadius: 2,
          boxShadow: 2
        }}
      >
        <Typography variant="body2">
          {format(new Date(), 'h:mm a')} PST
        </Typography>
      </Box>
    </Paper>
  );

  // Render card view
  const renderCardView = () => (
    <Grid container spacing={2}>
      {Object.entries(agentProfiles).map(([agentId, agent]) => {
        const status = getAgentStatus(agentId);
        const isActive = status === 'working';
        const currentActivity = activities.find(a => a.agentId === agentId);

        return (
          <Grid item xs={12} sm={6} md={4} lg={3} key={agentId}>
            <Card
              onClick={() => handleAgentClick(agent)}
              sx={{
                cursor: 'pointer',
                height: '100%',
                transition: 'all 0.3s ease',
                border: isActive ? '2px solid #4caf50' : 'none',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4
                }
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Badge
                    badgeContent={isActive ? '●' : ''}
                    color="success"
                    variant="dot"
                    invisible={!isActive}
                  >
                    <Avatar
                      src={agent.image}
                      sx={{
                        width: 56,
                        height: 56,
                        border: `3px solid ${agent.color}`
                      }}
                    >
                      <Typography fontSize="24px">{agent.icon}</Typography>
                    </Avatar>
                  </Badge>
                  <Box sx={{ ml: 2, flex: 1 }}>
                    <Typography variant="h6">{agent.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {agent.title}
                    </Typography>
                    <Chip
                      label={`Stage ${agent.stage}`}
                      size="small"
                      color={agent.stage === 3 ? 'success' : agent.stage === 2 ? 'primary' : 'default'}
                      sx={{ mt: 0.5 }}
                    />
                  </Box>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Tasks Today
                    </Typography>
                    <Typography variant="h6">
                      {agent.metrics.tasksToday}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Efficiency
                    </Typography>
                    <Typography variant="h6">
                      {agent.metrics.efficiency}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Response Time
                    </Typography>
                    <Typography variant="body2">
                      {agent.metrics.avgResponseTime}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Status
                    </Typography>
                    <Typography variant="body2" color={isActive ? 'success.main' : 'text.secondary'}>
                      {agent.metrics.lastActive}
                    </Typography>
                  </Grid>
                </Grid>

                {currentActivity && (
                  <Box
                    sx={{
                      mt: 2,
                      p: 1,
                      bgcolor: 'action.hover',
                      borderRadius: 1
                    }}
                  >
                    <Typography variant="caption">
                      Current: {currentActivity.currentTask || 'Processing...'}
                    </Typography>
                    {currentActivity.progress > 0 && (
                      <LinearProgress
                        variant="determinate"
                        value={currentActivity.progress}
                        sx={{ mt: 1 }}
                      />
                    )}
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        );
      })}
    </Grid>
  );

  // Render list view
  const renderListView = () => (
    <Box>
      {Object.entries(departments).map(([deptId, dept]) => {
        const deptAgents = Object.values(agentProfiles).filter(
          agent => agent.department === deptId
        );

        return (
          <Accordion key={deptId} defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography fontSize="20px">{dept.icon}</Typography>
                <Typography variant="h6">{dept.name}</Typography>
                <Chip
                  label={`${deptAgents.length} agents`}
                  size="small"
                  sx={{ ml: 2 }}
                />
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <List>
                {deptAgents.map((agent) => {
                  const status = getAgentStatus(agent.id);
                  const isActive = status === 'working';

                  return (
                    <ListItem
                      key={agent.id}
                      onClick={() => handleAgentClick(agent)}
                      sx={{
                        cursor: 'pointer',
                        borderRadius: 2,
                        mb: 1,
                        bgcolor: isActive ? 'action.hover' : 'transparent',
                        '&:hover': { bgcolor: 'action.hover' }
                      }}
                    >
                      <ListItemAvatar>
                        <Badge
                          badgeContent={isActive ? '●' : ''}
                          color="success"
                          variant="dot"
                          invisible={!isActive}
                        >
                          <Avatar src={agent.image} sx={{ width: 48, height: 48 }}>
                            <Typography fontSize="20px">{agent.icon}</Typography>
                          </Avatar>
                        </Badge>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="subtitle1">{agent.name}</Typography>
                            <Chip
                              label={`Stage ${agent.stage}`}
                              size="small"
                              color={agent.stage === 3 ? 'success' : agent.stage === 2 ? 'primary' : 'default'}
                            />
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              {agent.title} • {agent.model}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 2, mt: 0.5 }}>
                              <Typography variant="caption">
                                Tasks: {agent.metrics.tasksToday}
                              </Typography>
                              <Typography variant="caption">
                                Efficiency: {agent.metrics.efficiency}
                              </Typography>
                              <Typography variant="caption" color={isActive ? 'success.main' : 'text.secondary'}>
                                {agent.metrics.lastActive}
                              </Typography>
                            </Box>
                          </Box>
                        }
                      />
                    </ListItem>
                  );
                })}
              </List>
            </AccordionDetails>
          </Accordion>
        );
      })}
    </Box>
  );

  // Agent Profile Dialog with Edit functionality
  const renderAgentProfile = () => (
    <Dialog
      open={!!selectedAgent}
      onClose={() => {
        setSelectedAgent(null);
        setEditMode(false);
      }}
      maxWidth="md"
      fullWidth
    >
      {selectedAgent && (
        <>
          <DialogTitle>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar src={selectedAgent.image} sx={{ width: 56, height: 56 }}>
                  <Typography fontSize="28px">{selectedAgent.icon}</Typography>
                </Avatar>
                <Box>
                  {editMode ? (
                    <TextField
                      value={editedAgent?.name || ''}
                      onChange={(e) => setEditedAgent({ ...editedAgent, name: e.target.value })}
                      variant="standard"
                      sx={{ fontSize: '1.5rem' }}
                    />
                  ) : (
                    <Typography variant="h5">{selectedAgent.name}</Typography>
                  )}
                  {editMode ? (
                    <TextField
                      value={editedAgent?.title || ''}
                      onChange={(e) => setEditedAgent({ ...editedAgent, title: e.target.value })}
                      variant="standard"
                      size="small"
                    />
                  ) : (
                    <Typography variant="subtitle1" color="text.secondary">
                      {selectedAgent.title}
                    </Typography>
                  )}
                </Box>
              </Box>
              <Box>
                {editMode ? (
                  <>
                    <IconButton onClick={() => {
                      // Save logic
                      setEditMode(false);
                    }} color="primary">
                      <Save />
                    </IconButton>
                    <IconButton onClick={() => setEditMode(false)}>
                      <Cancel />
                    </IconButton>
                  </>
                ) : (
                  <>
                    <IconButton onClick={() => {
                      setEditMode(true);
                      setEditedAgent({ ...selectedAgent });
                    }}>
                      <Edit />
                    </IconButton>
                    <IconButton onClick={() => setSelectedAgent(null)}>
                      <Close />
                    </IconButton>
                  </>
                )}
              </Box>
            </Box>
          </DialogTitle>

          <DialogContent dividers>
            <Grid container spacing={3}>
              {/* Agent Info */}
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  <Psychology sx={{ mr: 1, verticalAlign: 'bottom' }} />
                  Agent Information
                </Typography>
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Model</Typography>
                    {editMode ? (
                      <TextField
                        fullWidth
                        value={editedAgent?.model || ''}
                        onChange={(e) => setEditedAgent({ ...editedAgent, model: e.target.value })}
                        size="small"
                      />
                    ) : (
                      <Typography variant="body1">{selectedAgent.model}</Typography>
                    )}
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Stage</Typography>
                    {editMode ? (
                      <FormControl fullWidth size="small">
                        <Select
                          value={editedAgent?.stage || 1}
                          onChange={(e) => setEditedAgent({ ...editedAgent, stage: e.target.value })}
                        >
                          <MenuItem value={1}>Stage 1</MenuItem>
                          <MenuItem value={2}>Stage 2</MenuItem>
                          <MenuItem value={3}>Stage 3</MenuItem>
                        </Select>
                      </FormControl>
                    ) : (
                      <Chip
                        label={`Stage ${selectedAgent.stage}`}
                        color={selectedAgent.stage === 3 ? 'success' : selectedAgent.stage === 2 ? 'primary' : 'default'}
                      />
                    )}
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Department</Typography>
                    <Typography variant="body1">
                      {departments[selectedAgent.department]?.icon} {departments[selectedAgent.department]?.name}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">API Endpoint</Typography>
                    {editMode ? (
                      <TextField
                        fullWidth
                        value={editedAgent?.apiEndpoint || ''}
                        onChange={(e) => setEditedAgent({ ...editedAgent, apiEndpoint: e.target.value })}
                        size="small"
                        sx={{ fontFamily: 'monospace' }}
                      />
                    ) : (
                      <Typography variant="body1" fontFamily="monospace">
                        {selectedAgent.apiEndpoint}
                      </Typography>
                    )}
                  </Box>
                </Stack>
              </Grid>

              {/* Performance Metrics */}
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  <TrendingUp sx={{ mr: 1, verticalAlign: 'bottom' }} />
                  Performance Metrics
                </Typography>
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Tasks Today</Typography>
                    <Typography variant="h6">{selectedAgent.metrics.tasksToday}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Avg Response Time</Typography>
                    <Typography variant="h6">{selectedAgent.metrics.avgResponseTime}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Efficiency</Typography>
                    <Typography variant="h6">{selectedAgent.metrics.efficiency}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Last Active</Typography>
                    <Typography variant="body1" color="success.main">
                      {selectedAgent.metrics.lastActive}
                    </Typography>
                  </Box>
                </Stack>
              </Grid>

              {/* Responsibilities */}
              {selectedAgent.responsibilities && (
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    <Work sx={{ mr: 1, verticalAlign: 'bottom' }} />
                    Responsibilities
                  </Typography>
                  <List dense>
                    {selectedAgent.responsibilities.map((resp, idx) => (
                      <ListItem key={idx}>
                        <CheckCircle sx={{ mr: 1, fontSize: 16, color: 'success.main' }} />
                        <ListItemText primary={resp} />
                      </ListItem>
                    ))}
                  </List>
                </Grid>
              )}

              {/* Direct Message */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  <Chat sx={{ mr: 1, verticalAlign: 'bottom' }} />
                  Direct Message
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <TextField
                    fullWidth
                    multiline
                    maxRows={3}
                    value={dmMessage}
                    onChange={(e) => setDmMessage(e.target.value)}
                    placeholder={`Send a message to ${selectedAgent.name}...`}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        // Send DM logic
                        setDmMessage('');
                      }
                    }}
                  />
                  <Button
                    variant="contained"
                    onClick={() => {
                      // Send DM logic
                      setDmMessage('');
                    }}
                    disabled={!dmMessage.trim()}
                  >
                    <Send />
                  </Button>
                </Box>
              </Grid>

              {/* Quick Actions */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  <Task sx={{ mr: 1, verticalAlign: 'bottom' }} />
                  Quick Actions
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                  <Button variant="outlined" startIcon={<Assessment />}>
                    View Reports
                  </Button>
                  <Button variant="outlined" startIcon={<Analytics />}>
                    Performance Stats
                  </Button>
                  <Button variant="outlined" startIcon={<Schedule />}>
                    Schedule Task
                  </Button>
                </Stack>
              </Grid>
            </Grid>
          </DialogContent>
        </>
      )}
    </Dialog>
  );

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {showConfetti && <Confetti recycle={false} numberOfPieces={200} />}

      {/* Header */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h4" gutterBottom>
                Virtual AI Office
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                Your AI team workspace - {teamStats.activeAgents} agents online
              </Typography>
            </Box>
            
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={(e, value) => value && setViewMode(value)}
              aria-label="view mode"
            >
              <ToggleButton value="office" aria-label="office view">
                <Business sx={{ mr: 1 }} />
                Office View
              </ToggleButton>
              <ToggleButton value="card" aria-label="card view">
                <ViewModule sx={{ mr: 1 }} />
                Card View
              </ToggleButton>
              <ToggleButton value="list" aria-label="list view">
                <ViewList sx={{ mr: 1 }} />
                List View
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>
        </Grid>

        {/* Team Stats */}
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Groups sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">{teamStats.activeAgents}/14</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Active Agents
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Assignment sx={{ mr: 1, color: 'success.main' }} />
                <Typography variant="h6">{teamStats.totalTasks}</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Tasks Today
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Speed sx={{ mr: 1, color: 'warning.main' }} />
                <Typography variant="h6">{teamStats.efficiency}%</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Efficiency
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Schedule sx={{ mr: 1, color: 'info.main' }} />
                <Typography variant="h6">{teamStats.avgResponseTime}m</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Avg Response
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main View */}
      <Box>
        {viewMode === 'office' && renderOfficeView()}
        {viewMode === 'card' && renderCardView()}
        {viewMode === 'list' && renderListView()}
      </Box>

      {/* Agent Profile Dialog */}
      {renderAgentProfile()}
    </Container>
  );
};

export default VirtualOfficeDashboard;