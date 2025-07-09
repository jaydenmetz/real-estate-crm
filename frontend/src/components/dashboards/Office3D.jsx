// Modern Office with Wood Materials and Color-Themed Rooms
// File: components/dashboards/Office3D.jsx

import React, { useEffect, useRef, useState } from 'react';
import * as BABYLON from 'babylonjs';
import * as GUI from 'babylonjs-gui';

const Office3D = ({ agents, selectedAgent, onAgentClick, currentFloor = 'buyers' }) => {
  const canvasRef = useRef(null);
  const sceneRef = useRef(null);
  const engineRef = useRef(null);
  const agentMeshesRef = useRef({});
  const officesRef = useRef({});
  const doorsRef = useRef({});
  const lightsRef = useRef({});
  const [agentStates, setAgentStates] = useState({});

  useEffect(() => {
    if (!canvasRef.current) return;

    const engine = new BABYLON.Engine(canvasRef.current, true);
    engineRef.current = engine;

    const createScene = () => {
      const scene = new BABYLON.Scene(engine);
      scene.clearColor = new BABYLON.Color3(0.9, 0.88, 0.85); // Warm background

      // Camera setup
      const camera = new BABYLON.ArcRotateCamera(
        "camera",
        -Math.PI / 4,
        Math.PI / 3,
        50,
        new BABYLON.Vector3(0, 0, 0),
        scene
      );
      camera.attachControl(canvasRef.current, true);
      camera.lowerRadiusLimit = 30;
      camera.upperRadiusLimit = 80;
      camera.wheelPrecision = 20;
      camera.upperBetaLimit = Math.PI / 2.1;
      camera.lowerBetaLimit = Math.PI / 6;

      // Ambient lighting
      const ambientLight = new BABYLON.HemisphericLight("ambient", new BABYLON.Vector3(0, 1, 0), scene);
      ambientLight.intensity = 0.7;
      ambientLight.diffuse = new BABYLON.Color3(1, 0.98, 0.95);
      ambientLight.groundColor = new BABYLON.Color3(0.5, 0.45, 0.4);

      // Main directional light
      const sunLight = new BABYLON.DirectionalLight("sun", new BABYLON.Vector3(-1, -2, -1), scene);
      sunLight.position = new BABYLON.Vector3(20, 40, 20);
      sunLight.intensity = 0.6;

      // Shadow generator
      const shadowGenerator = new BABYLON.ShadowGenerator(2048, sunLight);
      shadowGenerator.useExponentialShadowMap = true;
      shadowGenerator.setDarkness(0.15);

      // Office dimensions
      const OFFICE_WIDTH = 40;
      const OFFICE_DEPTH = 30;
      const WALL_HEIGHT = 8;
      const WALL_THICKNESS = 0.3;

      // Room color themes
      const roomThemes = {
        office1: {
          wall: new BABYLON.Color3(0.9, 0.85, 0.75), // Warm beige
          accent: new BABYLON.Color3(0.7, 0.5, 0.3),  // Darker tan
          furniture: new BABYLON.Color3(0.6, 0.4, 0.25)
        },
        office2: {
          wall: new BABYLON.Color3(0.85, 0.9, 0.85), // Soft sage green
          accent: new BABYLON.Color3(0.5, 0.6, 0.5),
          furniture: new BABYLON.Color3(0.4, 0.5, 0.4)
        },
        office3: {
          wall: new BABYLON.Color3(0.9, 0.85, 0.9), // Soft lavender
          accent: new BABYLON.Color3(0.6, 0.5, 0.65),
          furniture: new BABYLON.Color3(0.5, 0.4, 0.55)
        },
        conference: {
          wall: new BABYLON.Color3(0.85, 0.85, 0.9), // Professional blue-gray
          accent: new BABYLON.Color3(0.4, 0.4, 0.5),
          furniture: new BABYLON.Color3(0.3, 0.3, 0.4)
        },
        common: {
          wall: new BABYLON.Color3(0.95, 0.92, 0.88), // Light neutral
          accent: new BABYLON.Color3(0.8, 0.7, 0.6),
          furniture: new BABYLON.Color3(0.7, 0.6, 0.5)
        }
      };

      // Base materials
      const materials = {
        floor: new BABYLON.PBRMaterial("floorMat", scene),
        externalWall: new BABYLON.PBRMaterial("externalWallMat", scene),
        door: new BABYLON.PBRMaterial("doorMat", scene),
        doorFrame: new BABYLON.PBRMaterial("doorFrameMat", scene),
        glass: new BABYLON.PBRMaterial("glassMat", scene),
      };

      // Configure base materials
      materials.floor.albedoColor = new BABYLON.Color3(0.75, 0.65, 0.55); // Wood floor
      materials.floor.metallic = 0.1;
      materials.floor.roughness = 0.8;

      materials.externalWall.albedoColor = new BABYLON.Color3(0.8, 0.75, 0.7); // External walls
      materials.externalWall.metallic = 0;
      materials.externalWall.roughness = 0.95;

      materials.door.albedoColor = new BABYLON.Color3(0.7, 0.55, 0.4); // Dark wood door
      materials.door.metallic = 0.15;
      materials.door.roughness = 0.6;

      materials.doorFrame.albedoColor = new BABYLON.Color3(0.6, 0.45, 0.3); // Darker wood frame
      materials.doorFrame.metallic = 0.2;
      materials.doorFrame.roughness = 0.5;

      materials.glass.albedoColor = new BABYLON.Color3(0.9, 0.95, 1);
      materials.glass.metallic = 0.1;
      materials.glass.roughness = 0.1;
      materials.glass.alpha = 0.3;
      materials.glass.transparencyMode = 2;

      // Create main floor
      const floor = BABYLON.MeshBuilder.CreateBox("floor", {
        width: OFFICE_WIDTH,
        depth: OFFICE_DEPTH,
        height: 0.5
      }, scene);
      floor.position.y = -0.25;
      floor.material = materials.floor;
      floor.receiveShadows = true;

      // Create external walls (all closed)
      const createExternalWalls = () => {
        // Back wall
        const backWall = BABYLON.MeshBuilder.CreateBox("backWall", {
          width: OFFICE_WIDTH,
          height: WALL_HEIGHT,
          depth: WALL_THICKNESS
        }, scene);
        backWall.position.set(0, WALL_HEIGHT/2, -OFFICE_DEPTH/2);
        backWall.material = materials.externalWall;

        // Front wall
        const frontWall = BABYLON.MeshBuilder.CreateBox("frontWall", {
          width: OFFICE_WIDTH,
          height: WALL_HEIGHT,
          depth: WALL_THICKNESS
        }, scene);
        frontWall.position.set(0, WALL_HEIGHT/2, OFFICE_DEPTH/2);
        frontWall.material = materials.externalWall;

        // Left wall
        const leftWall = BABYLON.MeshBuilder.CreateBox("leftWall", {
          width: WALL_THICKNESS,
          height: WALL_HEIGHT,
          depth: OFFICE_DEPTH
        }, scene);
        leftWall.position.set(-OFFICE_WIDTH/2, WALL_HEIGHT/2, 0);
        leftWall.material = materials.externalWall;

        // Right wall
        const rightWall = BABYLON.MeshBuilder.CreateBox("rightWall", {
          width: WALL_THICKNESS,
          height: WALL_HEIGHT,
          depth: OFFICE_DEPTH
        }, scene);
        rightWall.position.set(OFFICE_WIDTH/2, WALL_HEIGHT/2, 0);
        rightWall.material = materials.externalWall;
      };

      // Create individual office
      const createOffice = (id, position, size, theme) => {
        const office = new BABYLON.TransformNode(`office_${id}`);
        
        // Create room-specific materials
        const wallMat = new BABYLON.PBRMaterial(`${id}_wallMat`, scene);
        wallMat.albedoColor = theme.wall;
        wallMat.metallic = 0;
        wallMat.roughness = 0.9;

        const furnitureMat = new BABYLON.PBRMaterial(`${id}_furnitureMat`, scene);
        furnitureMat.albedoColor = theme.furniture;
        furnitureMat.metallic = 0.2;
        furnitureMat.roughness = 0.6;

        // Office walls
        const walls = [];

        // Back wall
        const backWall = BABYLON.MeshBuilder.CreateBox(`${id}_backWall`, {
          width: size.width,
          height: WALL_HEIGHT,
          depth: WALL_THICKNESS
        }, scene);
        backWall.position.set(position.x, WALL_HEIGHT/2, position.z + size.depth/2);
        backWall.material = wallMat;
        backWall.parent = office;
        walls.push(backWall);

        // Side walls
        const leftWall = BABYLON.MeshBuilder.CreateBox(`${id}_leftWall`, {
          width: WALL_THICKNESS,
          height: WALL_HEIGHT,
          depth: size.depth
        }, scene);
        leftWall.position.set(position.x - size.width/2, WALL_HEIGHT/2, position.z);
        leftWall.material = wallMat;
        leftWall.parent = office;
        walls.push(leftWall);

        const rightWall = BABYLON.MeshBuilder.CreateBox(`${id}_rightWall`, {
          width: WALL_THICKNESS,
          height: WALL_HEIGHT,
          depth: size.depth
        }, scene);
        rightWall.position.set(position.x + size.width/2, WALL_HEIGHT/2, position.z);
        rightWall.material = wallMat;
        rightWall.parent = office;
        walls.push(rightWall);

        // Front wall with door opening
        const doorWidth = 2.5;
        const frontLeftWall = BABYLON.MeshBuilder.CreateBox(`${id}_frontLeft`, {
          width: (size.width - doorWidth) / 2,
          height: WALL_HEIGHT,
          depth: WALL_THICKNESS
        }, scene);
        frontLeftWall.position.set(
          position.x - size.width/4 - doorWidth/4,
          WALL_HEIGHT/2,
          position.z - size.depth/2
        );
        frontLeftWall.material = wallMat;
        frontLeftWall.parent = office;

        const frontRightWall = BABYLON.MeshBuilder.CreateBox(`${id}_frontRight`, {
          width: (size.width - doorWidth) / 2,
          height: WALL_HEIGHT,
          depth: WALL_THICKNESS
        }, scene);
        frontRightWall.position.set(
          position.x + size.width/4 + doorWidth/4,
          WALL_HEIGHT/2,
          position.z - size.depth/2
        );
        frontRightWall.material = wallMat;
        frontRightWall.parent = office;

        // Door frame
        const doorFrame = BABYLON.MeshBuilder.CreateBox(`${id}_doorFrame`, {
          width: doorWidth,
          height: 0.3,
          depth: WALL_THICKNESS * 1.5
        }, scene);
        doorFrame.position.set(position.x, WALL_HEIGHT - 1, position.z - size.depth/2);
        doorFrame.material = materials.doorFrame;
        doorFrame.parent = office;

        // Door
        const door = BABYLON.MeshBuilder.CreateBox(`${id}_door`, {
          width: doorWidth - 0.1,
          height: 6.5,
          depth: 0.1
        }, scene);
        door.position.set(position.x - doorWidth/2 + 0.05, 3.25, position.z - size.depth/2);
        door.setPivotPoint(new BABYLON.Vector3(doorWidth/2 - 0.05, 0, 0));
        door.material = materials.door;
        doorsRef.current[id] = door;
        shadowGenerator.addShadowCaster(door);

        // Office furniture
        const desk = BABYLON.MeshBuilder.CreateBox(`${id}_desk`, {
          width: size.width * 0.6,
          height: 0.15,
          depth: size.depth * 0.3
        }, scene);
        desk.position.set(position.x, 2.5, position.z + size.depth * 0.2);
        desk.material = furnitureMat;
        desk.parent = office;
        shadowGenerator.addShadowCaster(desk);

        // Desk legs
        for (let i = 0; i < 4; i++) {
          const leg = BABYLON.MeshBuilder.CreateBox(`${id}_leg${i}`, {
            width: 0.1,
            height: 2.5,
            depth: 0.1
          }, scene);
          const xOffset = (i % 2 === 0) ? -size.width * 0.25 : size.width * 0.25;
          const zOffset = (i < 2) ? size.depth * 0.05 : size.depth * 0.35;
          leg.position.set(position.x + xOffset, 1.25, position.z + zOffset);
          leg.material = furnitureMat;
          leg.parent = office;
        }

        // Office chair
        const chairMat = new BABYLON.PBRMaterial(`${id}_chairMat`, scene);
        chairMat.albedoColor = new BABYLON.Color3(0.2, 0.2, 0.2);
        chairMat.metallic = 0.3;
        chairMat.roughness = 0.6;

        const chairSeat = BABYLON.MeshBuilder.CreateBox(`${id}_chairSeat`, {
          width: 1.2,
          height: 0.1,
          depth: 1.2
        }, scene);
        chairSeat.position.set(position.x, 1.8, position.z - size.depth * 0.1);
        chairSeat.material = chairMat;
        chairSeat.parent = office;

        const chairBack = BABYLON.MeshBuilder.CreateBox(`${id}_chairBack`, {
          width: 1.2,
          height: 1.5,
          depth: 0.1
        }, scene);
        chairBack.position.set(position.x, 2.5, position.z - size.depth * 0.15);
        chairBack.material = chairMat;
        chairBack.parent = office;

        // Office light
        const officeLight = new BABYLON.PointLight(`${id}_light`, new BABYLON.Vector3(position.x, WALL_HEIGHT - 1, position.z), scene);
        officeLight.intensity = 0.5;
        officeLight.diffuse = new BABYLON.Color3(1, 0.95, 0.8);
        lightsRef.current[id] = officeLight;

        officesRef.current[id] = office;
        return office;
      };

      // Create conference room
      const createConferenceRoom = () => {
        const position = { x: 10, z: 8 };
        const size = { width: 12, depth: 10 };
        const theme = roomThemes.conference;
        
        const conference = new BABYLON.TransformNode("conference_room");
        
        // Conference room materials
        const wallMat = new BABYLON.PBRMaterial("conf_wallMat", scene);
        wallMat.albedoColor = theme.wall;
        wallMat.metallic = 0;
        wallMat.roughness = 0.9;

        const furnitureMat = new BABYLON.PBRMaterial("conf_furnitureMat", scene);
        furnitureMat.albedoColor = theme.furniture;
        furnitureMat.metallic = 0.2;
        furnitureMat.roughness = 0.5;

        // Conference room walls (fully enclosed)
        const walls = [
          { name: "back", width: size.width, depth: WALL_THICKNESS, position: { x: position.x, z: position.z + size.depth/2 } },
          { name: "front", width: size.width, depth: WALL_THICKNESS, position: { x: position.x, z: position.z - size.depth/2 } },
          { name: "left", width: WALL_THICKNESS, depth: size.depth, position: { x: position.x - size.width/2, z: position.z } },
          { name: "right", width: WALL_THICKNESS, depth: size.depth, position: { x: position.x + size.width/2, z: position.z } },
        ];

        walls.forEach(wall => {
          // Add door to front wall
          if (wall.name === "front") {
            const doorWidth = 3;
            // Left part of wall
            const leftWall = BABYLON.MeshBuilder.CreateBox(`conf_${wall.name}_left`, {
              width: (size.width - doorWidth) / 2,
              height: WALL_HEIGHT,
              depth: wall.depth
            }, scene);
            leftWall.position.set(
              wall.position.x - size.width/4 - doorWidth/4,
              WALL_HEIGHT/2,
              wall.position.z
            );
            leftWall.material = wallMat;
            leftWall.parent = conference;

            // Right part of wall
            const rightWall = BABYLON.MeshBuilder.CreateBox(`conf_${wall.name}_right`, {
              width: (size.width - doorWidth) / 2,
              height: WALL_HEIGHT,
              depth: wall.depth
            }, scene);
            rightWall.position.set(
              wall.position.x + size.width/4 + doorWidth/4,
              WALL_HEIGHT/2,
              wall.position.z
            );
            rightWall.material = wallMat;
            rightWall.parent = conference;

            // Conference door
            const door = BABYLON.MeshBuilder.CreateBox("conf_door", {
              width: doorWidth - 0.1,
              height: 6.5,
              depth: 0.1
            }, scene);
            door.position.set(position.x - doorWidth/2, 3.25, position.z - size.depth/2);
            door.setPivotPoint(new BABYLON.Vector3(doorWidth/2, 0, 0));
            door.material = materials.door;
            doorsRef.current.conference = door;
          } else {
            const wallMesh = BABYLON.MeshBuilder.CreateBox(`conf_${wall.name}`, {
              width: wall.width,
              height: WALL_HEIGHT,
              depth: wall.depth
            }, scene);
            wallMesh.position.set(wall.position.x, WALL_HEIGHT/2, wall.position.z);
            wallMesh.material = wallMat;
            wallMesh.parent = conference;
          }
        });

        // Conference table
        const confTable = BABYLON.MeshBuilder.CreateBox("confTable", {
          width: 6,
          height: 0.2,
          depth: 3
        }, scene);
        confTable.position.set(position.x, 2.5, position.z);
        confTable.material = furnitureMat;
        confTable.parent = conference;
        shadowGenerator.addShadowCaster(confTable);

        // Conference chairs
        const chairPositions = [
          { x: -2, z: -1.8 }, { x: 0, z: -1.8 }, { x: 2, z: -1.8 },
          { x: -2, z: 1.8 }, { x: 0, z: 1.8 }, { x: 2, z: 1.8 }
        ];

        chairPositions.forEach((offset, i) => {
          const chair = BABYLON.MeshBuilder.CreateBox(`confChair${i}`, {
            width: 0.8,
            height: 0.1,
            depth: 0.8
          }, scene);
          chair.position.set(position.x + offset.x, 1.8, position.z + offset.z);
          chair.material = furnitureMat;
          chair.parent = conference;
        });

        // Conference room light
        const confLight = new BABYLON.PointLight("conf_light", new BABYLON.Vector3(position.x, WALL_HEIGHT - 1, position.z), scene);
        confLight.intensity = 0.6;
        confLight.diffuse = new BABYLON.Color3(1, 1, 0.95);
        lightsRef.current.conference = confLight;
      };

      // Create common area furniture
      const createCommonArea = () => {
        const theme = roomThemes.common;
        
        // Common area materials
        const furnitureMat = new BABYLON.PBRMaterial("common_furnitureMat", scene);
        furnitureMat.albedoColor = theme.furniture;
        furnitureMat.metallic = 0.1;
        furnitureMat.roughness = 0.8;

        // Reception desk
        const receptionDesk = BABYLON.MeshBuilder.CreateBox("receptionDesk", {
          width: 6,
          height: 3,
          depth: 2
        }, scene);
        receptionDesk.position.set(-10, 1.5, -10);
        receptionDesk.material = furnitureMat;
        shadowGenerator.addShadowCaster(receptionDesk);

        // Reception chair
        const receptionChair = BABYLON.MeshBuilder.CreateBox("receptionChair", {
          width: 1,
          height: 0.1,
          depth: 1
        }, scene);
        receptionChair.position.set(-10, 1.8, -8);
        receptionChair.material = materials.door;

        // Refreshments area
        const refreshmentCounter = BABYLON.MeshBuilder.CreateBox("refreshmentCounter", {
          width: 4,
          height: 3,
          depth: 2
        }, scene);
        refreshmentCounter.position.set(-15, 1.5, 5);
        refreshmentCounter.material = furnitureMat;
        shadowGenerator.addShadowCaster(refreshmentCounter);

        // Coffee machine (simple box)
        const coffeeMachine = BABYLON.MeshBuilder.CreateBox("coffeeMachine", {
          width: 0.8,
          height: 1,
          depth: 0.8
        }, scene);
        coffeeMachine.position.set(-15, 3.5, 5);
        const coffeeMat = new BABYLON.PBRMaterial("coffeeMat", scene);
        coffeeMat.albedoColor = new BABYLON.Color3(0.1, 0.1, 0.1);
        coffeeMat.metallic = 0.8;
        coffeeMat.roughness = 0.3;
        coffeeMachine.material = coffeeMat;

        // Seating area
        const couchMat = new BABYLON.PBRMaterial("couchMat", scene);
        couchMat.albedoColor = new BABYLON.Color3(0.5, 0.4, 0.35);
        couchMat.metallic = 0;
        couchMat.roughness = 0.9;

        // Couches
        const couch1 = BABYLON.MeshBuilder.CreateBox("couch1", {
          width: 4,
          height: 1.5,
          depth: 1.5
        }, scene);
        couch1.position.set(0, 0.75, 0);
        couch1.material = couchMat;
        shadowGenerator.addShadowCaster(couch1);

        const couch2 = BABYLON.MeshBuilder.CreateBox("couch2", {
          width: 4,
          height: 1.5,
          depth: 1.5
        }, scene);
        couch2.position.set(0, 0.75, 5);
        couch2.rotation.y = Math.PI;
        couch2.material = couchMat;
        shadowGenerator.addShadowCaster(couch2);

        // Coffee table
        const coffeeTable = BABYLON.MeshBuilder.CreateBox("coffeeTable", {
          width: 2,
          height: 0.1,
          depth: 2
        }, scene);
        coffeeTable.position.set(0, 1, 2.5);
        coffeeTable.material = materials.door;
      };

      // Build the office
      createExternalWalls();
      
      // Create 3 offices on the left side
      createOffice("office1", { x: -15, z: -8 }, { width: 8, depth: 8 }, roomThemes.office1);
      createOffice("office2", { x: -15, z: 0 }, { width: 8, depth: 8 }, roomThemes.office2);
      createOffice("office3", { x: -15, z: 8 }, { width: 8, depth: 8 }, roomThemes.office3);
      
      // Create conference room on the right side
      createConferenceRoom();
      
      // Create common area
      createCommonArea();

      // Enable shadows
      floor.receiveShadows = true;

      return scene;
    };

    const scene = createScene();
    sceneRef.current = scene;

    engine.runRenderLoop(() => {
      scene.render();
    });

    const handleResize = () => {
      engine.resize();
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      scene.dispose();
      engine.dispose();
    };
  }, [currentFloor]);

  // Update agents and handle office states
  useEffect(() => {
    if (!sceneRef.current) return;

    // Clear existing agent meshes
    Object.values(agentMeshesRef.current).forEach(mesh => {
      mesh.dispose();
    });
    agentMeshesRef.current = {};

    // Map agents to offices
    const officeIds = ['office1', 'office2', 'office3'];
    const advancedTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI("AgentUI");
    
    let agentIndex = 0;
    Object.values(agents).forEach(agent => {
      if (agentIndex >= officeIds.length) {
        // Extra agents go to common area
        const agentGroup = new BABYLON.TransformNode(agent.id);
        
        const agentBody = BABYLON.MeshBuilder.CreateCylinder(agent.id + "_body", {
          height: 3,
          diameterTop: 0.8,
          diameterBottom: 1
        }, sceneRef.current);
        
        agentBody.position = new BABYLON.Vector3(
          Math.random() * 6 - 3,
          1.5,
          Math.random() * 6 - 3
        );

        // Agent material
        const agentMat = new BABYLON.PBRMaterial(agent.id + "Mat", sceneRef.current);
        const colorMap = {
          management: new BABYLON.Color3(0.2, 0.4, 0.8),
          buyer: new BABYLON.Color3(0.2, 0.6, 0.3),
          seller: new BABYLON.Color3(0.8, 0.3, 0.3),
          operations: new BABYLON.Color3(0.5, 0.3, 0.7),
        };
        agentMat.albedoColor = colorMap[agent.department] || new BABYLON.Color3(0.5, 0.5, 0.5);
        agentMat.metallic = 0.1;
        agentMat.roughness = 0.8;
        agentBody.material = agentMat;
        agentBody.parent = agentGroup;
        
        agentMeshesRef.current[agent.id] = agentGroup;
        return;
      }

      const officeId = officeIds[agentIndex];
      agentIndex++;

      // Create agent mesh
      const agentGroup = new BABYLON.TransformNode(agent.id);
      
      const agentBody = BABYLON.MeshBuilder.CreateCylinder(agent.id + "_body", {
        height: 3,
        diameterTop: 0.8,
        diameterBottom: 1
      }, sceneRef.current);
      
      // Position agent based on status
      if (agent.enabled) {
        // Agent is in common area
        agentBody.position = new BABYLON.Vector3(
          Math.random() * 6 - 3,
          1.5,
          Math.random() * 6 - 3
        );
        
        // Open door and turn on light
        if (doorsRef.current[officeId]) {
          BABYLON.Animation.CreateAndStartAnimation(
            "doorOpen",
            doorsRef.current[officeId],
            "rotation.y",
            30,
            15,
            doorsRef.current[officeId].rotation.y,
            -Math.PI / 2,
            BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
          );
        }
        if (lightsRef.current[officeId]) {
          lightsRef.current[officeId].intensity = 0.5;
        }
      } else {
        // Agent is in their office
        const officePos = officeId === 'office1' ? { x: -15, z: -8 } :
                         officeId === 'office2' ? { x: -15, z: 0 } :
                         { x: -15, z: 8 };
        
        agentBody.position = new BABYLON.Vector3(
          officePos.x,
          1.5,
          officePos.z
        );
        
        // Close door and turn off light
        if (doorsRef.current[officeId]) {
          BABYLON.Animation.CreateAndStartAnimation(
            "doorClose",
            doorsRef.current[officeId],
            "rotation.y",
            30,
            15,
            doorsRef.current[officeId].rotation.y,
            0,
            BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
          );
        }
        if (lightsRef.current[officeId]) {
          lightsRef.current[officeId].intensity = 0;
        }
      }

      // Agent material
      const agentMat = new BABYLON.PBRMaterial(agent.id + "Mat", sceneRef.current);
      const colorMap = {
        management: new BABYLON.Color3(0.2, 0.4, 0.8),
        buyer: new BABYLON.Color3(0.2, 0.6, 0.3),
        seller: new BABYLON.Color3(0.8, 0.3, 0.3),
        operations: new BABYLON.Color3(0.5, 0.3, 0.7),
      };
      agentMat.albedoColor = colorMap[agent.department] || new BABYLON.Color3(0.5, 0.5, 0.5);
      agentMat.metallic = 0.1;
      agentMat.roughness = 0.8;
      agentBody.material = agentMat;
      agentBody.parent = agentGroup;

      // Make clickable
      agentBody.actionManager = new BABYLON.ActionManager(sceneRef.current);
      agentBody.actionManager.registerAction(
        new BABYLON.ExecuteCodeAction(
          BABYLON.ActionManager.OnPickTrigger,
          () => onAgentClick(agent)
        )
      );

      // Add name label
      const label = new GUI.Rectangle();
      label.width = "100px";
      label.height = "25px";
      label.cornerRadius = 5;
      label.color = "white";
      label.thickness = 0;
      label.background = agent.department === 'management' ? "rgba(25, 118, 210, 0.9)" :
                       agent.department === 'buyer' ? "rgba(46, 125, 50, 0.9)" :
                       agent.department === 'seller' ? "rgba(211, 47, 47, 0.9)" :
                       "rgba(156, 39, 176, 0.9)";
      advancedTexture.addControl(label);

      const text = new GUI.TextBlock();
      text.text = agent.name;
      text.color = "white";
      text.fontSize = 12;
      text.fontWeight = "bold";
      label.addControl(text);

      label.linkWithMesh(agentBody);
      label.linkOffsetY = -30;

      agentMeshesRef.current[agent.id] = agentGroup;
    });
  }, [agents, selectedAgent, onAgentClick]);

  // Simple agent movement animation
  useEffect(() => {
    if (!sceneRef.current) return;

    let time = 0;
    const animateAgents = () => {
      time += 0.01;
      
      Object.entries(agents).forEach(agent => {
        const agentMesh = agentMeshesRef.current[agent[0]];
        if (agentMesh && agent[1].enabled) {
          const body = agentMesh.getChildMeshes()[0];
          if (body) {
            // Keep agents in common area bounds
            if (body.position.x > -10 && body.position.x < 10) {
              body.position.x += Math.sin(time + agent[0].length) * 0.02;
              body.position.z += Math.cos(time * 0.7 + agent[0].length) * 0.02;
              
              body.position.x = Math.max(-8, Math.min(8, body.position.x));
              body.position.z = Math.max(-8, Math.min(8, body.position.z));
            }
          }
        }
      });
    };

    sceneRef.current.registerBeforeRender(animateAgents);

    return () => {
      if (sceneRef.current) {
        sceneRef.current.unregisterBeforeRender(animateAgents);
      }
    };
  }, [agents]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: '100%',
        height: '600px',
        borderRadius: '8px',
        cursor: 'grab',
        display: 'block',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
      }}
    />
  );
};

export default Office3D;