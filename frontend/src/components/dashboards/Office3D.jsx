// File: frontend/src/components/dashboards/Office3D.jsx
import React, { useEffect, useRef, useState } from 'react';
import {
  Box,
  Paper,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  Stack,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Card,
  CardContent,
  Grid,
  IconButton,
  Chip,
} from '@mui/material';
import {
  Home,
  SmartToy,
  Business,
  Close,
  Person,
  Group,
  CorporateFare,
  AssistantPhoto,
} from '@mui/icons-material';
import * as THREE from 'three';
import { useSnackbar } from 'notistack';

// Office configurations
const officeConfigs = {
  solo: {
    name: 'Solo Office',
    description: 'Personal workspace with executive assistant',
    size: { width: 20, depth: 15 },
    agents: ['alex_assistant', 'executive_assistant']
  },
  team: {
    name: 'Team Office',
    description: 'Collaborative team workspace from your layout',
    size: { width: 80, depth: 60 },
    agents: ['alex_assistant', 'buyer_specialist', 'listing_specialist', 'escrow_coordinator', 'client_success', 'marketing_specialist', 'compliance_officer', 'financial_analyst']
  },
  company: {
    name: 'Company Office',
    description: '3 department layout with full teams',
    size: { width: 120, depth: 60 },
    agents: ['alex_assistant', 'buyer_specialist', 'listing_specialist', 'escrow_coordinator', 'client_success', 'marketing_specialist', 'compliance_officer', 'financial_analyst', 'operations_manager', 'buyer_manager', 'listing_manager', 'database_specialist']
  }
};

// Agent configurations
const agentConfigs = {
  alex_assistant: {
    name: 'Alex',
    title: 'Executive Assistant',
    icon: '🤖',
    color: '#2196f3',
    department: 'management'
  },
  executive_assistant: {
    name: 'Emma',
    title: 'Personal Assistant',
    icon: '👩‍💼',
    color: '#9c27b0',
    department: 'management'
  },
  buyer_specialist: {
    name: 'Bailey',
    title: 'Buyer Specialist',
    icon: '🏠',
    color: '#4caf50',
    department: 'buyer'
  },
  listing_specialist: {
    name: 'Skylar',
    title: 'Listing Specialist',
    icon: '📋',
    color: '#ff9800',
    department: 'listing'
  },
  escrow_coordinator: {
    name: 'Esther',
    title: 'Escrow Coordinator',
    icon: '📄',
    color: '#795548',
    department: 'operations'
  },
  client_success: {
    name: 'Sam',
    title: 'Client Success',
    icon: '⭐',
    color: '#607d8b',
    department: 'support'
  },
  marketing_specialist: {
    name: 'Morgan',
    title: 'Marketing Specialist',
    icon: '📣',
    color: '#e91e63',
    department: 'marketing'
  },
  compliance_officer: {
    name: 'Carlos',
    title: 'Legal & Compliance',
    icon: '✅',
    color: '#9c27b0',
    department: 'operations'
  },
  financial_analyst: {
    name: 'Finn',
    title: 'Commission & Finance',
    icon: '💰',
    color: '#009688',
    department: 'operations'
  },
  operations_manager: {
    name: 'Oscar',
    title: 'Operations Manager',
    icon: '⚙️',
    color: '#3f51b5',
    department: 'operations'
  },
  buyer_manager: {
    name: 'Brenda',
    title: 'Buyer Department Manager',
    icon: '🏢',
    color: '#2e7d32',
    department: 'buyer'
  },
  listing_manager: {
    name: 'Laura',
    title: 'Listing Department Manager',
    icon: '📊',
    color: '#ed6c02',
    department: 'listing'
  },
  database_specialist: {
    name: 'Olivia',
    title: 'CRM & Database Admin',
    icon: '💾',
    color: '#757575',
    department: 'support'
  }
};

const Office3D = ({ agents = [] }) => {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const agentMeshesRef = useRef({});
  const cameraDistanceRef = useRef(50);
  const cameraAngleXRef = useRef(Math.PI / 3.5);
  const cameraAngleYRef = useRef(-Math.PI / 2);
  const [selectedTab, setSelectedTab] = useState('team');
  const [selectedAgent, setSelectedAgent] = useState(null);
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    if (!mountRef.current) return;

    // Check if THREE is available
    if (!THREE || !THREE.Scene || !THREE.WebGLRenderer) {
      console.error('Three.js not loaded properly');
      return;
    }

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(
      50, // Slightly wider field of view for better view
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    cameraRef.current = camera;

    // Renderer
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      
      // Check if domElement exists before accessing it
      if (renderer.domElement) {
        mountRef.current.appendChild(renderer.domElement);
        rendererRef.current = renderer;
      } else {
        console.error('Renderer domElement not created');
        return;
      }
    } catch (error) {
      console.error('Error creating WebGL renderer:', error);
      return;
    }

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.4);
    directionalLight.position.set(10, 20, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 50;
    directionalLight.shadow.camera.left = -30;
    directionalLight.shadow.camera.right = 30;
    directionalLight.shadow.camera.top = 30;
    directionalLight.shadow.camera.bottom = -30;
    scene.add(directionalLight);

    // Create office based on selected tab
    createOffice(selectedTab);

    // Camera controls
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    // Adjust distance for better head-on view
    cameraDistanceRef.current = selectedTab === 'company' ? 75 : selectedTab === 'team' ? 60 : 30;
    cameraAngleXRef.current = Math.PI / 3.5; // Tilt angle
    cameraAngleYRef.current = Math.PI; // Head-on view from front/south (looking at the office entrance)

    const updateCamera = () => {
      camera.position.x = cameraDistanceRef.current * Math.sin(cameraAngleYRef.current) * Math.cos(cameraAngleXRef.current);
      camera.position.y = cameraDistanceRef.current * Math.sin(cameraAngleXRef.current);
      camera.position.z = cameraDistanceRef.current * Math.cos(cameraAngleYRef.current) * Math.cos(cameraAngleXRef.current);
      camera.lookAt(0, 0, 0);
    };

    // Mouse controls
    const handleMouseDown = (e) => {
      if (e.button === 2 || e.button === 1) {
        isDragging = true;
        previousMousePosition = { x: e.clientX, y: e.clientY };
      }
    };

    const handleMouseMove = (e) => {
      if (isDragging) {
        const deltaX = e.clientX - previousMousePosition.x;
        const deltaY = e.clientY - previousMousePosition.y;
        
        // Rotate around Y axis (horizontal movement)
        cameraAngleYRef.current -= deltaX * 0.01;
        
        // Tilt up/down (vertical movement)
        cameraAngleXRef.current = Math.max(0.1, Math.min(Math.PI / 2 - 0.1, cameraAngleXRef.current - deltaY * 0.01));
        
        previousMousePosition = { x: e.clientX, y: e.clientY };
        updateCamera();
      }
    };

    const handleMouseUp = () => {
      isDragging = false;
    };

    const handleContextMenu = (e) => {
      e.preventDefault();
    };

    const handleWheel = (e) => {
      e.preventDefault();
      if (e.shiftKey) {
        cameraAngleXRef.current = Math.max(0.1, Math.min(Math.PI / 2 - 0.1, cameraAngleXRef.current - e.deltaY * 0.001));
      } else {
        const zoomSpeed = selectedTab === 'company' ? 0.1 : 0.05;
        cameraDistanceRef.current = Math.max(15, Math.min(150, cameraDistanceRef.current + e.deltaY * zoomSpeed));
      }
      updateCamera();
    };

    // Raycaster for clicking agents
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleClick = (e) => {
      const rect = mountRef.current.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);

      const agentMeshes = Object.values(agentMeshesRef.current);
      const intersects = raycaster.intersectObjects(agentMeshes, true); // true for recursive check</      
      if (intersects.length > 0) {
        const clickedObject = intersects[0].object;
        // Find the parent group if clicked on a child mesh
        let clickedMesh = clickedObject;
        while (clickedMesh.parent && !agentMeshes.includes(clickedMesh)) {
          clickedMesh = clickedMesh.parent;
        }
        
        const agentId = Object.keys(agentMeshesRef.current).find(
          id => agentMeshesRef.current[id] === clickedMesh
        );
        if (agentId) {
          const agent = agentConfigs[agentId];
          setSelectedAgent({ ...agent, id: agentId });
        }
      }
    };

    // Add event listeners
    if (renderer && renderer.domElement) {
      renderer.domElement.addEventListener('mousedown', handleMouseDown);
      renderer.domElement.addEventListener('mousemove', handleMouseMove);
      renderer.domElement.addEventListener('mouseup', handleMouseUp);
      renderer.domElement.addEventListener('contextmenu', handleContextMenu);
      renderer.domElement.addEventListener('wheel', handleWheel);
      renderer.domElement.addEventListener('click', handleClick);
    }

    // Keyboard controls
    const handleKeyDown = (e) => {
      // Don't trigger if typing in an input field or dialog is open
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || selectedAgent) return;
      
      if ((e.key === 'w' || e.key === 'W') || e.key === 'ArrowUp' || e.key === 'q' || e.key === 'Q') {
        // Tilt camera up (more top-down)
        cameraAngleXRef.current = Math.max(0.1, cameraAngleXRef.current - 0.1);
        updateCamera();
      } else if ((e.key === 's' || e.key === 'S') || e.key === 'ArrowDown' || e.key === 'e' || e.key === 'E') {
        // Tilt camera down (more angled)
        cameraAngleXRef.current = Math.min(Math.PI / 2 - 0.1, cameraAngleXRef.current + 0.1);
        updateCamera();
      } else if (e.key === 'a' || e.key === 'A' || e.key === 'ArrowLeft') {
        // Rotate left
        cameraAngleYRef.current -= 0.1;
        updateCamera();
      } else if (e.key === 'd' || e.key === 'D' || e.key === 'ArrowRight') {
        // Rotate right
        cameraAngleYRef.current += 0.1;
        updateCamera();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      
      // Rotate agents slightly for visual interest
      Object.values(agentMeshesRef.current).forEach(mesh => {
        if (mesh) {
          mesh.rotation.y += 0.005;
        }
      });
      
      renderer.render(scene, camera);
    };

    updateCamera();
    animate();

    // Handle resize
    const handleResize = () => {
      if (!mountRef.current || !cameraRef.current) return;
      cameraRef.current.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      cameraRef.current.updateProjectionMatrix();
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    const setCameraView = (viewType) => {
    if (!cameraRef.current) return;
    
    switch(viewType) {
      case 'top':
        // Near top-down but not completely flat
        cameraAngleXRef.current = 0.1;
        cameraDistanceRef.current = selectedTab === 'company' ? 100 : selectedTab === 'team' ? 75 : 40;
      case 'reset':
        // Reset to default head-on view
        cameraAngleXRef.current = Math.PI / 3.5;
        cameraAngleYRef.current = Math.PI;
        cameraDistanceRef.current = selectedTab === 'company' ? 75 : selectedTab === 'team' ? 60 : 30;
        break;
      case 'default':
        // Default angled view from front
        cameraAngleXRef.current = Math.PI / 3.5;
        cameraAngleYRef.current = Math.PI;
        cameraDistanceRef.current = selectedTab === 'company' ? 75 : selectedTab === 'team' ? 60 : 30;
        break;
      case 'close':
        // Zoomed in view
        cameraDistanceRef.current = selectedTab === 'company' ? 50 : selectedTab === 'team' ? 40 : 20;
        break;
      case 'front':
        // Head-on from front (looking at Reception/Lounges)
        cameraAngleYRef.current = Math.PI;
        break;
      case 'back':
        // Head-on from back (looking at Executive Offices)
        cameraAngleYRef.current = 0;
        break;
      case 'left':
        // Head-on from left side
        cameraAngleYRef.current = Math.PI / 2;
        break;
      case 'right':
        // Head-on from right side
        cameraAngleYRef.current = -Math.PI / 2;
        break;
      case 'reset':
        // Reset to default head-on view
        cameraAngleXRef.current = Math.PI / 3.5;
        cameraAngleYRef.current = Math.PI;
        cameraDistanceRef.current = selectedTab === 'company' ? 75 : selectedTab === 'team' ? 60 : 30;
        break;
    }
    
    // Update camera position
    const camera = cameraRef.current;
    camera.position.x = cameraDistanceRef.current * Math.sin(cameraAngleYRef.current) * Math.cos(cameraAngleXRef.current);
    camera.position.y = cameraDistanceRef.current * Math.sin(cameraAngleXRef.current);
    camera.position.z = cameraDistanceRef.current * Math.cos(cameraAngleYRef.current) * Math.cos(cameraAngleXRef.current);
    camera.lookAt(0, 0, 0);
  };

  return () => {
      window.removeEventListener('resize', handleResize);
      
      if (renderer && renderer.domElement) {
        renderer.domElement.removeEventListener('mousedown', handleMouseDown);
        renderer.domElement.removeEventListener('mousemove', handleMouseMove);
        renderer.domElement.removeEventListener('mouseup', handleMouseUp);
        renderer.domElement.removeEventListener('contextmenu', handleContextMenu);
        renderer.domElement.removeEventListener('wheel', handleWheel);
        renderer.domElement.removeEventListener('click', handleClick);
        
        if (mountRef.current) {
          try {
            mountRef.current.removeChild(renderer.domElement);
          } catch (e) {
            // Already removed
          }
        }
        
        renderer.dispose();
      }
    };
  }, []);

  // Update office when tab changes
  useEffect(() => {
    if (sceneRef.current && cameraRef.current) {
      createOffice(selectedTab);
      // Adjust camera distance based on office size
              cameraDistanceRef.current = selectedTab === 'company' ? 75 : selectedTab === 'team' ? 60 : 30;
      cameraAngleYRef.current = Math.PI; // Reset to head-on view from front when changing tabs
      // Update camera position
      const camera = cameraRef.current;
      camera.position.x = cameraDistanceRef.current * Math.sin(cameraAngleYRef.current) * Math.cos(cameraAngleXRef.current);
      camera.position.y = cameraDistanceRef.current * Math.sin(cameraAngleXRef.current);
      camera.position.z = cameraDistanceRef.current * Math.cos(cameraAngleYRef.current) * Math.cos(cameraAngleXRef.current);
      camera.lookAt(0, 0, 0);
    }
  }, [selectedTab, agents]);

  const createOffice = (officeType) => {
    const scene = sceneRef.current;
    if (!scene) return;

    // Clear existing objects
    while (scene.children.length > 2) { // Keep lights
      const child = scene.children[2];
      if (child.geometry) child.geometry.dispose();
      if (child.material) child.material.dispose();
      scene.remove(child);
    }
    agentMeshesRef.current = {};

    const config = officeConfigs[officeType];
    const materials = {
      floor: new THREE.MeshStandardMaterial({ color: 0xcccccc }),
      wall: new THREE.MeshStandardMaterial({ color: 0xe0e0e0 }),
      desk: new THREE.MeshStandardMaterial({ color: 0x8B4513 }),
      chair: new THREE.MeshStandardMaterial({ color: 0x2B2B2B }),
      accent: new THREE.MeshStandardMaterial({ color: 0x4A90E2 }),
      plant: new THREE.MeshStandardMaterial({ color: 0x228B22 }),
      glass: new THREE.MeshStandardMaterial({ 
        color: 0x87CEEB, 
        transparent: true, 
        opacity: 0.3 
      }),
    };

    // Floor
    const floor = new THREE.Mesh(
      new THREE.BoxGeometry(config.size.width, 0.1, config.size.depth),
      materials.floor
    );
    floor.receiveShadow = true;
    scene.add(floor);

    // Create office-specific layouts
    switch (officeType) {
      case 'solo':
        createSoloOffice(scene, materials, config);
        break;
      case 'team':
        createTeamOffice(scene, materials, config);
        break;
      case 'company':
        createCompanyOffice(scene, materials, config);
        break;
    }
  };

  const createDesk = (scene, materials, x, y, z, rotation = 0) => {
    const deskGroup = new THREE.Group();
    
    // Desk top
    const deskTop = new THREE.Mesh(
      new THREE.BoxGeometry(2, 0.1, 1),
      materials.desk
    );
    deskTop.position.y = 0.75;
    deskTop.castShadow = true;
    deskTop.receiveShadow = true;
    
    // Desk legs
    const legGeometry = new THREE.BoxGeometry(0.1, 0.7, 0.1);
    const positions = [
      [-0.9, 0.35, 0.4],
      [0.9, 0.35, 0.4],
      [-0.9, 0.35, -0.4],
      [0.9, 0.35, -0.4]
    ];
    
    positions.forEach(pos => {
      const leg = new THREE.Mesh(legGeometry, materials.desk);
      leg.position.set(...pos);
      leg.castShadow = true;
      deskGroup.add(leg);
    });
    
    deskGroup.add(deskTop);
    deskGroup.position.set(x, y, z);
    deskGroup.rotation.y = rotation;
    
    scene.add(deskGroup);
    return deskGroup;
  };

  const createChair = (scene, materials, x, y, z, rotation = 0) => {
    const chairGroup = new THREE.Group();
    
    // Seat
    const seat = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, 0.1, 0.5),
      materials.chair
    );
    seat.position.y = 0.5;
    seat.castShadow = true;
    
    // Back
    const back = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, 0.5, 0.1),
      materials.chair
    );
    back.position.set(0, 0.75, -0.2);
    back.castShadow = true;
    
    chairGroup.add(seat);
    chairGroup.add(back);
    chairGroup.position.set(x, y, z);
    chairGroup.rotation.y = rotation;
    
    scene.add(chairGroup);
    return chairGroup;
  };

  const createWall = (scene, materials, width, height, depth, position, rotation = 0) => {
    const wall = new THREE.Mesh(
      new THREE.BoxGeometry(width, height, depth),
      materials.wall
    );
    wall.position.copy(position);
    wall.rotation.y = rotation;
    wall.castShadow = true;
    wall.receiveShadow = true;
    scene.add(wall);
    return wall;
  };

  const createAgent = (scene, agentId, position) => {
    const agent = agentConfigs[agentId];
    if (!agent) return;

    const agentGroup = new THREE.Group();
    
    // Body
    const body = new THREE.Mesh(
      new THREE.CylinderGeometry(0.3, 0.3, 1.5, 8),
      new THREE.MeshStandardMaterial({ color: agent.color })
    );
    body.position.y = 0.75;
    body.castShadow = true;
    
    // Head
    const head = new THREE.Mesh(
      new THREE.SphereGeometry(0.25, 8, 8),
      new THREE.MeshStandardMaterial({ color: 0xfdbcb4 })
    );
    head.position.y = 1.75;
    head.castShadow = true;
    
    agentGroup.add(body);
    agentGroup.add(head);
    agentGroup.position.copy(position);
    
    scene.add(agentGroup);
    agentMeshesRef.current[agentId] = agentGroup;
    
    return agentGroup;
  };

  const createSoloOffice = (scene, materials, config) => {
    const wallHeight = 3;
    const wallThickness = 0.2;
    
    // Outer walls
    createWall(scene, materials, config.size.width, wallHeight, wallThickness, 
      new THREE.Vector3(0, wallHeight/2, -config.size.depth/2));
    createWall(scene, materials, config.size.width, wallHeight, wallThickness, 
      new THREE.Vector3(0, wallHeight/2, config.size.depth/2));
    createWall(scene, materials, wallThickness, wallHeight, config.size.depth, 
      new THREE.Vector3(-config.size.width/2, wallHeight/2, 0));
    createWall(scene, materials, wallThickness, wallHeight, config.size.depth, 
      new THREE.Vector3(config.size.width/2, wallHeight/2, 0));
    
    // Main office area
    createDesk(scene, materials, -3, 0, 0);
    createChair(scene, materials, -3, 0, 1.5);
    
    // Executive assistant area
    createDesk(scene, materials, 3, 0, -3, Math.PI/2);
    createChair(scene, materials, 1.5, 0, -3);
    
    // Meeting area
    const meetingTable = new THREE.Mesh(
      new THREE.BoxGeometry(2, 0.1, 2),
      materials.desk
    );
    meetingTable.position.set(5, 0.75, 3);
    meetingTable.castShadow = true;
    scene.add(meetingTable);
    
    // Add chairs around meeting table
    createChair(scene, materials, 5, 0, 1.5);
    createChair(scene, materials, 5, 0, 4.5, Math.PI);
    createChair(scene, materials, 3.5, 0, 3, Math.PI/2);
    createChair(scene, materials, 6.5, 0, 3, -Math.PI/2);
    
    // Plant
    const plant = new THREE.Mesh(
      new THREE.CylinderGeometry(0.5, 0.5, 1, 8),
      materials.plant
    );
    plant.position.set(-8, 0.5, 5);
    plant.castShadow = true;
    scene.add(plant);
    
    // Add agents
    createAgent(scene, 'alex_assistant', new THREE.Vector3(-3, 0.05, 0));
    createAgent(scene, 'executive_assistant', new THREE.Vector3(3, 0.05, -3));
  };

  const createRoomArea = (scene, name, position, width, depth, color) => {
    const roomMat = new THREE.MeshStandardMaterial({
      color: color,
      transparent: true,
      opacity: 0.3,
      emissive: new THREE.Color(0x000000)
    });
    
    const room = new THREE.Mesh(
      new THREE.BoxGeometry(width, 0.02, depth),
      roomMat
    );
    room.position.set(position.x, 0.01, position.z);
    room.receiveShadow = true;
    room.name = name;
    
    scene.add(room);
    return room;
  };

  const createTeamOffice = (scene, materials, config) => {
    // This recreates your Office3D.jsx layout
    const wallHeight = 5;
    const wallThickness = 0.5;
    
    // Outer walls
    createWall(scene, materials, 80, wallHeight, wallThickness, 
      new THREE.Vector3(0, wallHeight/2, 30));
    createWall(scene, materials, 80, wallHeight, wallThickness, 
      new THREE.Vector3(0, wallHeight/2, -30));
    createWall(scene, materials, wallThickness, wallHeight, 60, 
      new THREE.Vector3(40, wallHeight/2, 0));
    createWall(scene, materials, wallThickness, wallHeight, 60, 
      new THREE.Vector3(-40, wallHeight/2, 0));
    
    // TOP ROW - Partner and Senior Offices
    // Partner Office (10' x 10')
    createWall(scene, materials, wallThickness, wallHeight, 10, 
      new THREE.Vector3(-30, wallHeight/2, 25));
    createWall(scene, materials, 10, wallHeight, wallThickness, 
      new THREE.Vector3(-35, wallHeight/2, 20));
    
    createDesk(scene, materials, -35, 0.05, 25);
    createChair(scene, materials, -35, 0.05, 23);
    
    // Senior Office 1 (9' x 10')
    createWall(scene, materials, wallThickness, wallHeight, 10, 
      new THREE.Vector3(-21, wallHeight/2, 25));
    createWall(scene, materials, 9, wallHeight, wallThickness, 
      new THREE.Vector3(-25.5, wallHeight/2, 20));
    
    createDesk(scene, materials, -25.5, 0.05, 25);
    createChair(scene, materials, -25.5, 0.05, 23);
    
    // Senior Office 2 (9' x 10')
    createWall(scene, materials, wallThickness, wallHeight, 10, 
      new THREE.Vector3(-12, wallHeight/2, 25));
    createWall(scene, materials, 9, wallHeight, wallThickness, 
      new THREE.Vector3(-16.5, wallHeight/2, 20));
    
    createDesk(scene, materials, -16.5, 0.05, 25);
    createChair(scene, materials, -16.5, 0.05, 23);
    
    // Conference Room (16' x 10')
    createWall(scene, materials, wallThickness, wallHeight, 10, 
      new THREE.Vector3(24, wallHeight/2, 25));
    createWall(scene, materials, 16, wallHeight, wallThickness, 
      new THREE.Vector3(32, wallHeight/2, 20));
    
    // Conference table
    const conferenceTable = new THREE.Mesh(
      new THREE.BoxGeometry(7, 0.1, 3.5),
      materials.desk
    );
    conferenceTable.position.set(32, 1.25, 25);
    conferenceTable.castShadow = true;
    scene.add(conferenceTable);
    
    // MIDDLE ROW
    // Manager Office (11' x 10')
    createWall(scene, materials, 11, wallHeight, wallThickness, 
      new THREE.Vector3(-34.5, wallHeight/2, 10));
    createWall(scene, materials, wallThickness, wallHeight, 10, 
      new THREE.Vector3(-29, wallHeight/2, 5));
    createWall(scene, materials, 11, wallHeight, wallThickness, 
      new THREE.Vector3(-34.5, wallHeight/2, 0));
    
    createDesk(scene, materials, -34.5, 0.05, 5);
    createChair(scene, materials, -34.5, 0.05, 3);
    
    // Wellness Zone divider
    createWall(scene, materials, 14, wallHeight, wallThickness, 
      new THREE.Vector3(33, wallHeight/2, 3));
    
    // Refreshment bar counter
    const barCounter = new THREE.Mesh(
      new THREE.BoxGeometry(10, 0.1, 2),
      materials.desk
    );
    barCounter.position.set(33, 1.5, 0.5);
    barCounter.castShadow = true;
    scene.add(barCounter);
    
    // BOTTOM ROW
    // Reception (11' x 10')
    createWall(scene, materials, 11, wallHeight, wallThickness, 
      new THREE.Vector3(-34.5, wallHeight/2, -20));
    createWall(scene, materials, wallThickness, wallHeight, 10, 
      new THREE.Vector3(-29, wallHeight/2, -25));
    
    // Reception desk (curved)
    const receptionDesk = new THREE.Mesh(
      new THREE.CylinderGeometry(3.5, 3.5, 0.1, 6),
      materials.desk
    );
    receptionDesk.position.set(-34.5, 1.25, -25);
    receptionDesk.castShadow = true;
    scene.add(receptionDesk);
    
    // Client Lounge walls
    createWall(scene, materials, wallThickness, wallHeight, 10, 
      new THREE.Vector3(-10, wallHeight/2, -25));
    createWall(scene, materials, wallThickness, wallHeight, 10, 
      new THREE.Vector3(7.5, wallHeight/2, -25));
    createWall(scene, materials, 17.5, wallHeight, wallThickness, 
      new THREE.Vector3(-1.25, wallHeight/2, -20));
    
    // Lead Lounge walls
    createWall(scene, materials, wallThickness, wallHeight, 10, 
      new THREE.Vector3(23, wallHeight/2, -25));
    createWall(scene, materials, 17, wallHeight, wallThickness, 
      new THREE.Vector3(31.5, wallHeight/2, -20));
    
    // Create colored room areas for visual distinction
    createRoomArea(scene, "partnerOffice", {x: -35, z: 25}, 10, 10, 0x4169E1);
    createRoomArea(scene, "seniorOffice1", {x: -25.5, z: 25}, 9, 10, 0x4169E1);
    createRoomArea(scene, "seniorOffice2", {x: -16.5, z: 25}, 9, 10, 0x4169E1);
    createRoomArea(scene, "conference", {x: 32, z: 25}, 16, 10, 0xFFA500);
    createRoomArea(scene, "managerOffice", {x: -34.5, z: 5}, 11, 10, 0x4169E1);
    createRoomArea(scene, "openCommon", {x: 0, z: 0}, 40, 26, 0xE0E0E0);
    createRoomArea(scene, "wellness", {x: 33, z: 6.5}, 14, 7, 0x66BB6A);
    createRoomArea(scene, "refreshment", {x: 33, z: 0.5}, 14, 5, 0xFFB74D);
    createRoomArea(scene, "reception", {x: -34.5, z: -25}, 11, 10, 0x4DD0E1);
    createRoomArea(scene, "clientLounge", {x: -1.25, z: -25}, 17.5, 10, 0x9C27B0);
    createRoomArea(scene, "leadLounge", {x: 31.5, z: -25}, 17, 10, 0x5C6BC0);
    
    // Add grid lines for better spatial reference
    const gridSize = 10;
    const gridMat = new THREE.MeshBasicMaterial({ color: 0xdddddd, transparent: true, opacity: 0.5 });
    
    // Vertical lines
    for (let x = -40; x <= 40; x += gridSize) {
      const line = new THREE.Mesh(
        new THREE.BoxGeometry(0.1, 0.01, 60),
        gridMat
      );
      line.position.set(x, 0.005, 0);
      scene.add(line);
    }
    
    // Horizontal lines
    for (let z = -30; z <= 30; z += gridSize) {
      const line = new THREE.Mesh(
        new THREE.BoxGeometry(80, 0.01, 0.1),
        gridMat
      );
      line.position.set(0, 0.005, z);
      scene.add(line);
    }
    
    // Add open area meeting tables
    createDesk(scene, materials, -10, 0.05, 0);
    createDesk(scene, materials, 10, 0.05, 0);
    
    // Add couches in lounges
    const createCouch = (x, z, width = 3) => {
      const couch = new THREE.Mesh(
        new THREE.BoxGeometry(width, 0.75, 1.5),
        materials.accent
      );
      couch.position.set(x, 0.375, z);
      couch.castShadow = true;
      scene.add(couch);
    };
    
    createCouch(-1.25, -25, 6);  // Client lounge couch
    createCouch(31.5, -25, 5);   // Lead lounge couch
    createCouch(33, 6.5, 4);     // Wellness zone couch
    
    // Add plants
    const plantPositions = [
      [-20, 0.5, 10], [20, 0.5, 10], 
      [-20, 0.5, -10], [20, 0.5, -10],
      [0, 0.5, 0]
    ];
    
    plantPositions.forEach(pos => {
      const plant = new THREE.Mesh(
        new THREE.CylinderGeometry(1, 1.25, 3, 8),
        materials.plant
      );
      plant.position.set(...pos);
      plant.castShadow = true;
      scene.add(plant);
    });
    
    // Add agents based on their roles
    createAgent(scene, 'alex_assistant', new THREE.Vector3(-34.5, 0.05, -25));
    createAgent(scene, 'buyer_specialist', new THREE.Vector3(-35, 0.05, 25));
    createAgent(scene, 'listing_specialist', new THREE.Vector3(-25.5, 0.05, 25));
    createAgent(scene, 'escrow_coordinator', new THREE.Vector3(-16.5, 0.05, 25));
    createAgent(scene, 'client_success', new THREE.Vector3(-10, 0.05, 0));
    createAgent(scene, 'marketing_specialist', new THREE.Vector3(10, 0.05, 0));
    createAgent(scene, 'compliance_officer', new THREE.Vector3(-34.5, 0.05, 5));
    createAgent(scene, 'financial_analyst', new THREE.Vector3(33, 0.05, 6.5));
  };

  const createCompanyOffice = (scene, materials, config) => {
    // 3 department layout - essentially 3 team offices side by side
    const wallHeight = 5;
    const wallThickness = 0.5;
    const deptWidth = 40;
    
    // Outer walls
    createWall(scene, materials, 120, wallHeight, wallThickness, 
      new THREE.Vector3(0, wallHeight/2, 30));
    createWall(scene, materials, 120, wallHeight, wallThickness, 
      new THREE.Vector3(0, wallHeight/2, -30));
    createWall(scene, materials, wallThickness, wallHeight, 60, 
      new THREE.Vector3(60, wallHeight/2, 0));
    createWall(scene, materials, wallThickness, wallHeight, 60, 
      new THREE.Vector3(-60, wallHeight/2, 0));
    
    // Department dividers
    createWall(scene, materials, wallThickness, wallHeight, 60, 
      new THREE.Vector3(-20, wallHeight/2, 0));
    createWall(scene, materials, wallThickness, wallHeight, 60, 
      new THREE.Vector3(20, wallHeight/2, 0));
    
    // Department signs
    const deptNames = ['BUYERS DEPT', 'LISTINGS DEPT', 'OPERATIONS'];
    const deptColors = [0x2e7d32, 0xed6c02, 0x9c27b0];
    const deptXPositions = [-40, 0, 40];
    
    deptNames.forEach((name, index) => {
      const sign = new THREE.Mesh(
        new THREE.BoxGeometry(8, 1, 0.2),
        new THREE.MeshStandardMaterial({ color: deptColors[index] })
      );
      sign.position.set(deptXPositions[index], 3.5, 29.8);
      scene.add(sign);
    });
    
    // Create offices for each department
    deptXPositions.forEach((xOffset, deptIndex) => {
      // Manager office for each department
      createWall(scene, materials, 10, wallHeight, wallThickness, 
        new THREE.Vector3(xOffset, wallHeight/2, 10));
      createWall(scene, materials, wallThickness, wallHeight, 10, 
        new THREE.Vector3(xOffset - 5, wallHeight/2, 15));
      createWall(scene, materials, wallThickness, wallHeight, 10, 
        new THREE.Vector3(xOffset + 5, wallHeight/2, 15));
      
      createDesk(scene, materials, xOffset, 0.05, 15);
      createChair(scene, materials, xOffset, 0.05, 13);
      
      // Team desks - 6 per department
      const deskPositions = [
        { x: xOffset - 10, z: 0 },
        { x: xOffset, z: 0 },
        { x: xOffset + 10, z: 0 },
        { x: xOffset - 10, z: -15 },
        { x: xOffset, z: -15 },
        { x: xOffset + 10, z: -15 }
      ];
      
      deskPositions.forEach(pos => {
        createDesk(scene, materials, pos.x, 0.05, pos.z);
        createChair(scene, materials, pos.x, 0.05, pos.z + 1.5);
      });
      
      // Meeting area for each department
      const meetingTable = new THREE.Mesh(
        new THREE.BoxGeometry(4, 0.1, 3),
        materials.desk
      );
      meetingTable.position.set(xOffset, 0.75, 25);
      meetingTable.castShadow = true;
      scene.add(meetingTable);
    });
    
    // Central reception area
    const centralReception = new THREE.Mesh(
      new THREE.CylinderGeometry(5, 5, 0.1, 8),
      materials.accent
    );
    centralReception.position.set(0, 0.75, 0);
    centralReception.castShadow = true;
    scene.add(centralReception);
    
    // Add agents to their departments
    // Buyer Department
    createAgent(scene, 'buyer_manager', new THREE.Vector3(-40, 0.05, 15));
    createAgent(scene, 'buyer_specialist', new THREE.Vector3(-50, 0.05, 0));
    createAgent(scene, 'client_success', new THREE.Vector3(-30, 0.05, 0));
    
    // Listing Department
    createAgent(scene, 'listing_manager', new THREE.Vector3(0, 0.05, 15));
    createAgent(scene, 'listing_specialist', new THREE.Vector3(-10, 0.05, 0));
    createAgent(scene, 'marketing_specialist', new THREE.Vector3(10, 0.05, 0));
    
    // Operations Department
    createAgent(scene, 'operations_manager', new THREE.Vector3(40, 0.05, 15));
    createAgent(scene, 'escrow_coordinator', new THREE.Vector3(30, 0.05, 0));
    createAgent(scene, 'compliance_officer', new THREE.Vector3(40, 0.05, 0));
    createAgent(scene, 'financial_analyst', new THREE.Vector3(50, 0.05, 0));
    createAgent(scene, 'database_specialist', new THREE.Vector3(40, 0.05, -15));
    
    // Alex at central reception
    createAgent(scene, 'alex_assistant', new THREE.Vector3(0, 0.05, 0));
  };

  return (
    <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* Tab controls */}
      <Paper 
        sx={{ 
          position: 'absolute', 
          top: 20, 
          left: '50%', 
          transform: 'translateX(-50%)',
          zIndex: 10,
          borderRadius: 8,
          overflow: 'hidden'
        }}
      >
        <ToggleButtonGroup
          value={selectedTab}
          exclusive
          onChange={(e, value) => value && setSelectedTab(value)}
          aria-label="office view"
        >
          <ToggleButton value="solo" aria-label="solo office">
            <Person sx={{ mr: 1 }} />
            Solo
          </ToggleButton>
          <ToggleButton value="team" aria-label="team office">
            <Group sx={{ mr: 1 }} />
            Team
          </ToggleButton>
          <ToggleButton value="company" aria-label="company office">
            <CorporateFare sx={{ mr: 1 }} />
            Company
          </ToggleButton>
        </ToggleButtonGroup>
      </Paper>

      {/* Controls info */}
      <Paper 
        sx={{ 
          position: 'absolute', 
          top: 80, 
          left: 20,
          p: 2,
          zIndex: 10
        }}
      >
        <Typography variant="h6" gutterBottom>View Controls</Typography>
        <Stack spacing={1} sx={{ mb: 2 }}>
          <Button 
            variant="contained" 
            fullWidth 
            size="small"
            onClick={() => setCameraView('top')}
          >
            Top View
          </Button>
          <Button 
            variant="contained" 
            fullWidth 
            size="small"
            onClick={() => setCameraView('default')}
          >
            Default View
          </Button>
          <Button 
            variant="contained" 
            fullWidth 
            size="small"
            onClick={() => setCameraView('close')}
          >
            Close View
          </Button>
          <Button 
            variant="outlined" 
            fullWidth 
            size="small"
            color="secondary"
            onClick={() => setCameraView('reset')}
          >
            Reset Camera
          </Button>
        </Stack>
        
        <Typography variant="body2" sx={{ mb: 1, fontWeight: 'bold' }}>Quick Angles:</Typography>
        <Stack direction="row" spacing={0.5} sx={{ mb: 2, flexWrap: 'wrap', gap: 0.5 }}>
          <Button 
            variant="outlined" 
            size="small"
            onClick={() => setCameraView('front')}
            sx={{ minWidth: '40px', fontSize: '0.7rem' }}
          >
            Front
          </Button>
          <Button 
            variant="outlined" 
            size="small"
            onClick={() => setCameraView('back')}
            sx={{ minWidth: '40px', fontSize: '0.7rem' }}
          >
            Back
          </Button>
          <Button 
            variant="outlined" 
            size="small"
            onClick={() => setCameraView('left')}
            sx={{ minWidth: '40px', fontSize: '0.7rem' }}
          >
            Left
          </Button>
          <Button 
            variant="outlined" 
            size="small"
            onClick={() => setCameraView('right')}
            sx={{ minWidth: '40px', fontSize: '0.7rem' }}
          >
            Right
          </Button>
        </Stack>
        
        <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>• Scroll: Zoom</Typography>
        <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>• Right-drag: Rotate</Typography>
        <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>• Shift+Scroll: Tilt</Typography>
        <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>• W/S or ↑/↓: Tilt</Typography>
        <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>• A/D or ←/→: Rotate</Typography>
        <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>• Click agents to interact</Typography>
      </Paper>

      {/* Office info */}
      <Paper 
        sx={{ 
          position: 'absolute', 
          bottom: 20, 
          left: 20,
          p: 2,
          zIndex: 10,
          maxWidth: 300
        }}
      >
        <Typography variant="h6">{officeConfigs[selectedTab].name}</Typography>
        <Typography variant="body2" color="text.secondary">
          {officeConfigs[selectedTab].description}
        </Typography>
        <Typography variant="body2" sx={{ mt: 1, fontWeight: 'bold' }}>
          Size: {officeConfigs[selectedTab].size.width}' × {officeConfigs[selectedTab].size.depth}'
        </Typography>
        <Alert severity="info" sx={{ mt: 1 }}>
          {officeConfigs[selectedTab].agents.length} agents active
        </Alert>
      </Paper>

      {/* 3D Scene */}
      <Box 
        ref={mountRef} 
        sx={{ 
          width: '100%', 
          height: '100%',
          cursor: 'grab',
          '&:active': {
            cursor: 'grabbing'
          }
        }} 
      />

      {/* Agent Dialog */}
      <Dialog
        open={Boolean(selectedAgent)}
        onClose={() => setSelectedAgent(null)}
        maxWidth="sm"
        fullWidth
      >
        {selectedAgent && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: selectedAgent.color, width: 48, height: 48 }}>
                    {selectedAgent.icon}
                  </Avatar>
                  <Box>
                    <Typography variant="h6">{selectedAgent.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {selectedAgent.title}
                    </Typography>
                  </Box>
                </Box>
                <IconButton onClick={() => setSelectedAgent(null)}>
                  <Close />
                </IconButton>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle2" gutterBottom>Department</Typography>
                      <Chip 
                        label={selectedAgent.department} 
                        size="small" 
                        color="primary"
                      />
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12}>
                  <Button 
                    variant="contained" 
                    fullWidth
                    onClick={() => {
                      enqueueSnackbar(`Starting chat with ${selectedAgent.name}`, { variant: 'info' });
                      setSelectedAgent(null);
                    }}
                  >
                    Chat with {selectedAgent.name}
                  </Button>
                </Grid>
              </Grid>
            </DialogContent>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default Office3D;