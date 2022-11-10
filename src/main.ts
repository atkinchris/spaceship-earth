import { primitives, booleans, transforms, maths } from '@jscad/modeling'
import { Geom3 } from '@jscad/modeling/src/geometries/types'
import { Vec3 } from '@jscad/modeling/src/maths/vec3'
import fromVectorRotation from '@jscad/modeling/src/maths/mat4/fromVectorRotation'
import stlSerializer from '@jscad/stl-serializer'
import fs from 'fs'

import generatePyramids from './pyramids'
import { Vect } from './vect'

const writeStl = (model: Geom3 | Geom3[], fileName: string) => {
  const rawData: string[] = stlSerializer.serialize({ binary: false }, model)
  fs.writeFileSync(fileName, rawData.join('\n'))
}

const toVec3 = (v: Vect): Vec3 => [v.x, v.y, v.z]

const main = () => {
  const triangles = generatePyramids()
  const points = triangles.flatMap(t => t.map(toVec3))
  const faces = triangles.map((_, i) => [0 + i * 3, 1 + i * 3, 2 + i * 3])

  const hull = primitives.polyhedron({ points, faces })
  const innerSphere = primitives.sphere({ radius: 0.9, segments: 64 })

  const target = triangles[999][0]

  const hole = primitives.cylinder({ height: 0.1, radius: 0.1, segments: 16, center: [0, 0, 0] })
  const holeRotated = transforms.rotateX(Math.PI / 2, hole)
  const holeTranslated = transforms.translateY(1, holeRotated)

  const matrix = fromVectorRotation(maths.mat4.create(), [0, 1, 0], toVec3(target))
  const rotated = transforms.transform(matrix, holeTranslated)

  const model = booleans.subtract(hull, innerSphere, rotated)

  writeStl(model, 'output.stl')
}

main()
