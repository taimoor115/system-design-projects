declare module "ms" {
  function ms(val: string | number, options?: { long?: boolean }): number;
  export = ms;
}
