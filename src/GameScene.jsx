import { useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { CanvasTexture, MathUtils, Shape, Vector3 } from 'three'

// Three.js objects are mutable by design; React Three Fiber animates them inside useFrame.
// oxlint-disable react/immutability

const TILE_SIZE = 2.1
const ROAD_ROWS = new Set([1, 3, 6])
const WORLD_ROWS = Array.from({ length: 7 }, (_, index) => index)
const BOARD_COLUMNS = 7
const BOARD_WIDTH = BOARD_COLUMNS * TILE_SIZE
const BOARD_CENTER_Y = 3 * TILE_SIZE
const BOARD_DEPTH = WORLD_ROWS.length * TILE_SIZE
const TREE_LAYOUTS = [
  [-3, 3],
  [-3, 2],
  [-2, 3],
]
const PARKED_CARS = {
  1: [
    { x: -5.55, color: '#ff785c', direction: 1 },
    { x: 4.85, color: '#f0c949', direction: -1 },
  ],
  3: [
    { x: -4.35, color: '#8f78d6', direction: -1 },
    { x: 5.55, color: '#57ad79', direction: 1 },
  ],
  6: [
    { x: -5.75, color: '#88c7df', direction: 1 },
    { x: 3.95, color: '#f7a65a', direction: -1 },
  ],
}

const COIN_SHAPE = new Shape()
COIN_SHAPE.moveTo(-0.35, -0.58)
COIN_SHAPE.lineTo(0.35, -0.58)
COIN_SHAPE.lineTo(0.35, -0.52)
COIN_SHAPE.lineTo(0.49, -0.52)
COIN_SHAPE.lineTo(0.49, -0.38)
COIN_SHAPE.lineTo(0.56, -0.38)
COIN_SHAPE.lineTo(0.56, 0.38)
COIN_SHAPE.lineTo(0.49, 0.38)
COIN_SHAPE.lineTo(0.49, 0.52)
COIN_SHAPE.lineTo(0.35, 0.52)
COIN_SHAPE.lineTo(0.35, 0.58)
COIN_SHAPE.lineTo(-0.35, 0.58)
COIN_SHAPE.lineTo(-0.35, 0.52)
COIN_SHAPE.lineTo(-0.49, 0.52)
COIN_SHAPE.lineTo(-0.49, 0.38)
COIN_SHAPE.lineTo(-0.56, 0.38)
COIN_SHAPE.lineTo(-0.56, -0.38)
COIN_SHAPE.lineTo(-0.49, -0.38)
COIN_SHAPE.lineTo(-0.49, -0.52)
COIN_SHAPE.lineTo(-0.35, -0.52)
COIN_SHAPE.closePath()

const COIN_EXTRUSION = {
  depth: 0.22,
  bevelEnabled: false,
  steps: 1,
}

const COIN_MARK_SEGMENTS = [
  { x: 0.02, z: 0.22, width: 0.62, height: 0.14 },
  { x: -0.22, z: 0, width: 0.14, height: 0.56 },
  { x: 0.02, z: -0.22, width: 0.62, height: 0.14 },
]

function CameraRig() {
  const { camera, size } = useThree()
  const lookAt = useRef(new Vector3(0, BOARD_CENTER_Y, 0))

  useFrame((_, delta) => {
    camera.position.x = MathUtils.damp(camera.position.x, 9.5, 4, delta)
    camera.position.y = MathUtils.damp(camera.position.y, BOARD_CENTER_Y - 11.75, 4, delta)
    camera.position.z = MathUtils.damp(camera.position.z, 9, 4, delta)
    lookAt.current.x = MathUtils.damp(lookAt.current.x, 0, 5, delta)
    lookAt.current.y = MathUtils.damp(lookAt.current.y, BOARD_CENTER_Y, 5, delta)
    lookAt.current.z = MathUtils.damp(lookAt.current.z, 0, 5, delta)
    camera.lookAt(lookAt.current)

    const targetZoom = Math.min(size.width / 24, size.height / 20, 28)
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

function GrassRow({ row }) {
  const trees = TREE_LAYOUTS[Math.abs(row) % TREE_LAYOUTS.length]

  return (
    <group position-y={row * TILE_SIZE}>
      <mesh position-z={-0.13} receiveShadow>
        <boxGeometry args={[BOARD_WIDTH, TILE_SIZE, 0.28]} />
        <meshLambertMaterial color={row % 2 === 0 ? '#91c95f' : '#9bd06b'} />
      </mesh>
      {trees.map((tile) => (
        <Tree key={tile} tile={tile} row={row} />
      ))}
    </group>
  )
}

function ParkedCar({ x, color, direction = 1 }) {
  const length = 2.1
  const cabinX = direction * 0.3

  return (
    <group position={[x, 0, 0.15]}>
      <mesh position-z={0.4} castShadow receiveShadow>
        <boxGeometry args={[length, 0.9, 0.48]} />
        <meshLambertMaterial color={color} />
      </mesh>
      <mesh position={[cabinX, 0, 0.78]} castShadow>
        <boxGeometry args={[0.95, 0.76, 0.42]} />
        <meshLambertMaterial color="#e9f7f7" />
      </mesh>
      <mesh position={[cabinX + direction * 0.15, -0.4, 0.8]}>
        <boxGeometry args={[0.46, 0.04, 0.2]} />
        <meshBasicMaterial color="#8ccbd2" />
      </mesh>
      {[-0.65, 0.65].map((wheelX) => (
        <group key={wheelX} position-x={wheelX}>
          <mesh position={[0, -0.47, 0.25]} rotation-x={Math.PI / 2} castShadow>
            <cylinderGeometry args={[0.25, 0.25, 0.14, 12]} />
            <meshLambertMaterial color="#263136" />
          </mesh>
          <mesh position={[0, 0.47, 0.25]} rotation-x={Math.PI / 2} castShadow>
            <cylinderGeometry args={[0.25, 0.25, 0.14, 12]} />
            <meshLambertMaterial color="#263136" />
          </mesh>
        </group>
      ))}
    </group>
  )
}

function RoadRow({ row }) {
  const cars = PARKED_CARS[row] || []

  return (
    <group position-y={row * TILE_SIZE}>
      <mesh position-z={-0.08} receiveShadow>
        <boxGeometry args={[BOARD_WIDTH, TILE_SIZE, 0.16]} />
        <meshLambertMaterial color="#3e4a4e" />
      </mesh>
      <mesh position={[0, -0.82, 0.02]}>
        <boxGeometry args={[BOARD_WIDTH, 0.06, 0.03]} />
        <meshBasicMaterial color="#d8d3bc" />
      </mesh>
      <mesh position={[0, 0.82, 0.02]}>
        <boxGeometry args={[BOARD_WIDTH, 0.06, 0.03]} />
        <meshBasicMaterial color="#d8d3bc" />
      </mesh>
      {[-6, -3, 0, 3, 6].map((x) => (
        <mesh key={x} position={[x, 0, 0.02]}>
          <boxGeometry args={[1.25, 0.06, 0.03]} />
          <meshBasicMaterial color="#f3edda" />
        </mesh>
      ))}
      {cars.map((car) => (
        <ParkedCar key={`${car.x}-${car.color}`} {...car} />
      ))}
    </group>
  )
}

function Chicken({ row, tile, hopKey }) {
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
  }, [row, tile, hopKey])

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

function DestinationCoin({ destination, isActivating }) {
  const group = useRef()
  const activationTime = useRef(1)

  useEffect(() => {
    if (isActivating) activationTime.current = 0
  }, [isActivating])

  useFrame(({ clock }, delta) => {
    if (!group.current) return
    activationTime.current = Math.min(activationTime.current + delta, 0.45)
    const progress = activationTime.current / 0.45
    const pulse = progress < 1 ? Math.sin(progress * Math.PI) : 0
    group.current.position.z = 0.72
      + Math.sin(clock.elapsedTime * 2.2 + destination.sectionIndex) * 0.08
      + pulse * 0.7
    group.current.rotation.z += delta * 0.8
    group.current.scale.setScalar(1 + pulse * 0.42)
  })

  return (
    <group
      ref={group}
      position={[destination.tile * TILE_SIZE, destination.row * TILE_SIZE, 0.72]}
    >
      <mesh rotation-x={Math.PI / 2} castShadow receiveShadow>
        <extrudeGeometry args={[COIN_SHAPE, COIN_EXTRUSION]} />
        <meshLambertMaterial attach="material-0" color="#ffdc19" />
        <meshLambertMaterial attach="material-1" color="#bc9300" />
      </mesh>
      {COIN_MARK_SEGMENTS.map((segment) => (
        <mesh
          key={`recess-${segment.x}-${segment.z}`}
          position={[segment.x, -0.235, segment.z]}
          castShadow
        >
          <boxGeometry args={[segment.width + 0.055, 0.035, segment.height + 0.055]} />
          <meshLambertMaterial color="#9c7900" />
        </mesh>
      ))}
      {COIN_MARK_SEGMENTS.map((segment) => (
        <mesh
          key={`mark-${segment.x}-${segment.z}`}
          position={[segment.x, -0.26, segment.z]}
          castShadow
        >
          <boxGeometry args={[segment.width, 0.035, segment.height]} />
          <meshLambertMaterial color="#ff203b" />
        </mesh>
      ))}
    </group>
  )
}

function DestinationLabel({ destination, canActivate }) {
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 768
    canvas.height = 160
    const context = canvas.getContext('2d')
    const text = canActivate
      ? `${destination.label.toUpperCase()}  •  ENTER`
      : destination.label.toUpperCase()

    context.imageSmoothingEnabled = false
    context.fillStyle = 'rgba(23, 33, 39, 0.94)'
    context.fillRect(10, 18, canvas.width - 20, canvas.height - 36)
    context.strokeStyle = '#ffffff'
    context.lineWidth = 8
    context.strokeRect(10, 18, canvas.width - 20, canvas.height - 36)
    context.fillStyle = '#ffffff'
    context.font = '700 46px monospace'
    context.textAlign = 'center'
    context.textBaseline = 'middle'
    context.fillText(text, canvas.width / 2, canvas.height / 2 + 2)

    return new CanvasTexture(canvas)
  }, [canActivate, destination.label])

  useEffect(() => () => texture.dispose(), [texture])

  return (
    <sprite
      position={[
        destination.tile * TILE_SIZE,
        destination.row * TILE_SIZE,
        3.05,
      ]}
      scale={[5.4, 1.12, 1]}
      renderOrder={10}
    >
      <spriteMaterial map={texture} transparent depthTest={false} />
    </sprite>
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

function World({ position, destinations, activatingSectionIndex, activationKey }) {
  const nearbyDestination = useMemo(() => (
    destinations
      .map((destination) => ({
        ...destination,
        distance: Math.abs(destination.tile - position.tile)
          + Math.abs(destination.row - position.row),
      }))
      .filter((destination) => destination.distance === 0)
      .sort((first, second) => first.distance - second.distance)[0] || null
  ), [destinations, position.row, position.tile])

  return (
    <>
      <CameraRig />
      <group position-x={-0.55}>
        <mesh position={[0, BOARD_CENTER_Y, -0.62]} castShadow receiveShadow>
          <boxGeometry args={[BOARD_WIDTH + 0.45, BOARD_DEPTH + 0.45, 1.05]} />
          <meshLambertMaterial color="#587348" />
        </mesh>
        {WORLD_ROWS.map((row) =>
          ROAD_ROWS.has(row)
            ? <RoadRow key={row} row={row} />
            : <GrassRow key={row} row={row} />,
        )}
        {destinations.map((destination) => (
          <DestinationCoin
            key={destination.id}
            destination={destination}
            isActivating={activatingSectionIndex === destination.sectionIndex}
          />
        ))}
        {nearbyDestination ? (
          <DestinationLabel
            destination={nearbyDestination}
            canActivate={nearbyDestination.distance === 0}
          />
        ) : null}
        <Chicken row={position.row} tile={position.tile} hopKey={activationKey} />
        <Cloud position={[4.5, 8.5, 7]} scale={0.65} />
        <Cloud position={[-4.5, 6.8, 5]} scale={0.5} />
        <Cloud position={[5, -1.5, 5]} scale={0.55} />
      </group>
    </>
  )
}

export function GameScene({
  position,
  destinations = [],
  activatingSectionIndex = null,
  activationKey = 0,
}) {
  return (
    <Canvas
      className="game-canvas"
      shadows
      orthographic
      camera={{ position: [9.5, BOARD_CENTER_Y - 11.75, 9], zoom: 24, near: 0.1, far: 100, up: [0, 0, 1] }}
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
      <World
        position={position}
        destinations={destinations}
        activatingSectionIndex={activatingSectionIndex}
        activationKey={activationKey}
      />
    </Canvas>
  )
}
