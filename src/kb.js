/* Sello a Sello · Base de conocimiento de ayudas (España)
   Cada ayuda: datos oficiales + función de encaje m(p) con el perfil.
   Revisado: 30/10/2026. Al actualizar, cambia `ver` en la ayuda revisada. */
(function (root) {
  "use strict";

  // ── Indicadores 2026 ──────────────────────────────────────────────
  const IND = {
    anio: 2026,
    IPREM_MES: 600, IPREM_12: 7200, IPREM_14: 8400,   // IPREM congelado desde 2023
    SMI_MES: 1221, SMI_14: 17094,                       // SMI 2026 (14 pagas)
    IMV_BASE: 8803.20,                                  // renta garantizada IMV persona sola / año
    PNC: 8803.20,                                       // pensión no contributiva anual (14 pagas)
    revisado: "2026-10-31"
  };

  // ── Comunidades autónomas ─────────────────────────────────────────
  const CCAA = {
    AN: { n: "Andalucía", web: "https://www.juntadeandalucia.es/", bol: "BOJA", bolUrl: "https://www.juntadeandalucia.es/eboja.html", rmin: "Renta Mínima de Inserción Social en Andalucía" },
    AR: { n: "Aragón", web: "https://www.aragon.es/", bol: "BOA", bolUrl: "https://www.boa.aragon.es/", rmin: "Prestación Aragonesa Complementaria del IMV" },
    AS: { n: "Asturias", web: "https://www.asturias.es/", bol: "BOPA", bolUrl: "https://sede.asturias.es/bopa", rmin: "Salario Social Básico" },
    IB: { n: "Illes Balears", web: "https://www.caib.es/", bol: "BOIB", bolUrl: "https://www.caib.es/eboibfront/", rmin: "Renta Social Garantizada" },
    CN: { n: "Canarias", web: "https://www.gobiernodecanarias.org/", bol: "BOC", bolUrl: "https://www.gobiernodecanarias.org/boc/", rmin: "Renta Canaria de Ciudadanía" },
    CB: { n: "Cantabria", web: "https://www.cantabria.es/", bol: "BOC Cantabria", bolUrl: "https://boc.cantabria.es/", rmin: "Renta Social Básica" },
    CL: { n: "Castilla y León", web: "https://www.jcyl.es/", bol: "BOCYL", bolUrl: "https://bocyl.jcyl.es/", rmin: "Renta Garantizada de Ciudadanía" },
    CM: { n: "Castilla-La Mancha", web: "https://www.castillalamancha.es/", bol: "DOCM", bolUrl: "https://docm.jccm.es/", rmin: "Ingreso Mínimo de Solidaridad" },
    CT: { n: "Cataluña", web: "https://web.gencat.cat/", bol: "DOGC", bolUrl: "https://dogc.gencat.cat/", rmin: "Renda Garantida de Ciutadania" },
    VC: { n: "Comunitat Valenciana", web: "https://www.gva.es/", bol: "DOGV", bolUrl: "https://dogv.gva.es/", rmin: "Renta Valenciana de Inclusión" },
    EX: { n: "Extremadura", web: "https://www.juntaex.es/", bol: "DOE", bolUrl: "https://doe.juntaex.es/", rmin: "Renta Extremeña Garantizada" },
    GA: { n: "Galicia", web: "https://www.xunta.gal/", bol: "DOG", bolUrl: "https://www.xunta.gal/diario-oficial-galicia", rmin: "Renta de Inclusión Social de Galicia (RISGA)" },
    MD: { n: "Comunidad de Madrid", web: "https://www.comunidad.madrid/", bol: "BOCM", bolUrl: "https://www.bocm.es/", rmin: "Renta Mínima de Inserción (RMI)" },
    MC: { n: "Región de Murcia", web: "https://www.carm.es/", bol: "BORM", bolUrl: "https://www.borm.es/", rmin: "Renta Básica de Inserción" },
    NC: { n: "Navarra", web: "https://www.navarra.es/", bol: "BON", bolUrl: "https://bon.navarra.es/", rmin: "Renta Garantizada" },
    PV: { n: "País Vasco", web: "https://www.euskadi.eus/", bol: "BOPV", bolUrl: "https://www.euskadi.eus/bopv", rmin: "Renta de Garantía de Ingresos (RGI, Lanbide)" },
    RI: { n: "La Rioja", web: "https://www.larioja.org/", bol: "BOR", bolUrl: "https://web.larioja.org/bor-portada", rmin: "Ingreso Mínimo de Inserción" },
    CE: { n: "Ceuta", web: "https://www.ceuta.es/", bol: "BOCCE", bolUrl: "https://www.ceuta.es/ceuta/bocce", rmin: "Ingreso Mínimo de Inserción Social (IMIS)" },
    ML: { n: "Melilla", web: "https://www.melilla.es/", bol: "BOME", bolUrl: "https://bomemelilla.es/", rmin: "Ingreso Melillense de Integración (IMI)" }
  };

  // ── Documentos reutilizables ──────────────────────────────────────
  const D = {
    dni: "DNI o NIE en vigor de todas las personas de la unidad de convivencia",
    padron: "Certificado de empadronamiento colectivo (lo da tu ayuntamiento, a menudo online)",
    libro: "Libro de familia o certificados de nacimiento / matrimonio / pareja de hecho",
    renta: "Declaración de la Renta del último año o certificado de imputaciones de la AEAT",
    banco: "Certificado de titularidad de la cuenta bancaria (lo da tu banco)",
    clave: "Cl@ve, certificado digital o DNIe para tramitar online (si no, cita presencial)",
    alquiler: "Contrato de alquiler en vigor y recibos de los últimos meses pagados por banco",
    vida: "Informe de vida laboral (Seguridad Social, descarga inmediata con Cl@ve)",
    discap: "Certificado de grado de discapacidad (si aplica)",
    fn: "Título de familia numerosa o monoparental en vigor (si aplica)",
    nomina: "Nóminas o justificantes de ingresos de los últimos meses",
    estatutos: "Estatutos y acta fundacional de la entidad, inscritos en el registro",
    cif: "Tarjeta de identificación fiscal (NIF) de la entidad",
    junta: "Certificado de la junta directiva vigente y DNI de la persona representante",
    corriente: "Certificados de estar al corriente con Hacienda (AEAT) y con la Seguridad Social",
    proyecto: "Memoria del proyecto con objetivos, actividades, calendario y presupuesto detallado",
    cuentas: "Cuentas anuales o balance y presupuesto del último ejercicio",
    plan: "Plan de empresa o memoria de la actividad (con previsión de ingresos y gastos)",
    altaAEAT: "Alta censal en Hacienda (modelo 036/037)",
    escritura: "Escritura de constitución y estatutos de la sociedad"
  };

  // ── Utilidades de cálculo ─────────────────────────────────────────
  const miembros = p => Math.max(1, (p.adultos || 1) + (p.menores || 0));
  const menores = p => (p.m0_3 || 0) + (p.m3_6 || 0) + (p.m6_18 || 0);
  const esHogar = p => p.tipo === "persona" || p.tipo === "familia";
  const enParo = p => p.laboral === "paro-prestacion" || p.laboral === "paro-sin";
  const trabaja = p => p.laboral === "empleado" || p.laboral === "autonomo";

  // Renta garantizada IMV anual según composición (escala oficial: +30 % por miembro, tope 2,2)
  function rentaIMV(p) {
    const n = miembros(p);
    let esc = Math.min(1 + 0.3 * (n - 1), 2.2);
    let rg = IND.IMV_BASE * esc;
    if (p.monoparental && menores(p) > 0) rg += IND.IMV_BASE * 0.22;
    if (p.discapacidad >= 65) rg += IND.IMV_BASE * 0.22;
    return Math.round(rg);
  }
  function encajaIMV(p) {
    if (!esHogar(p)) return false;
    const edadOk = p.edad >= 23 || (p.edad >= 18 && menores(p) > 0);
    const resOk = p.residencia && p.residencia !== "menos1";
    return edadOk && resOk && p.patrimonioBajo !== false && p.ingresos < rentaIMV(p);
  }
  // Límite bono social eléctrico (CNMC): IPREM 14 pagas × (1,5 +0,3/adulto extra +0,5/menor [+1 especial])
  function limiteBonoSocial(p) {
    let mult = 1.5 + 0.3 * Math.max(0, (p.adultos || 1) - 1) + 0.5 * menores(p);
    if (p.discapacidad >= 33 || p.vg || p.dependencia || (p.monoparental && menores(p) > 0)) mult += 1;
    return Math.round(IND.IPREM_14 * mult);
  }
  // Umbrales becas MEC (orientativos, escala sobre la familia de 4 de la convocatoria 2025-26)
  const ESCALA_BECA = [0, 0.41, 0.67, 0.88, 1, 1.11, 1.21, 1.31, 1.41];
  function umbralBeca(p, ref4) {
    const n = Math.min(miembros(p), 8);
    return Math.round(ref4 * ESCALA_BECA[n]);
  }
  const eur = n => n.toLocaleString("es-ES", { maximumFractionDigits: 0 }) + " €";

  // ── Catálogo de ayudas ────────────────────────────────────────────
  const A = [];
  const add = o => { o.ver = o.ver || IND.revisado; A.push(o); };

  /* ================= PERSONAS Y FAMILIAS ================= */

  add({
    id: "imv", t: "Ingreso Mínimo Vital (IMV)", org: "Seguridad Social (INSS)", amb: "estatal", cat: "ingresos",
    para: ["persona", "familia"],
    res: "Prestación mensual que garantiza un ingreso mínimo a hogares en situación de vulnerabilidad. Se cobra mientras se cumplan los requisitos.",
    cuantia: "Desde 733,60 €/mes (persona sola) hasta 1.613,92 €/mes en 2026, menos los ingresos que ya tenga el hogar. +22 % si es monoparental.",
    plazo: { tipo: "permanente" },
    url: "https://imv.seg-social.es/", fuente: "Seguridad Social · cuantías 2026",
    req: ["Tener 23 años o más (18 si tienes hijos a cargo)", "Residencia legal y efectiva en España al menos 1 año", "Ingresos del año anterior por debajo de la renta garantizada de tu hogar", "Patrimonio (sin vivienda habitual) por debajo del límite legal", "No ser administrador de una sociedad mercantil", "Inscribirte como demandante de empleo si tienes entre 18 y 65 años (salvo excepciones)"],
    docs: [D.dni, D.padron, D.libro, D.renta, D.banco, D.clave],
    pasos: ["Entra en imv.seg-social.es y usa el simulador para comprobar tu cuantía", "Pulsa «Solicitar» (con Cl@ve o sin certificado, con formulario guiado)", "Adjunta los documentos escaneados o fotografiados", "Guarda el justificante con el número de expediente", "La Seguridad Social tiene 6 meses para resolver; consulta el estado en la misma web"],
    m: p => {
      if (!encajaIMV(p)) return null;
      const rg = rentaIMV(p);
      return { n: "alta", why: [`Tus ingresos (${eur(p.ingresos)}) están por debajo de la renta garantizada estimada para tu hogar (${eur(rg)}/año)`], imp: rg - p.ingresos };
    }
  });

  add({
    id: "capi", t: "Complemento de Ayuda para la Infancia (CAPI)", org: "Seguridad Social (INSS)", amb: "estatal", cat: "familia",
    para: ["persona", "familia"],
    res: "Ayuda mensual por cada hijo menor de 18 años para hogares con ingresos bajos o medios-bajos. Se puede cobrar aunque no tengas derecho al IMV.",
    cuantia: "Por hijo y mes en 2026: 115 € (0-3 años), 80,50 € (3-6 años), 57,50 € (6-18 años).",
    plazo: { tipo: "permanente" },
    url: "https://imv.seg-social.es/", fuente: "Seguridad Social · cuantías CAPI 2026",
    req: ["Hijos menores de 18 años en el hogar", "Ingresos del hogar inferiores al 300 % de la renta garantizada del IMV", "Patrimonio neto inferior al 150 % del límite del IMV", "Residencia legal en España"],
    docs: [D.dni, D.padron, D.libro, D.renta, D.banco],
    pasos: ["Solicítalo en imv.seg-social.es marcando solo «Complemento de ayuda para la infancia»", "Si ya cobras el IMV, se reconoce de oficio: comprueba que aparece en tu resolución", "Consulta el estado en la web del IMV"],
    m: p => {
      if (!esHogar(p) || menores(p) === 0) return null;
      const lim = rentaIMV(p) * 3;
      if (p.ingresos >= lim) return null;
      const imp = Math.round(((p.m0_3 || 0) * 115 + (p.m3_6 || 0) * 80.5 + (p.m6_18 || 0) * 57.5) * 12);
      return { n: "alta", why: [`Tienes ${menores(p)} menor(es) y tus ingresos están bajo el límite estimado de ${eur(lim)}`], imp };
    }
  });

  add({
    id: "rmin", t: "Renta mínima de tu comunidad", org: "Servicios sociales de la comunidad autónoma", amb: "autonomico", cat: "ingresos",
    para: ["persona", "familia"],
    res: "Cada comunidad tiene su propia renta de inserción, que complementa o sustituye al IMV y suele ir unida a un itinerario de inserción.",
    cuantia: "Varía por comunidad; se calcula según los miembros del hogar y los ingresos.",
    plazo: { tipo: "permanente", nota: "Solicitud todo el año en servicios sociales" },
    url: c => (CCAA[c] || {}).web, fuente: "Portal oficial de la comunidad",
    req: ["Empadronamiento y residencia en la comunidad (normalmente 1 a 3 años)", "Ingresos por debajo del baremo autonómico", "Haber solicitado antes el IMV, en muchas comunidades"],
    docs: [D.dni, D.padron, D.libro, D.renta, D.banco, "Resolución del IMV (concedido o denegado)"],
    pasos: ["Pide cita en el centro de servicios sociales de tu ayuntamiento", "La trabajadora social revisa tu caso y tramita la solicitud", "Firma el acuerdo o itinerario de inserción si te lo piden"],
    nombre: c => (CCAA[c] || {}).rmin,
    m: p => {
      if (!esHogar(p) || !p.ccaa) return null;
      if (p.ingresos < rentaIMV(p) * 1.05) return { n: encajaIMV(p) ? "media" : "alta", why: ["Tus ingresos son muy bajos para el tamaño de tu hogar"] };
      return null;
    }
  });

  add({
    id: "emergencia", t: "Ayudas de emergencia social del ayuntamiento", org: "Servicios sociales municipales", amb: "local", cat: "ingresos",
    para: ["persona", "familia"],
    res: "Ayudas puntuales para alquiler atrasado, suministros (luz, agua, gas), alimentación, gafas, material escolar o comedor. Las gestiona tu ayuntamiento.",
    cuantia: "Puntual, según necesidad y presupuesto municipal (habitualmente de 100 € a 3.000 €).",
    plazo: { tipo: "permanente", nota: "Todo el año, mientras haya presupuesto municipal" },
    url: "https://administracion.gob.es/", fuente: "Servicios sociales de tu ayuntamiento",
    req: ["Estar empadronado en el municipio", "Situación de necesidad valorada por servicios sociales"],
    docs: [D.dni, D.padron, D.renta, "Facturas o recibos pendientes que justifiquen la necesidad", D.banco],
    pasos: ["Llama o pide cita a los servicios sociales de tu ayuntamiento", "Explica la necesidad concreta y lleva las facturas", "La trabajadora social emite informe y se resuelve en días o semanas"],
    m: p => esHogar(p) && p.ingresos < limiteBonoSocial(p) ? { n: "media", why: ["Tus ingresos te sitúan en el rango de vulnerabilidad que atienden los servicios sociales"] } : null
  });

  add({
    id: "bonoluz", t: "Bono social eléctrico", org: "Ministerio para la Transición Ecológica · CNMC", amb: "estatal", cat: "energia",
    para: ["persona", "familia"],
    res: "Descuento directo en la factura de la luz para hogares vulnerables. Hasta el 31/12/2026 los descuentos excepcionales siguen siendo del 42,5 % (vulnerable) y 57,5 % (vulnerable severo).",
    cuantia: "42,5 % o 57,5 % de descuento en la factura (orientativo: 250-500 € de ahorro al año). Prohibición de cortes de suministro hasta 31/12/2026.",
    plazo: { tipo: "permanente", nota: "Descuentos reforzados hasta 31/12/2026 (RDL 16/2025)" },
    url: "https://www.cnmc.es/facil-para-ti/que-hace-la-cnmc-para-consumidores/bono-social-electrico", fuente: "CNMC · RDL 16/2025",
    req: ["Tener contratada la tarifa regulada (PVPC) con una comercializadora de referencia", "Potencia contratada de 10 kW o menos en tu vivienda habitual", "Renta del hogar ≤ 1,5 × IPREM (12.600 €) +0,3 por adulto extra +0,5 por menor (+1 si hay discapacidad, monoparentalidad, dependencia o violencia de género)", "O bien: familia numerosa, perceptor del IMV o pensionista con pensión mínima"],
    docs: ["Modelo de solicitud de la comercializadora de referencia", D.dni, D.padron, D.libro, D.fn, "Certificado de servicios sociales (discapacidad, VG, dependencia) si aplica"],
    pasos: ["Si no tienes PVPC, cámbiate a una comercializadora de referencia (Energía XXI, Curenergía, Baser, CHC, Régsiti, Teramelcor…)", "Descarga y rellena su modelo de solicitud del bono social", "Envíalo por email, teléfono, correo o en oficina con los documentos", "Respuesta en 10 días hábiles; el descuento aparece en la factura", "Renuévalo cada 2 años (las familias numerosas, cuando caduque el título)"],
    m: p => {
      if (!esHogar(p)) return null;
      const lim = limiteBonoSocial(p);
      const why = [];
      let ok = false;
      if (p.ingresos <= lim) { ok = true; why.push(`Ingresos ${eur(p.ingresos)} ≤ límite ${eur(lim)} para tu hogar` + (p.ingresos <= lim / 2 ? " (posible vulnerable severo: 57,5 %)" : "")); }
      if (p.familiaNumerosa === "si") { ok = true; why.push("Las familias numerosas tienen derecho sin límite de renta"); }
      if (encajaIMV(p)) { ok = true; why.push("Si cobras el IMV tienes derecho directo"); }
      if (!ok && p.familiaNumerosa !== "si" && menores(p) >= 3) return { n: "media", why: ["Con el título de familia numerosa tendrás derecho sin límite de renta: pídelo primero"], imp: 320 };
      if (!ok) return null;
      if (p.luzPVPC === "no") why.push("Ojo: tendrás que pasarte a la tarifa PVPC");
      return { n: "alta", why, imp: p.ingresos <= lim / 2 ? 450 : 320 };
    }
  });

  add({
    id: "bonotermico", t: "Bono social térmico (calefacción y agua caliente)", org: "Ministerio para la Transición Ecológica", amb: "estatal", cat: "energia",
    para: ["persona", "familia"],
    res: "Pago único anual para calefacción, agua caliente o cocina. Lo reciben automáticamente quienes tengan el bono social eléctrico a 31 de diciembre.",
    cuantia: "Entre unos 40 € y 375 € al año según zona climática y grado de vulnerabilidad.",
    plazo: { tipo: "permanente", nota: "Automático: hay que tener el bono social eléctrico antes del 31/12/2026 para cobrarlo en 2027" },
    url: "https://www.miteco.gob.es/", fuente: "MITECO · gestión por comunidades autónomas",
    req: ["Ser beneficiario del bono social eléctrico a 31 de diciembre del año anterior"],
    docs: ["Ninguno adicional: se paga de oficio en tu cuenta"],
    pasos: ["Consigue el bono social eléctrico antes del 31 de diciembre", "Comprueba que tu comunidad tiene tu cuenta bancaria correcta", "El pago llega durante el primer semestre del año siguiente"],
    m: p => esHogar(p) && (p.ingresos <= limiteBonoSocial(p) || p.familiaNumerosa === "si") ? { n: "alta", why: ["Va unido al bono social eléctrico, para el que encajas"], imp: 120 } : null
  });

  add({
    id: "nacimiento", t: "Prestación por nacimiento y cuidado de menor", org: "Seguridad Social (INSS)", amb: "estatal", cat: "familia",
    para: ["persona", "familia"],
    res: "Permiso retribuido al 100 % de la base reguladora para cada progenitor. Desde 2026: 17 semanas en el primer año + 2 semanas hasta los 8 años (monoparentales: 32 + 4).",
    cuantia: "100 % de tu base reguladora durante el permiso (19 semanas en total por progenitor).",
    plazo: { tipo: "permanente", nota: "Solicítala en los 15 días siguientes al nacimiento para cobrar sin demora" },
    url: "https://www.seg-social.es/", fuente: "La Moncloa · permiso ampliado 2026",
    req: ["Estar de alta en la Seguridad Social (cuenta ajena o autónomo)", "Periodo mínimo cotizado según edad (ninguno si tienes menos de 21 años)", "Si no llegas al mínimo cotizado, la madre puede cobrar el subsidio no contributivo de 42 días"],
    docs: [D.dni, "Informe de maternidad o certificado del registro civil / libro de familia", "Certificado de empresa (lo envía tu empresa) o justificante de alta como autónomo", D.banco],
    pasos: ["Entra en el portal «Tu Seguridad Social» o en prestaciones.seg-social.es", "Elige «Nacimiento y cuidado de menor» y rellena el formulario", "Adjunta la inscripción del bebé en el registro civil", "Las semanas extra (hasta los 8 años) se piden aparte, avisando a la empresa con 15 días"],
    m: p => esHogar(p) && (p.embarazo || (p.m0_3 || 0) > 0) && (trabaja(p) || p.laboral === "paro-prestacion")
      ? { n: p.embarazo ? "alta" : "media", why: [p.embarazo ? "Esperas o acabas de tener un bebé y cotizas" : "Tienes un menor de 3 años: puedes pedir las 2 semanas adicionales hasta los 8 años"] } : null
  });

  add({
    id: "maternidad", t: "Deducción por maternidad (100 €/mes) + gastos de guardería", org: "Agencia Tributaria (AEAT)", amb: "estatal", cat: "fiscal",
    para: ["persona", "familia"],
    res: "Hacienda te devuelve hasta 1.200 € al año por cada hijo menor de 3 años, cobrables por adelantado cada mes, y hasta 1.000 € más por guardería autorizada.",
    cuantia: "Hasta 1.200 €/año por hijo menor de 3 años + hasta 1.000 € por guardería (máx. 2.200 €).",
    plazo: { tipo: "permanente", nota: "Abono anticipado mensual con el modelo 140; el extra de guardería, en la declaración de la Renta" },
    url: "https://sede.agenciatributaria.gob.es/", fuente: "AEAT · art. 81 Ley del IRPF",
    req: ["Madre (o padre/tutor en los casos legales) con hijo menor de 3 años", "Estar de alta en la Seguridad Social o mutualidad, o cobrar prestación o subsidio por desempleo", "Para guardería: centro autorizado de educación infantil"],
    docs: [D.dni, D.libro, "Certificado de la guardería (modelo 233, lo presenta el centro)", D.clave],
    pasos: ["Entra en la sede de la AEAT > «Deducción por maternidad» > modelo 140 para cobrar cada mes", "O aplica la deducción completa en tu declaración de la Renta", "Marca el incremento por guardería en la Renta (lo verás en tus datos fiscales)"],
    m: p => {
      if (!esHogar(p) || !((p.m0_3 || 0) > 0 || p.embarazo)) return null;
      const n = Math.max(p.m0_3 || 0, p.embarazo ? 1 : 0);
      if (trabaja(p) || p.laboral === "paro-prestacion") return { n: "alta", why: ["Tienes (o vas a tener) un hijo menor de 3 años y trabajas o cobras paro"], imp: 1200 * n };
      return { n: "media", why: ["Hay un menor de 3 años: encaja si la madre trabaja o cobra paro"], imp: 1200 * n };
    }
  });

  add({
    id: "titulofn", t: "Título de familia numerosa (o monoparental)", org: "Servicios sociales de tu comunidad", amb: "autonomico", cat: "familia",
    para: ["familia", "persona"],
    res: "El título es la llave de muchos descuentos: transporte (20-50 %), tasas universitarias, bono social de luz sin límite de renta, deducción de 1.200 €, prioridad en becas y comedores.",
    cuantia: "Ahorro indirecto: descuentos y deducciones que suelen superar los 1.500 € al año.",
    plazo: { tipo: "permanente" },
    url: c => (CCAA[c] || {}).web, fuente: "Ley 40/2003 de protección a las familias numerosas",
    req: ["3 o más hijos, o 2 si uno tiene discapacidad, o 2 con un progenitor con discapacidad o viudo/a, entre otros supuestos", "Hijos menores de 21 años (26 si estudian)", "Algunas comunidades tienen además título de familia monoparental"],
    docs: [D.dni, D.libro, D.padron, D.discap, "Foto de cada miembro (algunas comunidades)"],
    pasos: ["Busca «título de familia numerosa» en la web de tu comunidad", "Solicítalo online o en registro con los documentos", "Recibirás el título y, en muchas comunidades, carnés individuales"],
    m: p => {
      if (!esHogar(p) || p.familiaNumerosa === "si") return null;
      const nm = menores(p);
      if (nm >= 3) return { n: "alta", why: [`Tienes ${nm} hijos: cumples el requisito básico`] };
      if (nm === 2 && (p.discapacidad >= 33 || p.monoparental)) return { n: "media", why: ["Con 2 hijos y discapacidad o un solo progenitor puedes encajar en un supuesto especial; en algunas comunidades, título monoparental"] };
      if (nm >= 1 && p.monoparental) return { n: "media", why: ["Varias comunidades (p. ej. Cataluña, C. Valenciana, Navarra, Madrid, Baleares, Galicia…) reconocen la familia monoparental con ventajas propias"] };
      return null;
    }
  });

  add({
    id: "dedfn", t: "Deducción por familia numerosa, monoparental o discapacidad a cargo", org: "Agencia Tributaria (AEAT)", amb: "estatal", cat: "fiscal",
    para: ["familia", "persona"],
    res: "Hacienda te paga 1.200 € al año (2.400 € si es categoría especial) por familia numerosa, por familia monoparental con 2 hijos o por cada familiar con discapacidad a cargo. Se puede cobrar cada mes.",
    cuantia: "1.200 €/año por cada supuesto (2.400 € familia numerosa especial), cobro anticipado mensual de 100 €.",
    plazo: { tipo: "permanente", nota: "Abono anticipado con el modelo 143 o en la Renta" },
    url: "https://sede.agenciatributaria.gob.es/", fuente: "AEAT · art. 81 bis Ley del IRPF",
    req: ["Trabajar (alta en Seguridad Social), cobrar pensión o prestación por desempleo", "Título de familia numerosa, o ser monoparental con 2 hijos sin pensión de alimentos, o tener a cargo un ascendiente/descendiente con discapacidad"],
    docs: [D.dni, D.fn, D.discap, D.libro, D.clave],
    pasos: ["Sede AEAT > «Deducciones por familia numerosa, personas con discapacidad a cargo» > modelo 143", "Elige solicitud colectiva si sois varios contribuyentes con derecho", "Hacienda ingresa 100 € al mes en tu cuenta"],
    m: p => {
      if (!esHogar(p)) return null;
      const why = []; let imp = 0;
      if (p.familiaNumerosa === "si" || menores(p) >= 3) { why.push("Familia numerosa"); imp += menores(p) >= 5 ? 2400 : 1200; }
      if (p.monoparental && menores(p) >= 2) { why.push("Familia monoparental con 2 o más hijos"); imp += p.familiaNumerosa === "si" ? 0 : 1200; }
      if (p.discapacidad >= 33 && p.discapacidadQuien !== "yo") { why.push("Familiar con discapacidad a cargo"); imp += 1200; }
      if (!why.length) return null;
      const ok = trabaja(p) || p.laboral === "paro-prestacion" || p.laboral === "jubilado";
      return { n: ok ? "alta" : "media", why: ok ? why : why.concat(["Requiere trabajar o cobrar pensión/paro"]), imp };
    }
  });

  add({
    id: "hijodisc", t: "Asignación por hijo a cargo con discapacidad", org: "Seguridad Social (INSS)", amb: "estatal", cat: "salud",
    para: ["familia", "persona"],
    res: "Prestación económica por cada hijo con discapacidad: menores con 33 % o más, y mayores de 18 con 65 % o más.",
    cuantia: "Desde 1.000 €/año por menor con discapacidad ≥ 33 %; mayores de 18 años con 65 % o más, importes mensuales superiores.",
    plazo: { tipo: "permanente" },
    url: "https://www.seg-social.es/", fuente: "Seguridad Social · prestaciones familiares",
    req: ["Hijo con discapacidad reconocida (≥ 33 % menores, ≥ 65 % mayores de edad)", "Residencia legal en España"],
    docs: [D.dni, D.libro, D.discap, D.banco],
    pasos: ["Solicítala en la sede electrónica de la Seguridad Social o en un CAISS con cita previa", "Adjunta el certificado de discapacidad del hijo", "Se resuelve y se paga mensualmente"],
    m: p => esHogar(p) && p.discapacidad >= 33 && p.discapacidadQuien === "hijo" ? { n: "alta", why: ["Hay un hijo con discapacidad reconocida en el hogar"], imp: 1000 } : null
  });

  add({
    id: "dependencia", t: "Prestaciones de la Ley de Dependencia", org: "Servicios sociales de tu comunidad (IMSERSO)", amb: "autonomico", cat: "salud",
    para: ["familia", "persona"],
    res: "Si alguien del hogar necesita ayuda para la vida diaria: ayuda a domicilio, centro de día, teleasistencia o prestación económica para cuidados en el entorno familiar.",
    cuantia: "Prestación por cuidados familiares de hasta unos 455 €/mes (grado III), o servicios gratuitos o con copago.",
    plazo: { tipo: "permanente" },
    url: "https://imserso.es/", fuente: "Ley 39/2006 · IMSERSO",
    req: ["Persona en situación de dependencia (grado I, II o III) valorada por la comunidad", "Residencia en España 5 años (2 inmediatamente anteriores)"],
    docs: [D.dni, D.padron, "Informe médico de salud (lo emite tu centro de salud)", D.renta, D.banco],
    pasos: ["Pide cita en servicios sociales de tu ayuntamiento o en la web de tu comunidad", "Solicita la valoración de dependencia; vendrán a valorar a casa", "Tras el grado, se elabora el Programa Individual de Atención (PIA) con la prestación"],
    m: p => esHogar(p) && p.dependencia ? { n: "alta", why: ["Hay una persona dependiente en el hogar"] } : null
  });

  add({
    id: "pncjub", t: "Pensión no contributiva de jubilación", org: "IMSERSO · comunidad autónoma", amb: "estatal", cat: "ingresos",
    para: ["persona", "familia"],
    res: "Pensión para mayores de 65 años que no han cotizado lo suficiente para una pensión contributiva.",
    cuantia: "Hasta 8.803,20 €/año en 14 pagas (628,80 €/mes) en 2026, más 525 €/año si vives de alquiler.",
    plazo: { tipo: "permanente" },
    url: "https://imserso.es/", fuente: "IMSERSO · cuantías PNC 2026",
    req: ["65 años o más", "Residencia legal en España 10 años entre los 16 años y hoy, 2 de ellos seguidos e inmediatamente anteriores", "Ingresos personales inferiores a 8.803,20 €/año (límite mayor si convives con familiares)"],
    docs: [D.dni, D.padron, D.renta, D.banco, "Contrato de alquiler (para el complemento)"],
    pasos: ["Solicítala en el órgano gestor de tu comunidad (o IMSERSO en Ceuta/Melilla)", "Puedes presentarla en servicios sociales o registro electrónico", "Plazo de resolución: unos 3 meses"],
    m: p => esHogar(p) && p.edad >= 65 && p.pension !== "contributiva" && p.residencia === "mas10" && (p.ingresos / Math.max(1, p.adultos || 1)) < IND.PNC * 1.5
      ? { n: "alta", why: ["Tienes 65 años o más, sin pensión contributiva y con ingresos bajos"], imp: IND.PNC } : null
  });

  add({
    id: "pncinv", t: "Pensión no contributiva de invalidez", org: "IMSERSO · comunidad autónoma", amb: "estatal", cat: "salud",
    para: ["persona", "familia"],
    res: "Pensión para personas de 18 a 65 años con discapacidad del 65 % o más e ingresos bajos.",
    cuantia: "Hasta 8.803,20 €/año (628,80 €/mes); +50 % si necesitas ayuda de tercera persona (75 %+).",
    plazo: { tipo: "permanente" },
    url: "https://imserso.es/", fuente: "IMSERSO · cuantías PNC 2026",
    req: ["Entre 18 y 65 años", "Discapacidad igual o superior al 65 %", "Residencia legal 5 años (2 inmediatamente anteriores)", "Ingresos inferiores al límite"],
    docs: [D.dni, D.padron, D.discap, D.renta, D.banco],
    pasos: ["Solicítala en el órgano gestor de pensiones no contributivas de tu comunidad", "Adjunta el certificado de discapacidad", "Resolución en unos 3 meses"],
    m: p => esHogar(p) && p.discapacidad >= 65 && p.discapacidadQuien === "yo" && p.edad >= 18 && p.edad < 65 && (p.ingresos / Math.max(1, p.adultos || 1)) < IND.PNC * 1.5
      ? { n: "alta", why: ["Tienes una discapacidad del 65 % o más y estás en edad laboral"], imp: IND.PNC } : null
  });

  add({
    id: "minimos", t: "Complemento a mínimos de pensión", org: "Seguridad Social (INSS)", amb: "estatal", cat: "ingresos",
    para: ["persona", "familia"],
    res: "Si cobras una pensión contributiva baja y tienes pocos ingresos, la Seguridad Social la completa hasta la pensión mínima.",
    cuantia: "La diferencia entre tu pensión y la mínima de 2026 para tu situación.",
    plazo: { tipo: "permanente" },
    url: "https://www.seg-social.es/", fuente: "Seguridad Social · pensiones mínimas 2026",
    req: ["Cobrar una pensión contributiva", "Rendimientos anuales por debajo del límite (unos 9.000-10.500 €)", "Residir en España"],
    docs: [D.dni, D.renta, "Declaración anual de ingresos que pide la Seguridad Social"],
    pasos: ["Se pide junto a la pensión o en cualquier momento en la sede de la Seguridad Social", "Comunica cada año tus ingresos si te lo requieren"],
    m: p => esHogar(p) && p.pension === "contributiva" && p.ingresos / Math.max(1, p.adultos || 1) < 11000 ? { n: "media", why: ["Cobras pensión contributiva con ingresos bajos: comprueba si ya tienes el complemento"] } : null
  });

  add({
    id: "copago", t: "Exención del copago farmacéutico", org: "Sistema Nacional de Salud", amb: "estatal", cat: "salud",
    para: ["persona", "familia"],
    res: "Medicamentos con receta gratis para perceptores del IMV, de pensiones no contributivas, parados sin prestación y menores con discapacidad ≥ 33 %, entre otros.",
    cuantia: "Ahorro del 40-60 % del precio de tus medicamentos con receta.",
    plazo: { tipo: "permanente" },
    url: "https://www.sanidad.gob.es/", fuente: "Ministerio de Sanidad · RD-ley 16/2012 y modificaciones",
    req: ["Ser perceptor del IMV, de PNC, de rentas mínimas, parado sin prestación, o menor con discapacidad ≥ 33 %", "O pensionista con rentas bajas (aportación reducida)"],
    docs: [D.dni, "Tarjeta sanitaria", "Resolución de la prestación que cobras"],
    pasos: ["Normalmente se aplica de oficio en tu tarjeta sanitaria", "Si no aparece, pide en tu centro de salud la actualización del código de aportación"],
    m: p => esHogar(p) && (encajaIMV(p) || p.laboral === "paro-sin" || (p.discapacidad >= 33 && p.discapacidadQuien === "hijo")) ? { n: "media", why: ["Por tu situación probablemente no pagas medicinas: comprueba tu tarjeta sanitaria"], imp: 100 } : null
  });

  /* ---------- Empleo ---------- */
  add({
    id: "paro", t: "Prestación por desempleo (paro)", org: "SEPE", amb: "estatal", cat: "empleo",
    para: ["persona", "familia"],
    res: "Si has trabajado al menos 360 días en los últimos 6 años y perdiste el empleo de forma involuntaria, cobras una prestación según lo cotizado.",
    cuantia: "70 % de tu base reguladora los primeros 180 días y 60 % después (2026: mínimo 560 €/mes sin hijos; máximo 1.225-1.575 € según hijos).",
    plazo: { tipo: "permanente", nota: "Solicítala en los 15 días hábiles siguientes al cese para no perder días" },
    url: "https://www.sepe.es/", fuente: "SEPE · cuantías 2026",
    req: ["360 días cotizados en los últimos 6 años", "Situación legal de desempleo (despido, fin de contrato…)", "Inscribirte como demandante de empleo", "No haber cumplido la edad de jubilación"],
    docs: [D.dni, "Certificado de empresa (lo envía tu empresa al SEPE)", D.banco, D.libro],
    pasos: ["Inscríbete como demandante en tu oficina de empleo autonómica", "Solicita la prestación en sede.sepe.gob.es con Cl@ve o con el formulario de pre-solicitud", "Firma el acuerdo de actividad", "Consulta el estado y el importe en la sede del SEPE"],
    m: p => esHogar(p) && (p.laboral === "paro-prestacion" || (p.laboral === "paro-sin" && p.cotizado12 && !p.agotada))
      ? { n: p.laboral === "paro-prestacion" ? "media" : "alta", why: [p.laboral === "paro-prestacion" ? "Ya la cobras: revisa que la duración e importe son correctos" : "Tienes cotizado suficiente y estás en paro: solicítala ya"] } : null
  });

  add({
    id: "subsidio", t: "Subsidio por desempleo", org: "SEPE", amb: "estatal", cat: "empleo",
    para: ["persona", "familia"],
    res: "Ayuda para quien agotó el paro o no cotizó lo suficiente y tiene ingresos bajos. Desde la reforma, también para menores de 45 sin cargas y compatible con trabajar (CAE).",
    cuantia: "570 €/mes los 6 primeros meses, 540 € del 7.º al 12.º y 480 € después (95/90/80 % del IPREM). Entre 6 y 30 meses.",
    plazo: { tipo: "permanente", nota: "Solicítalo en los 15 días hábiles tras agotar el paro o el mes de espera" },
    url: "https://www.sepe.es/", fuente: "SEPE · RD-ley 2/2024",
    req: ["Estar inscrito como demandante de empleo", "Rentas propias inferiores al 75 % del SMI (unos 916 €/mes en 2026)", "Si tienes responsabilidades familiares, la renta del hogar dividida entre sus miembros también por debajo de ese límite", "Haber agotado la prestación o haber cotizado al menos 90 días (3 meses con cargas)"],
    docs: [D.dni, D.libro, D.renta, D.banco, "Declaración de rentas de la unidad familiar (modelo del SEPE)"],
    pasos: ["Inscríbete como demandante en tu servicio de empleo autonómico", "Solicita el subsidio en sede.sepe.gob.es", "Firma el acuerdo de actividad y el itinerario personalizado", "Si encuentras trabajo, pide el Complemento de Apoyo al Empleo (CAE) para seguir cobrando parte"],
    m: p => {
      if (!esHogar(p) || p.laboral !== "paro-sin") return null;
      if (p.cotizado12 && !p.agotada) return null;
      const perCap = p.ingresos / miembros(p);
      if (perCap >= IND.SMI_MES * 0.75 * 12) return null;
      return { n: "alta", why: ["Estás en paro sin prestación y con ingresos bajos", ...(p.edad >= 52 ? ["Con 52 años o más puedes acceder al subsidio para mayores de 52 (hasta la jubilación, cotiza para la pensión)"] : [])], imp: 570 * 6 + 540 * 6 };
    }
  });

  add({
    id: "garantia", t: "Garantía Juvenil Plus", org: "SEPE · servicios de empleo autonómicos", amb: "estatal", cat: "empleo",
    para: ["persona", "familia"],
    res: "Programa europeo para jóvenes de 16 a 29 años que no estudian ni trabajan: formación gratuita, prácticas y contratos con bonificaciones para la empresa que te contrate.",
    cuantia: "Formación y orientación gratuitas; las empresas reciben bonificaciones que facilitan tu contratación.",
    plazo: { tipo: "permanente" },
    url: "https://www.sepe.es/", fuente: "SEPE · Sistema Nacional de Garantía Juvenil",
    req: ["Entre 16 y 29 años", "No estar trabajando ni estudiando el día anterior a la inscripción", "Empadronado en España"],
    docs: [D.dni, D.clave],
    pasos: ["Busca «Garantía Juvenil» en sepe.es e inscríbete online", "Te asignan un orientador en tu servicio de empleo", "Accede a las ofertas, cursos y prácticas"],
    m: p => esHogar(p) && p.edad >= 16 && p.edad <= 29 && (enParo(p) || p.laboral === "hogar") ? { n: "alta", why: ["Tienes entre 16 y 29 años y no trabajas"] } : null
  });

  /* ---------- Educación ---------- */
  add({
    id: "becamec", t: "Beca general del Ministerio de Educación (Bachillerato, FP, universidad)", org: "Ministerio de Educación · Ministerio de Ciencia y Universidades", amb: "estatal", cat: "educacion",
    para: ["persona", "familia"],
    res: "Matrícula gratuita y cuantías fijas por renta (1.700 €) y por residencia fuera de casa (2.500 €), más una cuantía variable. La convocatoria 2026-27 ya cerró; la 2027-28 se espera en marzo de 2027.",
    cuantia: "Matrícula + 1.700 € (renta) + 2.500 € (residencia) + variable (mín. 60 €). Excelencia: 50-125 €.",
    plazo: { tipo: "conv", ini: "2026-03-19", fin: "2026-05-15", prox: "Próxima convocatoria (curso 2027-28): previsiblemente de marzo a mayo de 2027" },
    url: "https://sede.educacion.gob.es/", fuente: "Convocatoria 2026-27 · BOE",
    req: ["Estudiar Bachillerato, FP, grado o máster habilitante", "Renta familiar por debajo del umbral (orientativo, familia de 4: 13.898 € para cuantía de renta, 38.831 € para matrícula)", "Nota mínima: 5 para matrícula; 5,5 en Bachillerato para cuantías; 65 % (ciencias/técnicas) a 90 % de créditos aprobados en la universidad", "No superar los umbrales de patrimonio"],
    docs: [D.dni, D.clave, "Datos de todos los miembros de la familia (NIF) para que Educación cruce la renta con Hacienda", D.banco, "Contrato de alquiler si estudias fuera (para la cuantía de residencia)"],
    pasos: ["Entre marzo y mayo de 2027, entra en sede.educacion.gob.es > Becas > «Becas y ayudas al estudio de carácter general»", "Rellena el formulario (todos los miembros mayores de 18 deben firmar la autorización)", "Revisa el correo: la universidad o centro valida tus notas", "Resolución en otoño; el dinero llega entre diciembre y enero"],
    m: p => {
      if (!esHogar(p) || !p.estudia || p.estudia === "no") return null;
      const u3 = umbralBeca(p, 38831), u1 = umbralBeca(p, 13898);
      if (p.ingresos > u3) return null;
      const why = [`Hay un estudiante en el hogar y la renta (${eur(p.ingresos)}) es inferior al umbral orientativo de matrícula (${eur(u3)})`];
      let imp = 0;
      if (p.ingresos <= u1) { why.push("Podrías tener la cuantía fija de renta (1.700 €)"); imp += 1700; }
      if (p.fueraCasa) { why.push("Si estudias fuera de casa: +2.500 € de residencia"); imp += 2500; }
      return { n: "alta", why, imp };
    }
  });

  add({
    id: "neae", t: "Ayudas para alumnado con necesidad específica de apoyo educativo", org: "Ministerio de Educación", amb: "estatal", cat: "educacion",
    para: ["familia", "persona"],
    res: "Ayudas para enseñanza, transporte, comedor, material, reeducación pedagógica o del lenguaje para alumnos con discapacidad, TEA, trastornos graves de conducta o altas capacidades.",
    cuantia: "Variable según el concepto; la reeducación puede superar los 900 € por curso.",
    plazo: { tipo: "verificar", nota: "Convocatoria 2026-27 publicada en mayo de 2026 y con plazo abierto en septiembre; confirma la fecha de cierre en becaseducacion.gob.es o con el orientador del centro.", prox: "Si ha cerrado: convocatoria del curso 2027-28 en mayo de 2027" },
    url: "https://sede.educacion.gob.es/", fuente: "Ministerio de Educación · convocatoria anual",
    req: ["Alumno de 2 años en adelante con necesidad específica (dictamen o certificado)", "Umbrales de renta familiar (no aplican en altas capacidades)"],
    docs: [D.dni, D.discap, "Certificado del equipo de orientación educativa", D.banco],
    pasos: ["Sede del Ministerio de Educación > «Ayudas para alumnado con necesidad específica de apoyo educativo»", "El centro educativo certifica la necesidad y el gasto", "Resolución durante el curso"],
    m: p => esHogar(p) && p.discapacidad >= 33 && p.discapacidadQuien === "hijo" && (p.m3_6 + p.m6_18 > 0) ? { n: "media", why: ["Hay un hijo en edad escolar con discapacidad"] } : null
  });

  add({
    id: "comedor", t: "Ayudas de comedor y libros de texto", org: "Consejería de Educación de tu comunidad", amb: "autonomico", cat: "educacion",
    para: ["familia", "persona"],
    res: "Becas de comedor escolar y préstamo o ayuda para libros. Muchas comunidades tienen bancos de libros gratuitos; los plazos suelen ser entre mayo y septiembre.",
    cuantia: "Comedor gratuito o reducido (hasta 1.000 €/curso); libros gratis o hasta 200 € por alumno.",
    plazo: { tipo: "ccaa", nota: "Plazo habitual: mayo-septiembre para el curso siguiente. Algunas comunidades admiten solicitudes fuera de plazo por cambio de situación." },
    url: c => (CCAA[c] || {}).web, fuente: "Consejerías de Educación",
    req: ["Hijos en Infantil, Primaria o ESO en centro sostenido con fondos públicos", "Renta familiar por debajo del límite de tu comunidad"],
    docs: [D.dni, D.libro, D.renta, D.fn],
    pasos: ["Pregunta en la secretaría del colegio por la convocatoria vigente", "Rellena la solicitud (muchas veces se entrega en el propio centro)", "Revisa las listas provisionales y presenta alegaciones si hace falta"],
    m: p => esHogar(p) && ((p.m3_6 || 0) + (p.m6_18 || 0)) > 0 && p.ingresos < 35000 ? { n: p.ingresos < 20000 ? "alta" : "media", why: ["Tienes hijos en edad escolar"], imp: 400 } : null
  });

  add({
    id: "bonocultural", t: "Bono Cultural Joven 2026", org: "Ministerio de Cultura", amb: "estatal", cat: "cultura",
    para: ["persona", "familia"],
    res: "400 € para gastar en cultura (libros, conciertos, cine, cursos, instrumentos, videojuegos culturales) para quienes cumplen 18 años en 2026.",
    cuantia: "400 € en tarjeta prepago (200 artes en vivo, 100 físico, 100 digital).",
    plazo: { tipo: "conv", ini: "2026-06-22", fin: "2026-10-31", prox: "Edición 2027 para nacidos en 2009: previsiblemente desde junio de 2027" },
    url: "https://bonoculturajoven.gob.es/", fuente: "Ministerio de Cultura · La Moncloa",
    req: ["Haber nacido en 2008 (o en 2009 para la edición 2027)", "Residencia legal en España"],
    docs: [D.dni, D.clave],
    pasos: ["Consigue Cl@ve (por videollamada en minutos) o certificado digital", "Entra en bonoculturajoven.gob.es y pulsa «Solicitar»", "Recibirás la tarjeta virtual en el móvil; tienes 1 año para gastarla"],
    m: p => esHogar(p) && (p.anioNac === 2008 || p.anioNac === 2009 || p.hijo18) ? { n: "alta", why: [p.anioNac === 2008 || p.hijo18 ? "Cumples (o alguien del hogar cumple) 18 años en 2026" : "Cumplirás 18 en 2027: prepárate para la próxima edición"], imp: 400 } : null
  });

  add({
    id: "abono", t: "Abono Único de transporte", org: "Ministerio de Transportes", amb: "estatal", cat: "movilidad",
    para: ["persona", "familia"],
    res: "Un abono de 30 días para Cercanías, Rodalies, Media Distancia de Renfe y autobuses estatales interregionales por toda España.",
    cuantia: "60 €/30 días (30 € para nacidos desde el 1 de enero de 2000).",
    plazo: { tipo: "permanente", nota: "En vigor desde el 19/01/2026" },
    url: "https://www.transportes.gob.es/", fuente: "Ministerio de Transportes · enero 2026",
    req: ["Registro previo en la web del Ministerio para obtener tu localizador", "Para la tarifa joven: haber nacido desde el 1/1/2000"],
    docs: [D.dni],
    pasos: ["Regístrate en la web del Ministerio de Transportes y obtén tu localizador", "Compra el abono en la web o app de Renfe, Alsa u otros operadores", "Valida en cada viaje; en Media Distancia reserva plaza"],
    m: p => esHogar(p) && p.transporte ? { n: "alta", why: [p.anioNac >= 2000 ? "Viajas en transporte interurbano y tienes tarifa joven (30 €)" : "Viajas en transporte interurbano"], imp: p.anioNac >= 2000 ? 360 : 300 } : null
  });

  /* ---------- Vivienda ---------- */
  add({
    id: "alqjoven", t: "Bono Alquiler Joven (Plan Estatal de Vivienda 2026-2030)", org: "Ministerio de Vivienda · tu comunidad autónoma", amb: "autonomico", cat: "vivienda",
    para: ["persona", "familia"],
    res: "Ayuda mensual para menores de 35 años que viven de alquiler. El nuevo plan estatal (en vigor desde el 24/04/2026) la sube a 300 €/mes y la gestionan las comunidades.",
    cuantia: "Hasta 300 €/mes (200 € por habitación), sin superar el 60 % del alquiler. 2 años prorrogables.",
    plazo: { tipo: "ccaa", nota: "Cada comunidad abre su convocatoria del nuevo plan. Revisa si la tuya ya está publicada." },
    url: c => (CCAA[c] || {}).web, fuente: "Plan Estatal de Vivienda 2026-2030 · BOE 24/04/2026",
    req: ["Tener menos de 35 años", "Ser titular de un contrato de alquiler de vivienda habitual", "Alquiler máximo: 1.000 €/mes vivienda, 600 € habitación (más en zonas tensionadas)", "Ingresos por debajo del límite de la convocatoria (orientativo: 3 veces el IPREM, unos 25.200 €)", "No tener otra vivienda en propiedad"],
    docs: [D.dni, D.padron, D.alquiler, D.renta, D.vida, D.banco],
    pasos: ["Busca «bono alquiler joven» en la web de vivienda de tu comunidad", "Prepara el contrato y los justificantes de pago (siempre por banco)", "Presenta la solicitud online en plazo", "Justifica los pagos cada trimestre o semestre según tu comunidad"],
    m: p => {
      if (!esHogar(p) || !(p.vivienda === "alquiler" || p.vivienda === "habitacion")) return null;
      if (p.edad >= 35) return null;
      const tope = p.vivienda === "habitacion" ? 600 : 1000;
      const why = ["Eres menor de 35 años y vives de alquiler"];
      if (p.alquiler > tope) why.push(`Ojo: tu alquiler supera el tope general de ${tope} € (solo vale en zonas tensionadas)`);
      if (p.ingresos > IND.IPREM_14 * 3) why.push("Tus ingresos podrían superar el límite: revísalo en la convocatoria");
      const imp = Math.round(Math.min(p.vivienda === "habitacion" ? 200 : 300, (p.alquiler || 0) * 0.6) * 12);
      return { n: p.alquiler > tope || p.ingresos > IND.IPREM_14 * 3 ? "media" : "alta", why, imp };
    }
  });

  add({
    id: "alqgeneral", t: "Ayuda al alquiler de vivienda (Plan Estatal 2026-2030)", org: "Ministerio de Vivienda · tu comunidad autónoma", amb: "autonomico", cat: "vivienda",
    para: ["persona", "familia"],
    res: "Ayuda al alquiler sin límite de edad para hogares con ingresos limitados, con prioridad para familias con menores, personas con discapacidad o víctimas de violencia de género.",
    cuantia: "Hasta 250 €/mes, sin superar el porcentaje del alquiler que fije tu comunidad.",
    plazo: { tipo: "ccaa", nota: "Convocatoria de tu comunidad dentro del nuevo plan estatal." },
    url: c => (CCAA[c] || {}).web, fuente: "Plan Estatal de Vivienda 2026-2030 · BOE 24/04/2026",
    req: ["Contrato de alquiler de vivienda habitual", "Ingresos del hogar por debajo del límite (orientativo: 3 IPREM, ampliable a 4-5 con familia numerosa o discapacidad)", "No tener vivienda en propiedad"],
    docs: [D.dni, D.padron, D.alquiler, D.renta, D.banco, D.fn, D.discap],
    pasos: ["Consulta la convocatoria en la web de vivienda de tu comunidad", "Presenta la solicitud con el contrato y la renta", "Justifica los pagos del alquiler en los plazos que marquen"],
    m: p => {
      if (!esHogar(p) || p.vivienda !== "alquiler") return null;
      let lim = IND.IPREM_14 * 3;
      if (p.familiaNumerosa === "si" || p.discapacidad >= 33) lim = IND.IPREM_14 * 4.5;
      if (p.ingresos > lim) return null;
      return { n: p.edad < 35 ? "media" : "alta", why: ["Vives de alquiler con ingresos dentro del rango del plan" + (p.edad < 35 ? " (si eres menor de 35, te conviene el Bono Alquiler Joven)" : "")], imp: Math.round(Math.min(250, (p.alquiler || 0) * 0.5) * 12) };
    }
  });

  add({
    id: "avalico", t: "Aval ICO para comprar la primera vivienda", org: "ICO · Ministerio de Vivienda", amb: "estatal", cat: "vivienda",
    para: ["persona", "familia"],
    res: "El Estado avala hasta el 20 % del préstamo para que el banco te financie hasta el 100 % de tu primera vivienda. Ampliado hasta el 31/12/2027.",
    cuantia: "Aval de hasta el 20 % del préstamo (25 % con eficiencia energética alta) durante 10 años.",
    plazo: { tipo: "hasta", fin: "2027-12-31", nota: "Hasta el 31/12/2027 o agotar la línea" },
    url: "https://www.ico.es/", fuente: "BOE 02/07/2026 · prórroga de la línea de avales",
    req: ["Menor de 36 años al firmar, o familia con menores a cargo (sin límite de edad)", "Primera vivienda habitual", "Ingresos ≤ 4,5 IPREM (37.800 €) por persona, ampliable con hijos", "Patrimonio ≤ 100.000 €", "Residencia legal en España los 2 últimos años"],
    docs: [D.dni, D.renta, D.nomina, D.vida, "Declaración responsable de patrimonio", "Contrato de arras o reserva de la vivienda"],
    pasos: ["Pide el aval ICO en un banco adherido (la mayoría lo están)", "El banco estudia tu hipoteca y solicita el aval", "Firma ante notario; el aval aparece en la escritura"],
    m: p => esHogar(p) && p.quiereComprar && (p.edad < 36 || menores(p) > 0) && p.ingresos <= 37800 * Math.max(1, Math.min(2, p.adultos || 1)) ? { n: "alta", why: ["Quieres comprar tu primera vivienda" + (p.edad < 36 ? " y tienes menos de 36 años" : " y tienes menores a cargo")] } : null
  });

  add({
    id: "dedalq", t: "Deducciones autonómicas por alquiler, nacimiento o cuidado", org: "Agencia Tributaria · tu comunidad", amb: "autonomico", cat: "fiscal",
    para: ["persona", "familia"],
    res: "Casi todas las comunidades tienen deducciones propias en la Renta: alquiler de jóvenes, nacimiento, guardería, gastos educativos, familia numerosa, discapacidad, vivir en zona rural…",
    cuantia: "Habitualmente de 100 € a 1.000 € por deducción y año.",
    plazo: { tipo: "renta", nota: "Se aplican en la declaración de la Renta (campaña de abril a junio de 2027 para el año 2026)" },
    url: "https://sede.agenciatributaria.gob.es/", fuente: "AEAT · Manual de deducciones autonómicas",
    req: ["Residir en la comunidad durante el año fiscal", "Cumplir los requisitos de cada deducción (edad, renta, importe del alquiler…)"],
    docs: [D.alquiler, "Justificantes de los gastos (guardería, material escolar, etc.)", "NIF del arrendador (para alquiler)"],
    pasos: ["Consulta el «Manual práctico de Renta: deducciones autonómicas» en la web de la AEAT", "Guarda todos los justificantes durante el año", "Marca las deducciones en Renta WEB: no siempre salen solas en el borrador"],
    m: p => esHogar(p) && p.ccaa && (p.vivienda === "alquiler" || p.vivienda === "habitacion" || menores(p) > 0 || p.discapacidad >= 33 || p.municipioPequeno) ? { n: "media", why: ["Tienes circunstancias (alquiler, hijos, discapacidad o municipio pequeño) con deducciones autonómicas"], imp: 300 } : null
  });

  add({
    id: "rehab", t: "Ayudas para rehabilitar y mejorar la eficiencia de tu vivienda", org: "Ministerio de Vivienda · tu comunidad · IDAE", amb: "autonomico", cat: "energia",
    para: ["persona", "familia"],
    res: "Subvenciones para aislamiento, ventanas, aerotermia, placas solares o accesibilidad (ascensor, rampas), dentro del Plan Estatal de Vivienda y programas de tu comunidad.",
    cuantia: "Habitualmente del 40 % al 80 % de la obra, según ahorro energético y renta.",
    plazo: { tipo: "ccaa", nota: "Convocatorias de tu comunidad y de tu ayuntamiento. Compatible con la deducción en la Renta por eficiencia energética." },
    url: c => (CCAA[c] || {}).web, fuente: "Plan Estatal de Vivienda 2026-2030 · IDAE",
    req: ["Vivienda en propiedad (o comunidad de propietarios)", "Certificado de eficiencia energética antes y después de la obra", "No empezar la obra antes de solicitar (en la mayoría de convocatorias)"],
    docs: [D.dni, "Escritura o nota simple de la vivienda", "Certificados de eficiencia energética (antes y después)", "Presupuesto y facturas de la obra", D.banco],
    pasos: ["Pide un certificado energético inicial a un técnico", "Busca la convocatoria vigente en la web de vivienda de tu comunidad", "Solicita la ayuda ANTES de empezar la obra", "Ejecuta, pide el certificado final y justifica"],
    m: p => esHogar(p) && p.reforma && (p.vivienda === "hipoteca" || p.vivienda === "propia") ? { n: "alta", why: ["Quieres reformar o mejorar la eficiencia de tu vivienda en propiedad"] } : null
  });

  add({
    id: "dedeficiencia", t: "Deducción en la Renta por obras de eficiencia energética", org: "Agencia Tributaria (AEAT)", amb: "estatal", cat: "fiscal",
    para: ["persona", "familia"],
    res: "Hacienda te devuelve el 20 % o el 40 % de lo invertido en obras que reducen el consumo de tu vivienda (ventanas, aislamiento, aerotermia…), y el 60 % en obras de todo el edificio. Prorrogada por el RDL 16/2025.",
    cuantia: "20 % (máx. 5.000 €/año de base), 40 % (máx. 7.500 €) o 60 % en edificios (hasta 15.000 € acumulados).",
    plazo: { tipo: "hasta", fin: "2026-12-31", nota: "Obras en tu vivienda: certificado energético final emitido antes del 1/1/2027. Obras de edificio (60 %): hasta el 31/12/2027." },
    url: "https://sede.agenciatributaria.gob.es/", fuente: "RDL 16/2025 · DA 50.ª Ley del IRPF",
    req: ["Vivienda habitual o alquilada (no vale la parte afecta a actividad)", "Reducir al menos un 7 % la demanda de calefacción y refrigeración (20 %) o un 30 % el consumo de energía no renovable / llegar a letra A o B (40 %)", "Certificado de eficiencia energética antes y después de la obra", "Pagar por tarjeta o transferencia, nunca en efectivo"],
    docs: ["Certificado energético previo (antes de empezar)", "Certificado energético posterior registrado en tu comunidad", "Facturas de la obra a tu nombre", "Justificantes de pago bancarios"],
    pasos: ["Pide el certificado energético inicial antes de empezar", "Haz la obra y págala por banco", "Registra el certificado final antes del 31/12/2026", "Aplica la deducción en la Renta 2026 (abril-junio de 2027)"],
    m: p => esHogar(p) && p.reforma && (p.vivienda === "hipoteca" || p.vivienda === "propia") ? { n: "alta", why: ["Vas a reformar tu vivienda: si terminas antes de fin de año, Hacienda te devuelve parte"], imp: 1500 } : null
  });

  add({
    id: "moves", t: "Plan MOVES III (coche eléctrico y punto de recarga)", org: "IDAE · tu comunidad autónoma", amb: "estatal", cat: "movilidad",
    para: ["persona", "familia", "empresa", "asociacion"],
    res: "Ayudas para comprar vehículo eléctrico o híbrido enchufable e instalar un punto de recarga. Vigente hasta el 31/12/2026 o hasta agotar fondos, con efectos desde el 1/1/2026.",
    cuantia: "Turismo eléctrico: 4.500 € (7.000 € achatarrando uno de 7+ años). Moto: hasta 1.300 €. Recarga: hasta 70 % (80 % en municipios < 5.000 hab.).",
    plazo: { tipo: "hasta", fin: "2026-12-31", nota: "Hasta el 31/12/2026 o fin de presupuesto" },
    url: "https://www.idae.es/", fuente: "IDAE · Plan MOVES III 2026",
    req: ["Vehículo nuevo con precio máx. 45.000 € (sin IVA) para turismos", "Comprar en concesionario adherido (adelanta la ayuda en muchos casos)", "Para recarga: vivienda o garaje de tu propiedad o con permiso"],
    docs: [D.dni, "Factura y permiso de circulación del vehículo", "Certificado de baja del vehículo achatarrado (si aplica)", D.banco],
    pasos: ["Pregunta al concesionario si gestiona el MOVES (lo habitual)", "Si no, solicítalo en la web de energía de tu comunidad tras la compra", "Para el punto de recarga, guarda factura de instalación y boletín eléctrico"],
    m: p => p.vehiculo || (p.necesidades || []).includes("vehiculo") ? { n: "alta", why: ["Te interesa un vehículo eléctrico o punto de recarga" + (p.municipioPequeno ? " (municipio pequeño: ayuda extra en recarga)" : "")], imp: 4500 } : null
  });

  /* ---------- Violencia de género (pregunta opcional) ---------- */
  add({
    id: "vg", t: "Apoyo a víctimas de violencia de género", org: "Ministerio de Igualdad · comunidad autónoma", amb: "estatal", cat: "ingresos",
    para: ["persona", "familia"],
    res: "Ayuda económica específica (art. 27 LO 1/2004), prioridad en vivienda, bono social, subsidio por desempleo sin espera y asesoramiento jurídico gratuito. Teléfono 016 gratuito y que no deja rastro en la factura.",
    cuantia: "Ayuda de pago único de 6 a 24 mensualidades del subsidio por desempleo, según edad y cargas.",
    plazo: { tipo: "permanente" },
    url: "https://violenciagenero.igualdad.gob.es/", fuente: "Ministerio de Igualdad · LO 1/2004",
    req: ["Acreditación de la situación de violencia (orden de protección, sentencia, informe de servicios sociales o especializados)", "Ingresos inferiores al 75 % del SMI (para la ayuda económica)"],
    docs: [D.dni, "Título acreditativo de víctima (lo emiten servicios sociales o especializados)", D.renta, D.banco],
    pasos: ["Llama al 016 (24 h, gratis, en 53 idiomas) para orientación", "Pide la acreditación en los servicios especializados de tu comunidad", "Solicita la ayuda del art. 27 en tu comunidad y el resto de prestaciones con prioridad"],
    m: p => esHogar(p) && p.vg ? { n: "alta", why: ["Nos has indicado esta situación: tienes derechos específicos"] } : null
  });

  add({
    id: "imserso", t: "Viajes y termalismo del IMSERSO", org: "IMSERSO", amb: "estatal", cat: "cultura",
    para: ["persona", "familia"],
    res: "Viajes y balnearios a precio reducido para mayores de 65 años y pensionistas (también de 60 a 64 en algunos casos).",
    cuantia: "Precios subvencionados (aprox. 30-70 % más baratos que mercado).",
    plazo: { tipo: "conv", ini: "2026-06-22", fin: "2026-07-10", prox: "El IMSERSO ha anunciado un nuevo periodo de solicitudes para 2026-27, aún sin fecha; la temporada 2027-28 se pedirá previsiblemente en junio-julio de 2027" },
    url: "https://imserso.es/", fuente: "IMSERSO · programa de turismo 2026-2027 (BOE 13/06/2026)",
    req: ["Pensionista de jubilación, o pensionista de viudedad con 55+ años, o 65+ años", "Valerse por uno mismo"],
    docs: [D.dni, "Número de pensión o resolución"],
    pasos: ["Solicita en imserso.es o por correo con el formulario", "Si ya estás acreditado, recibes plazas en la temporada", "Elige destino según puntuación"],
    m: p => esHogar(p) && (p.edad >= 65 || p.laboral === "jubilado") ? { n: "media", why: ["Tienes 65 años o más o eres pensionista"] } : null
  });

  /* ================= EMPRENDEDORES Y EMPRESAS ================= */

  const esAuto = p => p.forma === "autonomo" || (p.tipo !== "empresa" && p.quiereEmprender);
  const nueva = p => p.fase === "idea" || p.fase === "reciente";

  add({
    id: "tarifaplana", t: "Tarifa plana de autónomos (80 €/mes)", org: "Seguridad Social (TGSS)", amb: "estatal", cat: "emprender",
    para: ["empresa", "persona", "familia"],
    res: "Cuota reducida de 80 €/mes los 12 primeros meses, prorrogable otros 12 si tus rendimientos netos no superan el SMI.",
    cuantia: "80 €/mes en vez de la cuota normal (ahorro aproximado: 1.500-2.000 € el primer año).",
    plazo: { tipo: "permanente", nota: "Se pide en el mismo alta de autónomo" },
    url: "https://www.seg-social.es/", fuente: "TGSS · RDL 13/2022",
    req: ["No haber estado de alta como autónomo en los 2 años anteriores (3 si ya disfrutaste la tarifa plana)", "Darte de alta como autónomo (también autónomos societarios)", "Para la prórroga: rendimientos netos inferiores al SMI"],
    docs: [D.dni, D.altaAEAT, D.banco, D.clave],
    pasos: ["Haz el alta en Hacienda (modelo 036/037) antes o el mismo día", "Haz el alta en Import@ss (Seguridad Social) y marca «Tarifa plana / cuota reducida»", "Para prorrogarla 12 meses más, solicítalo antes de que termine el primer año"],
    m: p => (p.tipo === "empresa" && p.forma !== "cooperativa" && nueva(p)) || (esHogar(p) && p.quiereEmprender)
      ? { n: "alta", why: ["Vas a darte de alta (o lo hiciste hace poco) como autónomo"], imp: 1600 } : null
  });

  const CUOTA_CERO = {
    MD: { plazo: { tipo: "permanente", nota: "Convocatoria abierta de forma permanente" }, txt: "Madrid paga la cuota de autónomo durante 2 años (si el 2.º año no superas el SMI)." },
    CB: { plazo: { tipo: "permanente", nota: "Abierta; con efecto retroactivo para altas desde 2024" }, txt: "Cantabria cubre la cuota tras la tarifa plana («triple cuota cero»)." },
    EX: { plazo: { tipo: "hasta", fin: "2027-10-11", nota: "Abierta hasta el 11/10/2027" }, txt: "Extremadura da 1.920 € (960 € en algunos colectivos) para cubrir la cuota." },
    AR: { plazo: { tipo: "conv", ini: "2026-01-01", fin: "2026-10-30", prox: "Pendiente de nueva convocatoria en 2027" }, txt: "Aragón subvencionó la cuota reducida de los 12 primeros meses." },
    AN: { plazo: { tipo: "verificar", nota: "Cerrada en 2026; Andalucía la ha reabierto otros años. Comprueba si hay nueva convocatoria.", prox: "Posible reapertura" }, txt: "Andalucía cubría la cuota tras la tarifa plana." },
    GA: { plazo: { tipo: "verificar", nota: "Cerrada en 2026; Galicia la ha reabierto otros años. Comprueba si hay nueva convocatoria.", prox: "Posible reapertura" }, txt: "Galicia cubría la cuota de nuevos autónomos." }
  };
  add({
    id: "cuotacero", t: "Cuota cero de autónomos de tu comunidad", org: "Consejería de Empleo de tu comunidad", amb: "autonomico", cat: "emprender",
    para: ["empresa", "persona", "familia"],
    res: "Algunas comunidades devuelven la cuota de autónomo (incluida la tarifa plana) durante el primer o segundo año.",
    cuantia: "Hasta el 100 % de la cuota durante 12-24 meses (unos 960-2.400 €).",
    plazo: c => (CUOTA_CERO[c] || {}).plazo || { tipo: "verificar" },
    url: c => (CCAA[c] || {}).web, fuente: "Consejerías de empleo · estado a 23/10/2026",
    detalle: c => (CUOTA_CERO[c] || {}).txt,
    req: ["Estar de alta como nuevo autónomo con tarifa plana", "Domicilio fiscal y actividad en la comunidad", "Estar al corriente con Hacienda y Seguridad Social"],
    docs: [D.dni, "Resolución de alta en el RETA con cuota reducida", D.corriente, D.banco, "Recibos de cuotas pagadas"],
    pasos: ["Busca «cuota cero autónomos» en la web de empleo de tu comunidad", "Solicítalo dentro del plazo desde tu alta (suele ser 1-3 meses)", "Recibirás el reembolso de las cuotas pagadas"],
    m: p => {
      if (!CUOTA_CERO[p.ccaa]) return null;
      if (!((p.tipo === "empresa" && p.forma === "autonomo" && nueva(p)) || (esHogar(p) && p.quiereEmprender))) return null;
      return { n: "alta", why: [CUOTA_CERO[p.ccaa].txt], imp: 1000 };
    }
  });

  add({
    id: "capitaliza", t: "Capitalización del paro (pago único)", org: "SEPE", amb: "estatal", cat: "emprender",
    para: ["empresa", "persona", "familia"],
    res: "Cobra de una vez todo el paro que te queda para invertirlo en tu negocio, o úsalo para pagar tus cuotas de autónomo.",
    cuantia: "Hasta el 100 % de la prestación pendiente.",
    plazo: { tipo: "permanente", nota: "Pídelo ANTES de darte de alta como autónomo o en la sociedad" },
    url: "https://www.sepe.es/", fuente: "SEPE · pago único",
    req: ["Cobrar la prestación contributiva con al menos 3 meses pendientes", "No haberla capitalizado en los 4 años anteriores", "Iniciar la actividad en el mes siguiente a la resolución"],
    docs: [D.dni, D.plan, "Presupuestos o facturas proforma de la inversión", "Estatutos (si es sociedad o cooperativa)"],
    pasos: ["Solicítalo en la sede del SEPE antes del alta", "Adjunta la memoria del proyecto y presupuestos", "Tras la resolución, date de alta en 1 mes y justifica la inversión"],
    m: p => (esHogar(p) && p.quiereEmprender && p.laboral === "paro-prestacion") || (p.tipo === "empresa" && p.desempleado && nueva(p))
      ? { n: "alta", why: ["Cobras paro y quieres emprender"] } : null
  });

  add({
    id: "compatible", t: "Compatibilizar el paro con el alta de autónomo", org: "SEPE", amb: "estatal", cat: "emprender",
    para: ["empresa", "persona", "familia"],
    res: "Sigue cobrando el paro hasta 9 meses mientras empiezas tu actividad como autónomo.",
    cuantia: "Tu prestación mensual durante un máximo de 9 meses.",
    plazo: { tipo: "permanente", nota: "Solicítalo en los 15 días siguientes al alta" },
    url: "https://www.sepe.es/", fuente: "SEPE · compatibilidad prestación y autónomo",
    req: ["Cobrar la prestación contributiva", "Darte de alta en el RETA"],
    docs: [D.dni, "Resolución de alta en el RETA"],
    pasos: ["Date de alta como autónomo", "En los 15 días siguientes, pide la compatibilidad en la sede del SEPE"],
    m: p => (esHogar(p) && p.quiereEmprender && p.laboral === "paro-prestacion") || (p.tipo === "empresa" && p.desempleado && p.forma === "autonomo" && nueva(p))
      ? { n: "media", why: ["Alternativa a la capitalización: no puedes usar las dos a la vez"] } : null
  });

  add({
    id: "enisajoven", t: "ENISA Jóvenes Emprendedores", org: "ENISA (Ministerio de Industria)", amb: "estatal", cat: "emprender",
    para: ["empresa"],
    res: "Préstamo participativo sin avales ni garantías para sociedades creadas por menores de 40 años.",
    cuantia: "De 25.000 € a 75.000 €, interés ligado a resultados, carencia de 1 año.",
    plazo: { tipo: "hasta", fin: "2026-12-31", nota: "Línea anual abierta hasta agotar fondos; renovada cada año" },
    url: "https://www.enisa.es/", fuente: "ENISA · líneas 2026",
    req: ["Sociedad mercantil (S.L. o S.A.) con menos de 2 años", "Socios mayoritarios menores de 40 años", "Fondos propios al menos iguales al préstamo", "Modelo de negocio innovador o con ventaja competitiva"],
    docs: [D.escritura, D.plan, D.cuentas, D.corriente, "CV del equipo promotor"],
    pasos: ["Regístrate en el área cliente de enisa.es", "Sube el plan de negocio y la documentación", "Entrevista con un analista", "Firma ante notario"],
    m: p => p.tipo === "empresa" && p.forma === "sociedad" && p.edad < 40 && p.fase !== "consolidada" && (p.necesidades || []).includes("financiar")
      ? { n: "alta", why: ["Sociedad joven, promotor menor de 40 y necesitas financiación"] } : null
  });

  add({
    id: "enisamujer", t: "ENISA Emprendedoras Digitales", org: "ENISA", amb: "estatal", cat: "emprender",
    para: ["empresa"],
    res: "Préstamo participativo para empresas digitales lideradas por mujeres.",
    cuantia: "De 25.000 € a 1.500.000 €.",
    plazo: { tipo: "hasta", fin: "2026-12-31", nota: "Hasta agotar fondos" },
    url: "https://www.enisa.es/", fuente: "ENISA · líneas 2026",
    req: ["Sociedad con mujer(es) en posición relevante de liderazgo o capital", "Proyecto digital o tecnológico"],
    docs: [D.escritura, D.plan, D.cuentas, D.corriente],
    pasos: ["Solicitud online en enisa.es", "Análisis y entrevista", "Firma"],
    m: p => p.tipo === "empresa" && p.forma === "sociedad" && p.mujer && p.innovadora ? { n: "alta", why: ["Empresa digital liderada por una mujer"] } : null
  });

  add({
    id: "enisacrece", t: "ENISA Crecimiento / Emprendedores", org: "ENISA", amb: "estatal", cat: "emprender",
    para: ["empresa"],
    res: "Préstamos participativos para pymes que quieren crecer, sin garantías personales.",
    cuantia: "De 25.000 € a 1.500.000 €.",
    plazo: { tipo: "hasta", fin: "2026-12-31", nota: "Hasta agotar fondos" },
    url: "https://www.enisa.es/", fuente: "ENISA · líneas 2026",
    req: ["Pyme con forma societaria", "Cuentas depositadas en el Registro Mercantil", "Fondos propios al menos iguales al préstamo"],
    docs: [D.escritura, D.cuentas, D.plan, D.corriente],
    pasos: ["Solicitud online en enisa.es", "Análisis y entrevista", "Firma"],
    m: p => p.tipo === "empresa" && p.forma === "sociedad" && (p.necesidades || []).includes("financiar") && !(p.edad < 40 && p.fase !== "consolidada")
      ? { n: "media", why: ["Sociedad que busca financiación para crecer"] } : null
  });

  add({
    id: "ico", t: "Línea ICO Empresas y Emprendedores", org: "Instituto de Crédito Oficial", amb: "estatal", cat: "emprender",
    para: ["empresa", "asociacion"],
    res: "Préstamos para inversión o liquidez a través de tu banco, con condiciones del ICO.",
    cuantia: "Hasta 12,5 millones de euros por cliente y año.",
    plazo: { tipo: "permanente" },
    url: "https://www.ico.es/", fuente: "ICO · líneas de mediación",
    req: ["Autónomo, empresa o entidad con actividad en España", "Aprobación de riesgo por la entidad bancaria"],
    docs: [D.cif, D.cuentas, D.plan, "Presupuestos de la inversión"],
    pasos: ["Pide en tu banco la «Línea ICO Empresas y Emprendedores»", "El banco analiza y decide el riesgo", "Firma del préstamo"],
    m: p => p.tipo === "empresa" && (p.necesidades || []).includes("financiar") ? { n: "media", why: ["Necesitas financiación"] } : null
  });

  add({
    id: "neotec", t: "NEOTEC (startups tecnológicas)", org: "CDTI · Ministerio de Ciencia", amb: "estatal", cat: "emprender",
    para: ["empresa"],
    res: "Subvención a fondo perdido para empresas tecnológicas de menos de 3 años con un plan de negocio basado en tecnología propia. La convocatoria 2026 ya cerró.",
    cuantia: "Hasta el 70 % del presupuesto (máx. 250.000 €); 85 % y 325.000 € si contratas a un doctor.",
    plazo: { tipo: "conv", ini: "2026-04-14", fin: "2026-05-14", prox: "Próxima convocatoria: previsiblemente abril de 2027" },
    url: "https://www.cdti.es/", fuente: "CDTI · convocatoria NEOTEC 2026",
    req: ["Pequeña empresa innovadora con máximo 3 años", "Capital social mínimo de 20.000 € desembolsado", "Plan de empresa con base tecnológica propia"],
    docs: [D.escritura, D.plan, "Memoria técnica del proyecto", D.cuentas, D.corriente],
    pasos: ["Prepara ya la memoria técnica y el plan de negocio", "Amplía capital a 20.000 € si hace falta antes de la convocatoria", "Solicita en la sede del CDTI en cuanto abra (abril)"],
    m: p => p.tipo === "empresa" && p.forma === "sociedad" && p.innovadora && p.fase !== "consolidada" ? { n: p.capital20k ? "alta" : "media", why: ["Startup tecnológica de menos de 3 años" + (p.capital20k ? "" : " (necesitarás 20.000 € de capital social)")] } : null
  });

  add({
    id: "startup", t: "Certificación de empresa emergente (Ley de Startups)", org: "ENISA", amb: "estatal", cat: "fiscal",
    para: ["empresa"],
    res: "Con la certificación pagas un 15 % de Impuesto de Sociedades (en vez de 25 %) durante 4 años, aplazas impuestos sin intereses y mejoras la fiscalidad de las stock options.",
    cuantia: "Ahorro del 10 % del beneficio en el IS durante 4 años + aplazamiento de deudas tributarias.",
    plazo: { tipo: "permanente" },
    url: "https://www.enisa.es/", fuente: "Ley 28/2022 de fomento del ecosistema de empresas emergentes",
    req: ["Empresa de nueva creación (menos de 5 años; 7 en biotecnología, energía o industria)", "Carácter innovador y escalable", "No cotizar en bolsa ni repartir dividendos", "Sede o establecimiento permanente en España, 60 % de la plantilla en España"],
    docs: [D.escritura, D.plan, "Memoria de innovación y escalabilidad"],
    pasos: ["Solicita la certificación en la web de ENISA", "Recibirás la resolución en unos 3 meses", "Inscríbela en el Registro Mercantil"],
    m: p => p.tipo === "empresa" && p.forma === "sociedad" && p.innovadora ? { n: "alta", why: ["Empresa innovadora de nueva creación"] } : null
  });

  add({
    id: "kitdigital", t: "Kit Digital (bono de digitalización)", org: "Red.es", amb: "estatal", cat: "digital",
    para: ["empresa"],
    res: "El programa ya no admite nuevas solicitudes: los fondos se han agotado. La Orden TDF/39/2026 permite resolver de oficio a quienes fueron denegados solo por falta de crédito.",
    cuantia: "Bonos de 2.000 € a 29.000 € (ya no se conceden nuevos).",
    plazo: { tipo: "cerrada", nota: "Sin nuevas solicitudes. Si pediste y te denegaron por falta de fondos, vigila tus notificaciones de Red.es." },
    url: "https://www.acelerapyme.gob.es/", fuente: "Red.es · Orden TDF/39/2026",
    req: ["Solo para quienes ya presentaron solicitud"],
    docs: ["Revisa tu buzón de notificaciones en la sede de Red.es"],
    pasos: ["Entra en la sede de Red.es con certificado y revisa tus expedientes", "Para digitalizarte ahora, busca programas de tu Cámara de Comercio o comunidad"],
    m: p => p.tipo === "empresa" && (p.necesidades || []).includes("digitalizar") ? { n: "baja", why: ["Te interesa digitalizarte: aquí tienes el estado real del programa"] } : null
  });

  add({
    id: "camaras", t: "Programas de la Cámara de Comercio (digitalización, PICE, emprendimiento)", org: "Cámara de Comercio de España · cámaras locales", amb: "local", cat: "digital",
    para: ["empresa", "persona", "familia"],
    res: "Asesoramiento gratuito y ayudas de cofinanciación europea para digitalizar, internacionalizar, crear empresa (PAEM para mujeres) o contratar jóvenes (PICE).",
    cuantia: "Diagnóstico gratuito y ayudas de hasta 7.000 € en proyectos de digitalización según cámara.",
    plazo: { tipo: "verificar", nota: "Cada cámara abre sus convocatorias a lo largo del año." },
    url: "https://www.camara.es/", fuente: "Cámara de Comercio de España",
    req: ["Pyme o autónomo en la demarcación de la cámara"],
    docs: [D.cif, D.corriente],
    pasos: ["Busca tu cámara local en camara.es", "Consulta las convocatorias abiertas", "Pide cita para el diagnóstico gratuito"],
    m: p => (p.tipo === "empresa" && ((p.necesidades || []).some(n => ["digitalizar", "internacionalizar", "contratar"].includes(n)))) || (esHogar(p) && p.quiereEmprender)
      ? { n: "media", why: ["Asesoramiento y ayudas para pymes en tu zona"] } : null
  });

  add({
    id: "bonif", t: "Bonificaciones a la contratación", org: "SEPE · TGSS", amb: "estatal", cat: "empleo",
    para: ["empresa", "asociacion"],
    res: "Descuentos en la cotización si contratas a personas desempleadas de larga duración, con discapacidad, víctimas de violencia, jóvenes de Garantía Juvenil o mayores de 45, entre otros.",
    cuantia: "Habitualmente de 1.000 € a 6.300 € al año por contrato, durante 3-4 años.",
    plazo: { tipo: "permanente" },
    url: "https://www.sepe.es/", fuente: "RD-ley 1/2023 de incentivos a la contratación",
    req: ["Contrato indefinido (en la mayoría de casos)", "Estar al corriente con Hacienda y Seguridad Social", "Mantener el empleo el tiempo exigido"],
    docs: ["Contrato de trabajo registrado en Contrat@", "Documentación que acredite el colectivo de la persona contratada", D.corriente],
    pasos: ["Antes de contratar, consulta el colectivo de la persona en la oficina de empleo", "Comunica la bonificación al dar de alta el contrato en el sistema RED", "Se aplica automáticamente en los seguros sociales"],
    m: p => (p.tipo === "empresa" && (p.necesidades || []).includes("contratar")) || (p.tipo === "asociacion" && (p.necAso || []).includes("personal"))
      ? { n: "alta", why: ["Vas a contratar personal"], imp: 3000 } : null
  });

  add({
    id: "fundae", t: "Formación bonificada para tu plantilla (FUNDAE)", org: "FUNDAE", amb: "estatal", cat: "empleo",
    para: ["empresa", "asociacion"],
    res: "Toda empresa con trabajadores tiene un crédito anual para formarlos que recupera en las cotizaciones.",
    cuantia: "Mínimo 420 € al año por empresa; más según plantilla.",
    plazo: { tipo: "permanente", nota: "El crédito de 2026 caduca el 31/12/2026" },
    url: "https://www.fundae.es/", fuente: "FUNDAE · formación programada",
    req: ["Tener trabajadores por cuenta ajena", "Cotizar por formación profesional"],
    docs: [D.cif, "Datos de los trabajadores y de la acción formativa"],
    pasos: ["Consulta tu crédito disponible en fundae.es", "Comunica la formación antes de iniciarla", "Aplica la bonificación en los seguros sociales"],
    m: p => (p.tipo === "empresa" || p.tipo === "asociacion") && (p.empleados || 0) > 0 ? { n: (p.necesidades || []).includes("formacion") ? "alta" : "media", why: ["Tienes trabajadores contratados"], imp: 420 } : null
  });

  add({
    id: "icex", t: "ICEX Next (internacionalización)", org: "ICEX España Exportación e Inversiones", amb: "estatal", cat: "emprender",
    para: ["empresa"],
    res: "Asesoramiento experto y cofinanciación de gastos para pymes que quieren empezar a exportar.",
    cuantia: "Asesoramiento + apoyo de hasta 10.000 € en gastos de promoción.",
    plazo: { tipo: "verificar", nota: "Convocatoria abierta de forma continuada en años anteriores; confirma en icex.es." },
    url: "https://www.icex.es/", fuente: "ICEX",
    req: ["Pyme española con producto o servicio propio", "Facturación mínima y web operativa (según convocatoria)"],
    docs: [D.cif, D.cuentas, "Plan de internacionalización"],
    pasos: ["Revisa la convocatoria en icex.es", "Solicitud online", "Asignación de asesor experto"],
    m: p => p.tipo === "empresa" && (p.necesidades || []).includes("internacionalizar") ? { n: "alta", why: ["Quieres vender fuera de España"] } : null
  });

  add({
    id: "eficienciaemp", t: "Ayudas de eficiencia energética y autoconsumo para empresas", org: "IDAE · tu comunidad autónoma", amb: "autonomico", cat: "energia",
    para: ["empresa", "asociacion"],
    res: "Programas para placas solares, renovación de equipos, iluminación LED o climatización eficiente en locales e instalaciones.",
    cuantia: "Del 30 % al 60 % de la inversión según tamaño de empresa y programa.",
    plazo: { tipo: "ccaa", nota: "Convocatorias autonómicas con fondos del IDAE." },
    url: c => (CCAA[c] || {}).web, fuente: "IDAE",
    req: ["Local o instalación en la comunidad", "No iniciar la inversión antes de solicitar (casi siempre)"],
    docs: [D.cif, "Memoria técnica o auditoría energética", "Presupuestos", D.corriente],
    pasos: ["Pide un estudio energético", "Busca la convocatoria en la web de energía de tu comunidad", "Solicita antes de invertir"],
    m: p => (p.tipo === "empresa" && (p.necesidades || []).includes("eficiencia")) || (p.tipo === "asociacion" && (p.necAso || []).includes("local")) ? { n: "media", why: ["Quieres reducir la factura energética de tu local"] } : null
  });

  add({
    id: "agro", t: "Ayuda a la incorporación de jóvenes agricultores", org: "Consejería de Agricultura · PEPAC", amb: "autonomico", cat: "emprender",
    para: ["empresa"],
    res: "Prima de primera instalación para menores de 41 años que se incorporan a la actividad agraria como titulares de una explotación.",
    cuantia: "Habitualmente de 30.000 € a 100.000 € según comunidad y plan empresarial.",
    plazo: { tipo: "ccaa", nota: "Convocatoria anual de tu comunidad dentro del PEPAC 2023-2027." },
    url: c => (CCAA[c] || {}).web, fuente: "Plan Estratégico de la PAC 2023-2027",
    req: ["Tener entre 18 y 40 años", "Instalarse por primera vez como titular", "Formación agraria (o adquirirla en plazo)", "Plan empresarial viable"],
    docs: [D.dni, D.plan, "Título o curso de capacitación agraria", "Documentación de la explotación (SIGPAC, contratos de arrendamiento)"],
    pasos: ["Contacta con la oficina comarcal agraria", "Prepara el plan empresarial con un técnico", "Solicita en la convocatoria anual"],
    m: p => p.tipo === "empresa" && p.sector === "agro" && p.edad <= 40 ? { n: "alta", why: ["Joven que se incorpora al sector agrario"], imp: 30000 } : null
  });

  add({
    id: "localemp", t: "Ayudas de tu ayuntamiento y diputación al emprendimiento", org: "Ayuntamiento · diputación provincial", amb: "local", cat: "emprender",
    para: ["empresa", "persona", "familia"],
    res: "Muchos ayuntamientos y diputaciones dan ayudas al inicio de actividad, al alquiler del local, a la contratación o a la modernización del comercio.",
    cuantia: "Habitualmente de 1.000 € a 6.000 €.",
    plazo: { tipo: "verificar", nota: "Busca en la BDNS filtrando por tu municipio y provincia." },
    url: "https://www.infosubvenciones.es/bdnstrans/GE/es/convocatorias", fuente: "Base de Datos Nacional de Subvenciones (BDNS)",
    req: ["Domicilio de la actividad en el municipio o provincia", "Alta reciente (según convocatoria)"],
    docs: [D.dni, D.altaAEAT, D.corriente, D.banco],
    pasos: ["Entra en la BDNS > Convocatorias > filtra por órgano «Entidades locales» y tu provincia", "Revisa también la sede electrónica de tu ayuntamiento y la agencia de desarrollo local", "Pide cita a la agencia de desarrollo local: te asesoran gratis"],
    m: p => (p.tipo === "empresa" && p.fase !== "consolidada") || (esHogar(p) && p.quiereEmprender) ? { n: "media", why: ["Las entidades locales tienen ayudas para nuevas actividades"] } : null
  });

  /* ================= ASOCIACIONES ================= */

  const social = p => ["social", "discapacidad", "mayores", "juventud", "cooperacion"].includes(p.finalidad);

  add({
    id: "irpfest", t: "Subvenciones del 0,7 % del IRPF · tramo estatal", org: "Ministerio de Derechos Sociales", amb: "estatal", cat: "tercer-sector",
    para: ["asociacion"],
    res: "Financian programas de interés general de entidades del Tercer Sector de ámbito estatal. La convocatoria 2026 (para ejecutar en 2027) se resolvió en mayo y tuvo 30 días naturales de plazo.",
    cuantia: "Variable por programa; la suma solicitada no puede superar el doble de los ingresos del año anterior.",
    plazo: { tipo: "cerrada", nota: "Convocatoria 2026 (Resolución de 12/05/2026) cerrada: plazo de 30 días tras el extracto en el BOE.", prox: "Próxima convocatoria: previsiblemente mayo-junio de 2027" },
    url: "https://www.dsca.gob.es/", fuente: "Resolución de 12/05/2026 de la Secretaría de Estado de Derechos Sociales",
    req: ["Entidad del Tercer Sector de Acción Social de ámbito estatal (Ley 43/2015)", "Constituida al menos 3 años antes de la convocatoria", "Fines estatutarios adecuados a los programas", "Haber justificado ayudas anteriores", "Estar al corriente con Hacienda y Seguridad Social"],
    docs: [D.estatutos, D.cif, D.junta, D.corriente, D.cuentas, D.proyecto],
    pasos: ["Prepara ya los programas para 2028 (memoria, indicadores, presupuesto)", "Vigila el BOE en mayo-junio de 2027", "Presenta en la sede del Ministerio de Derechos Sociales en los 30 días naturales"],
    m: p => p.tipo === "asociacion" && social(p) && p.ambitoEnt === "estatal" ? { n: p.antiguedad >= 3 ? "alta" : "baja", why: [p.antiguedad >= 3 ? "Entidad social estatal con más de 3 años" : "Necesitas 3 años de antigüedad"] } : null
  });

  add({
    id: "irpfccaa", t: "Subvenciones del 0,7 % del IRPF · tramo autonómico", org: "Consejería de Bienestar Social de tu comunidad", amb: "autonomico", cat: "tercer-sector",
    para: ["asociacion"],
    res: "Cada comunidad convoca su parte del 0,7 % para entidades sociales que actúan en su territorio: atención a personas vulnerables, mayores, discapacidad, infancia, inclusión.",
    cuantia: "Variable; programas de unos 5.000 € a 200.000 €.",
    plazo: { tipo: "ccaa", nota: "Convocatoria anual; la mayoría se publica entre la primavera y el verano." },
    url: c => (CCAA[c] || {}).web, fuente: "Boletín oficial de tu comunidad",
    req: ["Entidad sin ánimo de lucro inscrita en el registro de entidades de servicios sociales de la comunidad", "Programas de interés social en la comunidad", "Antigüedad mínima (suele ser 1-2 años)"],
    docs: [D.estatutos, D.cif, D.junta, D.corriente, D.proyecto, "Inscripción en el registro autonómico de entidades de servicios sociales"],
    pasos: ["Inscríbete en el registro autonómico de entidades sociales si no lo estás", "Vigila el boletín oficial de tu comunidad", "Presenta el programa en la sede electrónica de la comunidad"],
    m: p => p.tipo === "asociacion" && social(p) && p.ambitoEnt !== "estatal" ? { n: "alta", why: ["Entidad social de ámbito local o autonómico"] } : null
  });

  add({
    id: "aytoaso", t: "Subvenciones municipales a asociaciones", org: "Tu ayuntamiento · diputación", amb: "local", cat: "tercer-sector",
    para: ["asociacion"],
    res: "Convocatorias anuales para actividades culturales, deportivas, vecinales, juveniles, sociales o de participación ciudadana, y cesión de locales municipales.",
    cuantia: "Normalmente de 500 € a 20.000 € por proyecto.",
    plazo: { tipo: "verificar", nota: "La mayoría se convocan en el primer semestre del año; busca en la BDNS y en la sede de tu ayuntamiento." },
    url: "https://www.infosubvenciones.es/bdnstrans/GE/es/convocatorias", fuente: "BDNS · ayuntamientos",
    req: ["Inscripción en el registro municipal de asociaciones (casi siempre obligatorio)", "Domicilio o actividad en el municipio", "Estar al corriente con Hacienda, Seguridad Social y el propio ayuntamiento"],
    docs: [D.estatutos, D.cif, D.junta, D.corriente, D.proyecto, "Certificado de inscripción en el registro municipal de asociaciones"],
    pasos: ["Inscribe la asociación en el registro municipal de entidades", "Busca en la BDNS filtrando por tu ayuntamiento", "Presenta en la sede electrónica municipal (las entidades deben tramitar por vía electrónica)", "Justifica con facturas y memoria al acabar"],
    m: p => p.tipo === "asociacion" ? { n: "alta", why: ["Es la vía de financiación más habitual para asociaciones locales"] } : null
  });

  add({
    id: "registro", t: "Inscribir la asociación en el registro (paso previo)", org: "Ministerio del Interior · registro autonómico", amb: "estatal", cat: "tercer-sector",
    para: ["asociacion"],
    res: "Sin inscripción no podrás pedir casi ninguna subvención. Las asociaciones de ámbito estatal se inscriben en el Registro Nacional; las demás, en el de su comunidad.",
    cuantia: "Trámite gratuito o con tasa reducida.",
    plazo: { tipo: "permanente" },
    url: "https://www.interior.gob.es/", fuente: "Ley Orgánica 1/2002 del Derecho de Asociación",
    req: ["Acta fundacional con al menos 3 socios", "Estatutos conforme a la ley"],
    docs: ["Acta fundacional firmada", "Estatutos firmados", "DNI de los socios fundadores", "Justificante de la tasa (si aplica)"],
    pasos: ["Redacta acta y estatutos (hay modelos en la web del registro)", "Solicita la inscripción en el registro correspondiente", "Pide el NIF en Hacienda (modelo 036) y abre cuenta bancaria", "Inscríbete también en el registro municipal"],
    m: p => p.tipo === "asociacion" && !p.inscrita ? { n: "alta", why: ["Tu entidad aún no está inscrita: es el primer paso"] } : null
  });

  add({
    id: "utilidad", t: "Declaración de utilidad pública", org: "Ministerio del Interior", amb: "estatal", cat: "fiscal",
    para: ["asociacion"],
    res: "Permite que quien os done se deduzca hasta el 80 % de los primeros 250 € (Ley 49/2002) y da exenciones fiscales, imagen y acceso a más ayudas.",
    cuantia: "Beneficios fiscales: tus donantes recuperan hasta el 80 % de su donación.",
    plazo: { tipo: "permanente" },
    url: "https://www.interior.gob.es/", fuente: "RD 1740/2003 · Ley 49/2002",
    req: ["Al menos 2 años de funcionamiento ininterrumpido", "Fines de interés general", "Actividad no restringida a socios", "Cuentas de los 2 últimos ejercicios"],
    docs: [D.estatutos, D.cuentas, "Memorias de actividades de los 2 últimos años", D.junta],
    pasos: ["Prepara memorias y cuentas de 2 años", "Presenta la solicitud en la sede del Ministerio del Interior", "Tras la declaración, opta al régimen fiscal de la Ley 49/2002 ante la AEAT"],
    m: p => p.tipo === "asociacion" && !p.utilidadPublica && p.inscrita && p.antiguedad >= 2 && p.finalidad !== "vecinal" ? { n: "media", why: ["Tienes 2 años o más de actividad: puedes pedirla"] } : null
  });

  add({
    id: "erasmus", t: "Erasmus+ Juventud y Cuerpo Europeo de Solidaridad", org: "Comisión Europea · INJUVE (agencia nacional)", amb: "europeo", cat: "tercer-sector",
    para: ["asociacion"],
    res: "Financiación europea para intercambios juveniles, voluntariado, formación de técnicos y proyectos de solidaridad.",
    cuantia: "De 10.000 € a 400.000 € según la acción.",
    plazo: { tipo: "verificar", nota: "Convocatoria anual; las primeras fechas límite suelen ser en febrero y la segunda en octubre.", prox: "Convocatoria 2027: fechas en la guía del programa" },
    url: "https://erasmus-plus.ec.europa.eu/", fuente: "Comisión Europea · Guía del programa Erasmus+",
    req: ["Entidad registrada en el portal de organizaciones (código OID)", "Proyecto con jóvenes de 13 a 30 años"],
    docs: ["Código OID de la entidad", D.estatutos, D.cif, D.proyecto],
    pasos: ["Registra la entidad y obtén el OID", "Consulta la guía del programa y la agencia nacional (INJUVE)", "Presenta online antes de la fecha límite"],
    m: p => p.tipo === "asociacion" && (p.finalidad === "juventud" || p.finalidad === "educacion" || (p.necAso || []).includes("europa")) ? { n: "media", why: ["Trabajáis con jóvenes o queréis proyectos europeos"] } : null
  });

  add({
    id: "lacaixa", t: "Convocatorias sociales de la Fundación «la Caixa»", org: "Fundación «la Caixa» (privada)", amb: "privado", cat: "tercer-sector",
    para: ["asociacion"],
    res: "Convocatorias anuales para proyectos de inclusión, mayores, discapacidad, infancia vulnerable, vivienda e interculturalidad. Entidad privada de gran trayectoria.",
    cuantia: "Hasta 40.000 € por proyecto (según convocatoria).",
    plazo: { tipo: "verificar", nota: "Varias convocatorias al año con fechas distintas." },
    url: "https://fundacionlacaixa.org/", fuente: "Fundación «la Caixa»",
    req: ["Entidad sin ánimo de lucro con 2+ años", "Proyecto en el ámbito de la convocatoria"],
    docs: [D.estatutos, D.cuentas, D.proyecto],
    pasos: ["Consulta las convocatorias abiertas en su web", "Regístrate en su plataforma", "Presenta el proyecto"],
    m: p => p.tipo === "asociacion" && social(p) ? { n: "media", why: ["Financiación privada para proyectos sociales"] } : null
  });

  add({
    id: "cultura", t: "Ayudas del Ministerio de Cultura y de tu comunidad", org: "Ministerio de Cultura · Consejería de Cultura", amb: "estatal", cat: "cultura",
    para: ["asociacion"],
    res: "Ayudas a la promoción del libro y la lectura, artes escénicas, música, patrimonio, festivales y actividades culturales.",
    cuantia: "Variable (de 3.000 € a 100.000 €).",
    plazo: { tipo: "verificar", nota: "Varias convocatorias al año." },
    url: "https://www.cultura.gob.es/", fuente: "Ministerio de Cultura",
    req: ["Entidad cultural sin ánimo de lucro", "Proyecto de ámbito supraautonómico (Ministerio) o regional (Consejería)"],
    docs: [D.estatutos, D.cif, D.proyecto, D.corriente],
    pasos: ["Consulta «Ayudas y subvenciones» en cultura.gob.es", "Revisa también la Consejería de Cultura de tu comunidad", "Presenta en sede electrónica"],
    m: p => p.tipo === "asociacion" && p.finalidad === "cultura" ? { n: "alta", why: ["Asociación cultural"] } : null
  });

  add({
    id: "biodiv", t: "Convocatorias de la Fundación Biodiversidad", org: "Fundación Biodiversidad (MITECO)", amb: "estatal", cat: "tercer-sector",
    para: ["asociacion"],
    res: "Ayudas para conservación de la naturaleza, empleo verde, transición ecológica y adaptación al cambio climático.",
    cuantia: "Variable, desde 20.000 €.",
    plazo: { tipo: "verificar", nota: "Varias convocatorias al año." },
    url: "https://fundacion-biodiversidad.es/", fuente: "Fundación Biodiversidad",
    req: ["Entidad sin ánimo de lucro con fines ambientales"],
    docs: [D.estatutos, D.cuentas, D.proyecto],
    pasos: ["Consulta las convocatorias en su web", "Presenta en su sede electrónica"],
    m: p => p.tipo === "asociacion" && p.finalidad === "medioambiente" ? { n: "alta", why: ["Asociación ambiental"] } : null
  });

  add({
    id: "aecid", t: "Subvenciones de cooperación al desarrollo (AECID)", org: "AECID", amb: "estatal", cat: "tercer-sector",
    para: ["asociacion"],
    res: "Proyectos y convenios de cooperación internacional y educación para la ciudadanía global.",
    cuantia: "Desde 100.000 € (proyectos) a varios millones (convenios).",
    plazo: { tipo: "verificar", nota: "Convocatoria anual de proyectos de ONGD." },
    url: "https://www.aecid.es/", fuente: "AECID",
    req: ["Inscripción en el Registro de ONGD de la AECID", "Experiencia en cooperación"],
    docs: [D.estatutos, D.cuentas, D.proyecto, "Inscripción en el Registro de ONGD"],
    pasos: ["Inscríbete en el Registro de ONGD", "Consulta la convocatoria en aecid.es", "Presenta en la sede"],
    m: p => p.tipo === "asociacion" && p.finalidad === "cooperacion" ? { n: "alta", why: ["Entidad de cooperación"] } : null
  });

  add({
    id: "deporte", t: "Ayudas al deporte de base (comunidad y ayuntamiento)", org: "Dirección General de Deportes · ayuntamiento", amb: "autonomico", cat: "tercer-sector",
    para: ["asociacion"],
    res: "Subvenciones a clubes y entidades deportivas para competiciones, escuelas deportivas, material y desplazamientos, y cesión de instalaciones municipales.",
    cuantia: "De 500 € a 30.000 €.",
    plazo: { tipo: "ccaa", nota: "Convocatoria anual de tu comunidad y de tu ayuntamiento." },
    url: c => (CCAA[c] || {}).web, fuente: "Consejerías de Deportes",
    req: ["Inscripción en el registro de entidades deportivas de la comunidad", "Actividad en la comunidad"],
    docs: [D.estatutos, D.cif, D.junta, D.proyecto, D.corriente, "Inscripción en el registro de entidades deportivas"],
    pasos: ["Inscribe el club en el registro deportivo autonómico", "Consulta las convocatorias de deportes de tu comunidad y ayuntamiento", "Presenta en sede electrónica"],
    m: p => p.tipo === "asociacion" && p.finalidad === "deporte" ? { n: "alta", why: ["Club o entidad deportiva"] } : null
  });

  add({
    id: "voluntariado", t: "Seguro y apoyo al voluntariado", org: "Plataforma del Voluntariado · comunidad autónoma", amb: "autonomico", cat: "tercer-sector",
    para: ["asociacion"],
    res: "Si trabajáis con voluntarios, la ley os obliga a asegurarlos. Varias comunidades y plataformas ofrecen seguros colectivos, formación y ayudas.",
    cuantia: "Formación gratuita y seguros a precio reducido.",
    plazo: { tipo: "permanente" },
    url: "https://plataformavoluntariado.org/", fuente: "Ley 45/2015 del Voluntariado",
    req: ["Programa de voluntariado y acuerdo de incorporación firmado con cada voluntario"],
    docs: ["Acuerdos de incorporación de voluntarios", "Póliza de seguro"],
    pasos: ["Consulta la plataforma de voluntariado de tu comunidad", "Firma los acuerdos de incorporación", "Contrata el seguro colectivo"],
    m: p => p.tipo === "asociacion" && (p.necAso || []).includes("voluntariado") ? { n: "media", why: ["Contáis con personas voluntarias"] } : null
  });

  // ── Estado de plazo (se calcula con la fecha real del navegador) ──
  function plazoDe(a, ccaa) { return typeof a.plazo === "function" ? a.plazo(ccaa) : a.plazo; }
  function estado(pl, hoy) {
    const d = s => new Date(s + "T23:59:59");
    const dias = f => hoy > d(f) ? -1 : Math.max(0, Math.floor((d(f) - hoy) / 864e5));
    switch (pl.tipo) {
      case "permanente": return { k: "siempre", txt: "Abierta todo el año", nota: pl.nota };
      case "renta": return { k: "renta", txt: "Se aplica en la Renta", nota: pl.nota };
      case "ccaa": return { k: "consultar", txt: "Según convocatoria de tu comunidad", nota: pl.nota };
      case "verificar": return { k: "consultar", txt: "Comprueba la convocatoria vigente", nota: pl.nota, prox: pl.prox };
      case "cerrada": return { k: "cerrada", txt: "Cerrada", nota: pl.nota, prox: pl.prox };
      case "hasta": {
        const n = dias(pl.fin);
        return n >= 0 ? { k: "abierta", dias: n, txt: `Abierta · quedan ${n} días`, nota: pl.nota, fin: pl.fin } : { k: "cerrada", txt: "Cerrada", nota: "Finalizó el " + fmt(pl.fin) };
      }
      case "conv": {
        if (hoy < new Date(pl.ini + "T00:00:00")) return { k: "proxima", txt: "Abre el " + fmt(pl.ini), nota: pl.nota };
        const n = dias(pl.fin);
        if (n >= 0) return { k: "abierta", dias: n, txt: n === 0 ? "Abierta · ¡último día!" : `Abierta · quedan ${n} días`, fin: pl.fin, nota: pl.nota };
        return { k: "cerrada", txt: "Cerrada el " + fmt(pl.fin), prox: pl.prox, nota: pl.nota };
      }
    }
    return { k: "consultar", txt: "Consulta el plazo" };
  }
  function fmt(s) { const [y, m, d] = s.split("-"); return `${d}/${m}/${y}`; }

  const ORDEN_ESTADO = { abierta: 0, siempre: 1, renta: 2, consultar: 3, proxima: 4, cerrada: 5 };
  const ORDEN_NIVEL = { alta: 0, media: 1, baja: 2 };

  // ── Motor: evalúa todo el catálogo para un perfil ─────────────────
  function evaluar(p, hoy) {
    hoy = hoy || new Date();
    if (p.anioNac) p.edad = IND.anio - p.anioNac;
    const out = [];
    for (const a of A) {
      if (!a.para.includes(p.tipo)) continue;
      let r;
      try { r = a.m(p); } catch (e) { r = null; }
      if (!r) continue;
      const pl = plazoDe(a, p.ccaa);
      const est = estado(pl, hoy);
      out.push({
        a, nivel: r.n, why: r.why || [], imp: Math.max(0, Math.round(r.imp || 0)), est,
        url: typeof a.url === "function" ? a.url(p.ccaa) : a.url,
        nombre: a.nombre ? a.nombre(p.ccaa) : null,
        detalle: a.detalle ? a.detalle(p.ccaa) : null
      });
    }
    // El subsidio cuenta como ingreso para el IMV: no sumar los dos enteros
    const imv = out.find(r => r.a.id === "imv"), sub = out.find(r => r.a.id === "subsidio");
    if (imv && sub) { imv.imp = Math.max(0, imv.imp - sub.imp); imv.why.push("El subsidio cuenta como ingreso: el IMV completaría la diferencia"); }
    out.sort((x, y) => (ORDEN_ESTADO[x.est.k] - ORDEN_ESTADO[y.est.k]) || (ORDEN_NIVEL[x.nivel] - ORDEN_NIVEL[y.nivel]) || (y.imp - x.imp));
    return out;
  }
  // Ahorro potencial: solo lo que se puede pedir ya o en la Renta
  function potencial(res) {
    return res.filter(r => r.nivel !== "baja" && r.est.k !== "cerrada" && r.est.k !== "proxima").reduce((s, r) => s + r.imp, 0);
  }

  const KB = { IND, CCAA, A, evaluar, potencial, estado, rentaIMV, limiteBonoSocial, fmt };
  if (typeof module !== "undefined" && module.exports) module.exports = KB;
  else root.KB = KB;
})(typeof window !== "undefined" ? window : globalThis);
