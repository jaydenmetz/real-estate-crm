import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  ToggleButton,
  ToggleButtonGroup,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  Stack,
  TextField,
  Alert,
} from '@mui/material';
import {
  Close,
  Business,
  SmartToy,
  Home,
  Email,
  Phone,
  LocationOn,
  Assessment,
  Build,
  AttachMoney,
  Gavel,
  PhotoCamera,
  LocalShipping,
  AccountBalance,
  Psychology,
  Engineering,
  Campaign,
} from '@mui/icons-material';

const Office3DViewer = ({ agents = [], onAgentClick, selectedOffice = 'corporate' }) => {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const agentMeshesRef = useRef({});
  const [selectedTab, setSelectedTab] = useState('corporate');
  const [hoveredPartner, setHoveredPartner] = useState(null);
  const [showPartnerDialog, setShowPartnerDialog] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState(null);

  // Office configurations
  const officeConfigs = {
    assistant: {
      name: "Assistant Office",
      description: "Cozy home office setup for executive assistant",
      size: { width: 12, depth: 10 },
      color: '#1976d2'
    },
    'ai-team': {
      name: "AI Team Office",
      description: "Modern tech workspace with manager office and specialist offices",
      size: { width: 20, depth: 16 },
      color: '#9c27b0'
    },
    corporate: {
      name: "Corporate Real Estate Office",
      description: "Full-scale office with three departments and partner kiosks",
      size: { width: 36, depth: 24 },
      color: '#2e7d32'
    }
  };

  // Partner network data
  const partnerNetworks = {
    assistant: [],
    'ai-team': [
      { name: "Tech Support Services", icon: <Engineering />, fee: "15%" },
      { name: "Cloud Infrastructure", icon: <Business />, fee: "10%" },
      { name: "AI Training Partners", icon: <Psychology />, fee: "20%" }
    ],
    corporate: [
      { name: "Real Estate Attorneys", icon: <Gavel />, fee: "25%", category: "Legal" },
      { name: "Home Inspection Services", icon: <Assessment />, fee: "20%", category: "Inspection" },
      { name: "General Contractors", icon: <Build />, fee: "15%", category: "Construction" },
      { name: "Mortgage Brokers", icon: <AccountBalance />, fee: "1% of loan", category: "Financial" },
      { name: "Title Insurance", icon: <Business />, fee: "30%", category: "Insurance" },
      { name: "Home Staging", icon: <Home />, fee: "20%", category: "Marketing" },
      { name: "Property Photographers", icon: <PhotoCamera />, fee: "25%", category: "Marketing" },
      { name: "Moving Services", icon: <LocalShipping />, fee: "10%", category: "Services" },
      { name: "Property Management", icon: <Business />, fee: "15%", category: "Management" }
    ]
  };

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

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
    let cameraDistance = 25;
    let cameraAngleX = Math.PI / 4;
    let cameraAngleY = Math.PI / 4;

    const updateCamera = () => {
      camera.position.x = cameraDistance * Math.sin(cameraAngleY) * Math.cos(cameraAngleX);
      camera.position.y = cameraDistance * Math.sin(cameraAngleX);
      camera.position.z = cameraDistance * Math.cos(cameraAngleY) * Math.cos(cameraAngleX);
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
        
        cameraAngleY -= deltaX * 0.01;
        cameraAngleX = Math.max(0.1, Math.min(Math.PI / 2 - 0.1, cameraAngleX - deltaY * 0.01));
        
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
        cameraAngleX = Math.max(0.1, Math.min(Math.PI / 2 - 0.1, cameraAngleX - e.deltaY * 0.001));
      } else {
        cameraDistance = Math.max(5, Math.min(50, cameraDistance + e.deltaY * 0.05));
      }
      updateCamera();
    };

    // Add event listeners
    renderer.domElement.addEventListener('mousedown', handleMouseDown);
    renderer.domElement.addEventListener('mousemove', handleMouseMove);
    renderer.domElement.addEventListener('mouseup', handleMouseUp);
    renderer.domElement.addEventListener('contextmenu', handleContextMenu);
    renderer.domElement.addEventListener('wheel', handleWheel);

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
      if (!mountRef.current) return;
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('mousedown', handleMouseDown);
      renderer.domElement.removeEventListener('mousemove', handleMouseMove);
      renderer.domElement.removeEventListener('mouseup', handleMouseUp);
      renderer.domElement.removeEventListener('contextmenu', handleContextMenu);
      renderer.domElement.removeEventListener('wheel', handleWheel);
      
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // Update office when tab changes
  useEffect(() => {
    if (sceneRef.current) {
      createOffice(selectedTab);
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
      shelf: new THREE.MeshStandardMaterial({ color: 0xD2691E }),
      computer: new THREE.MeshStandardMaterial({ color: 0x333333 }),
      sofa: new THREE.MeshStandardMaterial({ color: 0x4169E1 }),
      table: new THREE.MeshStandardMaterial({ color: 0x654321 }),
      partition: new THREE.MeshStandardMaterial({ 
        color: 0xB0B0B0, 
        transparent: true, 
        opacity: 0.8 
      }),
      kiosk: new THREE.MeshStandardMaterial({ color: 0x1976d2 })
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
      case 'assistant':
        createAssistantOffice(scene, materials, config);
        break;
      case 'ai-team':
        createAITeamOffice(scene, materials, config);
        break;
      case 'corporate':
        createCorporateOffice(scene, materials, config);
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
    
    // Computer
    const monitor = new THREE.Mesh(
      new THREE.BoxGeometry(0.6, 0.4, 0.05),
      materials.computer
    );
    monitor.position.set(0, 1.1, 0);
    monitor.castShadow = true;
    
    deskGroup.add(deskTop);
    deskGroup.add(monitor);
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
      new THREE.BoxGeometry(0.5, 0.6, 0.1),
      materials.chair
    );
    back.position.set(0, 0.8, -0.2);
    back.castShadow = true;
    
    // Legs
    const legGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.5);
    const legPositions = [
      [-0.2, 0.25, 0.2],
      [0.2, 0.25, 0.2],
      [-0.2, 0.25, -0.2],
      [0.2, 0.25, -0.2]
    ];
    
    legPositions.forEach(pos => {
      const leg = new THREE.Mesh(legGeometry, materials.chair);
      leg.position.set(...pos);
      leg.castShadow = true;
      chairGroup.add(leg);
    });
    
    chairGroup.add(seat);
    chairGroup.add(back);
    chairGroup.position.set(x, y, z);
    chairGroup.rotation.y = rotation;
    
    scene.add(chairGroup);
    return chairGroup;
  };

  const createPlant = (scene, materials, x, y, z) => {
    const plantGroup = new THREE.Group();
    
    // Pot
    const pot = new THREE.Mesh(
      new THREE.CylinderGeometry(0.2, 0.15, 0.3),
      materials.desk
    );
    pot.position.y = 0.15;
    pot.castShadow = true;
    
    // Plant
    const plant = new THREE.Mesh(
      new THREE.SphereGeometry(0.3, 8, 6),
      materials.plant
    );
    plant.position.y = 0.5;
    plant.castShadow = true;
    
    plantGroup.add(pot);
    plantGroup.add(plant);
    plantGroup.position.set(x, y, z);
    
    scene.add(plantGroup);
    return plantGroup;
  };

  const createAgent = (scene, materials, agent, position) => {
    const agentGroup = new THREE.Group();
    
    // Body (cylinder)
    const body = new THREE.Mesh(
      new THREE.CylinderGeometry(0.3, 0.3, 1.5),
      new THREE.MeshStandardMaterial({ 
        color: agent.color || 0x4A90E2 
      })
    );
    body.position.y = 0.75;
    body.castShadow = true;
    
    // Head (sphere)
    const head = new THREE.Mesh(
      new THREE.SphereGeometry(0.25),
      new THREE.MeshStandardMaterial({ color: 0xFFDBCA })
    );
    head.position.y = 1.75;
    head.castShadow = true;
    
    agentGroup.add(body);
    agentGroup.add(head);
    agentGroup.position.set(position.x, 0, position.z);
    
    // Make clickable
    agentGroup.userData = { agentId: agent.id };
    
    scene.add(agentGroup);
    agentMeshesRef.current[agent.id] = agentGroup;
    
    return agentGroup;
  };

  const createAssistantOffice = (scene, materials, config) => {
    // Walls
    const walls = new THREE.Group();
    
    // Back wall
    const backWall = new THREE.Mesh(
      new THREE.BoxGeometry(config.size.width, 3, 0.2),
      materials.wall
    );
    backWall.position.set(0, 1.5, -config.size.depth/2);
    backWall.castShadow = true;
    backWall.receiveShadow = true;
    
    // Side walls
    const sideWallGeometry = new THREE.BoxGeometry(0.2, 3, config.size.depth);
    const leftWall = new THREE.Mesh(sideWallGeometry, materials.wall);
    leftWall.position.set(-config.size.width/2, 1.5, 0);
    leftWall.castShadow = true;
    leftWall.receiveShadow = true;
    
    const rightWall = new THREE.Mesh(sideWallGeometry, materials.wall);
    rightWall.position.set(config.size.width/2, 1.5, 0);
    rightWall.castShadow = true;
    rightWall.receiveShadow = true;
    
    walls.add(backWall);
    walls.add(leftWall);
    walls.add(rightWall);
    scene.add(walls);
    
    // Executive desk
    createDesk(scene, materials, 0, 0, -2);
    createChair(scene, materials, 0, 0, -0.5, 0);
    
    // Meeting area
    const sofa = new THREE.Mesh(
      new THREE.BoxGeometry(3, 0.6, 1),
      materials.sofa
    );
    sofa.position.set(-3, 0.3, 2);
    sofa.castShadow = true;
    scene.add(sofa);
    
    // Coffee table
    const coffeeTable = new THREE.Mesh(
      new THREE.BoxGeometry(1.5, 0.3, 0.8),
      materials.table
    );
    coffeeTable.position.set(-3, 0.15, 3.5);
    coffeeTable.castShadow = true;
    scene.add(coffeeTable);
    
    // Shelving
    const shelf = new THREE.Mesh(
      new THREE.BoxGeometry(0.3, 2.5, 4),
      materials.shelf
    );
    shelf.position.set(5.5, 1.25, 0);
    shelf.castShadow = true;
    scene.add(shelf);
    
    // Plants
    createPlant(scene, materials, 4, 0, -4);
    createPlant(scene, materials, -5, 0, -4);
    
    // Add assistant agent if present
    const assistant = agents.find(a => a.department === 'management');
    if (assistant) {
      createAgent(scene, materials, assistant, { x: 0, z: -2 });
    }
  };

  const createAITeamOffice = (scene, materials, config) => {
    // Outer walls
    const walls = new THREE.Group();
    
    const backWall = new THREE.Mesh(
      new THREE.BoxGeometry(config.size.width, 3, 0.2),
      materials.wall
    );
    backWall.position.set(0, 1.5, -config.size.depth/2);
    walls.add(backWall);
    
    const leftWall = new THREE.Mesh(
      new THREE.BoxGeometry(0.2, 3, config.size.depth),
      materials.wall
    );
    leftWall.position.set(-config.size.width/2, 1.5, 0);
    walls.add(leftWall);
    
    const rightWall = new THREE.Mesh(
      new THREE.BoxGeometry(0.2, 3, config.size.depth),
      materials.wall
    );
    rightWall.position.set(config.size.width/2, 1.5, 0);
    walls.add(rightWall);
    
    scene.add(walls);
    
    // Manager office (center)
    const managerWalls = new THREE.Group();
    
    [-6, 6].forEach(x => {
      const wall = new THREE.Mesh(
        new THREE.BoxGeometry(0.1, 2.5, 6),
        materials.partition
      );
      wall.position.set(x, 1.25, 0);
      wall.castShadow = true;
      managerWalls.add(wall);
    });
    
    [-3, 3].forEach(z => {
      const wall = new THREE.Mesh(
        new THREE.BoxGeometry(12, 2.5, 0.1),
        materials.partition
      );
      wall.position.set(0, 1.25, z);
      wall.castShadow = true;
      managerWalls.add(wall);
    });
    
    scene.add(managerWalls);
    
    // Manager desk and chair
    createDesk(scene, materials, 0, 0, 0);
    createChair(scene, materials, 0, 0, 1.5, 0);
    
    // AI team offices
    const aiOfficePositions = [
      { x: -8, z: -5 },
      { x: 0, z: -5 },
      { x: 8, z: -5 }
    ];
    
    aiOfficePositions.forEach((pos, index) => {
      // Desk
      createDesk(scene, materials, pos.x, 0, pos.z);
      createChair(scene, materials, pos.x, 0, pos.z + 1.5, 0);
      
      // Side partitions
      if (index < 2) {
        const partition = new THREE.Mesh(
          new THREE.BoxGeometry(0.1, 2, 3),
          materials.partition
        );
        partition.position.set(pos.x + 4, 1, pos.z);
        partition.castShadow = true;
        scene.add(partition);
      }
    });
    
    // Collaboration area
    const collabTable = new THREE.Mesh(
      new THREE.BoxGeometry(3, 0.1, 2),
      materials.table
    );
    collabTable.position.set(0, 0.75, 5);
    collabTable.castShadow = true;
    scene.add(collabTable);
    
    // Collaboration chairs
    [-1.5, 1.5].forEach(x => {
      createChair(scene, materials, x, 0, 6, 0);
      createChair(scene, materials, x, 0, 4, Math.PI);
    });
    
    // Plants for ambiance
    createPlant(scene, materials, -9, 0, 7);
    createPlant(scene, materials, 9, 0, 7);
    
    // Add AI team agents
    const aiTeamAgents = agents.filter(a => 
      a.department === 'management' || 
      a.role === 'manager' || 
      a.department === 'support'
    );
    
    aiTeamAgents.forEach((agent, index) => {
      let position;
      if (agent.role === 'manager' || agent.department === 'management') {
        position = { x: 0, z: 0 };
      } else {
        const officePos = aiOfficePositions[index % 3];
        position = { x: officePos.x, z: officePos.z };
      }
      createAgent(scene, materials, agent, position);
    });
  };

  const createCorporateOffice = (scene, materials, config) => {
    // Outer walls
    const walls = new THREE.Group();
    
    const backWall = new THREE.Mesh(
      new THREE.BoxGeometry(config.size.width, 3, 0.2),
      materials.wall
    );
    backWall.position.set(0, 1.5, -config.size.depth/2);
    walls.add(backWall);
    
    const leftWall = new THREE.Mesh(
      new THREE.BoxGeometry(0.2, 3, config.size.depth),
      materials.wall
    );
    leftWall.position.set(-config.size.width/2, 1.5, 0);
    walls.add(leftWall);
    
    const rightWall = new THREE.Mesh(
      new THREE.BoxGeometry(0.2, 3, config.size.depth),
      materials.wall
    );
    rightWall.position.set(config.size.width/2, 1.5, 0);
    walls.add(rightWall);
    
    scene.add(walls);
    
    // Reception area
    const receptionDesk = new THREE.Mesh(
      new THREE.BoxGeometry(4, 0.8, 2),
      materials.accent
    );
    receptionDesk.position.set(0, 0.4, 10);
    receptionDesk.castShadow = true;
    scene.add(receptionDesk);
    
    createChair(scene, materials, 0, 0, 8.5, Math.PI);
    
    // Department divisions
    const deptWidth = 11;
    const deptDepth = 20;
    
    // Department walls
    [-12, 0, 12].forEach((x, deptIndex) => {
      if (deptIndex > 0) {
        const divider = new THREE.Mesh(
          new THREE.BoxGeometry(0.2, 3, deptDepth),
          materials.wall
        );
        divider.position.set(x - 6, 1.5, -2);
        divider.castShadow = true;
        scene.add(divider);
      }
      
      // Department name signs
      const deptNames = ['BUYERS', 'LISTINGS', 'OPERATIONS'];
      const deptColors = [0x2e7d32, 0xed6c02, 0x9c27b0];
      const sign = new THREE.Mesh(
        new THREE.BoxGeometry(4, 0.5, 0.1),
        new THREE.MeshStandardMaterial({ color: deptColors[deptIndex] })
      );
      sign.position.set(x, 2.5, 8);
      scene.add(sign);
      
      // Manager offices for each department
      const managerOffice = new THREE.Mesh(
        new THREE.BoxGeometry(5, 2.5, 5),
        materials.partition
      );
      managerOffice.position.set(x, 1.25, -8);
      scene.add(managerOffice);
      
      createDesk(scene, materials, x, 0, -8);
      createChair(scene, materials, x, 0, -6.5, 0);
      
      // Open floor desks (6 per department)
      const deskPositions = [
        { x: x - 3, z: -2 },
        { x: x, z: -2 },
        { x: x + 3, z: -2 },
        { x: x - 3, z: 2 },
        { x: x, z: 2 },
        { x: x + 3, z: 2 }
      ];
      
      deskPositions.forEach(pos => {
        createDesk(scene, materials, pos.x, 0, pos.z, 0);
        createChair(scene, materials, pos.x, 0, pos.z + 1.5, 0);
      });
      
      // Department plants
      createPlant(scene, materials, x - 5, 0, 5);
      createPlant(scene, materials, x + 5, 0, 5);
    });
    
    // Conference room (center back)
    const confRoom = new THREE.Mesh(
      new THREE.BoxGeometry(8, 2.8, 6),
      new THREE.MeshStandardMaterial({ 
        color: 0x4169E1, 
        transparent: true, 
        opacity: 0.3 
      })
    );
    confRoom.position.set(0, 1.4, -8);
    scene.add(confRoom);
    
    // Conference table
    const confTable = new THREE.Mesh(
      new THREE.BoxGeometry(6, 0.1, 3),
      materials.table
    );
    confTable.position.set(0, 0.75, -8);
    confTable.castShadow = true;
    scene.add(confTable);
    
    // Conference chairs
    for (let i = 0; i < 3; i++) {
      createChair(scene, materials, -2 + i * 2, 0, -6.5, 0);
      createChair(scene, materials, -2 + i * 2, 0, -9.5, Math.PI);
    }
    
    // Partner kiosks
    [-15, 15].forEach((x, index) => {
      const kiosk = new THREE.Mesh(
        new THREE.BoxGeometry(2, 2, 0.5),
        materials.kiosk
      );
      kiosk.position.set(x, 1, 10);
      kiosk.castShadow = true;
      kiosk.userData = { type: 'kiosk', index };
      scene.add(kiosk);
      
      // Kiosk screen
      const screen = new THREE.Mesh(
        new THREE.BoxGeometry(1.5, 1, 0.1),
        new THREE.MeshStandardMaterial({ 
          color: 0x000000,
          emissive: 0x111111
        })
      );
      screen.position.set(x, 1, 10.3);
      scene.add(screen);
    });
    
    // Add agents to departments
    const buyerAgents = agents.filter(a => a.department === 'buyer');
    const listingAgents = agents.filter(a => a.department === 'listing');
    const operationsAgents = agents.filter(a => a.department === 'operations');
    
    // Position buyer agents
    buyerAgents.forEach((agent, index) => {
      const positions = [
        { x: -15, z: -8 }, // Manager
        { x: -15, z: -2 },
        { x: -12, z: -2 },
        { x: -9, z: -2 },
        { x: -15, z: 2 },
        { x: -12, z: 2 }
      ];
      const pos = positions[index % positions.length];
      createAgent(scene, materials, agent, pos);
    });
    
    // Position listing agents
    listingAgents.forEach((agent, index) => {
      const positions = [
        { x: 0, z: -8 }, // Manager
        { x: -3, z: -2 },
        { x: 0, z: -2 },
        { x: 3, z: -2 },
        { x: -3, z: 2 },
        { x: 0, z: 2 }
      ];
      const pos = positions[index % positions.length];
      createAgent(scene, materials, agent, pos);
    });
    
    // Position operations agents
    operationsAgents.forEach((agent, index) => {
      const positions = [
        { x: 12, z: -8 }, // Manager
        { x: 9, z: -2 },
        { x: 12, z: -2 },
        { x: 15, z: -2 },
        { x: 9, z: 2 },
        { x: 12, z: 2 }
      ];
      const pos = positions[index % positions.length];
      createAgent(scene, materials, agent, pos);
    });
    
    // Add executive assistant at reception
    const executive = agents.find(a => a.id === 'executive_assistant');
    if (executive) {
      createAgent(scene, materials, executive, { x: 0, z: 8.5 });
    }
  };

  // Raycasting for agent clicks
  useEffect(() => {
    if (!rendererRef.current || !cameraRef.current || !sceneRef.current) return;

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleClick = (event) => {
      const rect = rendererRef.current.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, cameraRef.current);
      
      const agentMeshes = Object.values(agentMeshesRef.current);
      const intersects = raycaster.intersectObjects(agentMeshes, true);
      
      if (intersects.length > 0) {
        let clickedObject = intersects[0].object;
        while (clickedObject.parent && !clickedObject.userData.agentId) {
          clickedObject = clickedObject.parent;
        }
        
        if (clickedObject.userData.agentId && onAgentClick) {
          onAgentClick(clickedObject.userData.agentId);
        }
      }
      
      // Check kiosk clicks
      const allObjects = sceneRef.current.children;
      const kioskIntersects = raycaster.intersectObjects(allObjects, true);
      
      for (let intersect of kioskIntersects) {
        let obj = intersect.object;
        while (obj.parent && !obj.userData.type) {
          obj = obj.parent;
        }
        
        if (obj.userData.type === 'kiosk') {
          setSelectedPartner(partnerNetworks[selectedTab][obj.userData.index]);
          setShowPartnerDialog(true);
          break;
        }
      }
    };

    rendererRef.current.domElement.addEventListener('click', handleClick);

    return () => {
      if (rendererRef.current?.domElement) {
        rendererRef.current.domElement.removeEventListener('click', handleClick);
      }
    };
  }, [onAgentClick, selectedTab]);

  const handlePartnerConnect = () => {
    if (selectedPartner) {
      // In a real app, this would initiate the referral connection
      alert(`Connecting with ${selectedPartner.name}! Referral fee: ${selectedPartner.fee}`);
      setShowPartnerDialog(false);
    }
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
          <ToggleButton value="assistant" aria-label="assistant office">
            <Home sx={{ mr: 1 }} />
            Assistant Office
          </ToggleButton>
          <ToggleButton value="ai-team" aria-label="ai team office">
            <SmartToy sx={{ mr: 1 }} />
            AI Team Office
          </ToggleButton>
          <ToggleButton value="corporate" aria-label="corporate office">
            <Business sx={{ mr: 1 }} />
            Corporate Office
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
        <Stack spacing={0.5}>
          <Typography variant="body2">• Scroll: Zoom</Typography>
          <Typography variant="body2">• Right-drag: Pan</Typography>
          <Typography variant="body2">• Shift+Scroll: Tilt</Typography>
          <Typography variant="body2">• Click agents to view details</Typography>
          {selectedTab === 'corporate' && (
            <Typography variant="body2">• Click kiosks for partners</Typography>
          )}
        </Stack>
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
        {partnerNetworks[selectedTab].length > 0 && (
          <Alert severity="info" sx={{ mt: 1 }}>
            {partnerNetworks[selectedTab].length} partner connections available
          </Alert>
        )}
      </Paper>

      {/* Partner list for current office */}
      {partnerNetworks[selectedTab].length > 0 && (
        <Paper 
          sx={{ 
            position: 'absolute', 
            top: 80, 
            right: 20,
            p: 2,
            zIndex: 10,
            maxWidth: 250
          }}
        >
          <Typography variant="h6" gutterBottom>Partner Network</Typography>
          <List dense>
            {partnerNetworks[selectedTab].map((partner, index) => (
              <ListItem 
                key={index}
                button
                onClick={() => {
                  setSelectedPartner(partner);
                  setShowPartnerDialog(true);
                }}
                sx={{ 
                  borderRadius: 1,
                  mb: 0.5,
                  '&:hover': { bgcolor: 'action.hover' }
                }}
              >
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
                    {partner.icon}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText 
                  primary={partner.name}
                  secondary={`Fee: ${partner.fee}`}
                  primaryTypographyProps={{ variant: 'body2' }}
                  secondaryTypographyProps={{ variant: 'caption' }}
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      )}

      {/* 3D Scene */}
      <Box ref={mountRef} sx={{ width: '100%', height: '100%' }} />

      {/* Partner Dialog */}
      <Dialog
        open={showPartnerDialog}
        onClose={() => setShowPartnerDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        {selectedPartner && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="h6">Connect with Partner</Typography>
                <IconButton onClick={() => setShowPartnerDialog(false)}>
                  <Close />
                </IconButton>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                  {selectedPartner.icon}
                </Avatar>
                <Box>
                  <Typography variant="h6">{selectedPartner.name}</Typography>
                  <Chip 
                    label={`Referral Fee: ${selectedPartner.fee}`} 
                    color="success" 
                    size="small" 
                  />
                </Box>
              </Box>
              
              <Typography variant="body2" paragraph>
                Connect with our trusted partner for professional services. 
                You'll earn a referral fee for successful connections.
              </Typography>
              
              <TextField
                fullWidth
                label="Client Name"
                variant="outlined"
                sx={{ mb: 2 }}
              />
              
              <TextField
                fullWidth
                label="Client Contact"
                variant="outlined"
                sx={{ mb: 2 }}
              />
              
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Service Needed"
                variant="outlined"
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setShowPartnerDialog(false)}>Cancel</Button>
              <Button 
                variant="contained" 
                onClick={handlePartnerConnect}
                startIcon={<AttachMoney />}
              >
                Send Referral
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default Office3DViewer;