// File: frontend/src/components/dashboards/Office3D.jsx
// 3D Office Layout - 80' x 60' (4,800 sq ft) with Open Concept Reception
import React, { useEffect, useRef, useState } from 'react';
import * as BABYLON from 'babylonjs';
import * as GUI from 'babylonjs-gui';

/*
  Office Layout Structure (80' x 60' = 4,800 sq ft):
  
  TOP ROW (North - Back):
  - Executive Office 1 (20' x 15') | Executive Office 2 (20' x 15') | Executive Office 3 (20' x 15')
  
  MIDDLE ROW:
  - Conference Room (25' x 20') | OPEN RECEPTION AREA (40' x 30') | Client Lounge (25' x 20')
  
  BOTTOM ROW (South - Front):
  - Private Office 1 (20' x 15') | Meeting Room 1 (15' x 12') | Meeting Room 2 (15' x 12') | Private Office 2 (20' x 15')
  
  The Reception Area is completely open with no interior walls, creating a welcoming central hub.
  Total office space provides luxury amenities in an efficient, modern layout.
*/

const Office3D = ({ agents = [], selectedAgent, onAgentClick, onRoomClick, onSceneReady }) => {
  const canvasRef = useRef(null);
  const sceneRef = useRef(null);
  const engineRef = useRef(null);
  const agentMeshesRef = useRef({});
  const roomsRef = useRef({});
  const cameraRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const engine = new BABYLON.Engine(canvasRef.current, true);
    engineRef.current = engine;

    const createScene = () => {
      const scene = new BABYLON.Scene(engine);
      scene.clearColor = new BABYLON.Color3(0.95, 0.95, 0.95);

      // Camera setup for Clash of Clans style view
      const camera = new BABYLON.ArcRotateCamera(
        "camera",
        -Math.PI / 2,      // Alpha - rotation around Y axis (locked)
        Math.PI / 3.5,     // Beta - tilt angle (adjustable)
        100,               // Radius - distance from target (increased for larger space)
        new BABYLON.Vector3(0, 0, 0),
        scene
      );
      
      // Attach camera control
      camera.attachControl(canvasRef.current, true);
      
      // Camera limits for Clash of Clans style
      camera.lowerRadiusLimit = 50;    // Can't zoom in too close
      camera.upperRadiusLimit = 150;   // Can't zoom out too far (increased)
      camera.wheelPrecision = 30;      // Zoom sensitivity
      camera.panningSensibility = 100; // Pan sensitivity
      
      // Lock horizontal rotation but allow vertical tilt
      camera.lowerAlphaLimit = -Math.PI / 2;
      camera.upperAlphaLimit = -Math.PI / 2;
      camera.lowerBetaLimit = 0.1;          // Near top-down view
      camera.upperBetaLimit = Math.PI / 2.8; // Maximum tilt angle
      
      // Disable horizontal rotation, enable vertical tilt
      camera.angularSensibilityX = Infinity; // Disable horizontal rotation
      camera.angularSensibilityY = 2000;     // Enable vertical tilt (higher = less sensitive)
      camera.pinchPrecision = 50;            // For touch devices
      
      cameraRef.current = camera;

      // Custom input handling for panning and tilting
      let isPanning = false;
      let isTilting = false;
      let startPoint = { x: 0, y: 0 };
      let startBeta = camera.beta;
      
      scene.onPointerObservable.add((pointerInfo) => {
        switch (pointerInfo.type) {
          case BABYLON.PointerEventTypes.POINTERDOWN:
            if (pointerInfo.event.button === 2) { // Right click for panning
              isPanning = true;
              isTilting = false;
              startPoint.x = pointerInfo.event.clientX;
              startPoint.y = pointerInfo.event.clientY;
            } else if (pointerInfo.event.button === 1) { // Middle click for tilting
              isTilting = true;
              isPanning = false;
              startPoint.y = pointerInfo.event.clientY;
              startBeta = camera.beta;
            }
            break;
            
          case BABYLON.PointerEventTypes.POINTERUP:
            isPanning = false;
            isTilting = false;
            break;
            
          case BABYLON.PointerEventTypes.POINTERMOVE:
            if (isPanning) {
              const deltaX = pointerInfo.event.clientX - startPoint.x;
              const deltaY = pointerInfo.event.clientY - startPoint.y;
              
              // Calculate pan amount based on camera distance
              const panSpeed = camera.radius * 0.001;
              
              // Pan the camera target
              camera.target.x -= deltaX * panSpeed;
              camera.target.z += deltaY * panSpeed;
              
              startPoint.x = pointerInfo.event.clientX;
              startPoint.y = pointerInfo.event.clientY;
            } else if (isTilting) {
              const deltaY = pointerInfo.event.clientY - startPoint.y;
              
              // Adjust tilt based on mouse movement
              const tiltSpeed = 0.005;
              camera.beta = Math.max(
                camera.lowerBetaLimit,
                Math.min(camera.upperBetaLimit, startBeta + deltaY * tiltSpeed)
              );
            }
            break;
        }
      });

      // Add keyboard controls for tilting
      scene.actionManager = new BABYLON.ActionManager(scene);
      
      // Tilt up (more top-down)
      scene.actionManager.registerAction(
        new BABYLON.ExecuteCodeAction(
          BABYLON.ActionManager.OnKeyDownTrigger,
          (evt) => {
            if (evt.sourceEvent.key === "q" || evt.sourceEvent.key === "Q") {
              camera.beta = Math.max(camera.lowerBetaLimit, camera.beta - 0.1);
            }
          }
        )
      );
      
      // Tilt down (more angled)
      scene.actionManager.registerAction(
        new BABYLON.ExecuteCodeAction(
          BABYLON.ActionManager.OnKeyDownTrigger,
          (evt) => {
            if (evt.sourceEvent.key === "e" || evt.sourceEvent.key === "E") {
              camera.beta = Math.min(camera.upperBetaLimit, camera.beta + 0.1);
            }
          }
        )
      );

      // Mouse wheel with shift for tilting
      canvasRef.current.addEventListener('wheel', (evt) => {
        if (evt.shiftKey) {
          evt.preventDefault();
          const tiltAmount = evt.deltaY * 0.001;
          camera.beta = Math.max(
            camera.lowerBetaLimit,
            Math.min(camera.upperBetaLimit, camera.beta + tiltAmount)
          );
        }
      });

      // Lighting setup
      const hemisphereLight = new BABYLON.HemisphericLight("hemisphereLight", 
        new BABYLON.Vector3(0, 1, 0), scene);
      hemisphereLight.intensity = 0.7;
      hemisphereLight.groundColor = new BABYLON.Color3(0.5, 0.5, 0.5);

      const directionalLight = new BABYLON.DirectionalLight("directionalLight", 
        new BABYLON.Vector3(-1, -2, -1), scene);
      directionalLight.position = new BABYLON.Vector3(20, 40, 20);
      directionalLight.intensity = 0.5;

      // Shadow generator
      const shadowGenerator = new BABYLON.ShadowGenerator(2048, directionalLight);
      shadowGenerator.useBlurExponentialShadowMap = true;
      shadowGenerator.blurScale = 2;
      shadowGenerator.setDarkness(0.2);

      // Materials
      const materials = {
        floor: new BABYLON.StandardMaterial("floorMat", scene),
        wall: new BABYLON.StandardMaterial("wallMat", scene),
        glass: new BABYLON.StandardMaterial("glassMat", scene),
        door: new BABYLON.StandardMaterial("doorMat", scene),
        furniture: new BABYLON.StandardMaterial("furnitureMat", scene),
        accent: new BABYLON.StandardMaterial("accentMat", scene)
      };

      // Material properties
      materials.floor.diffuseColor = new BABYLON.Color3(0.9, 0.9, 0.9);
      materials.floor.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);

      materials.wall.diffuseColor = new BABYLON.Color3(0.85, 0.85, 0.85);
      materials.wall.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);

      materials.glass.diffuseColor = new BABYLON.Color3(0.7, 0.8, 0.9);
      materials.glass.alpha = 0.3;
      materials.glass.specularColor = new BABYLON.Color3(0.9, 0.9, 0.9);

      materials.door.diffuseColor = new BABYLON.Color3(0.5, 0.3, 0.2);
      
      materials.furniture.diffuseColor = new BABYLON.Color3(0.4, 0.3, 0.25);
      
      materials.accent.diffuseColor = new BABYLON.Color3(0.2, 0.4, 0.6);

      // Floor (80' width x 60' depth = 80 x 60 units in 3D space)
      const floor = BABYLON.MeshBuilder.CreateGround("floor", {
        width: 80,
        height: 60,
        subdivisions: 1
      }, scene);
      floor.position.y = 0;
      floor.material = materials.floor;
      floor.receiveShadows = true;

      // Function to create walls with proper positioning
      const wallHeight = 5; // Half height as requested
      const wallThickness = 0.5;
      
      const createWall = (name, width, height, depth, position, rotation = 0) => {
        const wall = BABYLON.MeshBuilder.CreateBox(name, {
          width: width,
          height: height,
          depth: depth
        }, scene);
        wall.position = position;
        wall.rotation.y = rotation;
        wall.material = materials.wall;
        shadowGenerator.addShadowCaster(wall);
        wall.receiveShadows = true;
        return wall;
      };

      // Outer walls for 80x60 space
      createWall("northWall", 80, wallHeight, wallThickness, 
        new BABYLON.Vector3(0, wallHeight/2, 30));
      createWall("southWall", 80, wallHeight, wallThickness, 
        new BABYLON.Vector3(0, wallHeight/2, -30));
      createWall("eastWall", wallThickness, wallHeight, 60, 
        new BABYLON.Vector3(40, wallHeight/2, 0));
      createWall("westWall", wallThickness, wallHeight, 60, 
        new BABYLON.Vector3(-40, wallHeight/2, 0));

      // INTERIOR WALLS - Updated for 80x60 layout
      
      // TOP ROW - Executive Offices (back row)
      // Executive Office 1 (20' x 15') - top left
      createWall("exec1East", wallThickness, wallHeight, 15, 
        new BABYLON.Vector3(-20, wallHeight/2, 22.5));
      createWall("exec1South", 20, wallHeight, wallThickness, 
        new BABYLON.Vector3(-30, wallHeight/2, 15));
      
      // Executive Office 2 (20' x 15') - top center
      createWall("exec2West", wallThickness, wallHeight, 15, 
        new BABYLON.Vector3(-10, wallHeight/2, 22.5));
      createWall("exec2East", wallThickness, wallHeight, 15, 
        new BABYLON.Vector3(10, wallHeight/2, 22.5));
      createWall("exec2South", 20, wallHeight, wallThickness, 
        new BABYLON.Vector3(0, wallHeight/2, 15));
      
      // Executive Office 3 (20' x 15') - top right
      createWall("exec3West", wallThickness, wallHeight, 15, 
        new BABYLON.Vector3(20, wallHeight/2, 22.5));
      createWall("exec3South", 20, wallHeight, wallThickness, 
        new BABYLON.Vector3(30, wallHeight/2, 15));

      // MIDDLE ROW
      // Main Conference Room (25' x 20') - left side
      createWall("conferenceNorth", 25, wallHeight, wallThickness, 
        new BABYLON.Vector3(-27.5, wallHeight/2, 10));
      createWall("conferenceEast", wallThickness, wallHeight, 20, 
        new BABYLON.Vector3(-15, wallHeight/2, 0));
      createWall("conferenceSouth", 25, wallHeight, wallThickness, 
        new BABYLON.Vector3(-27.5, wallHeight/2, -10));
      
      // Client Lounge (25' x 20') - right side
      createWall("loungeNorth", 25, wallHeight, wallThickness, 
        new BABYLON.Vector3(27.5, wallHeight/2, 10));
      createWall("loungeWest", wallThickness, wallHeight, 20, 
        new BABYLON.Vector3(15, wallHeight/2, 0));
      createWall("loungeSouth", 25, wallHeight, wallThickness, 
        new BABYLON.Vector3(27.5, wallHeight/2, -10));

      // BOTTOM ROW
      // Private Office 1 (20' x 15') - bottom left corner
      createWall("private1North", 20, wallHeight, wallThickness, 
        new BABYLON.Vector3(-30, wallHeight/2, -15));
      createWall("private1East", wallThickness, wallHeight, 15, 
        new BABYLON.Vector3(-20, wallHeight/2, -22.5));
      
      // Private Office 2 (20' x 15') - bottom right corner
      createWall("private2North", 20, wallHeight, wallThickness, 
        new BABYLON.Vector3(30, wallHeight/2, -15));
      createWall("private2West", wallThickness, wallHeight, 15, 
        new BABYLON.Vector3(20, wallHeight/2, -22.5));

      // Small Meeting Rooms (15' x 12') - bottom center
      createWall("meeting1North", 15, wallHeight, wallThickness, 
        new BABYLON.Vector3(-7.5, wallHeight/2, -15));
      createWall("meeting1East", wallThickness, wallHeight, 12, 
        new BABYLON.Vector3(0, wallHeight/2, -21));
      createWall("meeting1West", wallThickness, wallHeight, 12, 
        new BABYLON.Vector3(-15, wallHeight/2, -21));
      
      createWall("meeting2North", 15, wallHeight, wallThickness, 
        new BABYLON.Vector3(7.5, wallHeight/2, -15));
      createWall("meeting2West", wallThickness, wallHeight, 12, 
        new BABYLON.Vector3(0, wallHeight/2, -21));
      createWall("meeting2East", wallThickness, wallHeight, 12, 
        new BABYLON.Vector3(15, wallHeight/2, -21));

      // NO WALLS FOR RECEPTION AREA - It's the open central space (40' x 30')

      // Create room areas for interaction
      const createRoomArea = (name, position, width, depth, color) => {
        const room = BABYLON.MeshBuilder.CreateGround(name, {
          width: width,
          height: depth
        }, scene);
        room.position = new BABYLON.Vector3(position.x, 0.01, position.z);
        
        const roomMat = new BABYLON.StandardMaterial(name + "Mat", scene);
        roomMat.diffuseColor = color;
        roomMat.alpha = 0.3;
        roomMat.emissiveColor = new BABYLON.Color3(0, 0, 0);
        room.material = roomMat;
        room.isPickable = true;
        
        // Store original color for hover effects
        room.metadata = {
          originalColor: color,
          roomName: name,
          isHighlighted: false
        };
        
        roomsRef.current[name] = room;
        return room;
      };

      // Define all rooms based on the new 80x60 layout
      // Executive Offices (Top Row)
      createRoomArea("executive1", {x: -30, z: 22.5}, 20, 15, new BABYLON.Color3(0.2, 0.4, 0.7));
      createRoomArea("executive2", {x: 0, z: 22.5}, 20, 15, new BABYLON.Color3(0.2, 0.4, 0.7));
      createRoomArea("executive3", {x: 30, z: 22.5}, 20, 15, new BABYLON.Color3(0.2, 0.4, 0.7));
      
      // Conference and Lounge (Middle Row Sides)
      createRoomArea("conference", {x: -27.5, z: 0}, 25, 20, new BABYLON.Color3(0.7, 0.5, 0.2));
      createRoomArea("lounge", {x: 27.5, z: 0}, 25, 20, new BABYLON.Color3(0.6, 0.4, 0.6));
      
      // Private Offices (Bottom Row Corners)
      createRoomArea("privateOffice1", {x: -30, z: -22.5}, 20, 15, new BABYLON.Color3(0.2, 0.4, 0.7));
      createRoomArea("privateOffice2", {x: 30, z: -22.5}, 20, 15, new BABYLON.Color3(0.2, 0.4, 0.7));
      
      // Meeting Rooms (Bottom Row Center)
      createRoomArea("meetingRoom1", {x: -7.5, z: -21}, 15, 12, new BABYLON.Color3(0.5, 0.5, 0.7));
      createRoomArea("meetingRoom2", {x: 7.5, z: -21}, 15, 12, new BABYLON.Color3(0.5, 0.5, 0.7));
      
      // Open Reception Area (40' x 30') - Central open space
      createRoomArea("reception", {x: 0, z: 0}, 40, 30, new BABYLON.Color3(0.3, 0.7, 0.6));
      
      // Workspace area overlay (within reception)
      createRoomArea("workspace", {x: 0, z: -8}, 30, 25, new BABYLON.Color3(0.9, 0.9, 0.9));
      
      // Wellness area (within reception)
      createRoomArea("wellness", {x: -10, z: 0}, 12, 12, new BABYLON.Color3(0.4, 0.7, 0.4));

      // Add furniture
      const createDesk = (position, rotation = 0) => {
        const desk = BABYLON.MeshBuilder.CreateBox("desk", {
          width: 3,
          height: 2.5,
          depth: 1.5
        }, scene);
        desk.position = new BABYLON.Vector3(position.x, 1.25, position.z);
        desk.rotation.y = rotation;
        desk.material = materials.furniture;
        shadowGenerator.addShadowCaster(desk);
        return desk;
      };

      const createChair = (position, rotation = 0) => {
        const chair = BABYLON.MeshBuilder.CreateBox("chair", {
          width: 1,
          height: 2,
          depth: 1
        }, scene);
        chair.position = new BABYLON.Vector3(position.x, 1, position.z);
        chair.rotation.y = rotation;
        chair.material = materials.accent;
        shadowGenerator.addShadowCaster(chair);
        return chair;
      };

      // Add desks and chairs in executive offices
      createDesk({x: -30, z: 22.5}, 0);
      createChair({x: -30, z: 20}, 0);
      
      createDesk({x: 0, z: 22.5}, 0);
      createChair({x: 0, z: 20}, 0);
      
      createDesk({x: 30, z: 22.5}, 0);
      createChair({x: 30, z: 20}, 0);
      
      // Private offices
      createDesk({x: -30, z: -22.5}, 0);
      createChair({x: -30, z: -25}, 0);
      
      createDesk({x: 30, z: -22.5}, 0);
      createChair({x: 30, z: -25}, 0);

      // Large conference table
      const conferenceTable = BABYLON.MeshBuilder.CreateBox("conferenceTable", {
        width: 15,
        height: 2.5,
        depth: 6
      }, scene);
      conferenceTable.position = new BABYLON.Vector3(-27.5, 1.25, 0);
      conferenceTable.material = materials.furniture;
      shadowGenerator.addShadowCaster(conferenceTable);

      // Reception desk (modern curved design in open area)
      const receptionDesk = BABYLON.MeshBuilder.CreateCylinder("receptionDesk", {
        height: 3,
        diameterTop: 10,
        diameterBottom: 10,
        tessellation: 6
      }, scene);
      receptionDesk.position = new BABYLON.Vector3(0, 1.5, -3);
      receptionDesk.material = materials.furniture;
      shadowGenerator.addShadowCaster(receptionDesk);

      // Lounge furniture
      const createCouch = (position, width = 3) => {
        const couch = BABYLON.MeshBuilder.CreateBox("couch", {
          width: width,
          height: 1.5,
          depth: 1.5
        }, scene);
        couch.position = new BABYLON.Vector3(position.x, 0.75, position.z);
        couch.material = materials.accent;
        shadowGenerator.addShadowCaster(couch);
        return couch;
      };

      // Client lounge couches
      createCouch({x: 27.5, z: 3}, 8);
      createCouch({x: 27.5, z: -3}, 8);
      
      // Wellness area seating
      createCouch({x: -10, z: 0}, 5);
      
      // Meeting room tables
      const createMeetingTable = (position) => {
        const table = BABYLON.MeshBuilder.CreateBox("meetingTable", {
          width: 5,
          height: 2.5,
          depth: 3
        }, scene);
        table.position = new BABYLON.Vector3(position.x, 1.25, position.z);
        table.material = materials.furniture;
        shadowGenerator.addShadowCaster(table);
        return table;
      };
      
      createMeetingTable({x: -7.5, z: -21});
      createMeetingTable({x: 7.5, z: -21});

      // Add collaborative workspace tables in open area
      createMeetingTable({x: -10, z: -8});
      createMeetingTable({x: 10, z: -8});
      createMeetingTable({x: 0, z: 6});

      // Add plants for decoration
      const createPlant = (position) => {
        const plant = BABYLON.MeshBuilder.CreateCylinder("plant", {
          height: 3,
          diameterTop: 2,
          diameterBottom: 2.5,
          tessellation: 8
        }, scene);
        plant.position = new BABYLON.Vector3(position.x, 1.5, position.z);
        const plantMat = new BABYLON.StandardMaterial("plantMat", scene);
        plantMat.diffuseColor = new BABYLON.Color3(0.2, 0.6, 0.2);
        plant.material = plantMat;
        shadowGenerator.addShadowCaster(plant);
        return plant;
      };
      
      // Add plants throughout the open space
      createPlant({x: -15, z: 7});
      createPlant({x: 15, z: 7});
      createPlant({x: -15, z: -7});
      createPlant({x: 15, z: -7});
      createPlant({x: 0, z: 10});
      createPlant({x: -27.5, z: -15});
      createPlant({x: 27.5, z: -15});

      // Add grid lines to floor for better spatial reference
      const gridSize = 5; // 5 foot grid
      const lineColor = new BABYLON.Color3(0.8, 0.8, 0.8);
      
      // Vertical lines
      for (let x = -40; x <= 40; x += gridSize) {
        const line = BABYLON.MeshBuilder.CreateBox("gridLineV", {
          width: 0.1,
          height: 0.01,
          depth: 60
        }, scene);
        line.position = new BABYLON.Vector3(x, 0.005, 0);
        const lineMat = new BABYLON.StandardMaterial("gridLineMat", scene);
        lineMat.diffuseColor = lineColor;
        line.material = lineMat;
        line.isPickable = false;
      }
      
      // Horizontal lines
      for (let z = -30; z <= 30; z += gridSize) {
        const line = BABYLON.MeshBuilder.CreateBox("gridLineH", {
          width: 80,
          height: 0.01,
          depth: 0.1
        }, scene);
        line.position = new BABYLON.Vector3(0, 0.005, z);
        const lineMat = new BABYLON.StandardMaterial("gridLineMat", scene);
        lineMat.diffuseColor = lineColor;
        line.material = lineMat;
        line.isPickable = false;
      }

      // Add agents
      const createAgent = (agent, position) => {
        const agentMesh = BABYLON.MeshBuilder.CreateSphere(`agent_${agent.id}`, {
          diameter: 2
        }, scene);
        
        agentMesh.position = new BABYLON.Vector3(position.x, 1, position.z);
        
        const agentMat = new BABYLON.StandardMaterial(`agentMat_${agent.id}`, scene);
        agentMat.diffuseColor = agent.status === 'busy' ? 
          new BABYLON.Color3(0.8, 0.2, 0.2) : 
          new BABYLON.Color3(0.2, 0.8, 0.2);
        
        agentMesh.material = agentMat;
        agentMesh.isPickable = true;
        shadowGenerator.addShadowCaster(agentMesh);
        
        agentMeshesRef.current[agent.id] = agentMesh;

        // Add label
        const advancedTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI_" + agent.id);
        const label = new GUI.Rectangle();
        label.width = "100px";
        label.height = "30px";
        label.cornerRadius = 5;
        label.color = "white";
        label.thickness = 2;
        label.background = "black";

        const text = new GUI.TextBlock();
        text.text = agent.name;
        text.color = "white";
        text.fontSize = 12;
        label.addControl(text);

        advancedTexture.addControl(label);
        label.linkWithMesh(agentMesh);
        label.linkOffsetY = -30;

        return agentMesh;
      };

      // Position agents based on their default positions
      if (agents && agents.length > 0) {
        agents.forEach((agent, index) => {
          let position;
          if (agent.defaultPosition) {
            position = agent.defaultPosition;
          } else {
            // Default positions for different departments
            switch(agent.department || agent.role) {
              case 'management':
              case 'executive':
                position = {x: 0, z: 22.5}; // Executive office 2
                break;
              case 'reception':
                position = {x: 0, z: -3}; // Reception desk
                break;
              case 'sales':
              case 'operations':
                position = {x: 0, z: -8}; // Open workspace
                break;
              case 'marketing':
                position = {x: -30, z: -22.5}; // Private office 1
                break;
              case 'clients':
                position = {x: 27.5, z: 0}; // Client lounge
                break;
              default:
                // Distribute in offices
                switch(index % 7) {
                  case 0: position = {x: -30, z: 22.5}; break; // Exec 1
                  case 1: position = {x: 0, z: 22.5}; break; // Exec 2
                  case 2: position = {x: 30, z: 22.5}; break; // Exec 3
                  case 3: position = {x: -27.5, z: 0}; break; // Conference
                  case 4: position = {x: -30, z: -22.5}; break; // Private 1
                  case 5: position = {x: 30, z: -22.5}; break; // Private 2
                  default: position = {x: 0, z: 0}; // Reception area
                }
            }
          }
          createAgent(agent, position);
        });
      }

      // Handle clicks and hover
      scene.onPointerObservable.add((pointerInfo) => {
        if (pointerInfo.type === BABYLON.PointerEventTypes.POINTERPICK) {
          if (pointerInfo.pickInfo.hit && pointerInfo.event.button === 0) { // Left click only
            const pickedMesh = pointerInfo.pickInfo.pickedMesh;
            
            // Check if agent was clicked
            const agentId = Object.keys(agentMeshesRef.current).find(
              id => agentMeshesRef.current[id] === pickedMesh
            );
            if (agentId && onAgentClick) {
              onAgentClick(agentId);
            }
            
            // Check if room was clicked
            const roomName = Object.keys(roomsRef.current).find(
              name => roomsRef.current[name] === pickedMesh
            );
            if (roomName) {
              // Update selected room state
              setSelectedRoom(roomName);
              
              // Reset all room highlights
              Object.values(roomsRef.current).forEach(room => {
                if (room.material) {
                  room.material.emissiveColor = new BABYLON.Color3(0, 0, 0);
                  room.material.alpha = 0.3;
                }
              });
              
              // Highlight selected room
              const selectedMesh = roomsRef.current[roomName];
              if (selectedMesh && selectedMesh.material) {
                selectedMesh.material.emissiveColor = new BABYLON.Color3(0.2, 0.4, 0.6);
                selectedMesh.material.alpha = 0.5;
              }
              
              if (onRoomClick) {
                onRoomClick(roomName);
              }
            }
          }
        } else if (pointerInfo.type === BABYLON.PointerEventTypes.POINTERMOVE) {
          if (pointerInfo.pickInfo.hit && !isPanning && !isTilting) {
            const pickedMesh = pointerInfo.pickInfo.pickedMesh;
            
            // Check if hovering over a room
            const roomName = Object.keys(roomsRef.current).find(
              name => roomsRef.current[name] === pickedMesh
            );
            
            // Reset hover effect on all rooms except selected
            Object.entries(roomsRef.current).forEach(([name, room]) => {
              if (room.material && name !== selectedRoom) {
                room.material.alpha = name === roomName ? 0.4 : 0.3;
              }
            });
            
            // Change cursor on room hover
            canvasRef.current.style.cursor = roomName ? 'pointer' : 'grab';
          } else {
            canvasRef.current.style.cursor = isPanning ? 'grabbing' : (isTilting ? 'ns-resize' : 'grab');
          }
        }
      });

      setIsLoading(false);
      if (onSceneReady) {
        onSceneReady(scene);
      }

      return scene;
    };

    const scene = createScene();
    sceneRef.current = scene;

    engine.runRenderLoop(() => {
      scene.render();
    });

    window.addEventListener("resize", () => {
      engine.resize();
    });

    return () => {
      scene.dispose();
      engine.dispose();
    };
  }, [agents, selectedAgent, onAgentClick, onRoomClick, onSceneReady]);

  // Camera view controls
  const setCameraView = (viewType) => {
    const camera = cameraRef.current;
    if (!camera) return;

    switch(viewType) {
      case 'top':
        // Near top-down but not completely flat
        camera.beta = 0.1;
        camera.radius = 90;
        break;
      case '3d':
        // Default angled view
        camera.beta = Math.PI / 3.5;
        camera.radius = 100;
        break;
      case 'close':
        // Zoomed in view
        camera.radius = 50;
        break;
      default:
        break;
    }
  };

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <canvas
        ref={canvasRef}
        style={{ width: '100%', height: '100%', display: 'block' }}
      />
      
      {/* Camera controls */}
      <div style={{
        position: 'absolute',
        top: 20,
        left: 20,
        background: 'white',
        padding: '15px',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        zIndex: 10
      }}>
        <button 
          onClick={() => setCameraView('top')}
          style={{
            display: 'block',
            width: '120px',
            padding: '8px 16px',
            margin: '5px 0',
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          Top View
        </button>
        <button 
          onClick={() => setCameraView('3d')}
          style={{
            display: 'block',
            width: '120px',
            padding: '8px 16px',
            margin: '5px 0',
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          Default View
        </button>
        <button 
          onClick={() => setCameraView('close')}
          style={{
            display: 'block',
            width: '120px',
            padding: '8px 16px',
            margin: '5px 0',
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          Close View
        </button>
        <hr style={{ margin: '10px 0', border: 'none', borderTop: '1px solid #e0e0e0' }} />
        <p style={{ margin: '5px 0', fontSize: '11px', color: '#666', textAlign: 'left' }}>
          <strong>Controls:</strong>
        </p>
        <p style={{ margin: '2px 0', fontSize: '10px', color: '#999' }}>
          • Scroll: Zoom
        </p>
        <p style={{ margin: '2px 0', fontSize: '10px', color: '#999' }}>
          • Right-drag: Pan
        </p>
        <p style={{ margin: '2px 0', fontSize: '10px', color: '#999' }}>
          • Middle-drag: Tilt
        </p>
        <p style={{ margin: '2px 0', fontSize: '10px', color: '#999' }}>
          • Shift+Scroll: Tilt
        </p>
        <p style={{ margin: '2px 0', fontSize: '10px', color: '#999' }}>
          • Q/E keys: Tilt
        </p>
      </div>

      {isLoading && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          color: 'white',
          background: 'rgba(0,0,0,0.7)',
          padding: '20px',
          borderRadius: '10px'
        }}>
          Loading 3D Office...
        </div>
      )}
      
      {/* Selected room display */}
      {selectedRoom && (
        <div style={{
          position: 'absolute',
          bottom: 20,
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(0, 0, 0, 0.8)',
          color: 'white',
          padding: '10px 20px',
          borderRadius: '20px',
          fontSize: '16px',
          fontWeight: 'bold',
          boxShadow: '0 2px 10px rgba(0,0,0,0.3)'
        }}>
          {roomConfigs[selectedRoom]?.name || selectedRoom}
        </div>
      )}
    </div>
  );
};

// Updated room configuration for 80x60 grid
export const roomConfigs = {
  executive1: {
    name: 'Executive Office 1',
    type: 'office',
    size: "20' x 15'",
    capacity: 6,
    features: ['Executive Desk', 'Meeting Chairs', 'Private Storage', 'Window View']
  },
  executive2: {
    name: 'Executive Office 2',
    type: 'office',
    size: "20' x 15'",
    capacity: 6,
    features: ['Executive Desk', 'Meeting Chairs', 'Display Wall']
  },
  executive3: {
    name: 'Executive Office 3',
    type: 'office',
    size: "20' x 15'",
    capacity: 6,
    features: ['Executive Desk', 'Meeting Chairs', 'Filing System']
  },
  conference: {
    name: 'Main Conference Room',
    type: 'meeting',
    size: "25' x 20'",
    capacity: 20,
    features: ['Large Conference Table', '85" Display', 'Video Conference', 'Soundproofing']
  },
  lounge: {
    name: 'Client Lounge',
    type: 'lounge',
    size: "25' x 20'",
    capacity: 15,
    features: ['Luxury Seating', 'Refreshment Bar', 'Entertainment System', 'Private Meeting Area']
  },
  privateOffice1: {
    name: 'Private Office Suite 1',
    type: 'office',
    size: "20' x 15'",
    capacity: 6,
    features: ['Corner Office', 'Private Meeting Area', 'Storage', 'Executive Amenities']
  },
  privateOffice2: {
    name: 'Private Office Suite 2',
    type: 'office',
    size: "20' x 15'",
    capacity: 6,
    features: ['Window Office', 'Built-in Storage', 'Printer Station', 'Conference Phone']
  },
  meetingRoom1: {
    name: 'Small Meeting Room 1',
    type: 'meeting',
    size: "15' x 12'",
    capacity: 8,
    features: ['Round Table', 'Wall Display', 'Whiteboard', 'Video Conference']
  },
  meetingRoom2: {
    name: 'Small Meeting Room 2',
    type: 'meeting',
    size: "15' x 12'",
    capacity: 8,
    features: ['Conference Table', 'Video Display', 'Phone System', 'Whiteboard']
  },
  reception: {
    name: 'Open Reception Area',
    type: 'reception',
    size: "40' x 30'",
    capacity: 25,
    features: ['Modern Reception Desk', 'Lounge Seating', 'Digital Display Wall', 'Coffee Bar', 'Guest WiFi'],
    openConcept: true
  },
  workspace: {
    name: 'Open Collaborative Workspace',
    type: 'workspace',
    size: "30' x 25'",
    capacity: 30,
    features: ['Hot Desks', 'Standing Desks', 'Collaboration Zones', 'Quiet Pods', 'Tech Bar']
  },
  wellness: {
    name: 'Wellness Zone',
    type: 'wellness',
    size: "12' x 12'",
    capacity: 6,
    features: ['Meditation Space', 'Comfortable Seating', 'Plants', 'Relaxation Area']
  }
};

export default Office3D;