import { primitives } from '@jscad/modeling'
import { Vec3 } from '@jscad/modeling/src/maths/vec3'
import stlSerializer from '@jscad/stl-serializer'
import fs from 'fs'
import generatePyramids from './pyramids'

const main = () => {
  const pyramids = generatePyramids()
  const points = pyramids.flatMap(t => t.map(v => [v.x, v.y, v.z] as Vec3))
  const faces = pyramids.map((_, i) => [0 + i * 3, 1 + i * 3, 2 + i * 3])

  const dodecahedronPoly = primitives.polyhedron({
    points,
    faces,
    orientation: 'outward',
  })

  const rawData: string[] = stlSerializer.serialize({ binary: false }, dodecahedronPoly)

  fs.writeFileSync('output.stl', rawData.join('\n'))
}

main()
