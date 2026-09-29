import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { VisorTint, GoogleEarthViewMode, TimeOfSol } from '../types';

interface Mars3dSurfaceProps {
  isWalking: boolean;
  walkDistance: number;
  stepPhase: number;
  pitchOffset: number;
  panOffset: number;
  headingDeg: number;
  visorTint: VisorTint;
  viewMode: GoogleEarthViewMode;
  timeOfSol: TimeOfSol;
  showTopoGrid: boolean;
  isTourPlaying: boolean;
  dustDevilsActive: boolean;
  onAltitudeChange?: (alt: number) => void;
  zoomLevel: number;
}

interface SquadAstronautRig {
  id: string;
  name: string;
  role: string;
  group: THREE.Group;
  leftLegGroup: THREE.Group;
  rightLegGroup: THREE.Group;
  leftArmGroup: THREE.Group;
  rightArmGroup: THREE.Group;
  headlampLight: THREE.SpotLight;
  statusBeacon: THREE.PointLight;
  offsetLateral: number;
  offsetAhead: number;
  phaseOffset: number;
}

export const Mars3dSurface: React.FC<Mars3dSurfaceProps> = ({
  isWalking,
  walkDistance,
  stepPhase,
  pitchOffset,
  panOffset,
  headingDeg,
  visorTint,
  viewMode,
  timeOfSol,
  showTopoGrid,
  isTourPlaying,
  dustDevilsActive,
  onAltitudeChange,
  zoomLevel,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  // Store refs to mutable values so requestAnimationFrame doesn't re-create scene
  const stateRef = useRef({
    isWalking,
    walkDistance,
    stepPhase,
    pitchOffset,
    panOffset,
    headingDeg,
    visorTint,
    viewMode,
    timeOfSol,
    showTopoGrid,
    isTourPlaying,
    dustDevilsActive,
    zoomLevel,
  });

  useEffect(() => {
    stateRef.current = {
      isWalking,
      walkDistance,
      stepPhase,
      pitchOffset,
      panOffset,
      headingDeg,
      visorTint,
      viewMode,
      timeOfSol,
      showTopoGrid,
      isTourPlaying,
      dustDevilsActive,
      zoomLevel,
    };
  }, [
    isWalking,
    walkDistance,
    stepPhase,
    pitchOffset,
    panOffset,
    headingDeg,
    visorTint,
    viewMode,
    timeOfSol,
    showTopoGrid,
    isTourPlaying,
    dustDevilsActive,
    zoomLevel,
  ]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();

    // Natural warm peach-salmon distance haze matching user reference image
    scene.fog = new THREE.FogExp2(0xc2714c, 0.00078);

    const camera = new THREE.PerspectiveCamera(
      56,
      container.clientWidth / container.clientHeight,
      0.1,
      2800
    );
    camera.position.set(0, 1.75, 0);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      alpha: false,
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    const maxAnisotropy = renderer.capabilities.getMaxAnisotropy();

    // 2. Martian Sun & Ambient Planetary Lighting
    const sunLight = new THREE.DirectionalLight(0xfff3e4, 3.5);
    sunLight.position.set(-110, 68, -90);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 520;
    sunLight.shadow.camera.left = -110;
    sunLight.shadow.camera.right = 110;
    sunLight.shadow.camera.top = 110;
    sunLight.shadow.camera.bottom = -110;
    sunLight.shadow.bias = -0.0002;
    sunLight.shadow.radius = 1.3;
    scene.add(sunLight);

    // Warm terracotta regolith ground bounce light
    const ambientLight = new THREE.AmbientLight(0x9a4422, 0.7);
    scene.add(ambientLight);

    // Atmospheric hemisphere gradient: Butterscotch sky to ochre desert floor
    const hemiLight = new THREE.HemisphereLight(0xdc8660, 0x481908, 0.55);
    scene.add(hemiLight);

    // 3. Texture Loader for NASA Planetary Assets
    const textureLoader = new THREE.TextureLoader();

    // 3.1 360 Mountain Ridge & Wide Gravel Desert Horizon
    const horizonTexture = textureLoader.load(
      '/images/mars_wide_gravel_horizon_1790425175244.jpg'
    );
    horizonTexture.colorSpace = THREE.SRGBColorSpace;
    horizonTexture.wrapS = THREE.RepeatWrapping;
    horizonTexture.wrapT = THREE.ClampToEdgeWrapping;
    horizonTexture.repeat.set(1.5, 1);

    const skyDomeGeo = new THREE.SphereGeometry(950, 48, 24, 0, Math.PI * 2, 0, Math.PI * 0.52);
    skyDomeGeo.scale(-1, 1, 1);
    const skyDomeMat = new THREE.MeshBasicMaterial({
      map: horizonTexture,
      side: THREE.BackSide,
      fog: false,
    });
    const skyDomeMesh = new THREE.Mesh(skyDomeGeo, skyDomeMat);
    skyDomeMesh.position.set(0, -16, 0);
    scene.add(skyDomeMesh);

    // 3.2 Authentic Gravel & Pebble Soil Texture
    const gravelSoilTexture = textureLoader.load(
      '/images/mars_gravel_pebble_soil_1790425197380.jpg'
    );
    gravelSoilTexture.wrapS = THREE.RepeatWrapping;
    gravelSoilTexture.wrapT = THREE.RepeatWrapping;
    gravelSoilTexture.repeat.set(40, 80);
    gravelSoilTexture.colorSpace = THREE.SRGBColorSpace;
    gravelSoilTexture.anisotropy = maxAnisotropy;

    // 3.3 Vast Martian Desert Plain Mesh
    const terrainWidth = 560;
    const terrainLength = 1100;
    const terrainSegmentsX = 160;
    const terrainSegmentsZ = 280;
    const terrainGeo = new THREE.PlaneGeometry(
      terrainWidth,
      terrainLength,
      terrainSegmentsX,
      terrainSegmentsZ
    );
    terrainGeo.rotateX(-Math.PI / 2);
    terrainGeo.translate(0, 0, -420);

    const posAttr = terrainGeo.attributes.position;
    for (let i = 0; i < posAttr.count; i++) {
      const x = posAttr.getX(i);
      const z = posAttr.getZ(i);

      const broadSwell = Math.sin(z * 0.005 + x * 0.003) * 1.5;
      const subtleRoll = Math.cos(z * 0.012 + 0.3) * Math.sin(x * 0.006) * 0.9;
      const windRipples = Math.sin(z * 0.06 + x * 0.025) * 0.15;
      const rightRidge = x > 35 ? Math.pow((x - 35) / 12, 1.4) * 0.85 : 0;

      const corridorDist = Math.abs(x + z * 0.14);
      const flatten = Math.min(1, Math.pow(corridorDist / 22, 2));

      const totalY = (broadSwell + subtleRoll + windRipples) * (0.25 + 0.75 * flatten) + rightRidge;
      posAttr.setY(i, totalY);
    }
    terrainGeo.computeVertexNormals();

    const terrainMat = new THREE.MeshStandardMaterial({
      map: gravelSoilTexture,
      bumpMap: gravelSoilTexture,
      bumpScale: 0.035,
      roughness: 0.94,
      metalness: 0.02,
      color: 0xffffff,
    });

    const terrainMesh = new THREE.Mesh(terrainGeo, terrainMat);
    terrainMesh.receiveShadow = true;
    scene.add(terrainMesh);

    // 3.4 Topographic DEM Contour Grid
    const topoGeo = terrainGeo.clone();
    const topoMat = new THREE.MeshBasicMaterial({
      color: 0x06b6d4,
      wireframe: true,
      transparent: true,
      opacity: 0.0,
    });
    const topoMesh = new THREE.Mesh(topoGeo, topoMat);
    topoMesh.position.y = 0.03;
    scene.add(topoMesh);

    // 4. Hundreds of Small 3D Basalt Pebbles & Stones
    const pebbleCount = 280;
    const pebbleBaseGeo = new THREE.DodecahedronGeometry(0.3, 1);
    pebbleBaseGeo.scale(1.2, 0.45, 1.0);
    const pebblePos = pebbleBaseGeo.attributes.position;
    for (let i = 0; i < pebblePos.count; i++) {
      const vx = pebblePos.getX(i);
      const vy = pebblePos.getY(i);
      const vz = pebblePos.getZ(i);
      const n = 0.8 + Math.random() * 0.4;
      pebblePos.setXYZ(i, vx * n, vy * n, vz * n);
    }
    pebbleBaseGeo.computeVertexNormals();

    const pebbleMat = new THREE.MeshStandardMaterial({
      color: 0x5a2517,
      roughness: 0.96,
      metalness: 0.04,
      bumpMap: gravelSoilTexture,
      bumpScale: 0.05,
    });

    const pebbleInstanced = new THREE.InstancedMesh(pebbleBaseGeo, pebbleMat, pebbleCount);
    pebbleInstanced.castShadow = true;
    pebbleInstanced.receiveShadow = true;

    const dummyMatrix = new THREE.Matrix4();
    const dummyPos = new THREE.Vector3();
    const dummyRot = new THREE.Euler();
    const dummyQuat = new THREE.Quaternion();
    const dummyScale = new THREE.Vector3();

    for (let i = 0; i < pebbleCount; i++) {
      const px = (Math.random() - 0.5) * 260;
      const pz = -Math.random() * 800;

      const scale = 0.15 + Math.random() * 0.65;
      dummyPos.set(px, scale * 0.18, pz);
      dummyRot.set(
        (Math.random() - 0.5) * 0.2,
        Math.random() * Math.PI * 2,
        (Math.random() - 0.5) * 0.2
      );
      dummyQuat.setFromEuler(dummyRot);
      dummyScale.set(scale, scale * (0.6 + Math.random() * 0.4), scale);

      dummyMatrix.compose(dummyPos, dummyQuat, dummyScale);
      pebbleInstanced.setMatrixAt(i, dummyMatrix);
    }
    pebbleInstanced.instanceMatrix.needsUpdate = true;
    scene.add(pebbleInstanced);

    // 5. Authentic NASA Landmarks
    // 5.1 Ancient Rock Formation at ~126m
    const outcropGroup = new THREE.Group();
    outcropGroup.position.set(-28, 0, -126);
    for (let j = 0; j < 5; j++) {
      const layerGeo = new THREE.BoxGeometry(8 - j * 1.1, 0.85, 5.5 - j * 0.7);
      const layerMat = new THREE.MeshStandardMaterial({
        color: j % 2 === 0 ? 0x6e2c14 : 0x7c3217,
        roughness: 0.94,
        bumpMap: gravelSoilTexture,
        bumpScale: 0.04,
      });
      const layerMesh = new THREE.Mesh(layerGeo, layerMat);
      layerMesh.position.set(0, j * 0.8, 0);
      layerMesh.rotation.y = 0.25 + j * 0.06;
      layerMesh.castShadow = true;
      layerMesh.receiveShadow = true;
      outcropGroup.add(layerMesh);
    }
    scene.add(outcropGroup);

    // 5.2 NASA Perseverance Rover at ~243m
    const roverGroup = new THREE.Group();
    roverGroup.position.set(-42, 0.4, -243);

    const roverTex = textureLoader.load(
      '/images/nasa_perseverance_rover_1790422736238.jpg'
    );
    roverTex.colorSpace = THREE.SRGBColorSpace;
    const roverGeo = new THREE.PlaneGeometry(9, 6.5);
    const roverMat = new THREE.MeshStandardMaterial({
      map: roverTex,
      roughness: 0.6,
      transparent: true,
      opacity: 0.98,
      side: THREE.DoubleSide,
    });
    const roverBillboard = new THREE.Mesh(roverGeo, roverMat);
    roverBillboard.position.set(0, 3.25, 0);
    roverBillboard.rotation.y = Math.PI / 3.5;
    roverGroup.add(roverBillboard);

    const chassisGeo = new THREE.BoxGeometry(4.5, 1.4, 3.2);
    const chassisMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      metalness: 0.7,
      roughness: 0.3,
    });
    const chassis = new THREE.Mesh(chassisGeo, chassisMat);
    chassis.position.set(0, 1.2, 0);
    chassis.castShadow = true;
    roverGroup.add(chassis);

    const roverBeacon = new THREE.PointLight(0x38bdf8, 2.2, 30);
    roverBeacon.position.set(0, 5.2, 0);
    roverGroup.add(roverBeacon);
    scene.add(roverGroup);

    // 5.3 Subsurface Water Ice Anomaly at ~312m
    const iceGroup = new THREE.Group();
    iceGroup.position.set(-52, 0.05, -312);
    const iceBedGeo = new THREE.PlaneGeometry(10, 8, 16, 16);
    iceBedGeo.rotateX(-Math.PI / 2);
    const iceBedMat = new THREE.MeshStandardMaterial({
      color: 0xa5f3fc,
      roughness: 0.25,
      metalness: 0.1,
      transparent: true,
      opacity: 0.75,
    });
    const iceBed = new THREE.Mesh(iceBedGeo, iceBedMat);
    iceGroup.add(iceBed);
    const iceBeacon = new THREE.PointLight(0x67e8f9, 1.8, 20);
    iceBeacon.position.set(0, 2.5, 0);
    iceGroup.add(iceBeacon);
    scene.add(iceGroup);

    // 5.4 Habitat Alpha - Bio-Dome 01 Expedition Base at ~640m
    const baseGroup = new THREE.Group();
    baseGroup.position.set(-96, 0, -640);
    const domeGeo = new THREE.SphereGeometry(24, 32, 24, 0, Math.PI * 2, 0, Math.PI * 0.5);
    const domeMat = new THREE.MeshStandardMaterial({
      color: 0xf1f5f9,
      roughness: 0.25,
      metalness: 0.85,
    });
    const domeMesh = new THREE.Mesh(domeGeo, domeMat);
    domeMesh.castShadow = true;
    baseGroup.add(domeMesh);

    for (let s = -1; s <= 1; s += 2) {
      const solarGeo = new THREE.BoxGeometry(18, 0.4, 9);
      const solarMat = new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        metalness: 0.9,
        roughness: 0.1,
      });
      const solar = new THREE.Mesh(solarGeo, solarMat);
      solar.position.set(s * 28, 3, 0);
      solar.rotation.z = s * 0.15;
      baseGroup.add(solar);
    }
    const beaconGeo = new THREE.CylinderGeometry(0.4, 0.6, 14, 12);
    const beaconMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.8 });
    const tower = new THREE.Mesh(beaconGeo, beaconMat);
    tower.position.set(0, 28, 0);
    baseGroup.add(tower);
    const baseBeacon = new THREE.PointLight(0x10b981, 4.5, 75);
    baseBeacon.position.set(0, 35, 0);
    baseGroup.add(baseBeacon);
    scene.add(baseGroup);

    // 6. HIGH-FIDELITY NASA EMU SUIT TEXTURES, GEOMETRIES & MATERIALS (MATCHING USER REFERENCE PHOTO)
    const suitClothTexture = textureLoader.load(
      '/images/real_astronaut_suit_fabric_1790437395793.jpg'
    );
    suitClothTexture.wrapS = THREE.RepeatWrapping;
    suitClothTexture.wrapT = THREE.RepeatWrapping;
    suitClothTexture.repeat.set(3, 3);
    suitClothTexture.colorSpace = THREE.SRGBColorSpace;
    suitClothTexture.anisotropy = maxAnisotropy;

    // Authentic pressurized off-white Beta cloth with woven bump & deep fabric folds
    const suitClothMat = new THREE.MeshStandardMaterial({
      map: suitClothTexture,
      bumpMap: suitClothTexture,
      bumpScale: 0.045,
      roughness: 0.82,
      metalness: 0.05,
      color: 0xf1f3f5,
    });

    // Dark glossy spherical bubble visor (Exact match to user's uploaded photo)
    const visorDarkMat = new THREE.MeshStandardMaterial({
      color: 0x080c12,
      roughness: 0.05,
      metalness: 0.96,
      emissive: 0x050912,
      emissiveIntensity: 0.15,
    });

    // Dark anodized titanium collar / neck ring
    const collarMat = new THREE.MeshStandardMaterial({
      color: 0x1f2937,
      roughness: 0.35,
      metalness: 0.85,
    });

    // Chest Remote Control Unit (RCU) box
    const rcuBoxMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      roughness: 0.45,
      metalness: 0.35,
    });

    // Blue & Red umbilical fittings on chest RCU
    const blueFittingMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      metalness: 0.75,
      roughness: 0.25,
    });
    const redFittingMat = new THREE.MeshStandardMaterial({
      color: 0xef4444,
      metalness: 0.75,
      roughness: 0.25,
    });

    // Bellows accordion joints for elbows and knees
    const bellowsMat = new THREE.MeshStandardMaterial({
      color: 0xd1d5db,
      roughness: 0.88,
      bumpMap: suitClothTexture,
      bumpScale: 0.08,
    });

    // Dark silicone gloves & boots lug tread
    const bootsLugMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.92,
      metalness: 0.1,
    });

    // Shared Geometries for Realistic Proportions
    // 1. Torso: Contoured pressurized suit body with natural chest and waist
    const torsoChestGeo = new THREE.CylinderGeometry(0.38, 0.35, 0.48, 20);
    const torsoAbdomenGeo = new THREE.CylinderGeometry(0.35, 0.32, 0.44, 20);
    const chestRcuGeo = new THREE.BoxGeometry(0.32, 0.26, 0.14);
    const connectorGeo = new THREE.CylinderGeometry(0.024, 0.024, 0.06, 12);
    const plssBackpackGeo = new THREE.BoxGeometry(0.64, 0.86, 0.32);
    const plssTankGeo = new THREE.CylinderGeometry(0.09, 0.09, 0.68, 16);

    // 2. Helmet & Visor
    const neckRingGeo = new THREE.TorusGeometry(0.24, 0.04, 14, 28);
    neckRingGeo.rotateX(Math.PI / 2);
    const helmetOuterGeo = new THREE.SphereGeometry(0.29, 28, 24);
    const bubbleVisorGeo = new THREE.SphereGeometry(
      0.23,
      26,
      26,
      0,
      Math.PI * 2,
      0,
      Math.PI * 0.58
    );
    bubbleVisorGeo.rotateX(Math.PI / 2);
    const helmetPodGeo = new THREE.BoxGeometry(0.08, 0.12, 0.12);

    // 3. Limbs: Arms, Elbow Bellows, Knees, Thigh Pockets, Heavy Boots
    const shoulderBellGeo = new THREE.SphereGeometry(0.14, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.5);
    shoulderBellGeo.rotateX(Math.PI);
    const upperArmGeo = new THREE.CylinderGeometry(0.11, 0.1, 0.36, 14);
    const elbowBellowsGeo = new THREE.TorusGeometry(0.11, 0.035, 10, 18);
    elbowBellowsGeo.rotateX(Math.PI / 2);
    const forearmGeo = new THREE.CylinderGeometry(0.1, 0.095, 0.34, 14);
    const gloveGeo = new THREE.SphereGeometry(0.1, 14, 14);

    const upperLegGeo = new THREE.CylinderGeometry(0.15, 0.14, 0.42, 16);
    const thighPocketGeo = new THREE.BoxGeometry(0.18, 0.22, 0.07);
    const kneeBellowsGeo = new THREE.TorusGeometry(0.14, 0.04, 12, 20);
    kneeBellowsGeo.rotateX(Math.PI / 2);
    const lowerLegGeo = new THREE.CylinderGeometry(0.14, 0.15, 0.42, 16);
    const bootUpperGeo = new THREE.BoxGeometry(0.22, 0.2, 0.36);
    const bootSoleGeo = new THREE.BoxGeometry(0.24, 0.08, 0.42);

    const nameplateTextures: THREE.Texture[] = [];

    // Helper: Create a 3D Head Nameplate Sprite with the astronaut's name and red triangle arrow pointing down to the helmet
    const createAstronautNameplateSprite = (name: string) => {
      const canvas = document.createElement('canvas');
      canvas.width = 640;
      canvas.height = 150;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const boxX = 24;
        const boxY = 12;
        const boxWidth = 592;
        const boxHeight = 78;
        const radius = 16;

        // Dark slate-glass background with red accent glow
        ctx.shadowColor = 'rgba(239, 68, 68, 0.55)';
        ctx.shadowBlur = 12;
        ctx.fillStyle = 'rgba(6, 12, 24, 0.88)';
        ctx.beginPath();
        ctx.roundRect(boxX, boxY, boxWidth, boxHeight, radius);
        ctx.fill();

        // Red outer border
        ctx.shadowBlur = 0;
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.9)';
        ctx.lineWidth = 3.5;
        ctx.stroke();

        // Pulsing red indicator beacon dot on left
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(boxX + 32, boxY + boxHeight / 2, 8, 0, Math.PI * 2);
        ctx.fill();

        // Astronaut Name Text (bold, crisp, highly visible)
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 28px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(name.toUpperCase(), boxX + boxWidth / 2 + 10, boxY + boxHeight / 2);

        // Small Red Triangle Arrow pointing DOWN to the helmet
        // ("mathar opor red akta soto trangle ar moto arrow diye name gula likhe daw")
        const arrowCenterX = canvas.width / 2;
        const arrowTopY = boxY + boxHeight + 2;
        const arrowWidth = 32;
        const arrowHeight = 22;

        ctx.fillStyle = '#ef4444'; // Bright Red
        ctx.beginPath();
        ctx.moveTo(arrowCenterX - arrowWidth / 2, arrowTopY);
        ctx.lineTo(arrowCenterX + arrowWidth / 2, arrowTopY);
        ctx.lineTo(arrowCenterX, arrowTopY + arrowHeight);
        ctx.closePath();
        ctx.fill();

        // White border on red triangle
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      const texture = new THREE.CanvasTexture(canvas);
      texture.minFilter = THREE.LinearFilter;
      const spriteMat = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        depthTest: false,
      });
      const sprite = new THREE.Sprite(spriteMat);
      sprite.scale.set(2.8, 0.65, 1);
      sprite.position.set(0, 2.58, 0); // Directly above helmet
      return { sprite, texture };
    };

    // 6.1 Function to build a photorealistic NASA Apollo/Artemis EMU astronaut rig
    const buildAstronautRig = (
      id: string,
      name: string,
      role: string,
      accentColor: number,
      offsetLateral: number,
      offsetAhead: number,
      phaseOffset: number,
      beaconColor: number,
      hasAntenna = false
    ): SquadAstronautRig => {
      const group = new THREE.Group();
      const accentMat = new THREE.MeshStandardMaterial({
        color: accentColor,
        roughness: 0.5,
      });

      // Floating Head Nameplate Sprite with Red Downward Triangle Arrow
      const { sprite: nameplateSprite, texture: nameplateTex } = createAstronautNameplateSprite(name);
      group.add(nameplateSprite);
      nameplateTextures.push(nameplateTex);

      // 1. Pressurized Body (Upper Chest + Abdomen)
      const chestMesh = new THREE.Mesh(torsoChestGeo, suitClothMat);
      chestMesh.position.set(0, 1.44, 0);
      chestMesh.castShadow = true;
      group.add(chestMesh);

      const abdomenMesh = new THREE.Mesh(torsoAbdomenGeo, suitClothMat);
      abdomenMesh.position.set(0, 1.05, 0);
      abdomenMesh.castShadow = true;
      group.add(abdomenMesh);

      // Chest Remote Control Unit (RCU) - distinct feature in user's photo
      const rcuMesh = new THREE.Mesh(chestRcuGeo, rcuBoxMat);
      rcuMesh.position.set(0, 1.34, 0.25);
      rcuMesh.castShadow = true;
      group.add(rcuMesh);

      // Umbilical connectors on RCU
      const blueConn = new THREE.Mesh(connectorGeo, blueFittingMat);
      blueConn.position.set(-0.08, 1.25, 0.33);
      blueConn.rotation.x = Math.PI / 2;
      group.add(blueConn);

      const redConn = new THREE.Mesh(connectorGeo, redFittingMat);
      redConn.position.set(0.08, 1.25, 0.33);
      redConn.rotation.x = Math.PI / 2;
      group.add(redConn);

      // Role accent badge on chest
      const badgeGeo = new THREE.BoxGeometry(0.2, 0.05, 0.02);
      const badgeMesh = new THREE.Mesh(badgeGeo, accentMat);
      badgeMesh.position.set(0, 1.45, 0.33);
      group.add(badgeMesh);

      // 2. PLSS Life Support Backpack
      const plssMesh = new THREE.Mesh(plssBackpackGeo, suitClothMat);
      plssMesh.position.set(0, 1.32, -0.34);
      plssMesh.castShadow = true;
      group.add(plssMesh);

      // Dual oxygen cylinders
      for (let s = -1; s <= 1; s += 2) {
        const tank = new THREE.Mesh(plssTankGeo, accentMat);
        tank.position.set(s * 0.19, 1.32, -0.48);
        tank.castShadow = true;
        group.add(tank);
      }

      // Antenna on backpack
      if (hasAntenna) {
        const antGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.8, 8);
        const antMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.85 });
        const antMesh = new THREE.Mesh(antGeo, antMat);
        antMesh.position.set(0.22, 1.98, -0.42);
        group.add(antMesh);
      }

      // 3. Neck Collar & Bubble Helmet with Dark Reflective Visor
      const neckCollar = new THREE.Mesh(neckRingGeo, collarMat);
      neckCollar.position.set(0, 1.68, 0.02);
      group.add(neckCollar);

      const helmetMesh = new THREE.Mesh(helmetOuterGeo, suitClothMat);
      helmetMesh.position.set(0, 1.88, 0.02);
      helmetMesh.castShadow = true;
      group.add(helmetMesh);

      // Dark glossy reflective bubble visor (Matching user's photo!)
      const visorMesh = new THREE.Mesh(bubbleVisorGeo, visorDarkMat);
      visorMesh.position.set(0, 1.88, 0.12);
      group.add(visorMesh);

      // Helmet spotlight / camera modules on both sides
      for (let s = -1; s <= 1; s += 2) {
        const pod = new THREE.Mesh(helmetPodGeo, collarMat);
        pod.position.set(s * 0.28, 1.9, 0.04);
        group.add(pod);
      }

      // Headlamp SpotLight
      const headlampLight = new THREE.SpotLight(0xffffff, 1.8, 45, Math.PI / 5, 0.4);
      headlampLight.position.set(0, 2.05, 0.18);
      headlampLight.target.position.set(0, 0.5, 8);
      group.add(headlampLight);
      group.add(headlampLight.target);

      // Status Beacon on backpack
      const statusBeacon = new THREE.PointLight(beaconColor, 1.4, 6);
      statusBeacon.position.set(0, 1.72, -0.44);
      group.add(statusBeacon);

      // 4. Articulated Legs (Upper Thigh + Pocket + Bellows + Shin + Heavy Boot)
      const leftLegGroup = new THREE.Group();
      leftLegGroup.position.set(-0.22, 0.85, 0);

      const leftThigh = new THREE.Mesh(upperLegGeo, suitClothMat);
      leftThigh.position.set(0, -0.2, 0);
      leftThigh.castShadow = true;
      leftLegGroup.add(leftThigh);

      // Thigh utility pocket with red pull tab (from user photo)
      const leftPocket = new THREE.Mesh(thighPocketGeo, suitClothMat);
      leftPocket.position.set(-0.13, -0.2, 0.04);
      leftPocket.castShadow = true;
      leftLegGroup.add(leftPocket);

      const leftKnee = new THREE.Mesh(kneeBellowsGeo, bellowsMat);
      leftKnee.position.set(0, -0.42, 0);
      leftLegGroup.add(leftKnee);

      const leftShin = new THREE.Mesh(lowerLegGeo, suitClothMat);
      leftShin.position.set(0, -0.62, 0);
      leftShin.castShadow = true;
      leftLegGroup.add(leftShin);

      const leftBoot = new THREE.Mesh(bootUpperGeo, suitClothMat);
      leftBoot.position.set(0, -0.74, 0.06);
      leftBoot.castShadow = true;
      leftLegGroup.add(leftBoot);

      const leftSole = new THREE.Mesh(bootSoleGeo, bootsLugMat);
      leftSole.position.set(0, -0.83, 0.07);
      leftSole.castShadow = true;
      leftLegGroup.add(leftSole);
      group.add(leftLegGroup);

      // Right Leg Group
      const rightLegGroup = new THREE.Group();
      rightLegGroup.position.set(0.22, 0.85, 0);

      const rightThigh = new THREE.Mesh(upperLegGeo, suitClothMat);
      rightThigh.position.set(0, -0.2, 0);
      rightThigh.castShadow = true;
      rightLegGroup.add(rightThigh);

      const rightPocket = new THREE.Mesh(thighPocketGeo, suitClothMat);
      rightPocket.position.set(0.13, -0.2, 0.04);
      rightPocket.castShadow = true;
      rightLegGroup.add(rightPocket);

      const rightKnee = new THREE.Mesh(kneeBellowsGeo, bellowsMat);
      rightKnee.position.set(0, -0.42, 0);
      rightLegGroup.add(rightKnee);

      const rightShin = new THREE.Mesh(lowerLegGeo, suitClothMat);
      rightShin.position.set(0, -0.62, 0);
      rightShin.castShadow = true;
      rightLegGroup.add(rightShin);

      const rightBoot = new THREE.Mesh(bootUpperGeo, suitClothMat);
      rightBoot.position.set(0, -0.74, 0.06);
      rightBoot.castShadow = true;
      rightLegGroup.add(rightBoot);

      const rightSole = new THREE.Mesh(bootSoleGeo, bootsLugMat);
      rightSole.position.set(0, -0.83, 0.07);
      rightSole.castShadow = true;
      rightLegGroup.add(rightSole);
      group.add(rightLegGroup);

      // 5. Articulated Arms (Shoulder Bell + Upper Arm + Elbow Bellows + Forearm + Glove)
      const leftArmGroup = new THREE.Group();
      leftArmGroup.position.set(-0.46, 1.55, 0);

      const leftShoulder = new THREE.Mesh(shoulderBellGeo, suitClothMat);
      leftShoulder.position.set(0, 0, 0);
      leftArmGroup.add(leftShoulder);

      const leftUpperArm = new THREE.Mesh(upperArmGeo, suitClothMat);
      leftUpperArm.position.set(0, -0.18, 0);
      leftUpperArm.castShadow = true;
      leftArmGroup.add(leftUpperArm);

      const leftElbow = new THREE.Mesh(elbowBellowsGeo, bellowsMat);
      leftElbow.position.set(0, -0.36, 0);
      leftArmGroup.add(leftElbow);

      const leftForearm = new THREE.Mesh(forearmGeo, suitClothMat);
      leftForearm.position.set(0, -0.52, 0);
      leftForearm.castShadow = true;
      leftArmGroup.add(leftForearm);

      const leftGlove = new THREE.Mesh(gloveGeo, bootsLugMat);
      leftGlove.position.set(0, -0.72, 0);
      leftArmGroup.add(leftGlove);
      group.add(leftArmGroup);

      // Right Arm Group
      const rightArmGroup = new THREE.Group();
      rightArmGroup.position.set(0.46, 1.55, 0);

      const rightShoulder = new THREE.Mesh(shoulderBellGeo, suitClothMat);
      rightShoulder.position.set(0, 0, 0);
      rightArmGroup.add(rightShoulder);

      const rightUpperArm = new THREE.Mesh(upperArmGeo, suitClothMat);
      rightUpperArm.position.set(0, -0.18, 0);
      rightUpperArm.castShadow = true;
      rightArmGroup.add(rightUpperArm);

      const rightElbow = new THREE.Mesh(elbowBellowsGeo, bellowsMat);
      rightElbow.position.set(0, -0.36, 0);
      rightArmGroup.add(rightElbow);

      const rightForearm = new THREE.Mesh(forearmGeo, suitClothMat);
      rightForearm.position.set(0, -0.52, 0);
      rightForearm.castShadow = true;
      rightArmGroup.add(rightForearm);

      const rightGlove = new THREE.Mesh(gloveGeo, bootsLugMat);
      rightGlove.position.set(0, -0.72, 0);
      rightArmGroup.add(rightGlove);
      group.add(rightArmGroup);

      group.rotation.y = Math.PI; // Face forward along the trail
      scene.add(group);

      return {
        id,
        name,
        role,
        group,
        leftLegGroup,
        rightLegGroup,
        leftArmGroup,
        rightArmGroup,
        headlampLight,
        statusBeacon,
        offsetLateral,
        offsetAhead,
        phaseOffset,
      };
    };

    // 6.2 Primary Player Astronaut Rig (Dr. NAFI UL SHEAK)
    const playerRig = buildAstronautRig(
      'player',
      'Dr. NAFI UL SHEAK',
      'EVA Expedition Lead',
      0xea580c, // NASA Mars exploration orange
      0.0,
      0.0,
      0.0,
      0x10b981
    );

    // 6.3 3 ASTRONAUT CREWMATES POSITIONED ON THE SIDES (FLANKS)
    // Center line-of-sight is 100% OPEN & CLEAR
    const squadMembers: SquadAstronautRig[] = [
      // 1. Dr. ATHER ISRAK CHOWDHURY: 5.4m to the LEFT FLANK, 8.5m ahead (Expedition Lead)
      buildAstronautRig(
        'crew-vance',
        'Dr. ATHER ISRAK CHOWDHURY',
        'Lead Navigator & Expedition Specialist',
        0x2563eb, // Royal Blue commander stripes
        -5.4,     // Wide on the LEFT flank
        8.5,      // 8.5 meters ahead
        0.2,
        0x38bdf8
      ),
      // 2. Dr. POLLOB KUMAR: 5.6m to the RIGHT FLANK, 10.2m ahead (Life Support)
      buildAstronautRig(
        'crew-patel',
        'Dr. POLLOB KUMAR',
        'Life Support & EVA Systems',
        0x06b6d4, // Cyan stripes
        5.6,      // Wide on the RIGHT flank
        10.2,     // 10.2 meters ahead
        0.7,
        0x06b6d4,
        true      // Comms antenna
      ),
      // 3. Dr. JAMIUL ISLAM SUNNY: 8.2m to the FAR LEFT FLANK, 19.5m ahead (Field Geologist)
      buildAstronautRig(
        'crew-chen',
        'Dr. JAMIUL ISLAM SUNNY',
        'Astrobiology & Mineralogy Specialist',
        0xd97706, // Amber field geologist stripes
        -8.2,     // Ahead on the FAR LEFT ridge
        19.5,     // 19.5 meters ahead
        1.1,
        0xf59e0b
      ),
    ];

    // 7. Martian Footprint Trail in the Red Sand
    const maxFootprints = 42;
    const footprintGeo = new THREE.PlaneGeometry(0.26, 0.44);
    footprintGeo.rotateX(-Math.PI / 2);
    const footprintMat = new THREE.MeshBasicMaterial({
      color: 0x421808,
      transparent: true,
      opacity: 0.55,
      depthWrite: false,
    });
    const footprintsGroup = new THREE.Group();
    const footprintMeshes: THREE.Mesh[] = [];
    for (let i = 0; i < maxFootprints; i++) {
      const fp = new THREE.Mesh(footprintGeo, footprintMat);
      fp.position.set(0, -100, 0);
      footprintsGroup.add(fp);
      footprintMeshes.push(fp);
    }
    scene.add(footprintsGroup);
    let lastFootprintZ = 0;
    let footprintIndex = 0;
    let isLeftStep = true;

    // 8. Footstep Dust Puffs
    const dustPuffCount = 35;
    const dustPuffGeo = new THREE.BufferGeometry();
    const dustPuffPos = new Float32Array(dustPuffCount * 3);
    const dustPuffVel = new Float32Array(dustPuffCount * 3);
    for (let i = 0; i < dustPuffCount * 3; i++) {
      dustPuffPos[i] = 0;
      dustPuffVel[i] = 0;
    }
    dustPuffGeo.setAttribute('position', new THREE.BufferAttribute(dustPuffPos, 3));
    const dustPuffMat = new THREE.PointsMaterial({
      color: 0xed8936,
      size: 0.22,
      transparent: true,
      opacity: 0.0,
      blending: THREE.AdditiveBlending,
    });
    const dustPuffParticles = new THREE.Points(dustPuffGeo, dustPuffMat);
    scene.add(dustPuffParticles);

    // 9. Natural Atmospheric Micro-Dust
    const dustCount = 420;
    const dustGeo = new THREE.BufferGeometry();
    const dustPositions = new Float32Array(dustCount * 3);
    for (let i = 0; i < dustCount * 3; i += 3) {
      dustPositions[i] = (Math.random() - 0.5) * 110;
      dustPositions[i + 1] = Math.random() * 12;
      dustPositions[i + 2] = (Math.random() - 0.5) * 110;
    }
    dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
    const dustMat = new THREE.PointsMaterial({
      color: 0xfba05a,
      size: 0.1,
      transparent: true,
      opacity: 0.32,
      blending: THREE.AdditiveBlending,
    });
    const dustParticles = new THREE.Points(dustGeo, dustMat);
    scene.add(dustParticles);

    // 10. Render & Animation Loop
    let animationFrameId: number;
    const clock = new THREE.Clock();
    let tourProgress = 0;
    let lastAltUpdate = 0;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const dt = Math.min(clock.getDelta(), 0.08);
      const time = clock.getElapsedTime();
      const state = stateRef.current;

      // 10.1 Forward Traversal Coordinates
      const currentWalkZ = -state.walkDistance;
      const lateralPathX = -(state.walkDistance * 0.14);

      // EVA gait bob and sway
      const stepBobY = state.isWalking ? Math.abs(Math.sin(state.stepPhase * 2)) * 0.055 : 0;
      const stepSwayX = state.isWalking ? Math.sin(state.stepPhase) * 0.018 : 0;
      const stepRollZ = state.isWalking ? Math.cos(state.stepPhase) * 0.005 : 0;

      // 10.2 Player Astronaut Model Position & Walking Gait
      playerRig.group.position.set(lateralPathX, stepBobY, currentWalkZ);

      // In EVA 1st-person view (inside helmet HUD), player's own body is hidden so it never blocks the screen
      if (state.viewMode === 'eva') {
        playerRig.group.visible = false;
      } else {
        playerRig.group.visible = true; // Fully visible in Astronaut 3rd person, Drone, Satellite & Flyover!
      }

      if (state.isWalking) {
        const swing = Math.sin(state.stepPhase);
        playerRig.leftLegGroup.rotation.x = swing * 0.52;
        playerRig.rightLegGroup.rotation.x = -swing * 0.52;
        playerRig.leftArmGroup.rotation.x = -swing * 0.42;
        playerRig.rightArmGroup.rotation.x = swing * 0.42;
        playerRig.group.rotation.z = swing * 0.035;

        // Stamp bootprints in the soil behind the astronaut
        if (Math.abs(currentWalkZ - lastFootprintZ) > 0.72) {
          lastFootprintZ = currentWalkZ;
          const fp = footprintMeshes[footprintIndex % maxFootprints];
          const footOffsetX = isLeftStep ? -0.22 : 0.22;
          fp.position.set(lateralPathX + footOffsetX, 0.02, currentWalkZ);
          fp.rotation.y = (Math.PI / 180) * 14 * (isLeftStep ? -1 : 1);
          isLeftStep = !isLeftStep;
          footprintIndex++;

          // Dust puff at footstep
          dustPuffMat.opacity = 0.55;
          for (let p = 0; p < dustPuffCount; p++) {
            dustPuffPos[p * 3] = lateralPathX + footOffsetX + (Math.random() - 0.5) * 0.3;
            dustPuffPos[p * 3 + 1] = 0.05 + Math.random() * 0.15;
            dustPuffPos[p * 3 + 2] = currentWalkZ + (Math.random() - 0.5) * 0.3;
            dustPuffVel[p * 3] = (Math.random() - 0.5) * 0.4;
            dustPuffVel[p * 3 + 1] = 0.3 + Math.random() * 0.5;
            dustPuffVel[p * 3 + 2] = (Math.random() - 0.5) * 0.4;
          }
          dustPuffGeo.attributes.position.needsUpdate = true;
        }
      } else {
        playerRig.leftLegGroup.rotation.x = 0;
        playerRig.rightLegGroup.rotation.x = 0;
        playerRig.leftArmGroup.rotation.x = 0;
        playerRig.rightArmGroup.rotation.x = 0;
        playerRig.group.rotation.z = 0;
      }

      // 10.3 ANIMATE 3 SQUAD ASTRONAUTS WALKING IN FRONT OF THE USER
      // ("amar samne aro 2 ba 3 jon astronot")
      squadMembers.forEach((member) => {
        const memberPathDist = state.walkDistance + member.offsetAhead;
        const memberZ = -memberPathDist;
        const memberX = -(memberPathDist * 0.14) + member.offsetLateral;
        const memberPhase = (state.stepPhase + member.phaseOffset) % (Math.PI * 2);
        const memberBobY = state.isWalking
          ? Math.abs(Math.sin(memberPhase * 2)) * 0.05
          : Math.sin(time * 1.5 + member.phaseOffset) * 0.012;

        member.group.position.set(memberX, memberBobY, memberZ);
        // The 3 crew members are ALWAYS visible in front of the player (both in EVA and 3rd person)!
        member.group.visible = true;

        if (state.isWalking) {
          const swing = Math.sin(memberPhase);
          member.leftLegGroup.rotation.x = swing * 0.52;
          member.rightLegGroup.rotation.x = -swing * 0.52;
          member.leftArmGroup.rotation.x = -swing * 0.42;
          member.rightArmGroup.rotation.x = swing * 0.42;
          member.group.rotation.z = swing * 0.025;
        } else {
          // Alert standing posture with subtle breathing
          member.leftLegGroup.rotation.x = 0;
          member.rightLegGroup.rotation.x = 0;
          member.leftArmGroup.rotation.x = 0.05;
          member.rightArmGroup.rotation.x = 0.05;
          member.group.rotation.z = 0;
        }

        // Point headlamp forward onto the gravel ground
        member.headlampLight.target.position.set(memberX, 0.5, memberZ - 8);
        member.statusBeacon.intensity = 1.2 + Math.sin(time * 3 + member.phaseOffset) * 0.4;
      });

      // Fade out dust puffs
      if (dustPuffMat.opacity > 0.01) {
        dustPuffMat.opacity -= dt * 0.8;
        for (let p = 0; p < dustPuffCount; p++) {
          dustPuffPos[p * 3] += dustPuffVel[p * 3] * dt;
          dustPuffPos[p * 3 + 1] += dustPuffVel[p * 3 + 1] * dt;
          dustPuffPos[p * 3 + 2] += dustPuffVel[p * 3 + 2] * dt;
        }
        dustPuffGeo.attributes.position.needsUpdate = true;
      }

      // 10.4 Multi-Perspective Camera System
      let targetCamX = lateralPathX;
      let targetCamY = 1.75;
      let targetCamZ = currentWalkZ;
      let targetRotX = 0;
      let targetRotY = (state.panOffset * Math.PI) / 180;
      let targetRotZ = 0;
      let currentEyeAlt = 1.75;

      if (state.viewMode === 'eva') {
        // 1st Person Inside Helmet Visor: You see your 3 crewmates walking right in front of you!
        targetCamX = lateralPathX + stepSwayX;
        targetCamY = 1.75 + stepBobY;
        targetCamZ = currentWalkZ;
        targetRotX = (state.pitchOffset * Math.PI) / 180;
        targetRotY = (state.panOffset * Math.PI) / 180;
        targetRotZ = stepRollZ;
        currentEyeAlt = 1.75;
      } else if (state.viewMode === 'astronaut') {
        // 3rd Person Follow: Cinematic view showing you and your 3 crewmates trekking in formation!
        const followDistance = 3.6 * state.zoomLevel;
        targetCamX = lateralPathX - 0.35;
        targetCamY = 2.15 * state.zoomLevel + stepBobY * 0.5;
        targetCamZ = currentWalkZ + followDistance;
        targetRotX = -0.12 + (state.pitchOffset * Math.PI) / 360;
        targetRotY = (state.panOffset * Math.PI) / 180;
        currentEyeAlt = targetCamY;
      } else if (state.viewMode === 'drone') {
        // Google Earth 3D Tilt View (28m altitude)
        const radHeading = ((state.headingDeg - 90) * Math.PI) / 180;
        const zoomDist = 32 * state.zoomLevel;
        targetCamX = lateralPathX - Math.sin(radHeading) * (zoomDist * 0.5);
        targetCamY = 26 * state.zoomLevel;
        targetCamZ = currentWalkZ + Math.cos(radHeading) * (zoomDist * 0.5);
        targetRotX = -0.58;
        targetRotY = (state.panOffset * Math.PI) / 180;
        currentEyeAlt = targetCamY;
      } else if (state.viewMode === 'satellite') {
        // Orbital HiRISE Satellite View (180m altitude)
        const zoomDist = 180 * state.zoomLevel;
        targetCamX = lateralPathX - 45;
        targetCamY = zoomDist;
        targetCamZ = currentWalkZ + 95;
        targetRotX = -1.05;
        targetRotY = (state.panOffset * Math.PI) / 180;
        currentEyeAlt = targetCamY;
      } else if (state.viewMode === 'flyover' || state.isTourPlaying) {
        tourProgress += dt * 0.12;
        const tourRadius = 140;
        const centerZ = -280;
        targetCamX = Math.sin(tourProgress) * tourRadius - 40;
        targetCamY = 48 + Math.cos(tourProgress * 0.8) * 18;
        targetCamZ = centerZ + Math.cos(tourProgress) * (tourRadius * 1.4);
        targetRotX = -0.45;
        targetRotY = -tourProgress - Math.PI / 2;
        currentEyeAlt = targetCamY;
      }

      // Smooth camera interpolation
      const lerpSpeed =
        state.viewMode === 'eva' || state.viewMode === 'astronaut' ? 0.35 : 0.08;
      camera.position.x += (targetCamX - camera.position.x) * lerpSpeed;
      camera.position.y += (targetCamY - camera.position.y) * lerpSpeed;
      camera.position.z += (targetCamZ - camera.position.z) * lerpSpeed;

      camera.rotation.order = 'YXZ';
      camera.rotation.y += (targetRotY - camera.rotation.y) * lerpSpeed;
      camera.rotation.x += (targetRotX - camera.rotation.x) * lerpSpeed;
      camera.rotation.z += (targetRotZ - camera.rotation.z) * lerpSpeed;

      // Keep Sky Dome centered around camera
      skyDomeMesh.position.set(camera.position.x, camera.position.y - 16, camera.position.z);

      // Report altitude to parent HUD
      if (onAltitudeChange && time - lastAltUpdate > 0.25) {
        lastAltUpdate = time;
        onAltitudeChange(currentEyeAlt);
      }

      // 10.5 Topographic Contour Grid
      topoMat.opacity = state.showTopoGrid ? 0.4 : 0.0;

      // 10.6 Sol Time Lighting
      let sunIntensity = 3.5;
      let ambientColor = 0x9a4422;
      let skyColor = 0xc2714c;
      let exposure = 1.15;

      if (state.timeOfSol === 'morning') {
        sunLight.position.set(-140, 32, -90);
        sunLight.color.setHex(0xfbbf24);
        sunIntensity = 2.5;
        ambientColor = 0x854d0e;
        skyColor = 0xa16207;
        exposure = 1.05;
      } else if (state.timeOfSol === 'noon') {
        sunLight.position.set(-110, 68, -90);
        sunLight.color.setHex(0xfff3e4);
        sunIntensity = 3.5;
        ambientColor = 0x9a4422;
        skyColor = 0xc2714c;
        exposure = 1.15;
      } else if (state.timeOfSol === 'golden') {
        sunLight.position.set(120, 35, -120);
        sunLight.color.setHex(0xf97316);
        sunIntensity = 2.8;
        ambientColor = 0x9a3412;
        skyColor = 0x7c2d12;
        exposure = 1.1;
      } else if (state.timeOfSol === 'blue-sunset') {
        sunLight.position.set(160, 12, -140);
        sunLight.color.setHex(0x38bdf8);
        sunIntensity = 2.0;
        ambientColor = 0x451a03;
        skyColor = 0x2e1065;
        exposure = 0.95;
      } else if (state.timeOfSol === 'night') {
        sunLight.position.set(40, -40, -100);
        sunIntensity = 0.15;
        ambientColor = 0x0f172a;
        skyColor = 0x020617;
        exposure = 1.45;
      }

      sunLight.intensity = sunIntensity;
      ambientLight.color.setHex(ambientColor);
      (scene.fog as THREE.FogExp2).color.setHex(skyColor);

      if (state.visorTint === 'gold-polar') {
        renderer.toneMappingExposure = exposure * 0.88;
      } else if (state.visorTint === 'thermal-lidar') {
        renderer.toneMappingExposure = exposure * 1.3;
      } else {
        renderer.toneMappingExposure = exposure;
      }

      // 10.7 Suspended Atmospheric Dust
      const dPos = dustPositions;
      for (let i = 0; i < dustCount * 3; i += 3) {
        dPos[i] += 0.25 * dt;
        dPos[i + 1] -= 0.08 * dt;
        dPos[i + 2] -= 0.14 * dt;
        if (dPos[i] > camera.position.x + 55) dPos[i] = camera.position.x - 55;
        if (dPos[i + 1] < 0) dPos[i + 1] = 12;
        if (dPos[i + 2] < camera.position.z - 55) dPos[i + 2] = camera.position.z + 55;
      }
      dustGeo.attributes.position.needsUpdate = true;

      // 10.8 Landmark Beacons
      baseBeacon.intensity = 4.0 + Math.sin(time * 3.5) * 1.8;
      roverBeacon.intensity = 2.2 + Math.sin(time * 4.5) * 1.2;
      iceBeacon.intensity = 1.6 + Math.sin(time * 2.5) * 0.8;

      renderer.render(scene, camera);
    };

    animate();

    // 11. Resize Handler
    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    // 12. Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      terrainGeo.dispose();
      terrainMat.dispose();
      topoGeo.dispose();
      topoMat.dispose();
      gravelSoilTexture.dispose();
      skyDomeGeo.dispose();
      skyDomeMat.dispose();
      horizonTexture.dispose();
      pebbleBaseGeo.dispose();
      pebbleMat.dispose();
      pebbleInstanced.dispose();
      roverGeo.dispose();
      roverMat.dispose();
      roverTex.dispose();
      chassisGeo.dispose();
      chassisMat.dispose();
      iceBedGeo.dispose();
      iceBedMat.dispose();
      domeGeo.dispose();
      domeMat.dispose();
      beaconGeo.dispose();
      beaconMat.dispose();
      dustGeo.dispose();
      dustMat.dispose();
      torsoChestGeo.dispose();
      torsoAbdomenGeo.dispose();
      chestRcuGeo.dispose();
      connectorGeo.dispose();
      plssBackpackGeo.dispose();
      plssTankGeo.dispose();
      neckRingGeo.dispose();
      helmetOuterGeo.dispose();
      bubbleVisorGeo.dispose();
      helmetPodGeo.dispose();
      shoulderBellGeo.dispose();
      upperArmGeo.dispose();
      elbowBellowsGeo.dispose();
      forearmGeo.dispose();
      gloveGeo.dispose();
      upperLegGeo.dispose();
      thighPocketGeo.dispose();
      kneeBellowsGeo.dispose();
      lowerLegGeo.dispose();
      bootUpperGeo.dispose();
      bootSoleGeo.dispose();
      suitClothTexture.dispose();
      suitClothMat.dispose();
      visorDarkMat.dispose();
      collarMat.dispose();
      rcuBoxMat.dispose();
      blueFittingMat.dispose();
      redFittingMat.dispose();
      bellowsMat.dispose();
      bootsLugMat.dispose();
      footprintGeo.dispose();
      footprintMat.dispose();
      dustPuffGeo.dispose();
      dustPuffMat.dispose();
      nameplateTextures.forEach((t) => t.dispose());
    };
  }, []);

  return (
    <div
      ref={mountRef}
      id="mars-3d-webgl-canvas"
      className="absolute inset-0 z-0 pointer-events-none overflow-hidden"
    />
  );
};
