import { primitives, booleans } from '@jscad/modeling'
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

const main = () => {
  const triangles = generatePyramids()
  const points = triangles.flatMap(t => t.map(toVec3))
  const faces = triangles.map((_, i) => [0 + i * 3, 1 + i * 3, 2 + i * 3])

  const hull = primitives.polyhedron({ points, faces })
  const innerSphere = primitives.sphere({ radius: 0.9, segments: 64 })
  const model = booleans.subtract(hull, innerSphere)

  writeStl(model, 'output.stl')
}

main()
