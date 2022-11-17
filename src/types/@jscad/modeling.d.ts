import '@jscad/modeling'

declare module '@jscad/modeling' {
  namespace measurements {
    declare function measureDimensions(
      ...geometries: RecursiveArray<Geometry>
    ): [number, number, number] | [number, number, number][]
  }
}
