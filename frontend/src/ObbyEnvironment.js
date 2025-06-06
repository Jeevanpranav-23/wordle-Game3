import React, { useMemo } from 'react';
import * as THREE from 'three';

// Lego Block Component with studs
function LegoBlock({ position, size, color, type = 'platform' }) {
  const studPositions = useMemo(() => {
    const positions = [];
    const maxStuds = Math.min(4, Math.floor(size[0]) * Math.floor(size[2])); // Limit studs for performance
    
    for (let x = 0; x < Math.min(2, Math.floor(size[0])); x++) {
      for (let z = 0; z < Math.min(2, Math.floor(size[2])); z++) {
        if (positions.length < maxStuds) {
          positions.push([
            (x - Math.floor(size[0]) / 2 + 0.5) * (size[0] / Math.floor(size[0])),
            size[1] / 2 + 0.1,
            (z - Math.floor(size[2]) / 2 + 0.5) * (size[2] / Math.floor(size[2]))
          ]);
        }
      }
    }
    return positions;
  }, [size]);
  
  const blockColor = type === 'checkpoint' ? '#00ff00' : 
                    type === 'jumpPad' ? '#ffff00' :
                    type === 'speedPad' ? '#00ffff' :
                    type === 'moving' ? '#8b008b' :
                    type === 'spinner' ? '#8b008b' :
                    type === 'kill' ? '#ff0000' :
                    color;
  
  const opacity = type === 'checkpoint' ? 0.7 : 1;
  
  return (
    <group position={position}>
      {/* Main block */}
      <mesh>
        <boxGeometry args={size} />
        <meshLambertMaterial 
          color={blockColor} 
          transparent={opacity < 1}
          opacity={opacity}
        />
      </mesh>
      
      {/* Studs - reduced geometry for performance */}
      {studPositions.map((studPos, index) => (
        <mesh key={index} position={studPos}>
          <cylinderGeometry args={[0.15, 0.15, 0.2, 6]} />
          <meshLambertMaterial color={blockColor} />
        </mesh>
      ))}
      
      {/* Special effects for certain types */}
      {type === 'speedPad' && (
        <mesh position={[0, size[1]/2 + 0.15, 0]}>
          <cylinderGeometry args={[size[0]/2 - 0.1, size[0]/2 - 0.1, 0.1, 16]} />
          <meshBasicMaterial color="#00ffff" transparent opacity={0.5} />
        </mesh>
      )}
      
      {type === 'jumpPad' && (
        <mesh position={[0, size[1]/2 + 0.15, 0]}>
          <cylinderGeometry args={[size[0]/2 - 0.1, size[0]/2 - 0.1, 0.1, 16]} />
          <meshBasicMaterial color="#ffff00" transparent opacity={0.7} />
        </mesh>
      )}
    </group>
  );
}

function ObbyEnvironment() {
  // Generate spiral tower structure
  const platforms = useMemo(() => {
    const platformList = [];
    const centerX = 0;
    const centerZ = 0;
    const baseRadius = 8;
    const totalLevels = 50;
    const heightIncrement = 0.8;
    const platformsPerRotation = 12;
    
    // Spawn platform
    platformList.push({
      position: [0, 0, 0],
      size: [6, 0.5, 6],
      color: '#4ecdc4',
      type: 'platform'
    });
    
    // Generate spiral platforms
    for (let level = 0; level < totalLevels; level++) {
      const angle = (level / platformsPerRotation) * Math.PI * 2;
      const height = 1.5 + level * heightIncrement;
      const radius = baseRadius + Math.sin(level * 0.2) * 1; // Slight radius variation
      
      const x = centerX + Math.cos(angle) * radius;
      const z = centerZ + Math.sin(angle) * radius;
      
      // Platform size based on difficulty
      let platformSize, color;
      if (height < 10) {
        platformSize = [3, 0.5, 3];
        color = '#4FC3F7'; // Blue - Easy
      } else if (height < 20) {
        platformSize = [2.5, 0.5, 2.5];
        color = '#FF69B4'; // Pink - Medium
      } else if (height < 30) {
        platformSize = [2, 0.5, 2];
        color = '#DDA0DD'; // Plum - Hard
      } else {
        platformSize = [1.8, 0.5, 1.8];
        color = '#FF6B6B'; // Red - Expert
      }
      
      platformList.push({
        position: [x, height, z],
        size: platformSize,
        color: color,
        type: 'platform'
      });
      
      // Add checkpoints every 8 levels
      if (level > 0 && level % 8 === 0) {
        platformList.push({
          position: [x, height + 1, z],
          size: [1, 2, 1],
          color: '#00ff00',
          type: 'checkpoint'
        });
      }
      
      // Add special elements based on level
      const specialChance = Math.random();
      
      // Jump pads (every few levels)
      if (level > 5 && level % 6 === 0 && specialChance < 0.3) {
        platformList.push({
          position: [x, height + 0.3, z],
          size: [1.5, 0.2, 1.5],
          color: '#ffff00',
          type: 'jumpPad'
        });
      }
      
      // Speed pads
      if (level > 10 && level % 7 === 0 && specialChance < 0.4) {
        platformList.push({
          position: [x, height + 0.3, z],
          size: [2, 0.2, 2],
          color: '#00ffff',
          type: 'speedPad'
        });
      }
      
      // Moving platforms (higher levels)
      if (level > 20 && level % 10 === 0 && specialChance < 0.2) {
        platformList.push({
          position: [x + 2, height, z],
          size: [2, 0.5, 2],
          color: '#8b008b',
          type: 'moving'
        });
      }
      
      // Spinners (obstacles)
      if (level > 15 && level % 8 === 3 && specialChance < 0.25) {
        platformList.push({
          position: [x, height + 1.5, z],
          size: [3, 0.3, 0.3],
          color: '#8b008b',
          type: 'spinner'
        });
      }
      
      // Kill parts (dangerous zones)
      if (level > 25 && level % 12 === 0 && specialChance < 0.15) {
        platformList.push({
          position: [x, height - 1, z],
          size: [1, 0.3, 1],
          color: '#ff0000',
          type: 'kill'
        });
      }
      
      // Bridge platforms (every 4 levels for easier navigation)
      if (level % 4 === 1 && level > 0) {
        const prevAngle = ((level - 1) / platformsPerRotation) * Math.PI * 2;
        const prevX = centerX + Math.cos(prevAngle) * radius;
        const prevZ = centerZ + Math.sin(prevAngle) * radius;
        const prevHeight = 1.5 + (level - 1) * heightIncrement;
        
        const bridgeX = (x + prevX) / 2;
        const bridgeZ = (z + prevZ) / 2;
        const bridgeHeight = (height + prevHeight) / 2;
        
        platformList.push({
          position: [bridgeX, bridgeHeight, bridgeZ],
          size: [1.5, 0.5, 1.5],
          color: '#FFA500', // Orange bridges
          type: 'platform'
        });
      }
    }
    
    return platformList;
  }, []);
  
  return (
    <group>
      {platforms.map((platform, index) => (
        <LegoBlock
          key={index}
          position={platform.position}
          size={platform.size}
          color={platform.color}
          type={platform.type}
        />
      ))}
      
      {/* Victory platform at the top */}
      <LegoBlock
        position={[0, 42, 0]}
        size={[8, 1, 8]}
        color="#FFD700"
        type="victory"
      />
      
      {/* Victory text */}
      <mesh position={[0, 45, 0]}>
        <boxGeometry args={[0.1, 0.1, 0.1]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
    </group>
  );
}

export default ObbyEnvironment;