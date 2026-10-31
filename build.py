"""Genera web/index.html (web instalable + base de las apps) a partir de src/."""
import pathlib, sys

raiz = pathlib.Path(__file__).parent
html = (raiz / "src/app.html").read_text()
kb = (raiz / "src/kb.js").read_text()
html = html.replace("/*KB*/", kb)

# Versión simple (sin PWA) para el artifact de claude.ai
if "--simple" in sys.argv:
    pathlib.Path(sys.argv[-1]).write_text(html)
    sys.exit()

pwa = """<link rel="manifest" href="manifest.webmanifest">
<meta name="theme-color" content="#17223b">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="Sello a Sello">
<link rel="apple-touch-icon" href="icons/apple-touch-icon.png">
<link rel="icon" type="image/png" href="icons/icon-192.png">
<meta name="description" content="Encuentra las ayudas, becas y subvenciones de España que te tocan, con documentos y pasos para pedirlas.">
"""
sw = """<script>
if ("serviceWorker" in navigator && location.protocol === "https:") {
  navigator.serviceWorker.register("sw.js").catch(function () {});
}
</script>
"""
html = html.replace("</title>", "</title>\n" + pwa, 1).replace("</body>", sw + "</body>", 1)
(raiz / "web/index.html").write_text(html)
print("web/index.html generado")
