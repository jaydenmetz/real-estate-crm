// File: components/dashboards/Office3D.jsx
// Luxury Real Estate Office - 3D Implementation based on 2D Floor Plan

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

      // Camera setup - adjusted for larger office
      const camera = new BABYLON.ArcRotateCamera(
        "camera",
        -Math.PI / 3,
        Math.PI / 3.5,
        100,
        new BABYLON.Vector3(0, 0, -10),
        scene
      );
      camera.attachControl(canvasRef.current, true);
      camera.lowerRadiusLimit = 40;
      camera.upperRadiusLimit = 120;
      camera.wheelPrecision = 15;
      camera.upperBetaLimit = Math.PI / 2.1;
      camera.lowerBetaLimit = Math.PI / 6;

      // Ambient lighting
      const ambientLight = new BABYLON.HemisphericLight("ambient", new BABYLON.Vector3(0, 1, 0), scene);
      ambientLight.intensity = 0.8;
      ambientLight.diffuse = new BABYLON.Color3(1, 0.98, 0.95);
      ambientLight.groundColor = new BABYLON.Color3(0.6, 0.55, 0.5);

      // Main directional light
      const sunLight = new BABYLON.DirectionalLight("sun", new BABYLON.Vector3(-1, -2, -1), scene);
      sunLight.position = new BABYLON.Vector3(20, 40, 20);
      sunLight.intensity = 0.5;

      // Shadow generator with softer shadows
      const shadowGenerator = new BABYLON.ShadowGenerator(2048, sunLight);
      shadowGenerator.useBlurExponentialShadowMap = true;
      shadowGenerator.blurKernel = 64;
      shadowGenerator.useKernelBlur = true;
      shadowGenerator.blurScale = 2;

      // Materials
      const materials = {
        floor: (() => {
          const mat = new BABYLON.PBRMaterial("floor", scene);
          mat.albedoColor = new BABYLON.Color3(0.95, 0.93, 0.91);
          mat.metallic = 0.1;
          mat.roughness = 0.3;
          return mat;
          // Add window on back wall
          const window = BABYLON.MeshBuilder.CreateBox(`${id}_window`, {
            width: 8,
            height: 5,
            depth: 0.1
          }, scene);
          window.position.set(
            position.x + item.x,
            5,
            position.z - 10 + 0.25
          );
          window.material = materials.glass;
          window.parent = room;
        })(),
        wall: (() => {
          const mat = new BABYLON.PBRMaterial("wall", scene);
          mat.albedoColor = new BABYLON.Color3(0.88, 0.88, 0.88);
          mat.metallic = 0;
          mat.roughness = 0.5;
          return mat;
        })(),
        glass: (() => {
          const mat = new BABYLON.PBRMaterial("glass", scene);
          mat.albedoColor = new BABYLON.Color3(0.5, 0.8, 1);
          mat.metallic = 0.1;
          mat.roughness = 0;
          mat.alpha = 0.3;
          mat.transparencyMode = BABYLON.Material.MATERIAL_ALPHABLEND;
          return mat;
        })(),
        door: (() => {
          const mat = new BABYLON.PBRMaterial("door", scene);
          mat.albedoColor = new BABYLON.Color3(0.3, 0.2, 0.15);
          mat.metallic = 0.1;
          mat.roughness = 0.6;
          return mat;
        })(),
        doorFrame: (() => {
          const mat = new BABYLON.PBRMaterial("doorFrame", scene);
          mat.albedoColor = new BABYLON.Color3(0.2, 0.15, 0.1);
          mat.metallic = 0.2;
          mat.roughness = 0.4;
          return mat;
        })(),
        furniture: (() => {
          const mat = new BABYLON.PBRMaterial("furniture", scene);
          mat.albedoColor = new BABYLON.Color3(0.7, 0.65, 0.6);
          mat.metallic = 0.1;
          mat.roughness = 0.5;
          return mat;
        })(),
        darkFurniture: (() => {
          const mat = new BABYLON.PBRMaterial("darkFurniture", scene);
          mat.albedoColor = new BABYLON.Color3(0.2, 0.18, 0.16);
          mat.metallic = 0.1;
          mat.roughness = 0.6;
          return mat;
        })(),
        couch: (() => {
          const mat = new BABYLON.PBRMaterial("couch", scene);
          mat.albedoColor = new BABYLON.Color3(0.42, 0.36, 0.58); // Purple tone
          mat.metallic = 0;
          mat.roughness = 0.8;
          return mat;
        })(),
        reception: (() => {
          const mat = new BABYLON.PBRMaterial("reception", scene);
          mat.albedoColor = new BABYLON.Color3(0.88, 0.95, 0.94); // Teal tone
          mat.metallic = 0.1;
          mat.roughness = 0.3;
          return mat;
        })(),
        wellness: (() => {
          const mat = new BABYLON.PBRMaterial("wellness", scene);
          mat.albedoColor = new BABYLON.Color3(0.91, 0.96, 0.91); // Green tone
          mat.metallic = 0;
          mat.roughness = 0.4;
          return mat;
        })(),
        metal: (() => {
          const mat = new BABYLON.PBRMaterial("metal", scene);
          mat.albedoColor = new BABYLON.Color3(0.7, 0.7, 0.7);
          mat.metallic = 0.9;
          mat.roughness = 0.3;
          return mat;
        })()
      };

      // Office dimensions (scaled from feet to Babylon units - 1 unit = 1 foot)
      const OFFICE_WIDTH = 100; // Total width
      const OFFICE_DEPTH = 75;  // Total depth
      const WALL_HEIGHT = 10;
      const WALL_THICKNESS = 0.5;

      // Create floor
      const floor = BABYLON.MeshBuilder.CreateGround("floor", {
        width: OFFICE_WIDTH,
        height: OFFICE_DEPTH
      }, scene);
      floor.material = materials.floor;
      floor.receiveShadows = true;

      // Create ceiling
      const ceiling = BABYLON.MeshBuilder.CreateGround("ceiling", {
        width: OFFICE_WIDTH,
        height: OFFICE_DEPTH
      }, scene);
      ceiling.position.y = WALL_HEIGHT;
      ceiling.rotation.x = Math.PI;
      ceiling.material = materials.wall;

      // Create external walls
      const createExternalWalls = () => {
        // North wall
        const northWall = BABYLON.MeshBuilder.CreateBox("northWall", {
          width: OFFICE_WIDTH,
          height: WALL_HEIGHT,
          depth: WALL_THICKNESS
        }, scene);
        northWall.position.set(0, WALL_HEIGHT/2, -OFFICE_DEPTH/2);
        northWall.material = materials.wall;

        // South wall with main entrance
        const southLeftWall = BABYLON.MeshBuilder.CreateBox("southLeftWall", {
          width: OFFICE_WIDTH/2 - 5,
          height: WALL_HEIGHT,
          depth: WALL_THICKNESS
        }, scene);
        southLeftWall.position.set(-OFFICE_WIDTH/4 - 2.5, WALL_HEIGHT/2, OFFICE_DEPTH/2);
        southLeftWall.material = materials.wall;

        const southRightWall = BABYLON.MeshBuilder.CreateBox("southRightWall", {
          width: OFFICE_WIDTH/2 - 5,
          height: WALL_HEIGHT,
          depth: WALL_THICKNESS
        }, scene);
        southRightWall.position.set(OFFICE_WIDTH/4 + 2.5, WALL_HEIGHT/2, OFFICE_DEPTH/2);
        southRightWall.material = materials.wall;

        // East wall
        const eastWall = BABYLON.MeshBuilder.CreateBox("eastWall", {
          width: WALL_THICKNESS,
          height: WALL_HEIGHT,
          depth: OFFICE_DEPTH
        }, scene);
        eastWall.position.set(OFFICE_WIDTH/2, WALL_HEIGHT/2, 0);
        eastWall.material = materials.wall;

        // West wall
        const westWall = BABYLON.MeshBuilder.CreateBox("westWall", {
          width: WALL_THICKNESS,
          height: WALL_HEIGHT,
          depth: OFFICE_DEPTH
        }, scene);
        westWall.position.set(-OFFICE_WIDTH/2, WALL_HEIGHT/2, 0);
        westWall.material = materials.wall;
      };

      // Create room with specific layout
      const createRoom = (id, position, size, config = {}) => {
        const room = new BABYLON.TransformNode(`room_${id}`);
        
        // Room-specific floor color
        if (config.floorColor) {
          const roomFloor = BABYLON.MeshBuilder.CreateGround(`${id}_floor`, {
            width: size.width,
            height: size.depth
          }, scene);
          roomFloor.position.set(position.x, 0.01, position.z);
          roomFloor.material = config.floorMaterial || materials.floor;
          roomFloor.receiveShadows = true;
          roomFloor.parent = room;
        }

        // Create walls based on configuration
        if (config.walls) {
          config.walls.forEach(wall => {
            if (wall.type === 'glass') {
              // Glass wall
              const glassWall = BABYLON.MeshBuilder.CreateBox(`${id}_glass_${wall.side}`, {
                width: wall.width || size.width,
                height: WALL_HEIGHT * 0.8,
                depth: WALL_THICKNESS / 2
              }, scene);
              glassWall.position.set(
                position.x + (wall.offsetX || 0),
                WALL_HEIGHT * 0.4,
                position.z + (wall.offsetZ || 0)
              );
              if (wall.rotation) glassWall.rotation.y = wall.rotation;
              glassWall.material = materials.glass;
              glassWall.parent = room;
            } else {
              // Regular solid wall
              const wallMesh = BABYLON.MeshBuilder.CreateBox(`${id}_wall_${wall.side}`, {
                width: wall.width || size.width,
                height: WALL_HEIGHT,
                depth: WALL_THICKNESS
              }, scene);
              wallMesh.position.set(
                position.x + (wall.offsetX || 0),
                WALL_HEIGHT / 2,
                position.z + (wall.offsetZ || 0)
              );
              if (wall.rotation) wallMesh.rotation.y = wall.rotation;
              wallMesh.material = materials.wall;
              wallMesh.parent = room;
              shadowGenerator.addShadowCaster(wallMesh);
            }
          });
        }

        // Add door if specified
        if (config.door) {
          // Door frame
          const doorFrame = BABYLON.MeshBuilder.CreateBox(`${id}_doorFrame`, {
            width: config.door.width || 3,
            height: WALL_HEIGHT - 7.2,
            depth: WALL_THICKNESS * 1.2
          }, scene);
          doorFrame.position.set(
            position.x + (config.door.offsetX || 0),
            WALL_HEIGHT - (WALL_HEIGHT - 7.2)/2,
            position.z + (config.door.offsetZ || 0)
          );
          if (config.door.rotation) doorFrame.rotation.y = config.door.rotation;
          doorFrame.material = materials.doorFrame;
          doorFrame.parent = room;

          // Door
          const door = BABYLON.MeshBuilder.CreateBox(`${id}_door`, {
            width: (config.door.width || 3) - 0.2,
            height: 7,
            depth: 0.1
          }, scene);
          door.position.set(
            position.x + (config.door.offsetX || 0),
            3.5,
            position.z + (config.door.offsetZ || 0)
          );
          if (config.door.rotation) door.rotation.y = config.door.rotation;
          door.material = materials.door;
          doorsRef.current[id] = door;
          shadowGenerator.addShadowCaster(door);
          door.parent = room;
        }

        // Add furniture based on room type
        if (config.furniture) {
          config.furniture.forEach((item, index) => {
            switch (item.type) {
              case 'desk':
                const desk = BABYLON.MeshBuilder.CreateBox(`${id}_desk_${index}`, {
                  width: item.width || 6,
                  height: 0.2,
                  depth: item.depth || 3
                }, scene);
                desk.position.set(
                  position.x + item.x,
                  2.5,
                  position.z + item.z
                );
                desk.material = materials.furniture;
                shadowGenerator.addShadowCaster(desk);
                desk.parent = room;

                // Desk legs
                for (let i = 0; i < 4; i++) {
                  const leg = BABYLON.MeshBuilder.CreateCylinder(`${id}_desk_leg_${index}_${i}`, {
                    height: 2.5,
                    diameter: 0.2
                  }, scene);
                  const xOffset = (i % 2 === 0) ? -(item.width || 6)/2 + 0.3 : (item.width || 6)/2 - 0.3;
                  const zOffset = (i < 2) ? -(item.depth || 3)/2 + 0.3 : (item.depth || 3)/2 - 0.3;
                  leg.position.set(
                    position.x + item.x + xOffset,
                    1.25,
                    position.z + item.z + zOffset
                  );
                  leg.material = materials.darkFurniture;
                  leg.parent = room;
                }
                break;

              case 'chair':
                const chairSeat = BABYLON.MeshBuilder.CreateBox(`${id}_chair_${index}`, {
                  width: 1.5,
                  height: 0.1,
                  depth: 1.5
                }, scene);
                chairSeat.position.set(
                  position.x + item.x,
                  1.8,
                  position.z + item.z
                );
                chairSeat.material = materials.darkFurniture;
                chairSeat.parent = room;

                const chairBack = BABYLON.MeshBuilder.CreateBox(`${id}_chair_back_${index}`, {
                  width: 1.5,
                  height: 2,
                  depth: 0.1
                }, scene);
                
                // Determine chair rotation based on position relative to table
                let chairRotation = 0;
                if (id === 'conferenceRoom') {
                  if (item.z > 0) chairRotation = Math.PI; // Chairs on far side face towards camera
                  else if (item.z < 0) chairRotation = 0; // Chairs on near side face away
                  else if (item.x < 0) chairRotation = Math.PI/2; // Left end chair
                  else if (item.x > 0) chairRotation = -Math.PI/2; // Right end chair
                }
                
                chairBack.position.set(
                  position.x + item.x - 0.7 * Math.sin(chairRotation),
                  2.8,
                  position.z + item.z - 0.7 * Math.cos(chairRotation)
                );
                chairBack.rotation.y = chairRotation;
                chairBack.material = materials.darkFurniture;
                chairBack.parent = room;
                
                // Also rotate the seat
                chairSeat.rotation.y = chairRotation;
                break;

              case 'couch':
                const couch = BABYLON.MeshBuilder.CreateBox(`${id}_couch_${index}`, {
                  width: item.width || 8,
                  height: 1.5,
                  depth: 3
                }, scene);
                couch.position.set(
                  position.x + item.x,
                  0.75,
                  position.z + item.z
                );
                couch.material = materials.couch;
                shadowGenerator.addShadowCaster(couch);
                couch.parent = room;

                const couchBack = BABYLON.MeshBuilder.CreateBox(`${id}_couch_back_${index}`, {
                  width: item.width || 8,
                  height: 2,
                  depth: 0.5
                }, scene);
                couchBack.position.set(
                  position.x + item.x,
                  2,
                  position.z + item.z - 1.25
                );
                couchBack.material = materials.couch;
                couchBack.parent = room;
                break;

              case 'table':
                const table = BABYLON.MeshBuilder.CreateCylinder(`${id}_table_${index}`, {
                  height: 0.1,
                  diameter: item.diameter || 3
                }, scene);
                table.position.set(
                  position.x + item.x,
                  2,
                  position.z + item.z
                );
                table.material = materials.furniture;
                shadowGenerator.addShadowCaster(table);
                table.parent = room;

                const tableLeg = BABYLON.MeshBuilder.CreateCylinder(`${id}_table_leg_${index}`, {
                  height: 2,
                  diameter: 0.3
                }, scene);
                tableLeg.position.set(
                  position.x + item.x,
                  1,
                  position.z + item.z
                );
                tableLeg.material = materials.darkFurniture;
                tableLeg.parent = room;
                break;

              case 'conferenceTable':
                const confTable = BABYLON.MeshBuilder.CreateBox(`${id}_conf_table_${index}`, {
                  width: item.width || 12,
                  height: 0.2,
                  depth: item.depth || 6
                }, scene);
                confTable.position.set(
                  position.x + item.x,
                  2.5,
                  position.z + item.z
                );
                confTable.material = materials.furniture;
                shadowGenerator.addShadowCaster(confTable);
                confTable.parent = room;
                break;

              case 'receptionDesk':
                // Curved reception desk using torus
                const receptionDesk = BABYLON.MeshBuilder.CreateTorus(`${id}_reception_${index}`, {
                  diameter: 8,
                  thickness: 2,
                  tessellation: 32
                }, scene);
                receptionDesk.position.set(
                  position.x + item.x,
                  2.5,
                  position.z + item.z
                );
                receptionDesk.rotation.x = Math.PI / 2;
                receptionDesk.scaling.y = 0.5; // Make it more desk-like
                receptionDesk.material = materials.reception;
                shadowGenerator.addShadowCaster(receptionDesk);
                receptionDesk.parent = room;
                break;

              case 'cabinet':
                const cabinet = BABYLON.MeshBuilder.CreateBox(`${id}_cabinet_${index}`, {
                  width: item.width || 3,
                  height: 5,
                  depth: item.depth || 1.5
                }, scene);
                cabinet.position.set(
                  position.x + item.x,
                  2.5,
                  position.z + item.z
                );
                cabinet.material = materials.darkFurniture;
                shadowGenerator.addShadowCaster(cabinet);
                cabinet.parent = room;
                
                // Cabinet handles
                for (let i = 0; i < 3; i++) {
                  const handle = BABYLON.MeshBuilder.CreateCylinder(`${id}_handle_${index}_${i}`, {
                    height: 0.3,
                    diameter: 0.1
                  }, scene);
                  handle.position.set(
                    position.x + item.x + (item.width || 3)/2 - 0.1,
                    3.5 - i * 1.5,
                    position.z + item.z
                  );
                  handle.rotation.z = Math.PI/2;
                  handle.material = materials.metal;
                  handle.parent = room;
                }
                break;

              case 'whiteboard':
                const board = BABYLON.MeshBuilder.CreateBox(`${id}_whiteboard_${index}`, {
                  width: item.width || 8,
                  height: 4,
                  depth: 0.2
                }, scene);
                board.position.set(
                  position.x + item.x,
                  5,
                  position.z + item.z
                );
                const boardMat = new BABYLON.PBRMaterial(`${id}_board_mat_${index}`, scene);
                boardMat.albedoColor = new BABYLON.Color3(0.98, 0.98, 0.98);
                boardMat.metallic = 0.1;
                boardMat.roughness = 0.3;
                board.material = boardMat;
                board.parent = room;
                
                // Whiteboard frame
                const frame = BABYLON.MeshBuilder.CreateBox(`${id}_frame_${index}`, {
                  width: (item.width || 8) + 0.3,
                  height: 4.3,
                  depth: 0.3
                }, scene);
                frame.position.set(
                  position.x + item.x,
                  5,
                  position.z + item.z + 0.05
                );
                frame.material = materials.darkFurniture;
                frame.parent = room;
                
                // Marker tray
                const tray = BABYLON.MeshBuilder.CreateBox(`${id}_tray_${index}`, {
                  width: (item.width || 8) * 0.8,
                  height: 0.2,
                  depth: 0.4
                }, scene);
                tray.position.set(
                  position.x + item.x,
                  3,
                  position.z + item.z + 0.2
                );
                tray.material = materials.metal;
                tray.parent = room;
                break;

              case 'plant':
                const pot = BABYLON.MeshBuilder.CreateCylinder(`${id}_pot_${index}`, {
                  height: 1,
                  diameterTop: 1,
                  diameterBottom: 0.8
                }, scene);
                pot.position.set(
                  position.x + item.x,
                  0.5,
                  position.z + item.z
                );
                pot.material = materials.darkFurniture;
                pot.parent = room;

                const plant = BABYLON.MeshBuilder.CreateSphere(`${id}_plant_${index}`, {
                  diameter: 2,
                  segments: 16
                }, scene);
                plant.position.set(
                  position.x + item.x,
                  1.5,
                  position.z + item.z
                );
                const plantMat = new BABYLON.PBRMaterial(`${id}_plant_mat_${index}`, scene);
                plantMat.albedoColor = new BABYLON.Color3(0.2, 0.7, 0.2);
                plantMat.roughness = 0.8;
                plant.material = plantMat;
                plant.parent = room;
                break;
            }
          });
        }

        // Add room lighting
        if (config.lighting) {
          const roomLight = new BABYLON.PointLight(`${id}_light`,
            new BABYLON.Vector3(position.x, WALL_HEIGHT - 1, position.z),
            scene
          );
          roomLight.intensity = config.lighting.intensity || 0.5;
          roomLight.diffuse = config.lighting.color || new BABYLON.Color3(1, 0.95, 0.8);
          lightsRef.current[id] = roomLight;
          
          // Add ceiling light fixture for closed offices
          if (config.walls && config.walls.some(w => w.type === 'solid')) {
            const lightFixture = BABYLON.MeshBuilder.CreateCylinder(`${id}_fixture`, {
              height: 0.5,
              diameterTop: 2,
              diameterBottom: 1.5
            }, scene);
            lightFixture.position.set(position.x, WALL_HEIGHT - 0.25, position.z);
            const fixtureMat = new BABYLON.PBRMaterial(`${id}_fixture_mat`, scene);
            fixtureMat.albedoColor = new BABYLON.Color3(0.9, 0.9, 0.9);
            fixtureMat.metallic = 0.8;
            fixtureMat.roughness = 0.2;
            lightFixture.material = fixtureMat;
            lightFixture.parent = room;
          }
        }

        // Add windows for offices on exterior walls
        if (config.hasWindow) {
          const windowMesh = BABYLON.MeshBuilder.CreateBox(`${id}_window`, {
            width: config.windowWidth || 8,
            height: 5,
            depth: 0.1
          }, scene);
          windowMesh.position.set(
            position.x + (config.windowOffsetX || 0),
            5,
            position.z + (config.windowOffsetZ || 0)
          );
          if (config.windowRotation) windowMesh.rotation.y = config.windowRotation;
          windowMesh.material = materials.glass;
          windowMesh.parent = room;
        }

        officesRef.current[id] = room;
        return room;
      };

      // Build the office layout based on 2D floor plan
      createExternalWalls();

      // Top row offices - CLOSED IN WITH SOLID WALLS
      createRoom('partnerOffice', { x: -40, z: -27.5 }, { width: 20, depth: 20 }, {
        floorColor: true,
        floorMaterial: (() => {
          const mat = materials.floor.clone();
          mat.albedoColor = new BABYLON.Color3(0.91, 0.94, 1);
          return mat;
        })(),
        walls: [
          // Solid front wall with door opening
          { side: 'frontLeft', type: 'solid', width: 8.5, offsetX: -5.75, offsetZ: 10, rotation: 0 },
          { side: 'frontRight', type: 'solid', width: 8.5, offsetX: 5.75, offsetZ: 10, rotation: 0 },
          // Side walls
          { side: 'left', type: 'solid', width: 20, offsetX: -10, offsetZ: 0, rotation: Math.PI/2 },
          { side: 'right', type: 'solid', width: 20, offsetX: 10, offsetZ: 0, rotation: Math.PI/2 }
        ],
        door: { offsetX: 0, offsetZ: 10, width: 3 },
        furniture: [
          { type: 'desk', x: 0, z: -3, width: 8, depth: 4 },
          { type: 'chair', x: 0, z: 0 },
          { type: 'chair', x: -3, z: -5 },
          { type: 'chair', x: 3, z: -5 },
          { type: 'plant', x: -8, z: -8 },
          { type: 'cabinet', x: 8, z: -8 }
        ],
        lighting: { intensity: 0.8 },
        hasWindow: true,
        windowOffsetZ: -9.95,
        windowWidth: 10
      });

      createRoom('seniorOffice1', { x: -15, z: -27.5 }, { width: 18, depth: 20 }, {
        floorColor: true,
        floorMaterial: (() => {
          const mat = materials.floor.clone();
          mat.albedoColor = new BABYLON.Color3(0.91, 0.94, 1);
          return mat;
        })(),
        walls: [
          // Solid front wall with door opening
          { side: 'frontLeft', type: 'solid', width: 7.5, offsetX: -5.25, offsetZ: 10, rotation: 0 },
          { side: 'frontRight', type: 'solid', width: 7.5, offsetX: 5.25, offsetZ: 10, rotation: 0 },
          // Side walls
          { side: 'left', type: 'solid', width: 20, offsetX: -9, offsetZ: 0, rotation: Math.PI/2 },
          { side: 'right', type: 'solid', width: 20, offsetX: 9, offsetZ: 0, rotation: Math.PI/2 }
        ],
        door: { offsetX: 0, offsetZ: 10, width: 3 },
        furniture: [
          { type: 'desk', x: 0, z: -3, width: 6, depth: 3 },
          { type: 'chair', x: 0, z: 0 },
          { type: 'chair', x: -2, z: -5 },
          { type: 'chair', x: 2, z: -5 },
          { type: 'cabinet', x: 7, z: -5 }
        ],
        lighting: { intensity: 0.7 },
        hasWindow: true,
        windowOffsetZ: -9.95,
        windowWidth: 8
      });

      createRoom('seniorOffice2', { x: 8, z: -27.5 }, { width: 18, depth: 20 }, {
        floorColor: true,
        floorMaterial: (() => {
          const mat = materials.floor.clone();
          mat.albedoColor = new BABYLON.Color3(0.91, 0.94, 1);
          return mat;
        })(),
        walls: [
          // Solid front wall with door opening
          { side: 'frontLeft', type: 'solid', width: 7.5, offsetX: -5.25, offsetZ: 10, rotation: 0 },
          { side: 'frontRight', type: 'solid', width: 7.5, offsetX: 5.25, offsetZ: 10, rotation: 0 },
          // Side walls
          { side: 'left', type: 'solid', width: 20, offsetX: -9, offsetZ: 0, rotation: Math.PI/2 },
          { side: 'right', type: 'solid', width: 20, offsetX: 9, offsetZ: 0, rotation: Math.PI/2 }
        ],
        door: { offsetX: 0, offsetZ: 10, width: 3 },
        furniture: [
          { type: 'desk', x: 0, z: -3, width: 6, depth: 3 },
          { type: 'chair', x: 0, z: 0 },
          { type: 'chair', x: -2, z: -5 },
          { type: 'chair', x: 2, z: -5 },
          { type: 'cabinet', x: 7, z: -5 }
        ],
        lighting: { intensity: 0.7 },
        hasWindow: true,
        windowOffsetZ: -9.95,
        windowWidth: 8
      });

      createRoom('conferenceRoom', { x: 32, z: -27.5 }, { width: 33, depth: 20 }, {
        floorColor: true,
        floorMaterial: (() => {
          const mat = materials.floor.clone();
          mat.albedoColor = new BABYLON.Color3(1, 0.95, 0.88);
          return mat;
        })(),
        walls: [
          // Solid front wall with door opening - larger door for conference room
          { side: 'frontLeft', type: 'solid', width: 14.5, offsetX: -9.25, offsetZ: 10, rotation: 0 },
          { side: 'frontRight', type: 'solid', width: 14.5, offsetX: 9.25, offsetZ: 10, rotation: 0 },
          // Side walls
          { side: 'left', type: 'solid', width: 20, offsetX: -16.5, offsetZ: 0, rotation: Math.PI/2 },
          { side: 'right', type: 'solid', width: 20, offsetX: 16.5, offsetZ: 0, rotation: Math.PI/2 }
        ],
        door: { offsetX: 0, offsetZ: 10, width: 4 },
        furniture: [
          { type: 'conferenceTable', x: 0, z: 0, width: 14, depth: 7 },
          // Chairs around the table
          { type: 'chair', x: -6, z: -3 },
          { type: 'chair', x: -3, z: -3 },
          { type: 'chair', x: 0, z: -3 },
          { type: 'chair', x: 3, z: -3 },
          { type: 'chair', x: 6, z: -3 },
          { type: 'chair', x: -6, z: 3 },
          { type: 'chair', x: -3, z: 3 },
          { type: 'chair', x: 0, z: 3 },
          { type: 'chair', x: 3, z: 3 },
          { type: 'chair', x: 6, z: 3 },
          // Head chairs
          { type: 'chair', x: -7, z: 0 },
          { type: 'chair', x: 7, z: 0 },
          // Whiteboard
          { type: 'whiteboard', x: 0, z: -9 }
        ],
        lighting: { intensity: 0.9, color: new BABYLON.Color3(1, 0.98, 0.95) },
        hasWindow: true,
        windowOffsetZ: -9.95,
        windowWidth: 20,
        windowOffsetX: 0
      });

      // Middle row - CLOSED IN MANAGER'S OFFICE
      createRoom('managerOffice', { x: -40, z: 0 }, { width: 22, depth: 20 }, {
        floorColor: true,
        floorMaterial: (() => {
          const mat = materials.floor.clone();
          mat.albedoColor = new BABYLON.Color3(0.91, 0.94, 1);
          return mat;
        })(),
        walls: [
          // Solid front wall (facing east) with door opening
          { side: 'frontTop', type: 'solid', width: 8.5, offsetX: 11, offsetZ: -5.75, rotation: Math.PI/2 },
          { side: 'frontBottom', type: 'solid', width: 8.5, offsetX: 11, offsetZ: 5.75, rotation: Math.PI/2 },
          // Other walls
          { side: 'top', type: 'solid', width: 22, offsetX: 0, offsetZ: -10, rotation: 0 },
          { side: 'bottom', type: 'solid', width: 22, offsetX: 0, offsetZ: 10, rotation: 0 },
          { side: 'back', type: 'solid', width: 20, offsetX: -11, offsetZ: 0, rotation: Math.PI/2 }
        ],
        door: { offsetX: 11, offsetZ: 0, rotation: Math.PI/2, width: 3 },
        furniture: [
          { type: 'desk', x: -3, z: 0, width: 8, depth: 4 },
          { type: 'chair', x: 0, z: 0 },
          { type: 'couch', x: 5, z: 0, width: 6 },
          { type: 'table', x: 5, z: 5, diameter: 2 },
          { type: 'plant', x: -9, z: -8 },
          { type: 'cabinet', x: -9, z: 8, width: 4 }
        ],
        lighting: { intensity: 0.8 },
        hasWindow: true,
        windowOffsetX: -10.95,
        windowOffsetZ: 0,
        windowRotation: Math.PI/2,
        windowWidth: 10
      });

      // Wellness Zone
      createRoom('wellnessZone', { x: 35, z: 0 }, { width: 29, depth: 14 }, {
        floorColor: true,
        floorMaterial: materials.wellness,
        furniture: [
          { type: 'couch', x: -8, z: 0, width: 8 },
          { type: 'couch', x: 8, z: 0, width: 8 },
          { type: 'table', x: 0, z: 3, diameter: 2 },
          { type: 'plant', x: -12, z: -5 },
          { type: 'plant', x: 12, z: 5 }
        ],
        lighting: { intensity: 0.4, color: new BABYLON.Color3(0.9, 1, 0.9) }
      });

      // Refreshment Bar
      createRoom('refreshmentBar', { x: 35, z: 15 }, { width: 29, depth: 10 }, {
        floorColor: true,
        floorMaterial: (() => {
          const mat = materials.floor.clone();
          mat.albedoColor = new BABYLON.Color3(1, 0.97, 0.88);
          return mat;
        })(),
        furniture: [
          { type: 'table', x: 0, z: 0, diameter: 6 },
          { type: 'chair', x: -3, z: 0 },
          { type: 'chair', x: 3, z: 0 },
          { type: 'chair', x: 0, z: 3 }
        ],
        lighting: { intensity: 0.5 }
      });

      // Bottom row
      createRoom('reception', { x: -40, z: 27.5 }, { width: 22, depth: 20 }, {
        floorColor: true,
        floorMaterial: materials.reception,
        walls: [
          { side: 'front', type: 'glass', width: 22, offsetZ: -10, rotation: 0 }
        ],
        door: { offsetX: 0, offsetZ: -10, width: 4 },
        furniture: [
          { type: 'receptionDesk', x: 0, z: 0 },
          { type: 'chair', x: 0, z: 2 },
          { type: 'chair', x: -5, z: -5 },
          { type: 'chair', x: 5, z: -5 },
          { type: 'plant', x: -8, z: 8 },
          { type: 'plant', x: 8, z: 8 }
        ],
        lighting: { intensity: 0.6, color: new BABYLON.Color3(0.95, 1, 0.98) }
      });

      createRoom('clientLounge', { x: -12, z: 27.5 }, { width: 34, depth: 20 }, {
        floorColor: true,
        floorMaterial: (() => {
          const mat = materials.floor.clone();
          mat.albedoColor = new BABYLON.Color3(0.95, 0.9, 0.96);
          return mat;
        })(),
        furniture: [
          { type: 'couch', x: -10, z: -5, width: 10 },
          { type: 'couch', x: -10, z: 5, width: 10 },
          { type: 'couch', x: 10, z: 0, width: 8 },
          { type: 'table', x: 0, z: 0, diameter: 4 },
          { type: 'table', x: 10, z: -7, diameter: 2 },
          { type: 'chair', x: 10, z: 7 }
        ],
        lighting: { intensity: 0.5, color: new BABYLON.Color3(0.95, 0.9, 1) }
      });

      createRoom('leadLounge', { x: 28, z: 27.5 }, { width: 35, depth: 20 }, {
        floorColor: true,
        floorMaterial: (() => {
          const mat = materials.floor.clone();
          mat.albedoColor = new BABYLON.Color3(0.89, 0.95, 0.99);
          return mat;
        })(),
        furniture: [
          { type: 'couch', x: -12, z: -5, width: 8 },
          { type: 'couch', x: -12, z: 5, width: 8 },
          { type: 'couch', x: 12, z: -5, width: 8 },
          { type: 'couch', x: 12, z: 5, width: 8 },
          { type: 'table', x: 0, z: 0, diameter: 5 },
          { type: 'chair', x: 0, z: -8 },
          { type: 'chair', x: 0, z: 8 }
        ],
        lighting: { intensity: 0.5, color: new BABYLON.Color3(0.9, 0.95, 1) }
      });

      // Central Open Common Area
      const commonAreaFloor = BABYLON.MeshBuilder.CreateGround("commonArea", {
        width: 40,
        height: 26
      }, scene);
      commonAreaFloor.position.set(0, 0.01, 0);
      const commonMat = materials.floor.clone();
      commonMat.albedoColor = new BABYLON.Color3(0.98, 0.98, 0.98);
      commonAreaFloor.material = commonMat;
      commonAreaFloor.receiveShadows = true;

      // Common area furniture
      const commonTable = BABYLON.MeshBuilder.CreateCylinder("commonTable", {
        height: 0.2,
        diameter: 8
      }, scene);
      commonTable.position.set(0, 2, 0);
      commonTable.material = materials.furniture;
      shadowGenerator.addShadowCaster(commonTable);

      // Add some plants around common area
      const plantPositions = [
        { x: -15, z: -10 },
        { x: 15, z: 10 },
        { x: -15, z: 10 },
        { x: 15, z: -10 }
      ];
      
      plantPositions.forEach((pos, i) => {
        const pot = BABYLON.MeshBuilder.CreateCylinder(`common_pot_${i}`, {
          height: 1.5,
          diameterTop: 1.5,
          diameterBottom: 1
        }, scene);
        pot.position.set(pos.x, 0.75, pos.z);
        pot.material = materials.darkFurniture;

        const plant = BABYLON.MeshBuilder.CreateSphere(`common_plant_${i}`, {
          diameter: 3,
          segments: 16
        }, scene);
        plant.position.set(pos.x, 2, pos.z);
        const plantMat = new BABYLON.PBRMaterial(`common_plant_mat_${i}`, scene);
        plantMat.albedoColor = new BABYLON.Color3(0.2, 0.7, 0.2);
        plantMat.roughness = 0.8;
        plant.material = plantMat;
      });

      // Enable shadows
      floor.receiveShadows = true;
      ceiling.receiveShadows = true;

      // Add reflection probe for better visual quality
      const probe = new BABYLON.ReflectionProbe("main", 512, scene);
      probe.renderList.push(floor);
      probe.renderList.push(ceiling);

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

    // Store animation functions for cleanup
    const animationFunctions = [];

    // Map agents to offices based on the new layout
    const officeIds = ['partnerOffice', 'managerOffice', 'seniorOffice1', 'seniorOffice2'];
    const loungeIds = ['clientLounge', 'leadLounge'];
    const advancedTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI("AgentUI");
    
    let agentIndex = 0;
    Object.values(agents || {}).forEach(agent => {
      const agentGroup = new BABYLON.TransformNode(agent.id);
      
      const agentBody = BABYLON.MeshBuilder.CreateCylinder(agent.id + "_body", {
        height: 3,
        diameterTop: 0.8,
        diameterBottom: 1
      }, sceneRef.current);
      
      // Assign positions based on agent role
      let position;
      if (agent.role === 'manager' || agent.role === 'partner') {
        // Manager goes to manager office, partner to partner office
        position = agent.role === 'manager' 
          ? new BABYLON.Vector3(-40, 1.5, 0) // Manager office
          : new BABYLON.Vector3(-40, 1.5, -27.5); // Partner office
      } else if (agentIndex < officeIds.length) {
        // Senior agents in senior offices
        const officePositions = {
          seniorOffice1: new BABYLON.Vector3(-15, 1.5, -27.5),
          seniorOffice2: new BABYLON.Vector3(8, 1.5, -27.5)
        };
        position = officePositions[officeIds[agentIndex + 2]] || new BABYLON.Vector3(0, 1.5, 0);
      } else if (agentIndex < officeIds.length + loungeIds.length) {
        // Some agents in lounges
        const loungePositions = {
          clientLounge: new BABYLON.Vector3(-12, 1.5, 27.5),
          leadLounge: new BABYLON.Vector3(28, 1.5, 27.5)
        };
        position = loungePositions[loungeIds[agentIndex - officeIds.length]] || new BABYLON.Vector3(0, 1.5, 0);
      } else {
        // Extra agents in common area
        position = new BABYLON.Vector3(
          Math.random() * 20 - 10,
          1.5,
          Math.random() * 20 - 10
        );
      }
      
      agentBody.position = position;
      agentBody.material = new BABYLON.PBRMaterial(agent.id + "_mat", sceneRef.current);
      
      if (agent.isActive) {
        // Active agent - bright green with emissive glow
        agentBody.material.albedoColor = new BABYLON.Color3(0.2, 0.8, 0.2);
        agentBody.material.emissiveColor = new BABYLON.Color3(0.1, 0.4, 0.1);
        agentBody.material.emissiveIntensity = 0.5;
      } else {
        // Inactive agent - gray
        agentBody.material.albedoColor = new BABYLON.Color3(0.5, 0.5, 0.5);
      }
      agentBody.material.metallic = 0.1;
      agentBody.material.roughness = 0.5;
      
      // Agent head
      const agentHead = BABYLON.MeshBuilder.CreateSphere(agent.id + "_head", {
        diameter: 1
      }, sceneRef.current);
      agentHead.position = position.clone();
      agentHead.position.y += 2;
      agentHead.material = agentBody.material.clone(agent.id + "_head_mat");
      agentHead.parent = agentGroup;
      agentBody.parent = agentGroup;
      
      // Agent name label
      const rect = new GUI.Rectangle();
      rect.width = "150px";
      rect.height = "30px";
      rect.cornerRadius = 10;
      rect.color = "white";
      rect.background = agent.isActive ? "#4CAF50" : "#757575";
      rect.thickness = 0;
      advancedTexture.addControl(rect);
      
      const label = new GUI.TextBlock();
      label.text = agent.name;
      label.color = "white";
      label.fontSize = 14;
      rect.addControl(label);
      
      rect.linkWithMesh(agentHead);
      rect.linkOffsetY = -40;
      
      // Click handler
      agentBody.actionManager = new BABYLON.ActionManager(sceneRef.current);
      agentBody.actionManager.registerAction(
        new BABYLON.ExecuteCodeAction(
          BABYLON.ActionManager.OnPickTrigger,
          () => onAgentClick && onAgentClick(agent)
        )
      );
      
      agentMeshesRef.current[agent.id] = agentGroup;
      
      // Animation for active agents
      if (agent.isActive) {
        // Breathing animation
        const animationFunc = () => {
          if (agentHead && !agentHead.isDisposed()) {
            agentHead.position.y = position.y + 2 + Math.sin(Date.now() * 0.001) * 0.1;
          }
        };
        sceneRef.current.registerBeforeRender(animationFunc);
        animationFunctions.push(animationFunc);
      }
      
      agentIndex++;
    });

    // Animate doors based on occupancy
    Object.entries(doorsRef.current).forEach(([officeId, door]) => {
      const hasAgent = Object.values(agents || {}).some(agent => 
        (agent.role === 'manager' && officeId === 'managerOffice') ||
        (agent.role === 'partner' && officeId === 'partnerOffice')
      );
      
      if (hasAgent && door) {
        // Open door animation - adjust based on door orientation
        const targetRotation = door.rotation.y + Math.PI / 4;
        BABYLON.Animation.CreateAndStartAnimation(
          "doorOpen",
          door,
          "rotation.y",
          30,
          15,
          door.rotation.y,
          targetRotation,
          BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
        );
      }
    });

    // Cleanup function
    return () => {
      // Unregister all animation functions
      animationFunctions.forEach(func => {
        if (sceneRef.current) {
          sceneRef.current.unregisterBeforeRender(func);
        }
      });
      
      // Dispose of the advanced texture
      try {
        if (advancedTexture) {
          advancedTexture.dispose();
        }
      } catch (error) {
        // Texture may already be disposed
        console.log("Advanced texture cleanup:", error.message);
      }
    };

  }, [agents, onAgentClick]);

  // Handle selected agent highlighting
  useEffect(() => {
    if (!selectedAgent || !agentMeshesRef.current[selectedAgent.id] || !sceneRef.current) return;
    
    const agentMesh = agentMeshesRef.current[selectedAgent.id];
    
    // Update material to show selection
    agentMesh.getChildMeshes().forEach(mesh => {
      if (mesh.material) {
        mesh.material.emissiveColor = new BABYLON.Color3(1, 1, 0); // Yellow glow
        mesh.material.emissiveIntensity = 0.3;
      }
    });
    
    return () => {
      // Reset material when deselected
      agentMesh.getChildMeshes().forEach(mesh => {
        if (mesh.material) {
          if (selectedAgent.isActive) {
            mesh.material.emissiveColor = new BABYLON.Color3(0.1, 0.4, 0.1);
            mesh.material.emissiveIntensity = 0.5;
          } else {
            mesh.material.emissiveColor = new BABYLON.Color3(0, 0, 0);
            mesh.material.emissiveIntensity = 0;
          }
        }
      });
    };
  }, [selectedAgent]);

  return (
    <div style={{ width: '100%', height: '600px', position: 'relative' }}>
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />
      {selectedAgent && (
        <div style={{
          position: 'absolute',
          bottom: 20,
          left: 20,
          background: 'rgba(0,0,0,0.8)',
          color: 'white',
          padding: '10px 20px',
          borderRadius: '5px'
        }}>
          <h3>{selectedAgent.name}</h3>
          <p>Status: {selectedAgent.isActive ? 'Active' : 'Inactive'}</p>
          <p>Current Task: {selectedAgent.currentTask || 'Idle'}</p>
        </div>
      )}
    </div>
  );
};

export default Office3D;