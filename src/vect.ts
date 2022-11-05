export interface Vect {
  x: number
  y: number
  z: number
}

/* scale: returns position vector with direction of v and magnitude
	of l */
export const scale = (v: Vect, l: number): Vect => {
  const vl = Math.sqrt(v.x ** 2 + v.y ** 2 + v.z ** 2)

  return {
    x: (v.x / vl) * l,
    y: (v.y / vl) * l,
    z: (v.z / vl) * l,
  }
}

/* normal: returns a unit vector normal to the plane containing points[];
	points[] must contain 3 or more position vectors (if more, only the first
	3 will be used); to get a normal vector that points "outwards", points[]
	must be arranged in counter-clockwise order from outside */
export const normal = (points: Vect[]): Vect => {
  const a: Vect = {
    x: points[1].x - points[0].x,
    y: points[1].y - points[0].y,
    z: points[1].z - points[0].z,
  }

  const b: Vect = {
    x: points[2].x - points[0].x,
    y: points[2].y - points[0].y,
    z: points[2].z - points[0].z,
  }

  /* calculate cross product of a and b; n = a X b */
  const n: Vect = {
    x: a.y * b.z - a.z * b.y,
    y: a.z * b.x - a.x * b.z,
    z: a.x * b.y - a.y * b.x,
  }

  return scale(n, 1.0)
}

/* midpoint: returns the position vector of the midpoint of the two given
	position vectors */
export const midpoint = (p1: Vect, p2: Vect): Vect => ({
  x: (p1.x + p2.x) / 2.0,
  y: (p1.y + p2.y) / 2.0,
  z: (p1.z + p2.z) / 2.0,
})
