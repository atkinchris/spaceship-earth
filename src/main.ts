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

  const safeHolePositions = holePositions
    .filter(v => v.x >= -1 && v.x < 0.5)
    .filter(v => v.y > -0.7 && v.y <= 1)
    .filter(v => v.z >= -1 && v.z <= 1)

  console.log(`Generating with ${safeHolePositions.length} holes`)

  const hull = primitives.polyhedron({ points, faces })
  const innerSphere = primitives.sphere({ radius: 70, segments: 64 })

  const [hullWidth] = measurements.measureDimensions(hull)
  const scale = 150 / hullWidth
  const hullScaled = transforms.scale([scale, scale, scale], hull)

  const hole = primitives.cylinder({ height: 60, radius: 1.5, segments: 16, center: [0, 0, 0] })
  const holeRotated = transforms.rotateX(Math.PI / 2, hole)
  const holeTranslated = transforms.translateY(75, holeRotated)

  const support = primitives.cylinder({ height: 10, radius: 4, segments: 16, center: [0, 0, 0] })
  const supportRotated = transforms.rotateX(Math.PI / 2, support)
  const supportTranslated = transforms.translateY(68, supportRotated)

  const holeSupports = safeHolePositions.map(v => {
    const matrix = fromVectorRotation(maths.mat4.create(), [0, 1, 0], toVec3(v))
    return transforms.transform(matrix, supportTranslated)
  })

  const holes = safeHolePositions.map(v => {
    const matrix = fromVectorRotation(maths.mat4.create(), [0, 1, 0], toVec3(v))
    return transforms.transform(matrix, holeTranslated)
  })

  const leg = primitives.cuboid({ size: [15, 100, 50], center: [0, 0, 0] })
  const legHole = primitives.cuboid({ size: [100, 100, 20], center: [0, 50, 0] })
  const legSubtracted = booleans.subtract(leg, legHole)
  const legRotated = transforms.rotateZ(toRad(30), legSubtracted)
  const legTranslated = transforms.translate([55, -75, 0], legRotated)

  const column = primitives.cylinder({ height: 100, radius: 20, center: [0, 0, 0] })
  const columnRotated = transforms.rotateX(toRad(90), column)
  const columnTranslated = transforms.translate([0, -100, 0], columnRotated)

  const stands = booleans.union([
    transforms.rotateY(toRad(0), legTranslated),
    transforms.rotateY(toRad(120), legTranslated),
    transforms.rotateY(toRad(240), legTranslated),
    columnTranslated,
  ])
  const groundPlane = primitives.cuboid({ size: [1000, 1000, 1000], center: [0, -500 - 80, 0] })
  const standsTrimmed = booleans.subtract(stands, innerSphere, groundPlane)

  const hollowHull = booleans.subtract(hullScaled, innerSphere)
  const hullWithSupports = booleans.union(hollowHull, holeSupports)
  const hullWithHoles = booleans.subtract(hullWithSupports, holes)

  const accessHatch = primitives.sphere({ radius: 50, center: [60, 0, 0] })

  const model = booleans.union(hullWithHoles, standsTrimmed, accessHatch)

  const modelA = booleans.subtract(model, accessHatch)
  const modelB = booleans.intersect(model, accessHatch)

  writeStl(model, 'spaceship-earth.stl')
  writeStl(modelA, 'spaceship-earth_a.stl')
  writeStl(modelB, 'spaceship-earth_b.stl')
}

main()
