declare module 'html-to-pdfmake' {
  interface Options {
    window?: Window | any;
    tableAutoSize?: boolean;
    imagesByReference?: boolean;
    defaultStyles?: Record<string, any>;
    ignoreStyles?: string[];
  }
  function htmlToPdfmake(html: string, options?: Options): any[];
  export = htmlToPdfmake;
}

declare module 'pdfmake/build/vfs_fonts' {
  export const pdfMake: {
    vfs: Record<string, string>;
  };
  const vfs: Record<string, string>;
  export default vfs;
}
