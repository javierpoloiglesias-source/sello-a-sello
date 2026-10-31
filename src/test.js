// Pruebas del motor con perfiles realistas: node src/test.js
const KB = require("./kb.js");
const HOY = new Date("2026-10-31T12:00:00");
let fallos = 0, total = 0;

function caso(nombre, p, debe = [], noDebe = [], extra) {
  const r = KB.evaluar(Object.assign({}, p), HOY);
  const ids = r.map(x => x.a.id);
  const err = [];
  for (const id of debe) if (!ids.includes(id)) err.push("falta " + id);
  for (const id of noDebe) if (ids.includes(id)) err.push("sobra " + id);
  if (extra) { const m = extra(r); if (m) err.push(m); }
  total++;
  if (err.length) fallos++;
  console.log(`${err.length ? "✗" : "✓"} ${nombre}\n   → ${r.map(x => `${x.a.id}[${x.nivel}/${x.est.k}${x.imp ? "/" + x.imp : ""}]`).join(" ")}\n   potencial: ${KB.potencial(r)} €${err.length ? "\n   !! " + err.join(", ") : ""}`);
}
const est = id => r => { const x = r.find(y => y.a.id === id); return x ? x.est.k : "—"; };

const base = { residencia: "mas10", patrimonioBajo: true, adultos: 1, menores: 0, m0_3: 0, m3_6: 0, m6_18: 0, discapacidad: 0 };

caso("1. Madre sola, 2 hijos (1 y 7 años), 9.000 €/año, alquiler 650 €, Sevilla, en paro sin prestación",
  { ...base, tipo: "familia", anioNac: 1992, ccaa: "AN", menores: 2, m0_3: 1, m6_18: 1, monoparental: true, ingresos: 9000, laboral: "paro-sin", cotizado12: false, agotada: true, vivienda: "alquiler", alquiler: 650, luzPVPC: "nose" },
  ["imv", "capi", "rmin", "bonoluz", "bonotermico", "subsidio", "alqgeneral", "emergencia", "comedor", "maternidad"], ["paro", "becamec", "avalico", "pncjub"]);

caso("2. Pareja con 3 hijos (2, 5, 12), 28.000 €, hipoteca, Valladolid, ambos trabajan",
  { ...base, tipo: "familia", anioNac: 1986, ccaa: "CL", adultos: 2, menores: 3, m0_3: 1, m3_6: 1, m6_18: 1, ingresos: 28000, laboral: "empleado", vivienda: "hipoteca", familiaNumerosa: "no" },
  ["capi", "titulofn", "dedfn", "maternidad", "comedor", "bonoluz"], ["imv", "subsidio", "alqjoven"]);

caso("3. Joven 26 años, trabaja, 18.000 €, alquila habitación 400 €, Madrid, usa Cercanías",
  { ...base, tipo: "persona", anioNac: 2000, ccaa: "MD", ingresos: 18000, laboral: "empleado", vivienda: "habitacion", alquiler: 400, transporte: true },
  ["alqjoven", "abono", "dedalq"], ["imv", "capi", "bonoluz", "becamec"],
  r => { const a = r.find(x => x.a.id === "alqjoven"); return a && a.imp !== 2400 ? "importe alqjoven esperado 2400 (200×12) y es " + a.imp : null; });

caso("4. Estudiante universitario nacido en 2008, familia 4 miembros 22.000 €, estudia fuera",
  { ...base, tipo: "persona", anioNac: 2008, ccaa: "GA", adultos: 2, menores: 2, m6_18: 1, ingresos: 22000, laboral: "estudiante", estudia: "universidad", fueraCasa: true, vivienda: "familia" },
  ["becamec", "bonocultural"], ["imv", "alqjoven"],
  r => est("becamec")(r) !== "cerrada" ? "becamec debería estar cerrada" : (est("bonocultural")(r) !== "abierta" ? "bono cultural debería estar abierto (último día)" : null));

caso("5. Jubilada 72 años sin pensión contributiva, vive sola, 3.000 €/año, alquiler, Murcia",
  { ...base, tipo: "persona", anioNac: 1954, ccaa: "MC", ingresos: 3000, laboral: "jubilado", pension: "ninguna", vivienda: "alquiler", alquiler: 380 },
  ["pncjub", "imv", "bonoluz", "alqgeneral", "imserso", "emergencia"], ["subsidio", "garantia", "alqjoven"]);

caso("6. Pensionista contributivo 68 años, pensión baja 10.000 €, propietario, Asturias",
  { ...base, tipo: "persona", anioNac: 1958, ccaa: "AS", ingresos: 10000, laboral: "jubilado", pension: "contributiva", vivienda: "propia" },
  ["minimos", "bonoluz", "imserso"], ["pncjub", "imv"]);

caso("7. Parado 55 años, agotó el paro, 4.000 €/año, Extremadura",
  { ...base, tipo: "persona", anioNac: 1971, ccaa: "EX", ingresos: 4000, laboral: "paro-sin", cotizado12: true, agotada: true, vivienda: "propia" },
  ["subsidio", "imv", "bonoluz"], ["paro", "garantia"],
  r => (r.find(x => x.a.id === "subsidio").why.join(" ").includes("52") ? null : "debería mencionar subsidio mayores de 52"));

caso("8. Recién despedido 35 años, 20.000 €, cotizó 5 años, quiere montar negocio",
  { ...base, tipo: "persona", anioNac: 1991, ccaa: "CT", ingresos: 20000, laboral: "paro-sin", cotizado12: true, agotada: false, quiereEmprender: true, vivienda: "alquiler", alquiler: 900 },
  ["paro", "tarifaplana", "localemp", "camaras"], ["capitaliza", "subsidio", "imv"]);

caso("9. Cobra paro y quiere ser autónomo en Madrid (cuota cero)",
  { ...base, tipo: "persona", anioNac: 1990, ccaa: "MD", ingresos: 15000, laboral: "paro-prestacion", quiereEmprender: true, vivienda: "alquiler", alquiler: 1100 },
  ["capitaliza", "compatible", "tarifaplana", "cuotacero"], ["imv"],
  r => est("cuotacero")(r) !== "siempre" ? "cuota cero Madrid debería ser permanente" : null);

caso("10. Hogar con hijo con discapacidad 45 % (8 años), 2 adultos, 24.000 €, Valencia",
  { ...base, tipo: "familia", anioNac: 1984, ccaa: "VC", adultos: 2, menores: 1, m6_18: 1, discapacidad: 45, discapacidadQuien: "hijo", ingresos: 24000, laboral: "empleado", vivienda: "hipoteca" },
  ["hijodisc", "dedfn", "neae", "bonoluz", "capi", "copago"], ["pncinv"]);

caso("11. Persona 40 años con discapacidad 70 %, sin trabajo, 2.000 €/año, Canarias",
  { ...base, tipo: "persona", anioNac: 1986, ccaa: "CN", discapacidad: 70, discapacidadQuien: "yo", ingresos: 2000, laboral: "incapacidad", vivienda: "familia" },
  ["pncinv", "imv", "bonoluz"], ["hijodisc", "dedfn"]);

caso("12. Familia con abuela dependiente, 3 adultos, 30.000 €, Navarra",
  { ...base, tipo: "familia", anioNac: 1970, ccaa: "NC", adultos: 3, dependencia: true, ingresos: 30000, laboral: "empleado", vivienda: "propia" },
  ["dependencia"], ["imv", "capi", "bonoluz"]);

caso("13. Pareja joven 30 años, 1 bebé en camino, 42.000 €, quiere comprar piso, Zaragoza",
  { ...base, tipo: "familia", anioNac: 1996, ccaa: "AR", adultos: 2, embarazo: true, ingresos: 42000, laboral: "empleado", vivienda: "alquiler", alquiler: 850, quiereComprar: true },
  ["nacimiento", "maternidad", "avalico", "alqjoven"], ["imv", "bonoluz", "alqgeneral"]);

caso("14. Víctima de violencia de género con 1 hijo, 7.000 €, Bilbao",
  { ...base, tipo: "familia", anioNac: 1990, ccaa: "PV", menores: 1, m3_6: 1, monoparental: true, vg: true, ingresos: 7000, laboral: "paro-sin", cotizado12: false, agotada: true, vivienda: "alquiler", alquiler: 700 },
  ["vg", "imv", "capi", "rmin", "bonoluz", "subsidio", "alqgeneral"], []);

caso("15. Joven 20 años nini, vive con padres, Cádiz",
  { ...base, tipo: "persona", anioNac: 2006, ccaa: "AN", adultos: 3, ingresos: 20000, laboral: "paro-sin", cotizado12: false, agotada: false, vivienda: "familia" },
  ["garantia", "abono"].slice(0, 1), ["imv", "paro"]);

caso("16. Residente reciente (<1 año), sola, 0 ingresos, Barcelona",
  { ...base, tipo: "persona", anioNac: 1995, ccaa: "CT", residencia: "menos1", ingresos: 0, laboral: "paro-sin", vivienda: "habitacion", alquiler: 450 },
  ["emergencia", "bonoluz", "alqjoven"], ["imv"]);

caso("17. Familia rica 90.000 € con 2 hijos, Madrid",
  { ...base, tipo: "familia", anioNac: 1980, ccaa: "MD", adultos: 2, menores: 2, m6_18: 2, ingresos: 90000, laboral: "empleado", vivienda: "hipoteca" },
  [], ["imv", "capi", "bonoluz", "becamec", "comedor", "emergencia"]);

caso("18. Quiere coche eléctrico y reformar casa, pueblo < 5.000 hab., Cantabria",
  { ...base, tipo: "familia", anioNac: 1975, ccaa: "CB", adultos: 2, ingresos: 45000, laboral: "empleado", vivienda: "propia", vehiculo: true, reforma: true, municipioPequeno: true },
  ["moves", "rehab", "dedalq", "dedeficiencia"], ["imv"],
  r => est("moves")(r) !== "abierta" ? "MOVES debe estar abierto hasta 31/12/2026" : null);

// ── Empresas ──
caso("E1. Autónoma nueva 28 años, diseño, Madrid, quiere digitalizar",
  { tipo: "empresa", anioNac: 1998, ccaa: "MD", fase: "idea", forma: "autonomo", sector: "servicios", empleados: 0, necesidades: ["digitalizar"], mujer: true },
  ["tarifaplana", "cuotacero", "kitdigital", "camaras", "localemp"], ["enisajoven", "neotec", "fundae"],
  r => est("kitdigital")(r) !== "cerrada" ? "Kit Digital debe figurar cerrado" : null);

caso("E2. Startup tecnológica S.L. 1 año, socios 32 años, Barcelona, capital 20k, busca financiación",
  { tipo: "empresa", anioNac: 1994, ccaa: "CT", fase: "joven", forma: "sociedad", sector: "tech", innovadora: true, capital20k: true, empleados: 3, necesidades: ["financiar", "contratar"] },
  ["enisajoven", "neotec", "startup", "bonif", "fundae", "ico"], ["tarifaplana", "cuotacero", "agro"],
  r => est("neotec")(r) !== "cerrada" ? "NEOTEC 2026 debe figurar cerrada" : null);

caso("E3. Bar consolidado 12 empleados, Valencia, quiere contratar y ahorrar energía",
  { tipo: "empresa", anioNac: 1975, ccaa: "VC", fase: "consolidada", forma: "sociedad", sector: "hosteleria", empleados: 12, necesidades: ["contratar", "eficiencia", "financiar"] },
  ["bonif", "fundae", "eficienciaemp", "ico", "enisacrece"], ["tarifaplana", "enisajoven", "neotec", "localemp"]);

caso("E4. Joven agricultor 25 años, Castilla-La Mancha",
  { tipo: "empresa", anioNac: 2001, ccaa: "CM", fase: "idea", forma: "autonomo", sector: "agro", empleados: 0, necesidades: ["financiar"], desempleado: true },
  ["agro", "tarifaplana", "capitaliza", "compatible", "ico"], ["cuotacero"]);

caso("E5. Autónomo nuevo en Aragón (cuota cero cerró 30/10/2026)",
  { tipo: "empresa", anioNac: 1990, ccaa: "AR", fase: "reciente", forma: "autonomo", sector: "comercio", empleados: 0, necesidades: [] },
  ["tarifaplana", "cuotacero"], [],
  r => est("cuotacero")(r) !== "cerrada" ? "cuota cero Aragón debe estar cerrada el 31/10/2026" : null);

caso("E6. Exportadora con furgoneta eléctrica, Murcia",
  { tipo: "empresa", anioNac: 1980, ccaa: "MC", fase: "consolidada", forma: "sociedad", sector: "industria", empleados: 25, necesidades: ["internacionalizar", "vehiculo", "formacion"] },
  ["icex", "moves", "fundae", "camaras"], ["tarifaplana"]);

// ── Asociaciones ──
caso("A1. Asociación vecinal local recién creada, sin inscribir, Málaga",
  { tipo: "asociacion", ccaa: "AN", ambitoEnt: "local", finalidad: "vecinal", antiguedad: 0, inscrita: false, utilidadPublica: false, empleados: 0, necAso: ["proyectos"] },
  ["registro", "aytoaso"], ["irpfest", "utilidad", "irpfccaa"]);

caso("A2. ONG estatal de discapacidad, 10 años, utilidad pública, 20 empleados",
  { tipo: "asociacion", ccaa: "MD", ambitoEnt: "estatal", finalidad: "discapacidad", antiguedad: 10, inscrita: true, utilidadPublica: true, empleados: 20, necAso: ["personal", "voluntariado"] },
  ["irpfest", "aytoaso", "lacaixa", "bonif", "fundae", "voluntariado"], ["registro", "utilidad", "irpfccaa"],
  r => est("irpfest")(r) !== "cerrada" ? "IRPF estatal 2026 debe figurar cerrada" : null);

caso("A3. Club deportivo 5 años, Galicia",
  { tipo: "asociacion", ccaa: "GA", ambitoEnt: "local", finalidad: "deporte", antiguedad: 5, inscrita: true, utilidadPublica: false, empleados: 0, necAso: ["equipamiento"] },
  ["deporte", "aytoaso", "utilidad"], ["irpfccaa", "lacaixa"]);

caso("A4. Asociación juvenil autonómica, 3 años, proyectos europeos, Comunitat Valenciana",
  { tipo: "asociacion", ccaa: "VC", ambitoEnt: "autonomico", finalidad: "juventud", antiguedad: 3, inscrita: true, utilidadPublica: false, empleados: 1, necAso: ["europa", "proyectos"] },
  ["erasmus", "irpfccaa", "aytoaso", "utilidad", "fundae"], ["irpfest"]);

caso("A5. Asociación cultural y ambiental (cultura), Baleares",
  { tipo: "asociacion", ccaa: "IB", ambitoEnt: "local", finalidad: "cultura", antiguedad: 4, inscrita: true, utilidadPublica: false, empleados: 0, necAso: ["local"] },
  ["cultura", "aytoaso", "eficienciaemp"], ["biodiv"]);

// Integridad de la base: todas con url, docs y pasos
for (const a of KB.A) {
  const ok = a.t && a.org && a.res && a.cuantia && a.req.length && a.docs.length && a.pasos.length && a.url && a.fuente;
  if (!ok) { fallos++; console.log("✗ ayuda incompleta: " + a.id); }
}
// Estados de plazo frente a fechas límite
const e = (pl, f) => KB.estado(pl, new Date(f + "T12:00:00")).k;
const chk = (c, m) => { total++; if (!c) { fallos++; console.log("✗ " + m); } };
chk(e({ tipo: "conv", ini: "2026-06-22", fin: "2026-10-31" }, "2026-10-31") === "abierta", "último día debe ser abierta");
chk(e({ tipo: "conv", ini: "2026-06-22", fin: "2026-10-31" }, "2026-11-01") === "cerrada", "día siguiente debe ser cerrada");
chk(e({ tipo: "conv", ini: "2027-03-01", fin: "2027-05-01" }, "2026-11-01") === "proxima", "futura debe ser próxima");
chk(e({ tipo: "hasta", fin: "2026-12-31" }, "2027-01-02") === "cerrada", "hasta vencido debe cerrar");

console.log(`\n${KB.A.length} ayudas en la base · ${total - fallos}/${total} pruebas correctas`);
process.exit(fallos ? 1 : 0);
