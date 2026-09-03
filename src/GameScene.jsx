import { useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { MathUtils, Vector3 } from 'three'
import { sections } from './content'

// Three.js objects are mutable by design; React Three Fiber animates them inside useFrame.
// oxlint-disable react/immutability

const TILE_SIZE = 2.1
const ROAD_ROWS = new Set([1, 3, 6, 8])
const WORLD_ROWS = Array.from({ length: 14 }, (_, index) => index - 4)
const TREE_LAYOUTS = [
  [-4, -3, 3, 4],
  [-4, -2, 3],
  [-4, -3, 2, 4],
]

function CameraRig({ row }) {
  const { camera, size } = useThree()
  const lookAt = useRef(new Vector3())

  useFrame((_, delta) => {
    const targetY = row * TILE_SIZE
    camera.position.x = MathUtils.damp(camera.position.x, 9.5, 4, delta)
    camera.position.y = MathUtils.damp(camera.position.y, targetY - 10.5, 4, delta)
    camera.position.z = MathUtils.damp(camera.position.z, 9, 4, delta)
    lookAt.current.x = MathUtils.damp(lookAt.current.x, 0, 5, delta)
    lookAt.current.y = MathUtils.damp(lookAt.current.y, targetY + 1.25, 5, delta)
    lookAt.current.z = MathUtils.damp(lookAt.current.z, 0, 5, delta)
    camera.lookAt(lookAt.current)

    const targetZoom = size.width < 700 ? 40 : 53
    const nextZoom = MathUtils.damp(camera.zoom, targetZoom, 5, delta)
    if (Math.abs(nextZoom - camera.zoom) > 0.01) {
      camera.zoom = nextZoom
      camera.updateProjectionMatrix()
    }
  })

  return null
}

function Tree({ tile, row }) {
  const height = 1.3 + ((Math.abs(tile + row) * 7) % 4) * 0.12
  const crown = row % 3 === 0 ? '#4f9a58' : '#58a85c'

  return (
    <group position={[tile * TILE_SIZE, 0, 0]}>
      <mesh position-z={0.42} castShadow receiveShadow>
        <boxGeometry args={[0.38, 0.38, 0.84]} />
        <meshLambertMaterial color="#7f5435" />
      </mesh>
      <mesh position-z={0.88 + height / 2} castShadow receiveShadow>
        <boxGeometry args={[1.15, 1.15, height]} />
        <meshLambertMaterial color={crown} />
      </mesh>
      <mesh position={[-0.18, -0.18, 1.1 + height]} castShadow>
        <boxGeometry args={[0.5, 0.5, 0.38]} />
        <meshLambertMaterial color="#70bd67" />
      </mesh>
    </group>
  )
}

function SectionMarker({ index }) {
  const section = sections[index]

  return (
    <group position={[-9.2, 0, 0]}>
      <mesh position-z={0.7} castShadow>
        <boxGeometry args={[0.16, 0.16, 1.4]} />
        <meshLambertMaterial color="#203238" />
      </mesh>
      <mesh position={[0, 0, 1.25]} castShadow>
        <boxGeometry args={[1.2, 0.18, 0.7]} />
        <meshLambertMaterial color={section.accent} />
      </mesh>
      <mesh position={[0.37, -0.11, 1.38]}>
        <boxGeometry args={[0.22, 0.04, 0.22]} />
        <meshBasicMaterial color="#172127" />
      </mesh>
    </group>
  )
}

function GrassRow({ row }) {
  const sectionIndex = row >= 0 && row < sections.length ? row : null
  const trees = TREE_LAYOUTS[Math.abs(row) % TREE_LAYOUTS.length]

  return (
    <group position-y={row * TILE_SIZE}>
      <mesh position-z={-0.13} receiveShadow>
        <boxGeometry args={[24, TILE_SIZE, 0.28]} />
        <meshLambertMaterial color={row % 2 === 0 ? '#91c95f' : '#9bd06b'} />
      </mesh>
      {trees.map((tile) => (
        <Tree key={tile} tile={tile} row={row} />
      ))}
      {sectionIndex !== null && <SectionMarker index={sectionIndex} />}
    </group>
  )
}

function Vehicle({ row, initialX, direction, speed, color, truck = false }) {
  const vehicle = useRef()

  useFrame((_, delta) => {
    if (!vehicle.current) return
    vehicle.current.position.x += direction * speed * delta
    if (vehicle.current.position.x > 13) vehicle.current.position.x = -13
    if (vehicle.current.position.x < -13) vehicle.current.position.x = 13
  })

  const length = truck ? 3.5 : 2.35
  const cabinX = direction > 0 ? length * 0.22 : -length * 0.22

  return (
    <group ref={vehicle} position={[initialX, row * TILE_SIZE, 0.15]}>
      <mesh position-z={0.42} castShadow receiveShadow>
        <boxGeometry args={[length, 1.02, 0.52]} />
        <meshLambertMaterial color={color} />
      </mesh>
      <mesh position={[cabinX, 0, 0.86]} castShadow>
        <boxGeometry args={[truck ? 1.1 : 1.15, 0.86, truck ? 0.85 : 0.48]} />
        <meshLambertMaterial color={truck ? color : '#e9f7f7'} />
      </mesh>
      {!truck && (
        <mesh position={[cabinX + direction * 0.18, -0.44, 0.89]}>
          <boxGeometry args={[0.55, 0.05, 0.25]} />
          <meshBasicMaterial color="#8ccbd2" />
        </mesh>
      )}
      {[-length * 0.3, length * 0.3].map((x) => (
        <group key={x} position-x={x}>
          <mesh position={[0, -0.52, 0.28]} rotation-x={Math.PI / 2} castShadow>
            <cylinderGeometry args={[0.29, 0.29, 0.16, 12]} />
            <meshLambertMaterial color="#263136" />
          </mesh>
          <mesh position={[0, 0.52, 0.28]} rotation-x={Math.PI / 2} castShadow>
            <cylinderGeometry args={[0.29, 0.29, 0.16, 12]} />
            <meshLambertMaterial color="#263136" />
          </mesh>
        </group>
      ))}
    </group>
  )
}

function RoadRow({ row }) {
  const direction = row % 2 === 0 ? 1 : -1
  const palette = row % 3 === 0 ? ['#ff785c', '#f0c949', '#88c7df'] : ['#8f78d6', '#f7a65a', '#57ad79']

  return (
    <>
      <group position-y={row * TILE_SIZE}>
        <mesh position-z={-0.08} receiveShadow>
          <boxGeometry args={[24, TILE_SIZE, 0.16]} />
          <meshLambertMaterial color="#3e4a4e" />
        </mesh>
        <mesh position={[0, -0.82, 0.02]}>
          <boxGeometry args={[24, 0.06, 0.03]} />
          <meshBasicMaterial color="#d8d3bc" />
        </mesh>
        <mesh position={[0, 0.82, 0.02]}>
          <boxGeometry args={[24, 0.06, 0.03]} />
          <meshBasicMaterial color="#d8d3bc" />
        </mesh>
        {[-8, -4, 0, 4, 8].map((x) => (
          <mesh key={x} position={[x, 0, 0.02]}>
            <boxGeometry args={[1.7, 0.06, 0.03]} />
            <meshBasicMaterial color="#f3edda" />
          </mesh>
        ))}
        {row >= 0 && row < sections.length && <SectionMarker index={row} />}
      </group>
      {[-8, -1, 6].map((x, index) => (
        <Vehicle
          key={x}
          row={row}
          initialX={x}
          direction={direction}
          speed={2.6 + (Math.abs(row) % 3) * 0.45}
          color={palette[index]}
          truck={index === 1 && row % 3 === 0}
        />
      ))}
    </>
  )
}

function Chicken({ row, tile }) {
  const group = useRef()
  const body = useRef()
  const hopTime = useRef(1)
  const previous = useRef({ row, tile })
  const facing = useRef(0)
  const target = useMemo(() => new Vector3(), [])

  useEffect(() => {
    const rowDelta = row - previous.current.row
    const tileDelta = tile - previous.current.tile
    if (rowDelta !== 0) facing.current = rowDelta > 0 ? 0 : Math.PI
    if (tileDelta !== 0) facing.current = tileDelta > 0 ? -Math.PI / 2 : Math.PI / 2
    previous.current = { row, tile }
    hopTime.current = 0
  }, [row, tile])

  useFrame((_, delta) => {
    if (!group.current || !body.current) return
    hopTime.current = Math.min(hopTime.current + delta, 0.46)
    const phase = hopTime.current / 0.46
    const jump = Math.sin(phase * Math.PI) * 0.78
    target.set(tile * TILE_SIZE, row * TILE_SIZE, jump + 0.04)
    group.current.position.x = MathUtils.damp(group.current.position.x, target.x, 16, delta)
    group.current.position.y = MathUtils.damp(group.current.position.y, target.y, 16, delta)
    group.current.position.z = target.z
    group.current.rotation.z = MathUtils.damp(group.current.rotation.z, facing.current, 14, delta)
    body.current.rotation.x = Math.sin(phase * Math.PI) * 0.12
  })

  return (
    <group ref={group} position={[tile * TILE_SIZE, row * TILE_SIZE, 0.04]}>
      <group ref={body}>
        <mesh position-z={0.72} castShadow>
          <boxGeometry args={[0.88, 0.8, 0.88]} />
          <meshLambertMaterial color="#fffdf3" />
        </mesh>
        <mesh position={[0, 0.16, 1.38]} castShadow>
          <boxGeometry args={[0.7, 0.66, 0.68]} />
          <meshLambertMaterial color="#fffdf3" />
        </mesh>
        <mesh position={[0, 0.56, 1.32]} castShadow>
          <boxGeometry args={[0.36, 0.34, 0.25]} />
          <meshLambertMaterial color="#f5bd3d" />
        </mesh>
        {[-0.23, 0.23].map((x) => (
          <mesh key={x} position={[x, 0.5, 1.52]}>
            <boxGeometry args={[0.09, 0.06, 0.1]} />
            <meshBasicMaterial color="#172127" />
          </mesh>
        ))}
        <mesh position={[0, 0.06, 1.82]} castShadow>
          <boxGeometry args={[0.24, 0.24, 0.28]} />
          <meshLambertMaterial color="#ef5c4d" />
        </mesh>
        {[-0.24, 0.24].map((x) => (
          <group key={x} position-x={x}>
            <mesh position={[0, 0, 0.18]} castShadow>
              <boxGeometry args={[0.1, 0.1, 0.38]} />
              <meshLambertMaterial color="#e7a936" />
            </mesh>
            <mesh position={[0, 0.14, 0.04]} castShadow>
              <boxGeometry args={[0.18, 0.32, 0.08]} />
              <meshLambertMaterial color="#e7a936" />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  )
}

function Cloud({ position, scale = 1 }) {
  return (
    <group position={position} scale={scale}>
      {[
        [-0.8, 0, 0],
        [0, 0, 0.25],
        [0.8, 0, 0],
      ].map((point) => (
        <mesh key={point.join('-')} position={point}>
          <boxGeometry args={[1.4, 0.8, 0.75]} />
          <meshLambertMaterial color="#f4fbf8" />
        </mesh>
      ))}
    </group>
  )
}

function World({ position }) {
  return (
    <>
      <CameraRig row={position.row} />
      {WORLD_ROWS.map((row) =>
        ROAD_ROWS.has(row) ? <RoadRow key={row} row={row} /> : <GrassRow key={row} row={row} />,
      )}
      <Chicken row={position.row} tile={position.tile} />
      <Cloud position={[-7, 8, 8]} scale={1.25} />
      <Cloud position={[8, 15, 10]} scale={0.9} />
    </>
  )
}

export function GameScene({ position }) {
  return (
    <Canvas
      className="game-canvas"
      shadows
      orthographic
      camera={{ position: [9.5, -10.5, 9], zoom: 53, near: 0.1, far: 100, up: [0, 0, 1] }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
    >
      <color attach="background" args={['#9fdbe2']} />
      <fog attach="fog" args={['#9fdbe2', 20, 38]} />
      <hemisphereLight args={['#ffffff', '#72875f', 1.75]} />
      <directionalLight
        castShadow
        position={[-8, -10, 16]}
        intensity={2.2}
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-14}
        shadow-camera-right={14}
        shadow-camera-top={14}
        shadow-camera-bottom={-14}
      />
      <World position={position} />
    </Canvas>
  )
}
