import fs from 'fs'

import { midpoint, normal, scale } from './vect'

const PHI = (1.0 + Math.sqrt(5.0)) / 2.0 /* golden ratio */
const PEAK = 1.025

interface Vect {
  x: number
  y: number
  z: number
}

const printf = (message: string) => {
  fs.appendFileSync('output.stl', message)
}

/* init_dodecahedron: initializes given polygon array with points for a
	dodecahedron of circumscribed radius 1; assumes given array is of size
	[12][5] */
const initDodecahedron = (): Vect[][] => {
  /* define vertices of regular dodecahedron; radius of circumscribed sphere
      is currently sqrt(3) */

  /* "a" vertices; forms a cube */
  const a1: Vect = { x: 1, y: 1, z: 1 }
  const a2: Vect = { x: 1, y: 1, z: -1 }
  const a3: Vect = { x: 1, y: -1, z: 1 }
  const a4: Vect = { x: 1, y: -1, z: -1 }
  const a5: Vect = { x: -1, y: 1, z: 1 }
  const a6: Vect = { x: -1, y: 1, z: -1 }
  const a7: Vect = { x: -1, y: -1, z: 1 }
  const a8: Vect = { x: -1, y: -1, z: -1 }

  /* "b" vertices; forms a rectangle on the yz-plane */
  const b1: Vect = { x: 0, y: PHI, z: 1.0 / PHI }
  const b2: Vect = { x: 0, y: PHI, z: -1.0 / PHI }
  const b3: Vect = { x: 0, y: -PHI, z: 1.0 / PHI }
  const b4: Vect = { x: 0, y: -PHI, z: -1.0 / PHI }

  /* "c" vertices; forms a rectangle on the xz-plane */
  const c1: Vect = { x: 1.0 / PHI, y: 0, z: PHI }
  const c2: Vect = { x: 1.0 / PHI, y: 0, z: -PHI }
  const c3: Vect = { x: -1.0 / PHI, y: 0, z: PHI }
  const c4: Vect = { x: -1.0 / PHI, y: 0, z: -PHI }

  /* "d" vertices; forms a rectangle on the xy-plane */
  const d1: Vect = { x: PHI, y: 1.0 / PHI, z: 0 }
  const d2: Vect = { x: PHI, y: -1.0 / PHI, z: 0 }
  const d3: Vect = { x: -PHI, y: 1.0 / PHI, z: 0 }
  const d4: Vect = { x: -PHI, y: -1.0 / PHI, z: 0 }

  const dodecahedron = [
    [b1, a1, d1, a2, b2],
    [b2, a6, d3, a5, b1],
    [b3, a7, d4, a8, b4],
    [b4, a4, d2, a3, b3],
    [c1, a1, b1, a5, c3],
    [c2, a4, b4, a8, c4],
    [c3, a7, b3, a3, c1],
    [c4, a6, b2, a2, c2],
    [d1, a1, c1, a3, d2],
    [d2, a4, c2, a2, d1],
    [d3, a6, c4, a8, d4],
    [d4, a7, c3, a5, d3],
  ]

  /* copy dodecahedron to given array pointer; scale to radius of 1.0 */
  for (let i = 0; i < 12; i += 1) {
    for (let j = 0; j < 5; j += 1) {
      dodecahedron[i][j] = scale(dodecahedron[i][j], 1.0)
    }
  }

  return dodecahedron
}

/* print_triangle: prints given triangle in STL format to stdout */
const printTriangle = (t: Vect[]) => {
  const n = normal(t)

  printf(`facet normal ${n.x} ${n.y} ${n.z}\n`)

  printf('\touter loop\n')
  printf(`\t\tvertex ${t[0].x} ${t[0].y} ${t[0].z}\n`)
  printf(`\t\tvertex ${t[1].x} ${t[1].y} ${t[1].z}\n`)
  printf(`\t\tvertex ${t[2].x} ${t[2].y} ${t[2].z}\n`)
  printf('\tendloop\n')

  printf('endfacet\n')
  printf('\n')
}

/* peak_triangle: converts given triangle into pyramid-like peaks consisting of
	3 triangles; passes generated triangles to print_triangle() */
const peakTriangle = (tri: Vect[]) => {
  const n = scale(normal(tri), PEAK)

  const triangles = [
    [n, tri[0], tri[1]],
    [n, tri[1], tri[2]],
    [n, tri[2], tri[0]],
  ]

  for (let i = 0; i < 3; i += 1) {
    printTriangle(triangles[i])
  }
}

/* subdiv_triangle: subdivides given triangle into 4 triangles, recursively by
	numtimes; passes generated triangles to peak_triangle() */
const subdivTriangle = (t: Vect[], numtimes: number) => {
  if (numtimes <= 0) {
    peakTriangle(t)
    return
  }

  const m: Vect[] = [
    scale(midpoint(t[0], t[1]), 1.0),
    scale(midpoint(t[1], t[2]), 1.0),
    scale(midpoint(t[2], t[0]), 1.0),
  ]

  const newtriangles: Vect[][] = [
    [t[0], m[0], m[2]],
    [t[1], m[1], m[0]],
    [t[2], m[2], m[1]],
    [m[0], m[1], m[2]],
  ]

  for (let i = 0; i < 4; i += 1) {
    subdivTriangle(newtriangles[i], numtimes - 1)
  }
}

/* subdiv_pentagon: divides given spherical pentagon into spherical
	triangles; calls subdiv_triangle() */
const subdivPentagon = (p: Vect[]) => {
  const n = normal(p)

  const triangles: Vect[][] = [
    [n, p[0], p[1]],
    [n, p[1], p[2]],
    [n, p[2], p[3]],
    [n, p[3], p[4]],
    [n, p[4], p[0]],
  ]

  for (let i = 0; i < 5; i += 1) {
    subdivTriangle(triangles[i], 3)
  }
}

const main = () => {
  fs.writeFileSync('output.stl', '')
  printf('solid spaceship_earth\n')
  printf('\n')

  const dodecahedron = initDodecahedron()

  for (let i = 0; i < 12; i += 1) {
    subdivPentagon(dodecahedron[i])
  }

  printf('endsolid spaceship_earth\n')

  return 0
}

main()
