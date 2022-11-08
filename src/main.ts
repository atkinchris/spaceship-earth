import { primitives, booleans, transforms } from '@jscad/modeling'
import { Geom3 } from '@jscad/modeling/src/geometries/types'
import { Vec3 } from '@jscad/modeling/src/maths/vec3'
import stlSerializer from '@jscad/stl-serializer'
import fs from 'fs'
import generatePyramids from './pyramids'
import { Vect } from './vect'

const writeStl = (model: Geom3, fileName: string) => {
  const rawData: string[] = stlSerializer.serialize({ binary: false }, model)
  fs.writeFileSync(fileName, rawData.join('\n'))
}

const toVec3 = (v: Vect): Vec3 => [v.x, v.y, v.z]

const degToRad = (deg: number) => deg * (Math.PI / 180)

const main = () => {
  const triangles = generatePyramids()
  const points = triangles.flatMap(t => t.map(toVec3))
  const faces = triangles.map((_, i) => [0 + i * 3, 1 + i * 3, 2 + i * 3])

  const hull = primitives.polyhedron({ points, faces })
  const innerSphere = primitives.sphere({ radius: 0.9, segments: 64 })

  const cylinder = primitives.cylinder({ height: 4, radius: 0.1, segments: 16 })

  // const holeCount = 2
  // const angleOfSeparation = degToRad(360 / holeCount)

  // const baseHoles = Array.from({ length: holeCount }, (_, i) => transforms.rotateX(angleOfSeparation * i, cylinder))
  // const holes = Array.from({ length: holeCount }, (_, i) => transforms.rotateY(angleOfSeparation * i, baseHoles))

  const holes = [
    transforms.rotateY(0, cylinder),
    transforms.rotateY(degToRad(21), cylinder),
    transforms.rotateY(degToRad(39.5), cylinder),
    transforms.rotateY(degToRad(58), cylinder),
    transforms.rotateY(degToRad(73.5), cylinder),
    transforms.rotateY(degToRad(90), cylinder),
    transforms.rotateY(degToRad(106.5), cylinder),
  ]

  const model = booleans.subtract(hull, innerSphere, holes)

  writeStl(model, 'output.stl')
}

main()
