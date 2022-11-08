import { primitives } from '@jscad/modeling'
import { Vec3 } from '@jscad/modeling/src/maths/vec3'
import stlSerializer from '@jscad/stl-serializer'
import fs from 'fs'
import generatePyramids from './pyramids'

const main = () => {
  const triangles = generatePyramids()
  const dodecahedronPoly = triangles.map(tris => {
    const points = tris.flatMap(t => t.map(v => [v.x, v.y, v.z] as Vec3))

    return primitives.polyhedron({
      points,
      faces: [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
      ],
      orientation: 'outward',
    })
  })

  const rawData: string[] = stlSerializer.serialize({ binary: false }, dodecahedronPoly)

  fs.writeFileSync('output.stl', rawData.join('\n'))
}

main()
