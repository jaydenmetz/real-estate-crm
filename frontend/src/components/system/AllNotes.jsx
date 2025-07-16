import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  InputAdornment,
  Button,
  Card,
  CardContent,
  CardActions,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  Stack,
  Avatar,
  Tooltip,
  Divider,
  CircularProgress,
  Alert,
  FormControlLabel,
  Checkbox,
  ListItemIcon,
} from '@mui/material';
import {
  Search,
  Add,
  Edit,
  Delete,
  Share,
  Star,
  StarBorder,
  FilterList,
  Sort,
  Person,
  Business,
  Home,
  Event,
  TrendingUp,
  AttachFile,
  Close,
  Save,
  Cancel,
  Visibility,
  PushPin,
  Label,
  CalendarToday,
  MoreVert,
} from '@mui/icons-material';
import { format, formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { useForm, Controller } from 'react-hook-form';

const AllNotes = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [activeTab, setActiveTab] = useState(0);
  const [selectedNote, setSelectedNote] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const { control, handleSubmit, reset, setValue } = useForm({
    defaultValues: {
      title: '',
      content: '',
      entityType: '',
      entityId: '',
      tags: [],
      isPinned: false,
    }
  });

  // Mock notes data
  const mockNotes = [
    {
      id: 1,
      title: 'Henderson Family - First Meeting Notes',
      content: 'Met with the Henderson family today. They are first-time homebuyers looking for a 3-4 bedroom home in the $400-450k range. Prefer suburban areas with good schools. Pre-approved for $475k. Very motivated to buy within the next 2-3 months.',
      entityType: 'client',
      entityId: 'CL-2025-001',
      entityName: 'Henderson Family',
      tags: ['buyer', 'first-time', 'motivated'],
      isPinned: true,
      isFavorite: true,
      createdBy: 'Jayden Metz',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
    {
      id: 2,
      title: 'Property Inspection Issues - 456 Oak Ave',
      content: 'Inspection revealed minor issues:\n- Small leak under kitchen sink (fixed)\n- HVAC filter needs replacement\n- Garage door sensor misaligned\n\nAll issues addressed by seller. Re-inspection scheduled for next week.',
      entityType: 'escrow',
      entityId: 'ESC-2025-002',
      entityName: '456 Oak Ave',
      tags: ['inspection', 'repairs', 'follow-up'],
      isPinned: false,
      isFavorite: false,
      createdBy: 'Jayden Metz',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    },
    {
      id: 3,
      title: 'Marketing Strategy for 789 Pine St',
      content: 'Discussed marketing approach:\n1. Professional photography scheduled for Tuesday\n2. Virtual tour to be created\n3. Social media campaign targeting young professionals\n4. Open house planned for next weekend\n5. Reached out to my network about potential buyers',
      entityType: 'listing',
      entityId: 'MLS123456',
      entityName: '789 Pine St',
      tags: ['marketing', 'strategy', 'open-house'],
      isPinned: true,
      isFavorite: false,
      createdBy: 'Jayden Metz',
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    },
    {
      id: 4,
      title: 'Lead Follow-up - Sarah Chen',
      content: 'Called Sarah Chen regarding her website inquiry. She\'s looking to sell her condo and upgrade to a single-family home. Current condo estimated value: $350k. Looking for homes in the $500-600k range. Scheduled listing appointment for Thursday.',
      entityType: 'lead',
      entityId: 'LD-2025-047',
      entityName: 'Sarah Chen',
      tags: ['seller', 'buyer', 'hot-lead'],
      isPinned: false,
      isFavorite: true,
      createdBy: 'AI Agent - Alex',
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    },
    {
      id: 5,
      title: 'Negotiation Notes - 123 Main St',
      content: 'Counter-offer details:\n- Original offer: $475,000\n- Counter: $485,000\n- Seller paying 2% closing costs\n- 30-day escrow\n- All appliances included\n\nBuyer agreed to terms. Moving to escrow!',
      entityType: 'escrow',
      entityId: 'ESC-2025-001',
      entityName: '123 Main St',
      tags: ['negotiation', 'accepted', 'closing'],
      isPinned: false,
      isFavorite: false,
      createdBy: 'Jayden Metz',
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    },
    {
      id: 6,
      title: 'Client Preferences - Martinez Family',
      content: 'Updated preferences after second meeting:\n- Strongly prefer Westside neighborhood\n- Must have home office space\n- Minimum 2-car garage\n- Open floor plan preferred\n- Budget increased to $550k\n- Want to see properties this weekend',
      entityType: 'client',
      entityId: 'CL-2025-089',
      entityName: 'Martinez Family',
      tags: ['preferences', 'buyer', 'active'],
      isPinned: false,
      isFavorite: false,
      createdBy: 'AI Agent - Alex',
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setNotes(mockNotes);
      setLoading(false);
    }, 1000);
  }, []);

  const getEntityIcon = (type) => {
    const iconMap = {
      client: <Person />,
      escrow: <Business />,
      listing: <Home />,
      appointment: <Event />,
      lead: <TrendingUp />,
    };
    return iconMap[type] || <Person />;
  };

  const getEntityColor = (type) => {
    const colorMap = {
      client: 'primary',
      escrow: 'success',
      listing: 'warning',
      appointment: 'info',
      lead: 'secondary',
    };
    return colorMap[type] || 'default';
  };

  const handleCreateNote = () => {
    reset();
    setEditMode(false);
    setDialogOpen(true);
  };

  const handleEditNote = (note) => {
    setSelectedNote(note);
    setValue('title', note.title);
    setValue('content', note.content);
    setValue('entityType', note.entityType);
    setValue('entityId', note.entityId);
    setValue('tags', note.tags);
    setValue('isPinned', note.isPinned);
    setEditMode(true);
    setDialogOpen(true);
    handleMenuClose();
  };

  const handleDeleteNote = (noteId) => {
    setNotes(notes.filter(n => n.id !== noteId));
    enqueueSnackbar('Note deleted successfully', { variant: 'info' });
    handleMenuClose();
  };

  const handleToggleFavorite = (noteId) => {
    setNotes(notes.map(n => 
      n.id === noteId ? { ...n, isFavorite: !n.isFavorite } : n
    ));
  };

  const handleTogglePin = (noteId) => {
    setNotes(notes.map(n => 
      n.id === noteId ? { ...n, isPinned: !n.isPinned } : n
    ));
    handleMenuClose();
  };

  const onSubmit = (data) => {
    if (editMode) {
      setNotes(notes.map(n => 
        n.id === selectedNote.id 
          ? { ...n, ...data, updatedAt: new Date() }
          : n
      ));
      enqueueSnackbar('Note updated successfully', { variant: 'success' });
    } else {
      const newNote = {
        id: Date.now(),
        ...data,
        isFavorite: false,
        createdBy: 'Jayden Metz',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setNotes([newNote, ...notes]);
      enqueueSnackbar('Note created successfully', { variant: 'success' });
    }
    setDialogOpen(false);
    reset();
  };

  const handleMenuClick = (event, note) => {
    setAnchorEl(event.currentTarget);
    setSelectedNote(note);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleViewEntity = (note) => {
    const routeMap = {
      client: `/clients/${note.entityId}`,
      escrow: `/escrows/${note.entityId}`,
      listing: `/listings/${note.entityId}`,
      appointment: `/appointments/${note.entityId}`,
      lead: `/leads/${note.entityId}`,
    };
    const route = routeMap[note.entityType];
    if (route) {
      navigate(route);
    }
  };

  // Filter and sort notes
  const filteredNotes = notes.filter(note => {
    if (searchTerm && !note.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !note.content.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    if (filterType !== 'all' && note.entityType !== filterType) {
      return false;
    }
    if (activeTab === 1 && !note.isPinned) return false;
    if (activeTab === 2 && !note.isFavorite) return false;
    return true;
  });

  const sortedNotes = [...filteredNotes].sort((a, b) => {
    switch (sortBy) {
      case 'recent':
        return b.updatedAt - a.updatedAt;
      case 'oldest':
        return a.updatedAt - b.updatedAt;
      case 'title':
        return a.title.localeCompare(b.title);
      default:
        return 0;
    }
  });

  const stats = {
    total: notes.length,
    pinned: notes.filter(n => n.isPinned).length,
    favorites: notes.filter(n => n.isFavorite).length,
    byType: notes.reduce((acc, note) => {
      acc[note.entityType] = (acc[note.entityType] || 0) + 1;
      return acc;
    }, {}),
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          All Notes
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleCreateNote}
        >
          Create Note
        </Button>
      </Box>

      {/* Stats */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={3}>
          <Card variant="outlined">
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4">{stats.total}</Typography>
              <Typography variant="body2" color="text.secondary">
                Total Notes
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card variant="outlined">
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4">{stats.pinned}</Typography>
              <Typography variant="body2" color="text.secondary">
                Pinned Notes
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card variant="outlined">
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4">{stats.favorites}</Typography>
              <Typography variant="body2" color="text.secondary">
                Favorites
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card variant="outlined">
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4">
                {Object.keys(stats.byType).length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Categories
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters and Search */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search notes..."
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
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth>
              <InputLabel>Filter by Type</InputLabel>
              <Select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <MenuItem value="all">All Types</MenuItem>
                <MenuItem value="client">Clients</MenuItem>
                <MenuItem value="escrow">Escrows</MenuItem>
                <MenuItem value="listing">Listings</MenuItem>
                <MenuItem value="appointment">Appointments</MenuItem>
                <MenuItem value="lead">Leads</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth>
              <InputLabel>Sort By</InputLabel>
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <MenuItem value="recent">Most Recent</MenuItem>
                <MenuItem value="oldest">Oldest First</MenuItem>
                <MenuItem value="title">Title (A-Z)</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(e, value) => setActiveTab(value)}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label={`All Notes (${notes.length})`} />
          <Tab label={`Pinned (${stats.pinned})`} icon={<PushPin />} iconPosition="start" />
          <Tab label={`Favorites (${stats.favorites})`} icon={<Star />} iconPosition="start" />
        </Tabs>
      </Paper>

      {/* Notes Grid */}
      <Grid container spacing={3}>
        {sortedNotes.map((note) => (
          <Grid item xs={12} md={6} lg={4} key={note.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar sx={{ width: 32, height: 32, bgcolor: `${getEntityColor(note.entityType)}.light` }}>
                      {getEntityIcon(note.entityType)}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" sx={{ lineHeight: 1.2 }}>
                        {note.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {note.entityName}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    {note.isPinned && (
                      <Tooltip title="Pinned">
                        <PushPin fontSize="small" color="action" />
                      </Tooltip>
                    )}
                    <IconButton
                      size="small"
                      onClick={() => handleToggleFavorite(note.id)}
                    >
                      {note.isFavorite ? <Star color="warning" /> : <StarBorder />}
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuClick(e, note)}
                    >
                      <MoreVert />
                    </IconButton>
                  </Box>
                </Box>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    mb: 2,
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {note.content}
                </Typography>

                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 2 }}>
                  {note.tags.map((tag) => (
                    <Chip key={tag} label={tag} size="small" />
                  ))}
                </Box>

                <Divider sx={{ my: 1 }} />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="caption" color="text.secondary">
                    {note.createdBy} • {formatDistanceToNow(note.updatedAt, { addSuffix: true })}
                  </Typography>
                  <Chip
                    label={note.entityType}
                    size="small"
                    color={getEntityColor(note.entityType)}
                    variant="outlined"
                  />
                </Box>
              </CardContent>
              <CardActions>
                <Button
                  size="small"
                  startIcon={<Visibility />}
                  onClick={() => handleViewEntity(note)}
                >
                  View {note.entityType}
                </Button>
                <Button
                  size="small"
                  startIcon={<Edit />}
                  onClick={() => handleEditNote(note)}
                >
                  Edit
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {sortedNotes.length === 0 && (
        <Paper sx={{ p: 4, textAlign: 'center', mt: 3 }}>
          <Typography color="text.secondary">
            No notes found matching your criteria
          </Typography>
        </Paper>
      )}

      {/* Note Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogTitle>
            {editMode ? 'Edit Note' : 'Create New Note'}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <Controller
                  name="title"
                  control={control}
                  rules={{ required: 'Title is required' }}
                  render={({ field, fieldState: { error } }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Title"
                      error={!!error}
                      helperText={error?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Controller
                  name="content"
                  control={control}
                  rules={{ required: 'Content is required' }}
                  render={({ field, fieldState: { error } }) => (
                    <TextField
                      {...field}
                      fullWidth
                      multiline
                      rows={6}
                      label="Content"
                      error={!!error}
                      helperText={error?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="entityType"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth>
                      <InputLabel>Related To</InputLabel>
                      <Select {...field}>
                        <MenuItem value="">None</MenuItem>
                        <MenuItem value="client">Client</MenuItem>
                        <MenuItem value="escrow">Escrow</MenuItem>
                        <MenuItem value="listing">Listing</MenuItem>
                        <MenuItem value="appointment">Appointment</MenuItem>
                        <MenuItem value="lead">Lead</MenuItem>
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="entityId"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Entity ID"
                      placeholder="e.g., CL-2025-001"
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Controller
                  name="tags"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Tags"
                      placeholder="Enter tags separated by commas"
                      onChange={(e) => field.onChange(e.target.value.split(',').map(t => t.trim()).filter(t => t))}
                      value={field.value?.join(', ') || ''}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Controller
                  name="isPinned"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={<Checkbox {...field} checked={field.value} />}
                      label="Pin this note"
                    />
                  )}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained">
              {editMode ? 'Update' : 'Create'} Note
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleEditNote(selectedNote)}>
          <ListItemIcon>
            <Edit fontSize="small" />
          </ListItemIcon>
          Edit Note
        </MenuItem>
        <MenuItem onClick={() => handleTogglePin(selectedNote?.id)}>
          <ListItemIcon>
            <PushPin fontSize="small" />
          </ListItemIcon>
          {selectedNote?.isPinned ? 'Unpin' : 'Pin'} Note
        </MenuItem>
        <MenuItem onClick={() => handleDeleteNote(selectedNote?.id)}>
          <ListItemIcon>
            <Delete fontSize="small" />
          </ListItemIcon>
          Delete Note
        </MenuItem>
      </Menu>
    </Container>
  );
};

export default AllNotes;