import fs from 'fs'

function registerAFMFonts(ctx) {
  ctx.keys().forEach(key => {
    const match = key.match(/([^/]*\.afm$)/)
    if (match) {
      // afm files must be stored on data path
      fs.writeFileSync(`data/${match[0]}`, ctx(key).default)
    }
  });
}

// register AFM fonts distributed with pdfkit
// is good practice to register only required fonts to avoid the bundle size increase
registerAFMFonts(require.context('pdfkit/js/data', false, /.*\.afm$/))

