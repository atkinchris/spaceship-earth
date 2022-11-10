import { primitives, booleans, transforms } from '@jscad/modeling'
import { Geom3 } from '@jscad/modeling/src/geometries/types'
import { Vec3 } from '@jscad/modeling/src/maths/vec3'
import stlSerializer from '@jscad/stl-serializer'
import fs from 'fs'

import generatePyramids from './pyramids'
import { dot, scale, subtract, Vect } from './vect'

const writeStl = (model: Geom3 | Geom3[], fileName: string) => {
  const rawData: string[] = stlSerializer.serialize({ binary: false }, model)
  fs.writeFileSync(fileName, rawData.join('\n'))
}

const toVec3 = (v: Vect): Vec3 => [v.x, v.y, v.z]

const degToRad = (deg: number) => deg * (Math.PI / 180)

const main = () => {
  // const triangles = generatePyramids()
  // const points = triangles.flatMap(t => t.map(toVec3))
  // const faces = triangles.map((_, i) => [0 + i * 3, 1 + i * 3, 2 + i * 3])

  // const hull = primitives.polyhedron({ points, faces })
  // const innerSphere = primitives.sphere({ radius: 0.9, segments: 64 })

  // const cylinder = primitives.cylinder({ height: 4, radius: 0.1, segments: 16 })

  // const holes = [
  //   transforms.rotateY(0, cylinder),
  //   transforms.rotateY(degToRad(90), cylinder),
  //   transforms.rotateY(degToRad(45), cylinder),
  //   transforms.rotateY(degToRad(135), cylinder),
  //   transforms.rotateY(degToRad(21), cylinder),
  //   transforms.rotateY(degToRad(39.5), cylinder),
  //   transforms.rotateY(degToRad(58), cylinder),
  //   transforms.rotateY(degToRad(73.5), cylinder),
  //   transforms.rotateY(degToRad(90), cylinder),
  //   transforms.rotateY(degToRad(106.5), cylinder),
  // ]

  const cylinder = primitives.cylinder({ height: 1, radius: 0.1, segments: 16, center: [0, 0, 0] })
  const alignedToY = transforms.rotateX(Math.PI / 2, cylinder)
  const alignedToPlane = transforms.translateY(0.5, alignedToY)

  const plane = primitives.cuboid({ center: [0, 0, 0], size: [1, 0.01, 1] })
  const xAxis = primitives.cuboid({ center: [0, 0, 0], size: [1, 0.05, 0.05] })

  const target: Vect = { x: 0.5, y: 0, z: 0.5 }
  const targetSphere = primitives.sphere({ radius: 0.1, center: toVec3(target) })

  // const V1x = new THREE.Vector3(1, 0, 0)
  // const V1y = new THREE.Vector3(0, 1, 0)
  // const V1z = new THREE.Vector3(0, 0, 1)

  // const V2 = new THREE.Vector3(target.x, target.y, target.z)
  // const V2xz = new THREE.Vector3(V2.x, 0, V2.z)
  // const V2xy = new THREE.Vector3(V2.x, V2.y, 0)

  // const angleV1V2x = Math.acos(V1x.dot(V2xz.normalize()))
  // const angleV1V2y = Math.acos(V1y.dot(V2xy.normalize()))
  // const angleV1V2z = Math.acos(V1z.dot(V2xz.normalize()))

  // console.log(angleV1V2x * (180 / Math.PI), angleV1V2y * (180 / Math.PI), angleV1V2z * (180 / Math.PI))

  // const rotated = transforms.rotate([0, angleV1V2z, angleV1V2y], hole)

  // const translated = transforms.translate(toVec3(target), rotated)

  const model = [plane, xAxis, targetSphere, alignedToPlane /* , rotated  , translated */]

  // const model = booleans.subtract(hull, innerSphere, holes)

  writeStl(model, 'output.stl')
}

main()
