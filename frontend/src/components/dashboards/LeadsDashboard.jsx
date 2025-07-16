// frontend/src/components/dashboards/LeadsDashboard.jsx

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
  alpha,
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
  Switch,
  FormControlLabel,
  Drawer,
  AppBar,
  Toolbar,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Step,
  Stepper,
  StepLabel,
  StepContent,
  Backdrop,
  Breadcrumbs,
  Link,
  Pagination,
  BottomNavigation,
  BottomNavigationAction,
  Slider,
  RadioGroup,
  FormLabel,
  FormHelperText,
  OutlinedInput,
  FilledInput,
  InputBase,
  FormGroup,
  Checkbox,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TablePagination,
  TableSortLabel,
  Popover,
  Popper,
  ClickAwayListener,
  Hidden,
  NoSsr,
  Portal,
  TextareaAutosize,
  Autocomplete,
  ToggleButton as MuiToggleButton,
  useAutocomplete,
  TreeView,
  TreeItem,
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent,
  TabContext,
  TabList,
  TabPanel,
  LoadingButton,
  LocalizationProvider,
  DatePicker,
  TimePicker,
  DateTimePicker,
  MobileDatePicker,
  DesktopDatePicker,
  CalendarPicker,
  MonthPicker,
  YearPicker,
  ClockPicker,
  CalendarPickerSkeleton,
  PickersDay,
  DateRangePicker,
  DateRangePickerDay,
  StaticDatePicker,
  StaticDateRangePicker,
  StaticTimePicker,
  Masonry,
} from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import {
  Add,
  FilterList,
  Download,
  Visibility,
  Edit,
  TrendingUp,
  TrendingDown,
  Event,
  RemoveRedEye,
  FavoriteBorder,
  Favorite,
  DateRange,
  CameraAlt,
  LocationOn,
  LocalFireDepartment,
  Whatshot,
  NewReleases,
  AutoAwesome,
  Star,
  AttachMoney,
  Schedule,
  AccessTime,
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
  PersonAdd,
  Email,
  Phone,
  Message,
  ContactPhone,
  ContactMail,
  Contacts,
  PersonSearch,
  PersonOutline,
  PersonPin,
  SupervisedUserCircle,
  GroupAdd,
  GroupWork,
  Diversity3,
  EmojiPeople,
  People,
  PeopleAlt,
  PeopleOutline,
  Person,
  PersonOff,
  PersonRemove,
  PersonAddAlt,
  PersonAddAlt1,
  PersonRemoveAlt1,
  ManageAccounts,
  AdminPanelSettings,
  Shield,
  Security,
  VerifiedUser,
  Fingerprint,
  Lock,
  LockOpen,
  Key,
  VpnKey,
  Password,
  Pattern,
  Pin,
  LockPerson,
  LockReset,
  LockClock,
  EnhancedEncryption,
  NoEncryption,
  RemoveCircle,
  RemoveCircleOutline,
  AddCircle,
  AddCircleOutline,
  Cancel,
  CheckCircle,
  CheckCircleOutline,
  RadioButtonUnchecked,
  RadioButtonChecked,
  DoNotDisturbOn,
  DoNotDisturb,
  DoNotDisturbAlt,
  Block,
  ReportProblem,
  Warning,
  Error,
  ErrorOutline,
  ReportGmailerrorred,
  BugReport,
  NotInterested,
  HighlightOff,
  DeleteForever,
  Delete,
  DeleteOutline,
  DeleteSweep,
  RestoreFromTrash,
  Clear,
  BackspaceOutlined,
  LayersClear,
  FormatClear,
  ClearAll,
  RemoveDone,
  PlaylistRemove,
  PlaylistAddCheckCircle,
  LibraryAddCheck,
  Beenhere,
  DoneAll,
  DoneOutline,
  Done,
  AssignmentTurnedIn,
  AssignmentReturned,
  AssignmentReturn,
  AssignmentLate,
  AssignmentInd,
  Assignment,
  Receipt,
  Description,
  Article,
  Newspaper,
  Sticky,
  Note,
  EventNote,
  NoteAdd,
  PostAdd,
  CollectionsBookmark,
  Bookmark,
  BookmarkAdd,
  BookmarkAdded,
  BookmarkBorder,
  BookmarkRemove,
  Bookmarks,
  Label,
  LabelImportant,
  LabelOff,
  NewLabel,
  Loyalty,
  LocalOffer,
  LocalOfferOutlined,
  Sell,
  Discount,
  Redeem,
  CardGiftcard,
  CardMembership,
  Flag,
  EmojiFoodBeverage,
  OutlinedFlag,
  Report,
  ReportOff,
  Save,
  SaveAlt,
  SaveAs,
  Publish,
  Unpublished,
  Download as DownloadIcon,
  DownloadDone,
  DownloadForOffline,
  Downloading,
  CloudDownload,
  CloudUpload,
  CloudDone,
  CloudOff,
  CloudQueue,
  CloudSync,
  Cloud,
  Backup,
  UploadFile,
  DriveFileMove,
  DriveFileRenameOutline,
  DriveFolderUpload,
  FileDownload,
  FileDownloadDone,
  FileDownloadOff,
  FileUpload,
  Upload,
  AttachFile,
  AttachEmail,
  Attachment,
  Topic,
  FolderOpen,
  CreateNewFolder,
  Folder,
  FolderDelete,
  FolderOff,
  FolderShared,
  FolderZip,
  FolderSpecial,
  SnippetFolder,
  RuleFolder,
  PermMedia,
  ImageSearch,
  PhotoLibrary,
  PhotoAlbum,
  PhotoSizeSelectActual,
  Photo,
  AddPhotoAlternate,
  AddAPhoto,
  Collections,
  Compare,
  Slideshow,
  Camera,
  CameraAltOutlined,
  CameraRoll,
  PhotoCamera,
  CameraFront,
  CameraRear,
  FlipCameraAndroid,
  FlipCameraIos,
  CameraOutdoor,
  CameraIndoor,
  PhotoCameraBack,
  PhotoCameraFront,
  Portrait,
  PanoramaFishEye,
  Panorama,
  PanoramaHorizontal,
  PanoramaVertical,
  PanoramaWideAngle,
  Vrpano,
  ImageAspectRatio,
  Image,
  ImageNotSupported,
  HideImage,
  BrokenImage,
  Healing,
  AutoFixHigh,
  AutoFixNormal,
  AutoFixOff,
  Timer3,
  Timer10,
  TimerOff,
  Timelapse,
  Shutter,
  ShutterSpeed,
  Iso,
  Brightness1,
  Brightness2,
  Brightness3,
  Brightness4,
  Brightness5,
  Brightness6,
  Brightness7,
  BrightnessAuto,
  BrightnessHigh,
  BrightnessLow,
  BrightnessMedium,
  Exposure,
  ExposureNeg1,
  ExposureNeg2,
  ExposurePlus1,
  ExposurePlus2,
  ExposureZero,
  ControlPoint,
  ControlPointDuplicate,
  RadioChecked,
  RadioUnchecked,
  Crop,
  CropDin,
  CropFree,
  CropLandscape,
  CropOriginal,
  CropPortrait,
  CropRotate,
  CropSquare,
  Crop169,
  Crop32,
  Crop54,
  Crop75,
  Rotate90DegreesCcw,
  RotateLeft,
  RotateRight,
  Flip,
  FlipToBack,
  FlipToFront,
  Lens,
  Straighten,
  Tune,
  Transform,
  AutoStories,
  MenuBook,
  ChromeReaderMode,
  LibraryBooks,
  LibraryAdd,
  LibraryAddCheck as LibraryCheck,
  LibraryMusic,
  VideoLibrary,
  VideoLabel,
  LocalMovies,
  Movie,
  MovieCreation,
  MovieFilter,
  LiveTv,
  PlayCircle,
  PlayCircleFilled,
  PlayCircleOutline,
  PlayArrow,
  PlayDisabled,
  PauseCircle,
  PauseCircleFilled,
  PauseCircleOutline,
  Pause,
  Stop,
  StopCircle,
  SkipNext,
  SkipPrevious,
  FastForward,
  FastRewind,
  Forward5,
  Forward10,
  Forward30,
  Replay,
  Replay5,
  Replay10,
  Replay30,
  ReplayCircleFilled,
  Loop,
  MicNone,
  Mic,
  MicOff,
  VolumeDown,
  VolumeUp,
  VolumeMute,
  VolumeOff,
  HeadsetMicOutlined,
  Headphones,
  Headset,
  Hearing,
  HearingDisabled,
  Audiotrack,
  Album,
  Equalizer,
  ExplicitOutlined,
  QueueMusic,
  QueuePlayNext,
  Queue,
  MusicNote,
  MusicOff,
  Piano,
  PianoOff,
  GraphicEq,
  Surround,
  Speed,
  SlowMotionVideo,
  FiberManualRecord,
  FiberNew,
  FiberPin,
  FiberSmartRecord,
  Videocam,
  VideocamOff,
  VideoCall,
  VideoFile,
  VideoSettings,
  VideoStable,
  OndemandVideo,
  MissedVideoCall,
  HighQuality,
  ClosedCaption,
  ClosedCaptionOff,
  ClosedCaptionDisabled,
  Subtitles,
  SubtitlesOff,
  Hd,
  SdCard,
  SdCardAlert,
  SimCard,
  SimCardAlert,
  Storage,
  Memory,
  Usb,
  Cable,
  Cast,
  CastConnected,
  CastForEducation,
  Computer,
  DesktopMac,
  DesktopWindows,
  DeveloperBoard,
  DeveloperBoardOff,
  DeviceHub,
  DeviceUnknown,
  DevicesOther,
  Dock,
  Gamepad,
  Headset as HeadsetIcon,
  HeadsetMic,
  Keyboard,
  KeyboardArrowDown,
  KeyboardArrowLeft,
  KeyboardArrowRight,
  KeyboardArrowUp,
  KeyboardBackspace,
  KeyboardCapslock,
  KeyboardHide,
  KeyboardReturn,
  KeyboardTab,
  KeyboardVoice,
  Laptop,
  LaptopChromebook,
  LaptopMac,
  LaptopWindows,
  Monitor,
  Mouse,
  PhoneAndroid,
  PhoneIphone,
  Phonelink,
  PhonelinkOff,
  PointOfSale,
  PowerInput,
  Router,
  Scanner,
  Security as SecurityIcon,
  SimCard as SimCardIcon,
  Smartphone,
  Speaker,
  SpeakerGroup,
  Tablet,
  TabletAndroid,
  TabletMac,
  Toys,
  Tv,
  TvOff,
  VideogameAsset,
  VideogameAssetOff,
  Watch,
  WatchLater,
  WatchOff,
  SensorDoor,
  SensorOccupied,
  SensorWindow,
  Weekend,
  Kitchen,
  BedroomBaby,
  BedroomChild,
  BedroomParent,
  Bathroom,
  BathroomOutlined,
  Living,
  Dining,
  DiningOutlined,
  OtherHouses,
  Foundation,
  Roofing,
  House,
  HouseSiding,
  Cabin,
  Cottage,
  Villa,
  Bungalow,
  Chalet,
  Home,
  HomeMax,
  HomeMini,
  HomeWork,
  MapsHomeWork,
  StoreMallDirectory,
  LocalGroceryStore,
  Store,
  Storefront,
  Shop,
  Shop2,
  ShoppingBag,
  ShoppingBasket,
  ShoppingCart,
  ShoppingCartCheckout,
  AddShoppingCart,
  RemoveShoppingCart,
  AccountBalance,
  AccountBalanceWallet,
  AccountBox,
  AccountCircle,
  AccountTree,
  AddCard,
  AddToDrive,
  AssignmentInd as AssignmentUser,
  BusinessCenter,
  CalendarMonth,
  CalendarToday,
  CalendarViewDay,
  CalendarViewMonth,
  CalendarViewWeek,
  CameraEnhance,
  Cases,
  Category,
  Celebration,
  ChangeCircle,
  Circle,
  CircleNotifications,
  Class,
  CleanHands,
  Commute,
  CompassCalibration,
  CoPresent,
  CreditCard,
  CreditScore,
  Dashboard,
  DataExploration,
  DataThresholding,
  DateRange as DateRangeIcon,
  Dehaze,
  Details,
  DevicesOther as Devices,
  Dns,
  Domain,
  DonutLarge,
  DonutSmall,
  DragIndicator,
  DynamicFeed,
  DynamicForm,
  Eco,
  EditCalendar,
  EditNote,
  Elderly,
  ElderlyWoman,
  EmojiEmotions,
  EmojiEvents,
  EmojiFlags,
  EmojiNature,
  EmojiObjects,
  EmojiSymbols,
  EmojiTransportation,
  Engineering,
  Euro,
  EuroSymbol,
  EventAvailable,
  EventBusy,
  EventRepeat,
  EventSeat,
  ExitToApp,
  Explore,
  ExploreOff,
  Extension,
  ExtensionOff,
  Face,
  Face2,
  Face3,
  Face4,
  Face5,
  Face6,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Feedback,
  Female,
  FilterAlt,
  FilterAltOff,
  FilterBAndW,
  FilterCenterFocus,
  FilterDrama,
  FilterFrames,
  FilterHdr,
  FilterList as FilterListIcon,
  FilterNone,
  FilterTiltShift,
  FilterVintage,
  Filter1,
  Filter2,
  Filter3,
  Filter4,
  Filter5,
  Filter6,
  Filter7,
  Filter8,
  Filter9,
  Filter9Plus,
  FindInPage,
  FindReplace,
  Fireplace,
  FitnessCenter,
  FlagCircle,
  Flaky,
  FlashAuto,
  FlashOff,
  FlashOn,
  FlightLand,
  FlightTakeoff,
  Flourescent,
  FmdBad,
  FmdGood,
  Folder as FolderIcon,
  FolderCopy,
  FollowTheSigns,
  FontDownload,
  FontDownloadOff,
  FoodBank,
  Forest,
  ForkLeft,
  ForkRight,
  FormatAlignCenter,
  FormatAlignJustify,
  FormatAlignLeft,
  FormatAlignRight,
  FormatBold,
  FormatColorFill,
  FormatColorReset,
  FormatColorText,
  FormatIndentDecrease,
  FormatIndentIncrease,
  FormatItalic,
  FormatLineSpacing,
  FormatListBulleted,
  FormatListNumbered,
  FormatListNumberedRtl,
  FormatOverline,
  FormatPaint,
  FormatQuote,
  FormatShapes,
  FormatSize,
  FormatStrikethrough,
  FormatTextdirectionLToR,
  FormatTextdirectionRToL,
  FormatUnderlined,
  Fort,
  Forum,
  Forward,
  ForwardToInbox,
  Foundation as FoundationIcon,
  FreeBreakfast,
  Fullscreen,
  FullscreenExit,
  Functions,
  GTranslate,
  Garage,
  GasMeter,
  Gavel,
  GeneratingTokens,
  Gesture,
  GetApp,
  Gif,
  GifBox,
  Girl,
  Gite,
  GitHub,
  GolfCourse,
  GppBad,
  GppGood,
  GppMaybe,
  Grading,
  Gradient,
  Grain,
  GraphicEq as GraphicEqIcon,
  Grass,
  Grid3x3,
  Grid4x4,
  GridGoldenratio,
  GridOff,
  GridOn,
  GridView,
  Group,
  GroupAdd as GroupAddIcon,
  GroupOff,
  GroupRemove,
  Groups as GroupsIcon,
  Groups2,
  Groups3,
  Hail,
  Handshake,
  Handyman,
  Hardware,
  Hd as HdIcon,
  HdrAuto,
  HdrAutoSelect,
  HdrEnhancedSelect,
  HdrOff,
  HdrOffSelect,
  HdrOn,
  HdrOnSelect,
  HdrPlus,
  HdrStrong,
  HdrWeak,
  Headphones as HeadphonesIcon,
  Headset as HeadsetAlt,
  HealthAndSafety,
  Hearing as HearingIcon,
  HeartBroken,
  HeatPump,
  Height,
  Help,
  HelpCenter,
  HelpOutline,
  Hevc,
  Hexagon,
  HideSource,
  HighlightAlt,
  Hiking,
  History,
  HistoryEdu,
  HistoryToggleOff,
  Hive,
  Hls,
  HlsOff,
  HolidayVillage,
  Home as HomeAlt,
  HomeMax as HomeMaxIcon,
  HomeMini as HomeMiniIcon,
  HomeRepairService,
  HomeWork as HomeWorkIcon,
  HorizontalDistribute,
  HorizontalRule,
  HorizontalSplit,
  HotTub,
  Hotel,
  HourglassBottom,
  HourglassDisabled,
  HourglassEmpty,
  HourglassFull,
  HourglassTop,
  House as HouseIcon,
  HouseBoat,
  Houseboat,
  HouseSiding as HouseSidingIcon,
  HowToReg,
  HowToVote,
  Html,
  Http,
  Https,
  Hub,
  Hvac,
  IceSkating,
  Icecream,
  Image as ImageIcon,
  ImageAspectRatio as ImageAspectRatioIcon,
  ImageNotSupported as ImageNotSupportedIcon,
  ImageSearch as ImageSearchIcon,
  ImagesearchRoller,
  ImportContacts,
  ImportExport,
  ImportantDevices,
  Inbox,
  IncompleteCircle,
  IndeterminateCheckBox,
  Info,
  InfoOutlined,
  Input,
  InsertChart,
  InsertChartOutlined,
  InsertComment,
  InsertDriveFile,
  InsertEmoticon,
  InsertInvitation,
  InsertLink,
  InsertPageBreak,
  InsertPhoto,
  Insights,
  InstallDesktop,
  InstallMobile,
  IntegrationInstructions,
  Interests,
  InterpreterMode,
  Inventory,
  Inventory2,
  InvertColors,
  InvertColorsOff,
  IosShare,
  Iron,
  Javascript,
  JoinFull,
  JoinInner,
  JoinLeft,
  JoinRight,
  Kayaking,
  KebabDining,
  Key as KeyIcon,
  KeyOff,
  Keyboard as KeyboardIcon,
  KeyboardAlt,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  KeyboardArrowLeft as KeyboardArrowLeftIcon,
  KeyboardArrowRight as KeyboardArrowRightIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
  KeyboardBackspace as KeyboardBackspaceIcon,
  KeyboardCapslock as KeyboardCapslockIcon,
  KeyboardCommandKey,
  KeyboardControlKey,
  KeyboardDoubleArrowDown,
  KeyboardDoubleArrowLeft,
  KeyboardDoubleArrowRight,
  KeyboardDoubleArrowUp,
  KeyboardHide as KeyboardHideIcon,
  KeyboardOptionKey,
  KeyboardReturn as KeyboardReturnIcon,
  KeyboardTab as KeyboardTabIcon,
  KeyboardVoice as KeyboardVoiceIcon,
  KingBed,
  Kitchen as KitchenIcon,
  Kitesurfing,
  Label as LabelIcon,
  LabelImportant as LabelImportantIcon,
  LabelOff as LabelOffIcon,
  Lan,
  Landscape,
  Landslide,
  Language,
  Laptop as LaptopIcon,
  LaptopChromebook as LaptopChromebookIcon,
  LaptopMac as LaptopMacIcon,
  LaptopWindows as LaptopWindowsIcon,
  LastPage,
  Launch,
  Layers,
  LayersClear as LayersClearIcon,
  Leaderboard,
  LeakAdd,
  LeakRemove,
  LeaveBagsAtHome,
  LegendToggle,
  Lens as LensIcon,
  LensBlur,
  LibraryAdd as LibraryAddIcon,
  LibraryAddCheck as LibraryAddCheckIcon,
  LibraryBooks as LibraryBooksIcon,
  LibraryMusic as LibraryMusicIcon,
  Light,
  LightMode,
  Lightbulb,
  LightbulbCircle,
  LightbulbOutline,
  LineAxis,
  LineStyle,
  LineWeight,
  LinearScale,
  LinkOff,
  LinkedCamera,
  Liquor,
  List as ListIcon,
  ListAlt,
  LiveHelp,
  LiveTv as LiveTvIcon,
  Living as LivingIcon,
  LocalActivity,
  LocalAirport,
  LocalAtm,
  LocalBar,
  LocalCafe,
  LocalCarWash,
  LocalConvenienceStore,
  LocalDining,
  LocalDrink,
  LocalFireDepartment as LocalFireDepartmentIcon,
  LocalFlorist,
  LocalGasStation,
  LocalGroceryStore as LocalGroceryStoreIcon,
  LocalHospital,
  LocalHotel,
  LocalLaundryService,
  LocalLibrary,
  LocalMall,
  LocalMovies as LocalMoviesIcon,
  LocalOffer as LocalOfferIcon,
  LocalParking,
  LocalPharmacy,
  LocalPhone,
  LocalPizza,
  LocalPlay,
  LocalPolice,
  LocalPostOffice,
  LocalPrintshop,
  LocalSee,
  LocalShipping,
  LocalTaxi,
  LocationCity,
  LocationDisabled,
  LocationOff,
  LocationOn as LocationOnIcon,
  LocationSearching,
  Lock as LockIcon,
  LockClock as LockClockIcon,
  LockOpen as LockOpenIcon,
  LockOutlined,
  LockPerson as LockPersonIcon,
  LockReset as LockResetIcon,
  Login,
  LogoDev,
  Logout,
  Looks,
  Looks3,
  Looks4,
  Looks5,
  Looks6,
  LooksOne,
  LooksTwo,
  Loop as LoopIcon,
  Loupe,
  LowPriority,
  Loyalty as LoyaltyIcon,
  LteMobiledata,
  LtePlusMobiledata,
  Luggage,
  LunchDining,
  Lyrics,
  MacroOff,
  Mail,
  MailLock,
  MailOutline,
  Male,
  Man,
  Man2,
  Man3,
  Man4,
  ManageAccounts as ManageAccountsIcon,
  ManageHistory,
  ManageSearch,
  Map,
  MapsHomeWork as MapsHomeWorkIcon,
  MapsUgc,
  Margin,
  MarkAsUnread,
  MarkChatRead,
  MarkChatUnread,
  MarkEmailRead,
  MarkEmailUnread,
  MarkUnreadChatAlt,
  Markunread,
  MarkunreadMailbox,
  Masks,
  Maximize,
  MediaBluetoothOff,
  MediaBluetoothOn,
  Mediation,
  MedicalInformation,
  MedicalServices,
  Medication,
  MedicationLiquid,
  MeetingRoom,
  Memory as MemoryIcon,
  MenuOpen,
  MergeType,
  Message as MessageIcon,
  Mms,
  MobileFriendly,
  MobileOff,
  MobileScreenShare,
  MobiledataOff,
  Mode,
  ModeComment,
  ModeEdit,
  ModeEditOutline,
  ModeNight,
  ModeOfTravel,
  ModeStandby,
  ModelTraining,
  MonetizationOn,
  Money,
  MoneyOff,
  MoneyOffCsred,
  Monitor as MonitorIcon,
  MonitorHeart,
  MonitorWeight,
  MonochromePhotos,
  Mood,
  MoodBad,
  Moped,
  More,
  MoreHoriz,
  MoreTime,
  MoreVert as MoreVertIcon,
  Mosque,
  MotionPhotosAuto,
  MotionPhotosOff,
  MotionPhotosOn,
  MotionPhotosPause,
  MotionPhotosPaused,
  Mouse as MouseIcon,
  MoveDown,
  MoveToInbox,
  MoveUp,
  Movie as MovieIcon,
  MovieCreation as MovieCreationIcon,
  MovieFilter as MovieFilterIcon,
  Moving,
  Mp,
  MultilineChart,
  MultipleStop,
  Museum,
  MusicNote as MusicNoteIcon,
  MusicOff as MusicOffIcon,
  MusicVideo,
  MyLocation,
  Nat,
  Nature,
  NaturePeople,
  NavigateBefore,
  NavigateNext,
  Navigation,
  NearMe,
  NearMeDisabled,
  NearbyError,
  NearbyOff,
  NetworkCell,
  NetworkCheck,
  NetworkLocked,
  NetworkPing,
  NetworkWifi,
  NetworkWifi1Bar,
  NetworkWifi2Bar,
  NetworkWifi3Bar,
  NewReleases as NewReleasesIcon,
  Newspaper as NewspaperIcon,
  NextPlan,
  NextWeek,
  Nfc,
  NightShelter,
  NightlightRound,
  Nightlife,
  NightsStay,
  NoAccounts,
  NoAdultContent,
  NoBackpack,
  NoCell,
  NoCrash,
  NoDrinks,
  NoEncryption as NoEncryptionIcon,
  NoEncryptionGmailerrorred,
  NoFlash,
  NoFood,
  NoLuggage,
  NoMeals,
  NoMeetingRoom,
  NoPhotography,
  NoSim,
  NoStroller,
  NoTransfer,
  NoiseAware,
  NoiseControlOff,
  NordicWalking,
  North,
  NorthEast,
  NorthWest,
  NotAccessible,
  NotInterested as NotInterestedIcon,
  NotListedLocation,
  NotStarted,
  Note as NoteIcon,
  NoteAdd as NoteAddIcon,
  NoteAlt,
  Notes,
  NotificationAdd,
  NotificationImportant,
  Notifications,
  NotificationsActive,
  NotificationsNone,
  NotificationsOff,
  NotificationsPaused,
  Numbers,
  OfflineBolt,
  OfflinePin,
  OfflineShare,
  OilBarrel,
  OnDeviceTraining,
  OndemandVideo as OndemandVideoIcon,
  OneK,
  OneKPlus,
  OneKk,
  OneX,
  OnlinePrediction,
  Opacity,
  OpenInBrowser,
  OpenInFull,
  OpenInNew,
  OpenInNewOff,
  OpenWith,
  OtherHouses as OtherHousesIcon,
  Outbound,
  Outbox,
  OutdoorGrill,
  Outlet,
  OutlinedFlag as OutlinedFlagIcon,
  Output,
  Padding,
  Pages,
  Pageview,
  Paid,
  Palette,
  PanTool,
  PanToolAlt,
  Panorama as PanoramaIcon,
  PanoramaFishEye as PanoramaFishEyeIcon,
  PanoramaHorizontal as PanoramaHorizontalIcon,
  PanoramaHorizontalSelect,
  PanoramaPhotosphere,
  PanoramaPhotosphereSelect,
  PanoramaVertical as PanoramaVerticalIcon,
  PanoramaVerticalSelect,
  PanoramaWideAngle as PanoramaWideAngleIcon,
  PanoramaWideAngleSelect,
  Paragliding,
  Park,
  PartyMode,
  Password as PasswordIcon,
  Pattern as PatternIcon,
  Pause as PauseIcon,
  PauseCircle as PauseCircleIcon,
  PauseCircleFilled as PauseCircleFilledIcon,
  PauseCircleOutline as PauseCircleOutlineIcon,
  PausePresentation,
  Payment,
  Payments,
  PedalBike,
  Pending,
  PendingActions,
  Pentagon,
  People as PeopleIcon,
  PeopleAlt as PeopleAltIcon,
  PeopleOutline as PeopleOutlineIcon,
  Percent,
  PermCameraMic,
  PermContactCalendar,
  PermDataSetting,
  PermDeviceInformation,
  PermIdentity,
  PermMedia as PermMediaIcon,
  PermPhoneMsg,
  PermScanWifi,
  Person as PersonIcon,
  Person2,
  Person3,
  Person4,
  PersonAdd as PersonAddIcon,
  PersonAddAlt as PersonAddAltIcon,
  PersonAddAlt1 as PersonAddAlt1Icon,
  PersonAddDisabled,
  PersonOff as PersonOffIcon,
  PersonOutline as PersonOutlineIcon,
  PersonPin as PersonPinIcon,
  PersonPinCircle,
  PersonRemove as PersonRemoveIcon,
  PersonRemoveAlt1 as PersonRemoveAlt1Icon,
  PersonSearch as PersonSearchIcon,
  PersonalInjury,
  PersonalVideo,
  PestControl,
  PestControlRodent,
  Pets,
  Phishing,
  Phone as PhoneIcon,
  PhoneAndroid as PhoneAndroidIcon,
  PhoneBluetoothSpeaker,
  PhoneCallback,
  PhoneDisabled,
  PhoneEnabled,
  PhoneForwarded,
  PhoneInTalk,
  PhoneIphone as PhoneIphoneIcon,
  PhoneLocked,
  PhoneMissed,
  PhonePaused,
  Phonelink as PhonelinkIcon,
  PhonelinkErase,
  PhonelinkLock,
  PhonelinkOff as PhonelinkOffIcon,
  PhonelinkRing,
  PhonelinkSetup,
  Photo as PhotoIcon,
  PhotoAlbum as PhotoAlbumIcon,
  PhotoCamera as PhotoCameraIcon,
  PhotoCameraBack as PhotoCameraBackIcon,
  PhotoCameraFront as PhotoCameraFrontIcon,
  PhotoFilter,
  PhotoLibrary as PhotoLibraryIcon,
  PhotoSizeSelectActual as PhotoSizeSelectActualIcon,
  PhotoSizeSelectLarge,
  PhotoSizeSelectSmall,
  Php,
  Piano as PianoIcon,
  PianoOff as PianoOffIcon,
  PictureAsPdf,
  PictureInPicture,
  PictureInPictureAlt,
  PieChart,
  PieChartOutline,
  PinDrop,
  PinEnd,
  PinInvoke,
  Pinch,
  PivotTableChart,
  Pix,
  Place,
  Plagiarism,
  PlayArrow as PlayArrowIcon,
  PlayCircle as PlayCircleIcon,
  PlayCircleFilled as PlayCircleFilledIcon,
  PlayCircleOutline as PlayCircleOutlineIcon,
  PlayDisabled as PlayDisabledIcon,
  PlayForWork,
  PlayLesson,
  PlaylistAdd,
  PlaylistAddCheck,
  PlaylistAddCheckCircle as PlaylistAddCheckCircleIcon,
  PlaylistAddCircle,
  PlaylistPlay,
  PlaylistRemove as PlaylistRemoveIcon,
  Plumbing,
  PlusOne,
  Podcasts,
  PointOfSale as PointOfSaleIcon,
  Policy,
  Poll,
  Polyline,
  Pool,
  PortableWifiOff,
  Portrait as PortraitIcon,
  PostAdd as PostAddIcon,
  Power,
  PowerInput as PowerInputIcon,
  PowerOff,
  PowerSettingsNew,
  PrecisionManufacturing,
  PregnantWoman,
  PresentToAll,
  Preview,
  PriceChange,
  PriceCheck,
  Print as PrintIcon,
  PrintDisabled,
  PriorityHigh,
  PrivacyTip,
  PrivateConnectivity,
  ProductionQuantityLimits,
  Psychology,
  PsychologyAlt,
  Public,
  PublicOff,
  Publish as PublishIcon,
  PublishedWithChanges,
  PunchClock,
  PushPin,
  QrCode,
  QrCode2,
  QrCodeScanner,
  QueryBuilder,
  QueryStats,
  QuestionAnswer,
  QuestionMark,
  Queue as QueueIcon,
  QueueMusic as QueueMusicIcon,
  QueuePlayNext as QueuePlayNextIcon,
  QuickContactsDisp,
  QuickContactsMail,
  Quickreply,
  Quiz,
  RMobiledata,
  Radar,
  RadioButtonChecked as RadioButtonCheckedIcon,
  RadioButtonUnchecked as RadioButtonUncheckedIcon,
  Railway,
  RamenDining,
  RampLeft,
  RampRight,
  RateReview,
  RawOff,
  RawOn,
  ReadMore,
  RealEstateAgent,
  Receipt as ReceiptIcon,
  ReceiptLong,
  RecentActors,
  Recommend,
  RecordVoiceOver,
  Rectangle,
  Recycling,
  Redeem as RedeemIcon,
  Redo,
  ReduceCapacity,
  Refresh,
  RememberMe,
  Remove,
  RemoveCircle as RemoveCircleIcon,
  RemoveCircleOutline as RemoveCircleOutlineIcon,
  RemoveDone as RemoveDoneIcon,
  RemoveFromQueue,
  RemoveModerator,
  RemoveRedEye as RemoveRedEyeIcon,
  RemoveShoppingCart as RemoveShoppingCartIcon,
  Reorder,
  Repeat as RepeatIcon,
  RepeatOn,
  RepeatOne,
  RepeatOneOn,
  Replay as ReplayIcon,
  Replay10 as Replay10Icon,
  Replay30 as Replay30Icon,
  Replay5 as Replay5Icon,
  ReplayCircleFilled as ReplayCircleFilledIcon,
  Reply,
  ReplyAll,
  Report as ReportIcon,
  ReportGmailerrorred as ReportGmailerrorredIcon,
  ReportOff as ReportOffIcon,
  ReportProblem as ReportProblemIcon,
  RequestPage,
  RequestQuote,
  ResetTv,
  RestartAlt,
  Restaurant,
  RestaurantMenu,
  Restore,
  RestoreFromTrash as RestoreFromTrashIcon,
  RestorePage,
  Reviews,
  RiceBowl,
  RingVolume,
  Rocket,
  RocketLaunch,
  RollerShades,
  RollerShadesClosed,
  RollerSkating,
  Roofing as RoofingIcon,
  Room,
  RoomPreferences,
  RoomService,
  Rotate90DegreesCcw as Rotate90DegreesCcwIcon,
  Rotate90DegreesCw,
  RotateLeft as RotateLeftIcon,
  RotateRight as RotateRightIcon,
  RoundaboutLeft,
  RoundaboutRight,
  Route,
  Router as RouterIcon,
  Rowing,
  RssFeed,
  Rsvp,
  Rtt,
  Rule,
  RuleFolder as RuleFolderIcon,
  RunCircle,
  RunningWithErrors,
  RvHookup,
  SafetyCheck,
  SafetyDivider,
  Sailing,
  Sanitizer,
  Satellite,
  SatelliteAlt,
  Save as SaveIcon,
  SaveAlt as SaveAltIcon,
  SaveAs as SaveAsIcon,
  SavedSearch,
  Savings,
  Scale,
  Scanner as ScannerIcon,
  ScatterPlot,
  Schedule as ScheduleIcon,
  ScheduleSend,
  Schema,
  School,
  Science,
  Score,
  Scoreboard,
  ScreenLockLandscape,
  ScreenLockPortrait,
  ScreenLockRotation,
  ScreenRotation,
  ScreenRotationAlt,
  ScreenSearchDesktop,
  ScreenShare,
  Screenshot,
  ScreenshotMonitor,
  Scuba,
  ScubaDiving,
  Sd,
  SdCard as SdCardIcon,
  SdCardAlert as SdCardAlertIcon,
  SdStorage,
  Search as SearchIcon,
  SearchOff,
  Security as SecurityAlt,
  SecurityUpdate,
  SecurityUpdateGood,
  SecurityUpdateWarning,
  Segment,
  SelectAll,
  SelfImprovement,
  Sell as SellIcon,
  Send as SendIcon,
  SendAndArchive,
  SendTimeExtension,
  SendToMobile,
  SensorDoor as SensorDoorIcon,
  SensorOccupied as SensorOccupiedIcon,
  SensorWindow as SensorWindowIcon,
  Sensors,
  SensorsOff,
  SentimentDissatisfied,
  SentimentNeutral,
  SentimentSatisfied,
  SentimentSatisfiedAlt,
  SentimentVeryDissatisfied,
  SentimentVerySatisfied,
  Set,
  SetMeal,
  Settings,
  SettingsAccessibility,
  SettingsApplications,
  SettingsBackupRestore,
  SettingsBluetooth,
  SettingsBrightness,
  SettingsCell,
  SettingsEthernet,
  SettingsInputAntenna,
  SettingsInputComponent,
  SettingsInputComposite,
  SettingsInputHdmi,
  SettingsInputSvideo,
  SettingsOverscan,
  SettingsPhone,
  SettingsPower,
  SettingsRemote,
  SettingsSuggest,
  SettingsSystemDaydream,
  SettingsVoice,
  SevereCold,
  Shape,
  Share as ShareIcon,
  ShareArrivalTime,
  ShareLocation,
  Shield as ShieldIcon,
  ShieldMoon,
  Shop as ShopIcon,
  Shop2 as Shop2Icon,
  ShopTwo,
  ShoppingBag as ShoppingBagIcon,
  ShoppingBasket as ShoppingBasketIcon,
  ShoppingCart as ShoppingCartIcon,
  ShoppingCartCheckout as ShoppingCartCheckoutIcon,
  ShortText,
  Shortcut,
  ShowChart,
  Shower,
  Shuffle,
  ShuffleOn,
  ShutterSpeed as ShutterSpeedIcon,
  Sick,
  SignLanguage,
  SignalCellular0Bar,
  SignalCellular1Bar,
  SignalCellular2Bar,
  SignalCellular3Bar,
  SignalCellular4Bar,
  SignalCellularAlt,
  SignalCellularAlt1Bar,
  SignalCellularAlt2Bar,
  SignalCellularConnectedNoInternet0Bar,
  SignalCellularConnectedNoInternet1Bar,
  SignalCellularConnectedNoInternet2Bar,
  SignalCellularConnectedNoInternet3Bar,
  SignalCellularConnectedNoInternet4Bar,
  SignalCellularNoSim,
  SignalCellularNodata,
  SignalCellularNull,
  SignalCellularOff,
  SignalWifi0Bar,
  SignalWifi1Bar,
  SignalWifi1BarLock,
  SignalWifi2Bar,
  SignalWifi2BarLock,
  SignalWifi3Bar,
  SignalWifi3BarLock,
  SignalWifi4Bar,
  SignalWifi4BarLock,
  SignalWifiBad,
  SignalWifiConnectedNoInternet0,
  SignalWifiConnectedNoInternet1,
  SignalWifiConnectedNoInternet2,
  SignalWifiConnectedNoInternet3,
  SignalWifiConnectedNoInternet4,
  SignalWifiOff,
  SignalWifiStatusbar1Bar,
  SignalWifiStatusbar2Bar,
  SignalWifiStatusbar3Bar,
  SignalWifiStatusbar4Bar,
  SignalWifiStatusbarConnectedNoInternet1,
  SignalWifiStatusbarConnectedNoInternet2,
  SignalWifiStatusbarConnectedNoInternet3,
  SignalWifiStatusbarConnectedNoInternet4,
  SignalWifiStatusbarNotConnected,
  SignalWifiStatusbarNull,
  Signpost,
  SimCard as SimCardAlt,
  SimCardAlert as SimCardAlertIcon,
  SimCardDownload,
  SingleBed,
  Sip,
  Skateboarding,
  SkipNext as SkipNextIcon,
  SkipPrevious as SkipPreviousIcon,
  Sledding,
  Slideshow as SlideshowIcon,
  SlowMotionVideo as SlowMotionVideoIcon,
  SmartButton,
  SmartDisplay,
  SmartScreen,
  SmartToy,
  Smartphone as SmartphoneIcon,
  SmokeFree,
  SmokingRooms,
  Sms,
  SmsFailed,
  SnippetFolder as SnippetFolderIcon,
  Snooze,
  Snowboarding,
  Snowmobile,
  Snowshoeing,
  Soap,
  SocialDistance,
  SolarPower,
  Sort as SortIcon,
  SortByAlpha,
  Soup,
  Source,
  South,
  SouthAmerica,
  SouthEast,
  SouthWest,
  Spa,
  SpaceBar,
  SpaceDashboard,
  SpatialAudio,
  SpatialAudioOff,
  SpatialTracking,
  Speaker as SpeakerIcon,
  SpeakerGroup as SpeakerGroupIcon,
  SpeakerNotes,
  SpeakerNotesOff,
  SpeakerPhone,
  Speed as SpeedIcon,
  Spellcheck,
  Splitscreen,
  Spoke,
  Sports,
  SportsBar,
  SportsBaseball,
  SportsBasketball,
  SportsCricket,
  SportsEsports,
  SportsFootball,
  SportsGolf,
  SportsGymnastics,
  SportsHandball,
  SportsHockey,
  SportsKabaddi,
  SportsMartialArts,
  SportsMma,
  SportsMotorsports,
  SportsRugby,
  SportsScore,
  SportsSoccer,
  SportsTennis,
  SportsVolleyball,
  Square,
  SquareFoot,
  SsidChart,
  StackedBarChart,
  StackedLineChart,
  Stadium,
  Stairs,
  Star as StarIcon,
  StarBorder,
  StarBorderPurple500,
  StarHalf,
  StarOutline,
  StarPurple500,
  StarRate,
  Stars,
  Start,
  Sticky2,
  Stop as StopIcon,
  StopCircle as StopCircleIcon,
  StopScreenShare,
  Storage as StorageIcon,
  Store as StoreIcon,
  StoreMallDirectory as StoreMallDirectoryIcon,
  Storefront as StorefrontIcon,
  Storm,
  Straight,
  Straighten as StraightenIcon,
  Stream,
  Streetview,
  StrikethroughS,
  Stroller,
  Style,
  SubdirectoryArrowLeft,
  SubdirectoryArrowRight,
  Subject,
  Subscript,
  Subscriptions,
  Subtitles as SubtitlesIcon,
  SubtitlesOff as SubtitlesOffIcon,
  Subway,
  Summarize,
  Superscript,
  SupervisedUserCircle as SupervisedUserCircleIcon,
  SupervisorAccount,
  Support,
  SupportAgent,
  Surfing,
  SurroundSound as SurroundSoundIcon,
  SwapCalls,
  SwapHoriz,
  SwapHorizontalCircle,
  SwapVert,
  SwapVerticalCircle,
  Swipe,
  SwipeDown,
  SwipeDownAlt,
  SwipeLeft,
  SwipeLeftAlt,
  SwipeRight,
  SwipeRightAlt,
  SwipeUp,
  SwipeUpAlt,
  SwipeVertical,
  SwitchAccount,
  SwitchCamera,
  SwitchLeft,
  SwitchRight,
  SwitchVideo,
  Synagogue,
  Sync,
  SyncAlt,
  SyncDisabled,
  SyncLock,
  SyncProblem,
  SystemSecurityUpdate,
  SystemSecurityUpdateGood,
  SystemSecurityUpdateWarning,
  SystemUpdate,
  SystemUpdateAlt,
  TabUnselected,
  TableBar,
  TableChart,
  TableRestaurant,
  TableRows,
  TableView,
  Tablet as TabletIcon,
  TabletAndroid as TabletAndroidIcon,
  TabletMac as TabletMacIcon,
  Tag,
  TakeoutDining,
  TapAndPlay,
  Tapas,
  Task,
  TaskAlt,
  TaxiAlert,
  Telegram,
  Temple,
  Temple10mp,
  Terminal,
  Terrain,
  TextDecrease,
  TextFields,
  TextFormat,
  TextIncrease,
  TextRotateUp,
  TextRotateVertical,
  TextRotationAngledown,
  TextRotationAngleup,
  TextRotationDown,
  TextRotationNone,
  TextSnippet,
  Textsms,
  Texture,
  TheaterComedy,
  Theaters,
  Thermostat,
  ThermostatAuto,
  ThirtyFps,
  ThirtyFpsSelect,
  ThisDevice,
  ThreeG,
  ThreeK,
  ThreeKPlus,
  ThreeMP,
  ThreeP,
  ThreeSixty,
  ThumbDown,
  ThumbDownAlt,
  ThumbDownOffAlt,
  ThumbUp,
  ThumbUpAlt,
  ThumbUpOffAlt,
  ThumbsUpDown,
  Thunderstorm,
  Tiktok,
  TimeToLeave,
  Timelapse as TimelapseIcon,
  Timer as TimerIcon,
  Timer10 as Timer10Icon,
  Timer10Select,
  Timer3 as Timer3Icon,
  Timer3Select,
  TimerOff as TimerOffIcon,
  TimesOneMobiledata,
  TipsAndUpdates,
  TireRepair,
  Title,
  Toc,
  Today,
  ToggleOff,
  ToggleOn,
  Token,
  Toll,
  Tonality,
  Topic as TopicIcon,
  Tornado,
  TouchApp,
  Tour,
  Toys as ToysIcon,
  TrackChanges,
  Traffic,
  Train,
  Tram,
  Transcribe,
  TransferWithinAStation,
  Transform as TransformIcon,
  Transgender,
  TransitEnterexit,
  Translate,
  TravelExplore,
  TrendingDown as TrendingDownIcon,
  TrendingFlat,
  TrendingNeutral,
  TrendingUp as TrendingUpIcon,
  TripOrigin,
  Trolley,
  Troubleshoot,
  Try,
  Tsunami,
  Tty,
  Tune as TuneIcon,
  Tungsten,
  TurnLeft,
  TurnRight,
  TurnSharpLeft,
  TurnSharpRight,
  TurnSlightLeft,
  TurnSlightRight,
  TurnedIn,
  TurnedInNot,
  Tv as TvIcon,
  TvOff as TvOffIcon,
  TwelveMp,
  TwentyFourMp,
  TwentyFourthHourRight,
  TwentyOneMp,
  TwentyThreeMp,
  TwentyTwoMp,
  TwentyZeroMp,
  Twitter,
  TwoK,
  TwoKPlus,
  TwoMP,
  TwoWheeler,
  TypeSpecimen,
  UTurnLeft,
  UTurnRight,
  Umbrella,
  Unarchive,
  Undo,
  UnfoldLess,
  UnfoldLessDouble,
  UnfoldMore,
  UnfoldMoreDouble,
  Unpublished as UnpublishedIcon,
  Unsubscribe,
  Upcoming,
  Update,
  UpdateDisabled,
  Upgrade,
  Upload as UploadIcon,
  UploadFile as UploadFileIcon,
  Usb as UsbIcon,
  UsbOff,
  Vaccines,
  Vaping,
  VapingRooms,
  Verified,
  VerifiedUser as VerifiedUserIcon,
  VerticalAlignBottom,
  VerticalAlignCenter,
  VerticalAlignTop,
  VerticalDistribute,
  VerticalShades,
  VerticalShadesClosed,
  VerticalSplit,
  Vibration,
  VideoCall as VideoCallIcon,
  VideoFile as VideoFileIcon,
  VideoLabel as VideoLabelIcon,
  VideoLibrary as VideoLibraryIcon,
  VideoSettings as VideoSettingsIcon,
  VideoStable as VideoStableIcon,
  Videocam as VideocamIcon,
  VideocamOff as VideocamOffIcon,
  VideogameAsset as VideogameAssetIcon,
  VideogameAssetOff as VideogameAssetOffIcon,
  ViewAgenda,
  ViewArray,
  ViewCarousel,
  ViewColumn,
  ViewComfy,
  ViewComfyAlt,
  ViewCompact,
  ViewCozy,
  ViewDay,
  ViewHeadline,
  ViewInAr,
  ViewKanban,
  ViewList as ViewListIcon,
  ViewModule as ViewModuleIcon,
  ViewQuilt,
  ViewSidebar,
  ViewStream,
  ViewTimeline,
  ViewWeek,
  Vignette,
  Villa as VillaIcon,
  Visibility as VisibilityIcon,
  VisibilityOff,
  VoiceChat,
  VoiceOverOff,
  Voicemail,
  Volcano,
  VolumeDown as VolumeDownIcon,
  VolumeMute as VolumeMuteIcon,
  VolumeOff as VolumeOffIcon,
  VolumeUp as VolumeUpIcon,
  VolunteerActivism,
  VpnKey as VpnKeyIcon,
  VpnKeyOff,
  VpnLock,
  Vrpano as VrpanoIcon,
  Wallet,
  WalletGiftcard,
  WalletMembership,
  WalletTravel,
  Wallpaper,
  Warehouse,
  Warning as WarningIcon,
  WarningAmber,
  Wash,
  Watch as WatchIcon,
  WatchLater as WatchLaterIcon,
  WatchOff as WatchOffIcon,
  Water,
  WaterDamage,
  WaterDrop,
  WaterfallChart,
  Waves,
  WavingHand,
  WbAuto,
  WbCloudy,
  WbIncandescent,
  WbIridescent,
  WbShade,
  WbSunny,
  WbTwilight,
  Wc,
  Web,
  WebAsset,
  WebAssetOff,
  WebStories,
  Webhook,
  Wechat,
  Weekend as WeekendIcon,
  West,
  WhatsApp,
  Whatshot as WhatshotIcon,
  WheelchairPickup,
  WhereToVote,
  Widgets,
  WidthFull,
  WidthNormal,
  WidthWide,
  Wifi,
  WifiCalling,
  WifiCalling3,
  WifiChannel,
  WifiFind,
  WifiLock,
  WifiOff,
  WifiPassword,
  WifiProtectedSetup,
  WifiTethering,
  WifiTetheringError,
  WifiTetheringErrorRounded,
  WifiTetheringOff,
  Window,
  WindPower,
  Window as WindowIcon,
  WineBar,
  Woman,
  Woman2,
  Woo,
  Work,
  WorkHistory,
  WorkOff,
  WorkOutline,
  WorkspacePremium,
  Workspaces,
  WrapText,
  WrongLocation,
  Wysiwyg,
  Yard,
  YouTube,
  YoutubeSearchedFor,
  ZoomIn,
  ZoomInMap,
  ZoomOut,
  ZoomOutMap,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation as SwiperNavigation, Pagination as SwiperPagination, Autoplay, EffectFade, EffectCoverflow, Thumbs } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';
import 'swiper/css/effect-coverflow';
import 'swiper/css/thumbs';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { format, formatDistanceToNow, subDays, addDays, isToday, isYesterday, isTomorrow, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import { leadsAPI } from '../../services/api';
import { safeFormatDate } from '../../utils/safeDateUtils';
import CountUp from 'react-countup';
import { motion } from 'framer-motion';
import {
  AreaChart,
  Area,
  BarChart as RechartsBarChart,
  Bar,
  LineChart as RechartsLineChart,
  Line,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
  Treemap,
  Radar as RechartsRadar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Scatter,
  ScatterChart,
  ZAxis,
  ComposedChart,
  FunnelChart,
  Funnel,
  LabelList,
} from 'recharts';

// Animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const slideIn = keyframes`
  from { transform: translateX(-100%); }
  to { transform: translateX(0); }
`;

const pulseGlow = keyframes`
  0% { box-shadow: 0 0 20px rgba(156, 39, 176, 0.5); }
  50% { box-shadow: 0 0 40px rgba(156, 39, 176, 0.8); }
  100% { box-shadow: 0 0 20px rgba(156, 39, 176, 0.5); }
`;

const shimmer = keyframes`
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
`;

const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
`;

const rotate = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const bounce = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
`;

// Styled Components
const HeroSection = styled(Box)(({ theme }) => ({
  minHeight: '300px',
  padding: theme.spacing(6, 0, 4),
  background: 'linear-gradient(135deg, #10B981 0%, #34D399 100%)',
  color: 'white',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'radial-gradient(circle at 20% 80%, rgba(255, 255, 255, 0.2) 0%, transparent 50%)',
    pointerEvents: 'none',
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    top: -50,
    right: -50,
    width: 200,
    height: 200,
    background: 'radial-gradient(circle, rgba(255, 255, 255, 0.3) 0%, transparent 70%)',
    borderRadius: '50%',
    animation: `${float} 6s ease-in-out infinite`,
  },
}));

const StatsCard = styled(Card)(({ theme, color = 'primary' }) => ({
  background: 'white',
  borderRadius: theme.spacing(2),
  padding: theme.spacing(3),
  height: '100%',
  position: 'relative',
  overflow: 'hidden',
  transition: 'all 0.3s ease-in-out',
  animation: `${fadeIn} 0.6s ease-out`,
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[8],
    '& .stats-icon': {
      transform: 'scale(1.1) rotate(5deg)',
    },
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    top: -50,
    right: -50,
    width: 150,
    height: 150,
    borderRadius: '50%',
    background: theme.palette[color].main,
    opacity: 0.05,
  },
}));

const LeadCard = styled(Card)(({ theme, status }) => ({
  background: 'white',
  borderRadius: theme.spacing(2),
  overflow: 'hidden',
  transition: 'all 0.3s ease-in-out',
  animation: `${fadeIn} 0.6s ease-out`,
  marginBottom: theme.spacing(3),
  position: 'relative',
  cursor: 'pointer',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[12],
    '& .lead-image': {
      transform: 'scale(1.05)',
    },
    '& .action-buttons': {
      opacity: 1,
    },
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '4px',
    height: '100%',
    background: status === 'hot' ? theme.palette.error.main :
                status === 'warm' ? theme.palette.warning.main :
                status === 'cold' ? theme.palette.info.main :
                theme.palette.grey[400],
  },
}));

const AnimatedButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(135deg, #10B981 0%, #34D399 100%)',
  color: 'white',
  fontWeight: 600,
  padding: theme.spacing(1.5, 3),
  borderRadius: theme.spacing(3),
  transition: 'all 0.3s ease-in-out',
  '&:hover': {
    background: 'linear-gradient(135deg, #34D399 0%, #10B981 100%)',
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[8],
  },
}));

const ActionButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.spacing(3),
  padding: theme.spacing(1.5, 4),
  fontWeight: 600,
  textTransform: 'none',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 10px 20px rgba(0, 0, 0, 0.1)',
  },
}));

const SearchBar = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: theme.spacing(3),
    background: 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(10px)',
    '&:hover': {
      background: 'rgba(255, 255, 255, 0.95)',
    },
    '&.Mui-focused': {
      background: 'white',
    },
  },
}));

const FilterChip = styled(Chip)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  fontWeight: 500,
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 5px 10px rgba(0, 0, 0, 0.1)',
  },
}));

const LeadTag = styled(Chip)(({ theme }) => ({
  borderRadius: theme.spacing(1),
  height: 24,
  fontSize: '0.75rem',
  fontWeight: 600,
}));

const StageIndicator = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  padding: theme.spacing(0.5, 2),
  borderRadius: theme.spacing(2),
  background: alpha(theme.palette.primary.main, 0.1),
  color: theme.palette.primary.main,
  fontWeight: 600,
  fontSize: '0.875rem',
}));

const ActivityTimeline = styled(Box)(({ theme }) => ({
  position: 'relative',
  paddingLeft: theme.spacing(3),
  '&::before': {
    content: '""',
    position: 'absolute',
    left: 8,
    top: 0,
    bottom: 0,
    width: 2,
    background: theme.palette.divider,
  },
}));

const ActivityItem = styled(Box)(({ theme }) => ({
  position: 'relative',
  marginBottom: theme.spacing(3),
  '&::before': {
    content: '""',
    position: 'absolute',
    left: -20,
    top: 6,
    width: 10,
    height: 10,
    borderRadius: '50%',
    background: theme.palette.primary.main,
    border: `2px solid ${theme.palette.background.paper}`,
  },
}));

const FunnelStage = styled(Box)(({ theme, width }) => ({
  height: 60,
  width: `${width}%`,
  background: 'linear-gradient(135deg, #9C27B0 0%, #E91E63 100%)',
  color: 'white',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  clipPath: 'polygon(0 0, calc(100% - 20px) 0, 100% 50%, calc(100% - 20px) 100%, 0 100%)',
  position: 'relative',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'scale(1.05)',
    zIndex: 10,
  },
  '&:last-child': {
    clipPath: 'none',
  },
}));

const MetricCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(3),
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  textAlign: 'center',
  background: 'linear-gradient(135deg, #ffffff 0%, #f5f5f5 100%)',
  borderRadius: theme.spacing(2),
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
  },
}));

const FloatingActionButton = styled(Fab)(({ theme }) => ({
  position: 'fixed',
  bottom: theme.spacing(4),
  right: theme.spacing(4),
  background: 'linear-gradient(135deg, #9C27B0 0%, #E91E63 100%)',
  color: 'white',
  '&:hover': {
    background: 'linear-gradient(135deg, #7B1FA2 0%, #C2185B 100%)',
  },
}));

// StatsCard Component
const StatsCardComponent = ({ title, value, icon, color, trend }) => {
  return (
    <StatsCard>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 'bold', color }}>
              {value}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {title}
            </Typography>
            {trend && (
              <Typography variant="caption" color="text.secondary">
                {trend}
              </Typography>
            )}
          </Box>
          <Avatar 
            className="stat-icon"
            sx={{ 
              bgcolor: alpha(color, 0.1), 
              color,
              width: 56,
              height: 56,
              transition: 'all 0.3s ease',
            }}
          >
            {icon}
          </Avatar>
        </Box>
      </CardContent>
    </StatsCard>
  );
};

// Mock data
const mockLeads = [
  {
    id: 1,
    name: 'Sarah Johnson',
    email: 'sarah.johnson@email.com',
    phone: '(555) 123-4567',
    source: 'Website',
    stage: 'New',
    score: 85,
    budget: '$500,000 - $750,000',
    timeline: '3-6 months',
    interests: ['Single Family', 'Condo'],
    assignedTo: 'John Agent',
    lastContact: '2024-02-14',
    nextAction: 'Schedule property tour',
    notes: 'Looking for 3BR home in downtown area',
    activities: [
      { date: '2024-02-14', type: 'email', description: 'Sent property listings' },
      { date: '2024-02-12', type: 'call', description: 'Initial consultation call' },
    ],
  },
  {
    id: 2,
    name: 'Michael Chen',
    email: 'michael.chen@email.com',
    phone: '(555) 234-5678',
    source: 'Referral',
    stage: 'Qualified',
    score: 92,
    budget: '$1M+',
    timeline: '1-3 months',
    interests: ['Luxury', 'Waterfront'],
    assignedTo: 'Jane Agent',
    lastContact: '2024-02-15',
    nextAction: 'Send luxury property portfolio',
    notes: 'Cash buyer, looking for investment properties',
    activities: [
      { date: '2024-02-15', type: 'meeting', description: 'In-person consultation' },
      { date: '2024-02-10', type: 'email', description: 'Responded to inquiry' },
    ],
  },
];

// Chart data
const leadSourceData = [
  { name: 'Website', value: 35, color: '#9C27B0' },
  { name: 'Referral', value: 28, color: '#E91E63' },
  { name: 'Social Media', value: 20, color: '#3F51B5' },
  { name: 'Open House', value: 12, color: '#00BCD4' },
  { name: 'Other', value: 5, color: '#FF9800' },
];

const leadStageData = [
  { stage: 'New', count: 45, conversion: 100 },
  { stage: 'Contacted', count: 38, conversion: 84 },
  { stage: 'Qualified', count: 28, conversion: 62 },
  { stage: 'Viewing', count: 18, conversion: 40 },
  { stage: 'Negotiating', count: 12, conversion: 27 },
  { stage: 'Closed', count: 8, conversion: 18 },
];

const leadActivityData = [
  { date: 'Mon', calls: 12, emails: 25, meetings: 3 },
  { date: 'Tue', calls: 15, emails: 30, meetings: 5 },
  { date: 'Wed', calls: 18, emails: 35, meetings: 4 },
  { date: 'Thu', calls: 14, emails: 28, meetings: 6 },
  { date: 'Fri', calls: 20, emails: 40, meetings: 8 },
  { date: 'Sat', calls: 8, emails: 15, meetings: 2 },
  { date: 'Sun', calls: 5, emails: 10, meetings: 1 },
];

const leadScoreDistribution = [
  { range: '0-20', count: 5 },
  { range: '21-40', count: 12 },
  { range: '41-60', count: 25 },
  { range: '61-80', count: 35 },
  { range: '81-100', count: 23 },
];

const LeadsDashboard = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const queryClient = useQueryClient();

  // State
  const [viewMode, setViewMode] = useState('grid');
  const [selectedStage, setSelectedStage] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [dateRange, setDateRange] = useState('week');
  const [sortBy, setSortBy] = useState('recent');
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [selectedLead, setSelectedLead] = useState(null);
  const [addLeadOpen, setAddLeadOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [bulkActionMode, setBulkActionMode] = useState(false);
  const [selectedLeads, setSelectedLeads] = useState([]);
  const [scoreFilter, setScoreFilter] = useState([0, 100]);
  const [sourceFilter, setSourceFilter] = useState('all');

  // Fetch leads
  const { data: apiResponse, isLoading } = useQuery(
    ['leads', { stage: selectedStage, search: searchQuery, sort: sortBy }],
    () => leadsAPI.getAll({ stage: selectedStage, search: searchQuery, sort: sortBy }),
    {
      initialData: { data: mockLeads },
    }
  );
  
  // Extract leads array from API response
  const leads = apiResponse?.data || mockLeads;

  // Mutations
  const deleteMutation = useMutation(
    (id) => leadsAPI.delete(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('leads');
      },
    }
  );

  const updateStageMutation = useMutation(
    ({ id, stage }) => leadsAPI.update(id, { stage }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('leads');
      },
    }
  );

  // Handlers
  const handleViewModeChange = (event, newMode) => {
    if (newMode !== null) {
      setViewMode(newMode);
    }
  };

  const handleStageChange = (event, newStage) => {
    setSelectedStage(newStage);
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleDateRangeChange = (event) => {
    setDateRange(event.target.value);
  };

  const handleSortChange = (event) => {
    setSortBy(event.target.value);
  };

  const handleFilterClick = (event) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleFilterClose = (filter) => {
    if (filter) {
      setSelectedFilter(filter);
    }
    setFilterAnchorEl(null);
  };
  
  const handleMenuClick = (event, lead) => {
    setMenuAnchorEl(event.currentTarget);
    setSelectedLead(lead);
  };
  
  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  const handleLeadClick = (lead) => {
    navigate(`/leads/${lead.id}`);
  };

  const handleAddLead = () => {
    setAddLeadOpen(true);
  };

  const handleImportLeads = () => {
    setImportDialogOpen(true);
  };

  const handleBulkAction = (action) => {
    console.log('Bulk action:', action, selectedLeads);
    // Implement bulk actions
  };

  const getStageColor = (stage) => {
    const colors = {
      'New': '#9C27B0',
      'Contacted': '#3F51B5',
      'Qualified': '#00BCD4',
      'Viewing': '#4CAF50',
      'Negotiating': '#FF9800',
      'Closed': '#4CAF50',
      'Lost': '#F44336',
    };
    return colors[stage] || '#757575';
  };

  const getScoreColor = (score) => {
    if (score >= 80) return '#4CAF50';
    if (score >= 60) return '#FF9800';
    if (score >= 40) return '#2196F3';
    return '#F44336';
  };

  const getStatusColor = (status) => {
    const statusColors = {
      'hot': 'error',
      'warm': 'warning',
      'cold': 'info',
      'new': 'success',
      'contacted': 'primary',
      'qualified': 'secondary',
      'lost': 'default',
      'unknown': 'default'
    };
    return statusColors[(status || 'unknown').toLowerCase()] || 'default';
  };

  const getScoreIcon = (score) => {
    if (score >= 80) return <LocalFireDepartment sx={{ color: '#d32f2f' }} />;
    if (score >= 60) return <Whatshot sx={{ color: '#ff9800' }} />;
    return <TrendingUp sx={{ color: '#1976d2' }} />;
  };

  // Ensure leads is always an array
  const leadsArray = Array.isArray(leads) ? leads : [];
  
  // Filter leads
  const filteredLeads = leadsArray.filter(lead => {
    if (selectedStage !== 'all' && lead.stage !== selectedStage) return false;
    if (searchQuery && !lead.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (sourceFilter !== 'all' && lead.source !== sourceFilter) return false;
    if (lead.score < scoreFilter[0] || lead.score > scoreFilter[1]) return false;
    return true;
  });

  // Calculate metrics
  const totalLeads = leadsArray.length;
  const hotLeads = leadsArray.filter(l => l.score >= 80).length;
  const warmLeads = leadsArray.filter(l => l.score >= 60 && l.score < 80).length;
  const newLeadsThisWeek = leadsArray.filter(l => {
    const leadDate = new Date(l.lastContact);
    const weekAgo = subDays(new Date(), 7);
    return leadDate >= weekAgo;
  }).length;
  const conversionRate = totalLeads > 0 ? ((leadsArray.filter(l => l.stage === 'Closed').length / totalLeads) * 100).toFixed(1) : '0';
  
  // Define stats object
  const stats = {
    total: totalLeads,
    hot: hotLeads,
    warm: warmLeads,
    newThisWeek: newLeadsThisWeek
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      {/* Hero Section */}
      <HeroSection>
        <Container maxWidth="xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
              <Box>
                <Typography variant="h3" fontWeight="bold" gutterBottom>
                  Lead Management
                </Typography>
                <Typography variant="h6" sx={{ opacity: 0.9 }}>
                  Track and nurture your sales pipeline
                </Typography>
              </Box>
              <AnimatedButton
                startIcon={<Add />}
                onClick={handleAddLead}
                size="large"
              >
                New Lead
              </AnimatedButton>
            </Box>
          </motion.div>

          {/* Stats Cards */}
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <StatsCard color="primary">
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                      <Typography variant="h3" fontWeight="bold">
                        <CountUp end={stats.total} duration={2} />
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Total Leads
                      </Typography>
                    </Box>
                    <Avatar 
                      className="stats-icon"
                      sx={{ 
                        bgcolor: alpha('#10B981', 0.1), 
                        color: 'success.main',
                        width: 56,
                        height: 56,
                        transition: 'all 0.3s ease',
                      }}
                    >
                      <Person />
                    </Avatar>
                  </Box>
                </StatsCard>
              </motion.div>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <StatsCard color="error">
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                      <Typography variant="h3" fontWeight="bold">
                        <CountUp end={stats.hot} duration={2} />
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Hot Leads
                      </Typography>
                      <Chip
                        label={`${Math.round((stats.hot / stats.total) * 100)}% of total`}
                        size="small"
                        color="error"
                        sx={{ mt: 1 }}
                      />
                    </Box>
                    <Avatar 
                      className="stats-icon"
                      sx={{ 
                        bgcolor: alpha('#EF4444', 0.1), 
                        color: 'error.main',
                        width: 56,
                        height: 56,
                        transition: 'all 0.3s ease',
                      }}
                    >
                      <LocalFireDepartment />
                    </Avatar>
                  </Box>
                </StatsCard>
              </motion.div>
            </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCardComponent
              title="Warm Leads"
              value={stats.warm}
              icon={<AccessTime />}
              color="#f57c00"
              trend={`${Math.round((stats.warm / stats.total) * 100)}% of total`}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCardComponent
              title="New This Week"
              value={stats.newThisWeek}
              icon={<Star />}
              color="#388e3c"
            />
          </Grid>
        </Grid>

        {/* Search and Filter Bar */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search leads by name, email, or phone..."
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
            <Button
              variant="outlined"
              startIcon={<FilterList />}
              onClick={handleFilterClick}
            >
              Filter: {selectedFilter === 'all' ? 'All' : selectedFilter}
            </Button>
            <Menu
              anchorEl={filterAnchorEl}
              open={Boolean(filterAnchorEl)}
              onClose={() => handleFilterClose(null)}
            >
              <MenuItem onClick={() => handleFilterClose('all')}>All Leads</MenuItem>
              <MenuItem onClick={() => handleFilterClose('hot')}>Hot Leads</MenuItem>
              <MenuItem onClick={() => handleFilterClose('warm')}>Warm Leads</MenuItem>
              <MenuItem onClick={() => handleFilterClose('cold')}>Cold Leads</MenuItem>
            </Menu>
          </Box>
        </Paper>

        {/* Leads Table */}
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox"></TableCell>
                <TableCell>Lead</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Score</TableCell>
                <TableCell>Source</TableCell>
                <TableCell>Interest</TableCell>
                <TableCell>Timeline</TableCell>
                <TableCell>Assigned To</TableCell>
                <TableCell>Last Contact</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={10} align="center">
                    <LinearProgress />
                  </TableCell>
                </TableRow>
              ) : filteredLeads.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} align="center">
                    <Typography color="textSecondary">No leads found</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredLeads.map((lead) => (
                  <TableRow 
                    key={lead.id} 
                    hover
                    sx={{ cursor: 'pointer' }}
                  >
                    <TableCell padding="checkbox">
                      <IconButton size="small">
                        {lead.starred ? <Star color="primary" /> : <StarBorder />}
                      </IconButton>
                    </TableCell>
                    <TableCell onClick={() => handleLeadClick(lead.id)}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          {lead.name.split(' ').map(n => n[0]).join('')}
                        </Avatar>
                        <Box>
                          <Link
                            component="button"
                            variant="subtitle2"
                            onClick={(e) => {
                              e.preventDefault();
                              handleLeadClick(lead.id);
                            }}
                            sx={{ 
                              textAlign: 'left',
                              textDecoration: 'none',
                              color: 'primary.main',
                              '&:hover': {
                                textDecoration: 'underline'
                              }
                            }}
                          >
                            {lead.name}
                          </Link>
                          <Typography variant="caption" display="block" color="textSecondary">
                            {lead.email}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {lead.phone}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell onClick={() => handleLeadClick(lead.id)}>
                      <Chip
                        label={(lead.status || 'unknown').toUpperCase()}
                        color={getStatusColor(lead.status || 'unknown')}
                        size="small"
                      />
                    </TableCell>
                    <TableCell onClick={() => handleLeadClick(lead.id)}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {getScoreIcon(lead.score)}
                        <Typography variant="body2">{lead.score}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell onClick={() => handleLeadClick(lead.id)}>{lead.source}</TableCell>
                    <TableCell onClick={() => handleLeadClick(lead.id)}>
                      <Typography variant="body2">{lead.interested_in}</Typography>
                      <Typography variant="caption" color="textSecondary">
                        {lead.budget}
                      </Typography>
                    </TableCell>
                    <TableCell onClick={() => handleLeadClick(lead.id)}>{lead.timeline}</TableCell>
                    <TableCell onClick={() => handleLeadClick(lead.id)}>
                      <Chip
                        label={lead.assignedTo}
                        size="small"
                        variant="outlined"
                        color={lead.assignedTo.includes('AI') ? 'secondary' : 'default'}
                      />
                    </TableCell>
                    <TableCell onClick={() => handleLeadClick(lead.id)}>
                      <Typography variant="body2">
                        {safeFormatDate(lead.lastContact, 'MMM dd')}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {safeFormatDate(lead.lastContact, 'h:mm a')}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                        <Tooltip title="Call">
                          <IconButton size="small" color="primary">
                            <Phone />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Email">
                          <IconButton size="small" color="primary">
                            <Email />
                          </IconButton>
                        </Tooltip>
                        <IconButton
                          size="small"
                          onClick={(e) => handleMenuClick(e, lead)}
                        >
                          <MoreVert />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Action Menu */}
        <Menu
          anchorEl={menuAnchorEl}
          open={Boolean(menuAnchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={() => {
            handleLeadClick(selectedLead?.id);
            handleMenuClose();
          }}>
            View Details
          </MenuItem>
          <MenuItem onClick={handleMenuClose}>Edit Lead</MenuItem>
          <MenuItem onClick={handleMenuClose}>Change Status</MenuItem>
          <MenuItem onClick={handleMenuClose}>Assign To</MenuItem>
          <MenuItem onClick={handleMenuClose}>Add Note</MenuItem>
          <MenuItem onClick={handleMenuClose}>Convert to Client</MenuItem>
          <MenuItem onClick={handleMenuClose} sx={{ color: 'error.main' }}>
            Delete Lead
          </MenuItem>
        </Menu>
      </Box>
    </Container>
  );
};

export default LeadsDashboard;