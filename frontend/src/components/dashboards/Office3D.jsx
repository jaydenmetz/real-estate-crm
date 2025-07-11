// File: frontend/src/components/dashboards/Office3D.jsx
import React, { useEffect, useRef, useState } from 'react';
import * as BABYLON from 'babylonjs';
import * as GUI from 'babylonjs-gui';

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
        80,                // Radius - distance from target
        new BABYLON.Vector3(0, 0, 0),
        scene
      );
      
      // Attach camera control
      camera.attachControl(canvasRef.current, true);
      
      // Camera limits for Clash of Clans style
      camera.lowerRadiusLimit = 40;    // Can't zoom in too close
      camera.upperRadiusLimit = 120;   // Can't zoom out too far
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

      // Floor (80' x 60' = 80 x 60 units)
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

      // Outer walls
      createWall("northWall", 80, wallHeight, wallThickness, 
        new BABYLON.Vector3(0, wallHeight/2, 30));
      createWall("southWall", 80, wallHeight, wallThickness, 
        new BABYLON.Vector3(0, wallHeight/2, -30));
      createWall("eastWall", wallThickness, wallHeight, 60, 
        new BABYLON.Vector3(40, wallHeight/2, 0));
      createWall("westWall", wallThickness, wallHeight, 60, 
        new BABYLON.Vector3(-40, wallHeight/2, 0));

      // TOP ROW (anchored to top edge and respective corners)
      // Partner Office (10' x 10') - anchored to top-left corner
      createWall("partnerOfficeEast", wallThickness, wallHeight, 10, 
        new BABYLON.Vector3(-30, wallHeight/2, 25));
      createWall("partnerOfficeSouth", 10, wallHeight, wallThickness, 
        new BABYLON.Vector3(-35, wallHeight/2, 20));
      
      // Senior Office 1 (9' x 10') - next to Partner Office
      createWall("senior1West", wallThickness, wallHeight, 10, 
        new BABYLON.Vector3(-30, wallHeight/2, 25));
      createWall("senior1East", wallThickness, wallHeight, 10, 
        new BABYLON.Vector3(-21, wallHeight/2, 25));
      createWall("senior1South", 9, wallHeight, wallThickness, 
        new BABYLON.Vector3(-25.5, wallHeight/2, 20));
      
      // Senior Office 2 (9' x 10') - next to Senior Office 1
      createWall("senior2West", wallThickness, wallHeight, 10, 
        new BABYLON.Vector3(-21, wallHeight/2, 25));
      createWall("senior2East", wallThickness, wallHeight, 10, 
        new BABYLON.Vector3(-12, wallHeight/2, 25));
      createWall("senior2South", 9, wallHeight, wallThickness, 
        new BABYLON.Vector3(-16.5, wallHeight/2, 20));
      
      // Conference Room (16' x 10') - anchored to top-right corner (with gap from Senior Office 2)
      createWall("conferenceWest", wallThickness, wallHeight, 10, 
        new BABYLON.Vector3(24, wallHeight/2, 25));
      createWall("conferenceSouth", 16, wallHeight, wallThickness, 
        new BABYLON.Vector3(32, wallHeight/2, 20));

      // MIDDLE ROW
      // Manager Office (11' x 10') - anchored to left side (with gap from Reception below)
      createWall("managerNorth", 11, wallHeight, wallThickness, 
        new BABYLON.Vector3(-34.5, wallHeight/2, 10));
      createWall("managerEast", wallThickness, wallHeight, 10, 
        new BABYLON.Vector3(-29, wallHeight/2, 5));
      createWall("managerSouth", 11, wallHeight, wallThickness, 
        new BABYLON.Vector3(-34.5, wallHeight/2, 0));
      
      // Wellness Zone (14' x 7') - Only divider wall between wellness and refreshment
      // Keep only the divider wall (south wall of wellness / north wall of refreshment)
      createWall("wellness_refreshment_divider", 14, wallHeight, wallThickness, 
        new BABYLON.Vector3(33, wallHeight/2, 3));

      // BOTTOM ROW
      // Reception (11' x 10') - anchored to bottom-left corner
      createWall("receptionNorth", 11, wallHeight, wallThickness, 
        new BABYLON.Vector3(-34.5, wallHeight/2, -20));
      createWall("receptionEast", wallThickness, wallHeight, 10, 
        new BABYLON.Vector3(-29, wallHeight/2, -25));
      
      // Client Lounge (17' x 10') - positioned with gap from Reception
      createWall("clientLoungeWest", wallThickness, wallHeight, 10, 
        new BABYLON.Vector3(-10, wallHeight/2, -25));
      createWall("clientLoungeEast", wallThickness, wallHeight, 10, 
        new BABYLON.Vector3(7.5, wallHeight/2, -25));
      createWall("clientLoungeNorth", 17.5, wallHeight, wallThickness, 
        new BABYLON.Vector3(-1.25, wallHeight/2, -20));
      
      // Lead Lounge (17' x 10') - anchored to bottom-right corner
      createWall("leadLoungeWest", wallThickness, wallHeight, 10, 
        new BABYLON.Vector3(23, wallHeight/2, -25));
      createWall("leadLoungeNorth", 17, wallHeight, wallThickness, 
        new BABYLON.Vector3(31.5, wallHeight/2, -20));

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

      // Define all rooms based on floor plan
      createRoomArea("partnerOffice", {x: -35, z: 25}, 10, 10, new BABYLON.Color3(0.2, 0.4, 0.7));
      createRoomArea("seniorOffice1", {x: -25.5, z: 25}, 9, 10, new BABYLON.Color3(0.2, 0.4, 0.7));
      createRoomArea("seniorOffice2", {x: -16.5, z: 25}, 9, 10, new BABYLON.Color3(0.2, 0.4, 0.7));
      createRoomArea("conference", {x: 32, z: 25}, 16, 10, new BABYLON.Color3(0.7, 0.5, 0.2));
      
      createRoomArea("managerOffice", {x: -34.5, z: 5}, 11, 10, new BABYLON.Color3(0.2, 0.4, 0.7));
      createRoomArea("openCommon", {x: 0, z: 0}, 40, 26, new BABYLON.Color3(0.9, 0.9, 0.9));
      
      createRoomArea("wellness", {x: 33, z: 6.5}, 14, 7, new BABYLON.Color3(0.4, 0.7, 0.4));
      createRoomArea("refreshment", {x: 33, z: 0.5}, 14, 5, new BABYLON.Color3(0.7, 0.6, 0.3));
      
      createRoomArea("reception", {x: -34.5, z: -25}, 11, 10, new BABYLON.Color3(0.3, 0.7, 0.6));
      createRoomArea("clientLounge", {x: -1.25, z: -25}, 17.5, 10, new BABYLON.Color3(0.6, 0.4, 0.6));
      createRoomArea("leadLounge", {x: 31.5, z: -25}, 17, 10, new BABYLON.Color3(0.4, 0.6, 0.8));

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

      // Add desks and chairs in offices
      createDesk({x: -35, z: 25}, 0);
      createChair({x: -35, z: 23}, 0);
      
      createDesk({x: -25.5, z: 25}, 0);
      createChair({x: -25.5, z: 23}, 0);
      
      createDesk({x: -16.5, z: 25}, 0);
      createChair({x: -16.5, z: 23}, 0);
      
      createDesk({x: -34.5, z: 5}, 0);
      createChair({x: -34.5, z: 3}, 0);

      // Conference table
      const conferenceTable = BABYLON.MeshBuilder.CreateBox("conferenceTable", {
        width: 7,
        height: 2.5,
        depth: 3.5
      }, scene);
      conferenceTable.position = new BABYLON.Vector3(32, 1.25, 25);
      conferenceTable.material = materials.furniture;
      shadowGenerator.addShadowCaster(conferenceTable);

      // Reception desk (curved)
      const receptionDesk = BABYLON.MeshBuilder.CreateCylinder("receptionDesk", {
        height: 2.5,
        diameterTop: 7,
        diameterBottom: 7,
        tessellation: 6
      }, scene);
      receptionDesk.position = new BABYLON.Vector3(-34.5, 1.25, -25);
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

      createCouch({x: -1.25, z: -25}, 6);
      createCouch({x: 31.5, z: -25}, 5);
      
      // Wellness Zone furniture
      createCouch({x: 33, z: 6.5}, 4);
      
      // Refreshment bar counter
      const barCounter = BABYLON.MeshBuilder.CreateBox("barCounter", {
        width: 10,
        height: 3,
        depth: 2
      }, scene);
      barCounter.position = new BABYLON.Vector3(33, 1.5, 0.5);
      barCounter.material = materials.furniture;
      shadowGenerator.addShadowCaster(barCounter);
      
      // Add meeting tables in the open common area
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
      
      // Place a few meeting tables in the common area
      createMeetingTable({x: -10, z: 0});
      createMeetingTable({x: 10, z: 0});

      // Add plants and decorative elements in the open common area
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
      
      // Add plants in strategic locations
      createPlant({x: -20, z: 10});
      createPlant({x: 20, z: 10});
      createPlant({x: -20, z: -10});
      createPlant({x: 20, z: -10});
      createPlant({x: 0, z: 0});

      // Add grid lines to floor for better spatial reference
      const gridSize = 10;
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

      // Position agents based on their default positions or roles
      if (agents && agents.length > 0) {
        agents.forEach((agent, index) => {
          let position;
          if (agent.defaultPosition) {
            position = agent.defaultPosition;
          } else {
            // Default positions for different roles
            switch(agent.department || agent.role) {
              case 'management':
                position = {x: -34.5, z: 5}; // Manager office
                break;
              case 'reception':
                position = {x: -34.5, z: -25}; // Reception
                break;
              case 'sales':
                position = {x: 0, z: 0}; // Open common area
                break;
              default:
                // Distribute in offices
                switch(index % 4) {
                  case 0: position = {x: -35, z: 25}; break; // Partner office
                  case 1: position = {x: -25.5, z: 25}; break; // Senior office 1
                  case 2: position = {x: -16.5, z: 25}; break; // Senior office 2
                  case 3: position = {x: 32, z: 25}; break; // Conference room
                  default: position = {x: 0, z: 0}; // Common area
                }
            }
          }
          createAgent(agent, position);
        });
      }

      // Handle clicks and hover (modified to not interfere with panning)
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

  // Camera view controls - modified for Clash of Clans style
  const setCameraView = (viewType) => {
    const camera = cameraRef.current;
    if (!camera) return;

    switch(viewType) {
      case 'top':
        // Near top-down but not completely flat
        camera.beta = 0.1;
        camera.radius = 80;
        break;
      case '3d':
        // Default angled view
        camera.beta = Math.PI / 3.5;
        camera.radius = 80;
        break;
      case 'close':
        // Zoomed in view
        camera.radius = 40;
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

// Room configuration export for reference
export const roomConfigs = {
  partnerOffice: {
    name: 'Partner Office',
    type: 'office',
    size: "10' x 10'",
    capacity: 4,
    features: ['Executive Desk', 'Meeting Chairs', 'Private Storage']
  },
  seniorOffice1: {
    name: 'Senior Office 1',
    type: 'office',
    size: "9' x 10'",
    capacity: 3,
    features: ['Desk', 'Guest Chairs', 'Filing Cabinet']
  },
  seniorOffice2: {
    name: 'Senior Office 2',
    type: 'office',
    size: "9' x 10'",
    capacity: 3,
    features: ['Desk', 'Guest Chairs', 'Filing Cabinet']
  },
  conference: {
    name: 'Conference Room',
    type: 'meeting',
    size: "16' x 10'",
    capacity: 12,
    features: ['Conference Table', '85" Display', 'Video Conference']
  },
  managerOffice: {
    name: 'Manager Office',
    type: 'office',
    size: "11' x 10'",
    capacity: 5,
    features: ['Executive Desk', 'Lounge Area', 'TV Display']
  },
  openCommon: {
    name: 'Open Common Area',
    type: 'common',
    size: "20' x 13'",
    capacity: 20,
    features: ['Flexible Meeting Space', 'Collaboration Tables']
  },
  wellness: {
    name: 'Wellness Zone',
    type: 'wellness',
    size: "14' x 7'",
    capacity: 8,
    features: ['Quiet Zone', 'Comfortable Seating', 'Plants']
  },
  refreshment: {
    name: 'Refreshment Bar',
    type: 'refreshment',
    size: "14' x 5'",
    capacity: 6,
    features: ['Coffee Machine', 'Refreshments', 'Bar Seating']
  },
  reception: {
    name: 'Reception',
    type: 'reception',
    size: "11' x 10'",
    capacity: 6,
    features: ['Curved Reception Desk', 'Waiting Area', 'Display']
  },
  clientLounge: {
    name: 'Client Lounge',
    type: 'lounge',
    size: "17' x 10'",
    capacity: 10,
    features: ['Premium Seating', 'TV', 'Coffee Table']
  },
  leadLounge: {
    name: 'Lead Lounge',
    type: 'lounge',
    size: "17' x 10'",
    capacity: 10,
    features: ['Lead Nurture Area', 'Comfortable Seating', 'TV']
  }
};

export default Office3D;