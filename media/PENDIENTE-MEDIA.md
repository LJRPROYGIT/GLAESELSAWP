# Media del sitio: listo para conectar

Nada de esto está conectado todavía en `index.html` ni en `catalogo.js`. Solo hay que cambiar estas rutas.

## Videos y hero (`const MEDIA` en catalogo.js)
```js
const MEDIA = {
  heroVideo: "media/hero.mp4",            // Mixkit #49158, 1280×720, 7 s, sin audio, 1.4 MB
  heroVideoMovil: "media/hero-movil.mp4", // mismo clip recortado a 9:16 (405×720), 0.6 MB
  heroFoto: "media/hero.jpg",             // Gemini, 1376×768 (o se queda fotos/bomberos-incendio.jpg)
  ctaVideo: "media/cta.mp4"               // Mixkit #3465, brasas rojas sobre negro, 10 s, 0.6 MB
};
```
- Posters (primer fotograma): `media/hero-video-poster.jpg`, `media/hero-movil-video-poster.jpg` y `media/cta-poster.jpg`.
- `media/hero-movil.jpg` (572×1024) es la foto vertical de Gemini para el celular.
- Los videos de Mixkit son gratis para uso comercial y no piden atribución.

## Fotos de producto (`foto:` en PRODUCTOS)
Las 16 fotos son de Gemini: 900×900, fondo gris claro de estudio. Están en `media/productos/`.

| id del producto | foto |
|---|---|
| extintor-pqs | `media/productos/extintor-pqs.jpg` |
| extintor-co2 | `media/productos/extintor-co2.jpg` |
| extintor-espuma | `media/productos/extintor-espuma.jpg` |
| recarga-pqs, recarga-co2, recarga-espuma, mantenimiento | `media/productos/recarga.jpg` (técnico revisando un extintor) |
| botiquin, reposicion-botiquin | `media/productos/botiquin.jpg` |
| casco | `media/productos/casco.jpg` |
| lentes | `media/productos/lentes.jpg` |
| orejeras | `media/productos/orejeras.jpg` |
| guantes | `media/productos/guantes.jpg` |
| chaleco | `media/productos/chaleco.jpg` |
| mochila-trauma | `media/productos/mochila-trauma.jpg` |
| camilla | `media/productos/camilla.jpg` |
| collarin | `media/productos/collarin.jpg` |
| oximetro | `media/productos/oximetro.jpg` |
| arnes | `media/productos/arnes.jpg` |
| cuerda | `media/productos/cuerda.jpg` |

`supresion` ya usa la foto real `fotos/remolque-supresion.jpg`.

Son imágenes de IA para mostrar el diseño. Cuando la empresa tenga fotos reales de sus productos, se reemplazan con el mismo nombre de archivo.
