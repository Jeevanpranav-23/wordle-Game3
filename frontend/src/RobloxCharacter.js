import React, { useRef, useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

function RobloxCharacter({ onHeightChange, onCheckpoint }) {
  const groupRef = useRef();
  const { camera, gl } = useThree();
  
  // Character state
  const [velocity, setVelocity] = useState({ x: 0, y: 0, z: 0 });
  const [isGrounded, setIsGrounded] = useState(false);
  const [lastCheckpoint, setLastCheckpoint] = useState({ x: 0, y: 1.25, z: 0 });
  const [checkpointsReached, setCheckpointsReached] = useState(new Set());
  
  // Input state
  const keys = useRef({
    w: false, a: false, s: false, d: false,
    space: false, arrowLeft: false, arrowRight: false,
    arrowUp: false, arrowDown: false
  });
  
  // Camera state
  const cameraState = useRef({
    horizontalAngle: 0,
    verticalAngle: 0,
    distance: 8,
    height: 6,
    mouseX: 0,
    mouseY: 0,
    isMouseLocked: false
  });
  
  // Animation state
  const walkCycle = useRef(0);
  
  // Game constants
  const GRAVITY = -35;
  const MOVE_SPEED = 12;
  const JUMP_FORCE = 18;
  
  // Input handling
  useEffect(() => {
    const handleKeyDown = (e) => {
      e.preventDefault();
      switch(e.code) {
        case 'KeyW': keys.current.w = true; break;
        case 'KeyA': keys.current.a = true; break;
        case 'KeyS': keys.current.s = true; break;
        case 'KeyD': keys.current.d = true; break;
        case 'Space': keys.current.space = true; break;
        case 'ArrowLeft': keys.current.arrowLeft = true; break;
        case 'ArrowRight': keys.current.arrowRight = true; break;
        case 'ArrowUp': keys.current.arrowUp = true; break;
        case 'ArrowDown': keys.current.arrowDown = true; break;
      }
    };
    
    const handleKeyUp = (e) => {
      e.preventDefault();
      switch(e.code) {
        case 'KeyW': keys.current.w = false; break;
        case 'KeyA': keys.current.a = false; break;
        case 'KeyS': keys.current.s = false; break;
        case 'KeyD': keys.current.d = false; break;
        case 'Space': keys.current.space = false; break;
        case 'ArrowLeft': keys.current.arrowLeft = false; break;
        case 'ArrowRight': keys.current.arrowRight = false; break;
        case 'ArrowUp': keys.current.arrowUp = false; break;
        case 'ArrowDown': keys.current.arrowDown = false; break;
      }
    };
    
    const handleMouseDown = (e) => {
      if (e.button === 2) { // Right mouse button
        e.preventDefault();
        gl.domElement.requestPointerLock();
      }
    };
    
    const handleMouseMove = (e) => {
      if (document.pointerLockElement === gl.domElement) {
        cameraState.current.mouseX += e.movementX * 0.002;
        cameraState.current.mouseY += e.movementY * 0.002;
        cameraState.current.mouseY = Math.max(-1, Math.min(1, cameraState.current.mouseY));
        cameraState.current.isMouseLocked = true;
      }
    };
    
    const handlePointerLockChange = () => {
      cameraState.current.isMouseLocked = document.pointerLockElement === gl.domElement;
    };
    
    // Add event listeners
    window.addEventListener('keydown', handleKeyDown, { capture: true });
    window.addEventListener('keyup', handleKeyUp, { capture: true });
    gl.domElement.addEventListener('mousedown', handleMouseDown);
    gl.domElement.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('pointerlockchange', handlePointerLockChange);
    
    // Disable context menu
    gl.domElement.addEventListener('contextmenu', (e) => e.preventDefault());
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown, { capture: true });
      window.removeEventListener('keyup', handleKeyUp, { capture: true });
      gl.domElement.removeEventListener('mousedown', handleMouseDown);
      gl.domElement.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('pointerlockchange', handlePointerLockChange);
    };
  }, [gl]);
  
  // Initialize character position
  useEffect(() => {
    if (groupRef.current) {
      groupRef.current.position.set(0, 1.25, 0);
    }
  }, []);
  
  // Physics and movement
  useFrame((state, delta) => {
    if (!groupRef.current) return;
    
    // Clamp delta to prevent physics issues
    const clampedDelta = Math.min(delta, 0.05);
    
    // Sub-stepping for frame rate independence
    const steps = Math.max(1, Math.ceil(clampedDelta / 0.016));
    const stepDelta = clampedDelta / steps;
    
    for (let i = 0; i < steps; i++) {
      performPhysicsStep(stepDelta);
    }
    
    // Update camera
    updateCamera();
    
    // Update height callback
    if (onHeightChange) {
      onHeightChange(groupRef.current.position.y);
    }
    
    // Check for checkpoints
    checkForCheckpoints();
    
    // Respawn if fallen
    if (groupRef.current.position.y < -10) {
      respawn();
    }
  });
  
  // Physics step function
  const performPhysicsStep = (delta) => {
    const currentPos = groupRef.current.position;
    let newVelocity = { ...velocity };
    
    // Apply gravity
    newVelocity.y += GRAVITY * delta;
    
    // Handle input
    const inputVector = new THREE.Vector3();
    
    if (keys.current.w) inputVector.z -= 1;
    if (keys.current.s) inputVector.z += 1;
    if (keys.current.a) inputVector.x -= 1;
    if (keys.current.d) inputVector.x += 1;
    
    // Normalize input
    if (inputVector.length() > 0) {
      inputVector.normalize();
      
      // Transform input based on camera direction
      const cameraAngle = cameraState.current.isMouseLocked 
        ? cameraState.current.mouseX 
        : cameraState.current.horizontalAngle;
      
      const cos = Math.cos(cameraAngle);
      const sin = Math.sin(cameraAngle);
      
      newVelocity.x = (inputVector.x * cos - inputVector.z * sin) * MOVE_SPEED;
      newVelocity.z = (inputVector.x * sin + inputVector.z * cos) * MOVE_SPEED;
      
      // Update walk cycle
      walkCycle.current += delta * 10;
    } else {
      newVelocity.x = 0;
      newVelocity.z = 0;
    }
    
    // Handle jumping
    if (keys.current.space && isGrounded) {
      newVelocity.y = JUMP_FORCE;
      setIsGrounded(false);
    }
    
    // Calculate new position
    const newPos = {
      x: currentPos.x + newVelocity.x * delta,
      y: currentPos.y + newVelocity.y * delta,
      z: currentPos.z + newVelocity.z * delta
    };
    
    // Collision detection
    let onPlatform = false;
    const tolerance = 0.3;
    const verticalTolerance = 0.1;
    const playerBottom = newPos.y - 0.5;
    
    // Check spawn platform
    const spawnPlatform = { pos: [0, 0, 0], size: [6, 0.5, 6] };
    
    if (playerBottom <= spawnPlatform.pos[1] + spawnPlatform.size[1]/2 + verticalTolerance && 
        playerBottom >= spawnPlatform.pos[1] - spawnPlatform.size[1]/2 - 0.5) {
      
      const isOnSpawn = Math.abs(newPos.x - spawnPlatform.pos[0]) <= spawnPlatform.size[0]/2 + tolerance && 
                       Math.abs(newPos.z - spawnPlatform.pos[2]) <= spawnPlatform.size[2]/2 + tolerance;
      
      if (isOnSpawn && newVelocity.y <= 0.1) {
        newPos.y = spawnPlatform.pos[1] + spawnPlatform.size[1]/2 + 0.5;
        newVelocity.y = Math.max(0, newVelocity.y);
        onPlatform = true;
        setIsGrounded(true);
      }
    }
    
    // Check spiral tower platforms
    if (!onPlatform) {
      const centerX = 0, centerZ = 0, baseRadius = 8, totalLevels = 50;
      const heightIncrement = 0.8, platformsPerRotation = 12;
      
      const playerHeight = newPos.y;
      const startLevel = Math.max(0, Math.floor((playerHeight - 3) / heightIncrement));
      const endLevel = Math.min(totalLevels, Math.floor((playerHeight + 3) / heightIncrement) + 1);
      
      for (let level = startLevel; level < endLevel; level++) {
        const angle = (level / platformsPerRotation) * Math.PI * 2;
        const height = 1.5 + level * heightIncrement;
        const radius = baseRadius + Math.sin(level * 0.2) * 1;
        
        const x = centerX + Math.cos(angle) * radius;
        const z = centerZ + Math.sin(angle) * radius;
        
        let platformSize = [2.5, 0.5, 2.5];
        if (height < 10) platformSize = [3, 0.5, 3];
        else if (height < 20) platformSize = [2.5, 0.5, 2.5];
        else if (height < 30) platformSize = [2, 0.5, 2];
        else platformSize = [1.8, 0.5, 1.8];
        
        if (playerBottom <= height + platformSize[1]/2 + verticalTolerance && 
            playerBottom >= height - platformSize[1]/2 - 0.5) {
          
          const isOnPlatform = Math.abs(newPos.x - x) <= platformSize[0]/2 + tolerance && 
                              Math.abs(newPos.z - z) <= platformSize[2]/2 + tolerance;
          
          if (isOnPlatform && newVelocity.y <= 0.1) {
            newPos.y = height + platformSize[1]/2 + 0.5;
            newVelocity.y = Math.max(0, newVelocity.y);
            onPlatform = true;
            setIsGrounded(true);
            break;
          }
        }
        
        // Check bridge platforms
        if (level % 4 === 1 && level > 0) {
          const prevAngle = ((level - 1) / platformsPerRotation) * Math.PI * 2;
          const prevX = centerX + Math.cos(prevAngle) * radius;
          const prevZ = centerZ + Math.sin(prevAngle) * radius;
          const prevHeight = 1.5 + (level - 1) * heightIncrement;
          
          const bridgeX = (x + prevX) / 2;
          const bridgeZ = (z + prevZ) / 2;
          const bridgeHeight = (height + prevHeight) / 2;
          const bridgeSize = [1.5, 0.5, 1.5];
          
          if (playerBottom <= bridgeHeight + bridgeSize[1]/2 + verticalTolerance && 
              playerBottom >= bridgeHeight - bridgeSize[1]/2 - 0.5) {
            
            const isOnBridge = Math.abs(newPos.x - bridgeX) <= bridgeSize[0]/2 + tolerance && 
                              Math.abs(newPos.z - bridgeZ) <= bridgeSize[2]/2 + tolerance;
            
            if (isOnBridge && newVelocity.y <= 0.1) {
              newPos.y = bridgeHeight + bridgeSize[1]/2 + 0.5;
              newVelocity.y = Math.max(0, newVelocity.y);
              onPlatform = true;
              setIsGrounded(true);
              break;
            }
          }
        }
      }
    }
    
    if (!onPlatform) {
      setIsGrounded(false);
    }
    
    // Update position and velocity
    groupRef.current.position.set(newPos.x, newPos.y, newPos.z);
    setVelocity(newVelocity);
    
    // Rotate character to face movement direction
    if (inputVector.length() > 0) {
      const angle = Math.atan2(newVelocity.x, newVelocity.z);
      groupRef.current.rotation.y = angle;
    }
  };
  
  // Camera update
  const updateCamera = () => {
    if (!groupRef.current) return;
    
    // Handle arrow key camera rotation
    if (keys.current.arrowLeft) cameraState.current.horizontalAngle += 0.02;
    if (keys.current.arrowRight) cameraState.current.horizontalAngle -= 0.02;
    if (keys.current.arrowUp) cameraState.current.verticalAngle = Math.min(1, cameraState.current.verticalAngle + 0.02);
    if (keys.current.arrowDown) cameraState.current.verticalAngle = Math.max(-1, cameraState.current.verticalAngle - 0.02);
    
    // Use mouse angle if mouse is locked, otherwise use arrow keys
    const horizontalAngle = cameraState.current.isMouseLocked 
      ? cameraState.current.mouseX 
      : cameraState.current.horizontalAngle;
    const verticalAngle = cameraState.current.isMouseLocked 
      ? cameraState.current.mouseY 
      : cameraState.current.verticalAngle;
    
    // Calculate camera position
    const characterPos = groupRef.current.position;
    const cameraDistance = cameraState.current.distance;
    const cameraHeight = cameraState.current.height;
    
    const x = characterPos.x + Math.sin(horizontalAngle) * cameraDistance;
    const z = characterPos.z + Math.cos(horizontalAngle) * cameraDistance;
    const y = characterPos.y + cameraHeight + verticalAngle * 3;
    
    // Smooth camera movement
    camera.position.lerp(new THREE.Vector3(x, y, z), 0.08);
    camera.lookAt(characterPos.x, characterPos.y + 2, characterPos.z);
  };
  
  // Checkpoint detection
  const checkForCheckpoints = () => {
    const pos = groupRef.current.position;
    const currentHeight = Math.floor((pos.y - 1.5) / 0.8);
    
    // Check for checkpoint every 8 levels
    if (currentHeight > 0 && currentHeight % 8 === 0) {
      const checkpointId = Math.floor(currentHeight / 8);
      if (!checkpointsReached.has(checkpointId)) {
        setCheckpointsReached(prev => new Set([...prev, checkpointId]));
        setLastCheckpoint({ x: pos.x, y: pos.y, z: pos.z });
        if (onCheckpoint) onCheckpoint();
      }
    }
  };
  
  // Respawn function
  const respawn = () => {
    groupRef.current.position.set(lastCheckpoint.x, lastCheckpoint.y, lastCheckpoint.z);
    setVelocity({ x: 0, y: 0, z: 0 });
    setIsGrounded(true);
  };
  
  // Character parts with Roblox colors
  const headRef = useRef();
  const leftArmRef = useRef();
  const rightArmRef = useRef();
  const leftLegRef = useRef();
  const rightLegRef = useRef();
  
  // Animation
  useEffect(() => {
    const animate = () => {
      if (velocity.x !== 0 || velocity.z !== 0) {
        const walkOffset = Math.sin(walkCycle.current) * 0.1;
        
        if (leftArmRef.current) leftArmRef.current.rotation.x = walkOffset;
        if (rightArmRef.current) rightArmRef.current.rotation.x = -walkOffset;
        if (leftLegRef.current) leftLegRef.current.rotation.x = -walkOffset;
        if (rightLegRef.current) rightLegRef.current.rotation.x = walkOffset;
      }
    };
    
    const interval = setInterval(animate, 16);
    return () => clearInterval(interval);
  }, [velocity]);
  
  return (
    <group ref={groupRef} position={[0, 1.25, 0]}>
      {/* Head */}
      <mesh ref={headRef} position={[0, 0.75, 0]}>
        <boxGeometry args={[0.8, 0.8, 0.8]} />
        <meshLambertMaterial color="#FFDBAC" />
        {/* Simple face */}
        <mesh position={[0, 0, 0.41]}>
          <planeGeometry args={[0.2, 0.1]} />
          <meshBasicMaterial color="#000000" />
        </mesh>
      </mesh>
      
      {/* Torso */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[1, 1, 0.5]} />
        <meshLambertMaterial color="#4FC3F7" />
      </mesh>
      
      {/* Left Arm */}
      <mesh ref={leftArmRef} position={[-0.75, 0, 0]}>
        <boxGeometry args={[0.5, 1, 0.5]} />
        <meshLambertMaterial color="#FFDBAC" />
      </mesh>
      
      {/* Right Arm */}
      <mesh ref={rightArmRef} position={[0.75, 0, 0]}>
        <boxGeometry args={[0.5, 1, 0.5]} />
        <meshLambertMaterial color="#FFDBAC" />
      </mesh>
      
      {/* Left Leg */}
      <mesh ref={leftLegRef} position={[-0.25, -0.75, 0]}>
        <boxGeometry args={[0.5, 0.5, 0.5]} />
        <meshLambertMaterial color="#2E7D32" />
      </mesh>
      
      {/* Right Leg */}
      <mesh ref={rightLegRef} position={[0.25, -0.75, 0]}>
        <boxGeometry args={[0.5, 0.5, 0.5]} />
        <meshLambertMaterial color="#2E7D32" />
      </mesh>
    </group>
  );
}

export default RobloxCharacter;