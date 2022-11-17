interface Options {
  binary: boolean
}

declare module '@jscad/stl-serializer' {
  declare function serialize(
    options: { binary: true },
    ...geometries: RecursiveArray<Geometry>
  ): [ArrayBuffer, ArrayBuffer, ArrayBuffer]
  declare function serialize(options: { binary: false }, ...geometries: RecursiveArray<Geometry>): string[]
}
