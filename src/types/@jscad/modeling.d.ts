import '@jscad/modeling'

declare module '@jscad/modeling' {
  namespace measurements {
    declare function measureDimensions(geometry: Geometry): [number, number, number]
    declare function measureDimensions(...geometries: RecursiveArray<Geometry>): [number, number, number][]
  }
}
