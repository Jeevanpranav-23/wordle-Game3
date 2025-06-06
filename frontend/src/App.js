import React, { Suspense, useState, useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Sky, Text, Float } from '@react-three/drei';
import RobloxCharacter from './RobloxCharacter';
import ObbyEnvironment from './ObbyEnvironment';
import './App.css';

// Lego Skybox Component
function LegoSkybox() {
  return (
    <mesh scale={[100, 100, 100]}>
      <sphereGeometry args={[1, 32, 32]} />
      <meshBasicMaterial color="#87CEEB" transparent opacity={0.8} side={2} />
    </mesh>
  );
}

// Floating Lego Brick Component
function FloatingLegoBrick({ position, color = "#ff6b6b", size = [1, 1, 1] }) {
  const meshRef = useRef();
  
  return (
    <Float speed={1.5} rotationIntensity={0.5} floatIntensity={0.5}>
      <group ref={meshRef} position={position}>
        {/* Brick base */}
        <mesh>
          <boxGeometry args={size} />
          <meshLambertMaterial color={color} />
        </mesh>
        {/* Studs - reduced for performance */}
        {[0, 1].map((x) =>
          [0, 1].map((z) => (
            <mesh key={`${x}-${z}`} position={[
              (x - 0.5) * size[0] * 0.6,
              size[1] * 0.5 + 0.1,
              (z - 0.5) * size[2] * 0.6
            ]}>
              <cylinderGeometry args={[0.15, 0.15, 0.2, 4]} />
              <meshLambertMaterial color={color} />
            </mesh>
          ))
        )}
      </group>
    </Float>
  );
}

// Background Elements
function LegoBackgroundElements() {
  const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f39c12', '#e74c3c', '#9b59b6', '#2ecc71', '#f1c40f'];
  
  return (
    <group>
      {/* Floating bricks in sky - reduced count */}
      {Array.from({ length: 8 }, (_, i) => (
        <FloatingLegoBrick
          key={i}
          position={[
            (Math.random() - 0.5) * 60,
            Math.random() * 20 + 10,
            (Math.random() - 0.5) * 60
          ]}
          color={colors[i % colors.length]}
          size={[
            Math.random() * 2 + 1,
            Math.random() * 1 + 0.5,
            Math.random() * 2 + 1
          ]}
        />
      ))}
      
      {/* City skyline - reduced count */}
      {Array.from({ length: 4 }, (_, i) => (
        <FloatingLegoBrick
          key={`city-${i}`}
          position={[
            Math.cos((i / 4) * Math.PI * 2) * 40,
            Math.random() * 8 + 5,
            Math.sin((i / 4) * Math.PI * 2) * 40
          ]}
          color={colors[(i * 2) % colors.length]}
          size={[3, Math.random() * 6 + 2, 3]}
        />
      ))}
      
      {/* Ground plane */}
      <mesh position={[0, -5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[200, 200]} />
        <meshLambertMaterial color="#2ecc71" />
      </mesh>
    </group>
  );
}

// Game UI Component
function GameUI({ playerHeight, stage, zone, checkpoints, totalCheckpoints }) {
  const progress = (checkpoints / totalCheckpoints) * 100;
  
  return (
    <div className="game-ui">
      <div className="stats-panel">
        <div className="stat">
          <span className="stat-label">Stage</span>
          <span className="stat-value">{stage}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Height</span>
          <span className="stat-value">{playerHeight.toFixed(1)}m</span>
        </div>
        <div className="stat">
          <span className="stat-label">Zone</span>
          <span className="stat-value">{zone}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Checkpoints</span>
          <span className="stat-value">{checkpoints}/{totalCheckpoints}</span>
        </div>
      </div>
      
      <div className="progress-container">
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="progress-text">{progress.toFixed(1)}% Complete</span>
      </div>
      
      <div className="controls-hint">
        <div>WASD: Move | Space: Jump</div>
        <div>Arrow Keys: Rotate Camera | Right Click + Drag: Mouse Look</div>
      </div>
    </div>
  );
}

function App() {
  const [playerHeight, setPlayerHeight] = useState(0);
  const [stage, setStage] = useState(1);
  const [zone, setZone] = useState("Starting Platform");
  const [checkpoints, setCheckpoints] = useState(0);
  const [gameWon, setGameWon] = useState(false);
  const totalCheckpoints = 6; // Every 8 levels up to 50
  
  // Calculate stage and zone based on height
  useEffect(() => {
    const newStage = Math.min(5, Math.floor(playerHeight / 10) + 1);
    setStage(newStage);
    
    if (playerHeight < 5) setZone("Starting Platform");
    else if (playerHeight < 15) setZone("Learning Zone");
    else if (playerHeight < 25) setZone("Challenge Zone");
    else if (playerHeight < 35) setZone("Expert Zone");
    else if (playerHeight < 45) setZone("Master Zone");
    else setZone("Victory Zone");
    
    // Check for victory condition
    if (playerHeight >= 45 && !gameWon) {
      setGameWon(true);
    }
  }, [playerHeight, gameWon]);

  const handleCheckpoint = () => {
    setCheckpoints(prev => Math.min(totalCheckpoints, prev + 1));
  };

  return (
    <div className="App">
      <Canvas
        camera={{ 
          position: [15, 8, 15], 
          fov: 75,
          near: 0.1,
          far: 1000
        }}
        shadows={false} // Disabled for performance
      >
        {/* Lighting */}
        <ambientLight intensity={0.6} />
        <directionalLight 
          position={[50, 50, 25]} 
          intensity={1}
          castShadow={false} // Disabled for performance
        />
        
        {/* Background */}
        <LegoSkybox />
        <LegoBackgroundElements />
        
        {/* Fog for atmosphere */}
        <fog attach="fog" args={['#87CEEB', 30, 80]} />
        
        {/* Game Elements */}
        <Suspense fallback={null}>
          <RobloxCharacter 
            onHeightChange={setPlayerHeight}
            onCheckpoint={handleCheckpoint}
          />
          <ObbyEnvironment />
        </Suspense>
      </Canvas>
      
      {/* UI Overlay */}
      <GameUI 
        playerHeight={playerHeight}
        stage={stage}
        zone={zone}
        checkpoints={checkpoints}
        totalCheckpoints={totalCheckpoints}
      />
      
      {/* Victory Message */}
      {gameWon && (
        <div className="victory-message">
          <h1>🎉 VICTORY! 🎉</h1>
          <p>You've conquered the Obby Tower!</p>
          <p>Final Height: {playerHeight.toFixed(1)}m</p>
        </div>
      )}
    </div>
  );
}

export default App;