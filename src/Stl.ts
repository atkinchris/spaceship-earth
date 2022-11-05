import { normal, Vect } from './vect'

type Triangle = [Vect, Vect, Vect]

class Stl {
  private triangles: Triangle[] = []

  addTriangle(triangle: Triangle) {
    this.triangles.push(triangle)
  }

  toString(): string {
    const triangles = this.triangles.map(([v1, v2, v3]) => {
      const n = normal([v1, v2, v3])

      return `
  facet normal ${n.x} ${n.y} ${n.z}
    outer loop
      vertex ${v1.x} ${v1.y} ${v1.z}
      vertex ${v2.x} ${v2.y} ${v2.z}
      vertex ${v3.x} ${v3.y} ${v3.z}
    endloop
  endfacet
      `
    })

    return ['solid spaceship_earth', ...triangles, 'endsolid spaceship_earth'].join('\n')
  }
}

export default Stl
