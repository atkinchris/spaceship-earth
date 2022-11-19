import { primitives, booleans, transforms, maths, measurements } from '@jscad/modeling'
import { Geom3 } from '@jscad/modeling/src/geometries/types'
import { Vec3 } from '@jscad/modeling/src/maths/vec3'
import fromVectorRotation from '@jscad/modeling/src/maths/mat4/fromVectorRotation'
import stlSerializer from '@jscad/stl-serializer'
import fs from 'fs'

import generatePyramids from './pyramids'
import { Vect } from './vect'

const writeStl = (model: Geom3 | Geom3[], fileName: string) => {
  const rawData = stlSerializer.serialize({ binary: false }, model)
  fs.writeFileSync(fileName, rawData.join('\n'))
}

const toVec3 = (v: Vect): Vec3 => [v.x, v.y, v.z]

const toRad = (degrees: number) => degrees * (Math.PI / 180)

const main = () => {
  const { holePositions, triangles } = generatePyramids()
  const points = triangles.flatMap(t => t.map(toVec3))
  const faces = triangles.map((_, i) => [0 + i * 3, 1 + i * 3, 2 + i * 3])

  const hull = primitives.polyhedron({ points, faces })
  const innerSphere = primitives.sphere({ radius: 90, segments: 64 })

  const [hullWidth] = measurements.measureDimensions(hull)
  const scale = 200 / hullWidth
  const hullScaled = transforms.scale([scale, scale, scale], hull)

  const holeOuter = primitives.cylinder({ height: 40, radius: 2, segments: 16, center: [0, 0, -20] })
  const holeInner = primitives.cylinder({ height: 40, radius: 4, segments: 16, center: [0, 0, 20] })
  const hole = booleans.union(holeOuter, holeInner)
  const holeRotated = transforms.rotateX(Math.PI / 2, hole)
  const holeTranslated = transforms.translateY(95, holeRotated)

  const holes = holePositions
    .map(target => target[1])
    .filter(
      (targetV, index, array) =>
        array.findIndex(v => v.x === targetV.x && v.y === targetV.y && v.z === targetV.z) === index
    )
    .map(targetV => {
      const matrix = fromVectorRotation(maths.mat4.create(), [0, 1, 0], toVec3(targetV))
      return transforms.transform(matrix, holeTranslated)
    })

  const leg = primitives.cuboid({ size: [20, 100, 75], center: [0, 0, 0] })
  const legHole = primitives.cuboid({ size: [100, 50, 40], center: [0, 0, 0] })
  const legSubtracted = booleans.subtract(leg, legHole)
  const legRotated = transforms.rotateZ(toRad(30), legSubtracted)
  const legTranslated = transforms.translate([65, -75, 0], legRotated)

  const column = primitives.cylinder({ height: 100, radius: 30, center: [0, 0, 0] })
  const columnRotated = transforms.rotateX(toRad(90), column)
  const columnTranslated = transforms.translate([0, -100, 0], columnRotated)

  const stands = [
    transforms.rotateY(toRad(0), legTranslated),
    transforms.rotateY(toRad(120), legTranslated),
    transforms.rotateY(toRad(240), legTranslated),
    columnTranslated,
  ]

  const groundPlane = primitives.cuboid({ size: [1000, 1000, 1000], center: [0, -610, 0] })

  const finalHull = booleans.subtract(hullScaled, innerSphere, holes)
  const hullWithStands = booleans.union(finalHull, stands)
  const model = booleans.subtract(hullWithStands, innerSphere, groundPlane)

  const top = booleans.subtract(model, primitives.cuboid({ size: [1000, 1000, 1000], center: [0, -500, 0] }))
  const bottom = booleans.subtract(model, primitives.cuboid({ size: [1000, 1000, 1000], center: [0, 500, 0] }))

  writeStl(model, 'spaceship-earth.stl')
  writeStl(top, 'spaceship-earth_top.stl')
  writeStl(bottom, 'spaceship-earth_bottom.stl')
}

main()
