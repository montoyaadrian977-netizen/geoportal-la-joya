// ===================================================
// GEOPORTAL AMBIENTAL - JOYA DEL ORIENTE II
// CC CONSULTORES | TECNOLOGÍA GEOESPACIAL
// ===================================================

// 1. CREACIÓN DEL MAPA

const mapa = L.map("mapa").setView([-4, -79], 8);

// ===================================================
// 2. MAPAS BASE
// ===================================================

const satelite = L.tileLayer(
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    {
        attribution: "Esri World Imagery",
        maxZoom: 19
    }
).addTo(mapa);

const topografico = L.tileLayer(
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}",
    {
        attribution: "Esri World Topographic Map",
        maxZoom: 19
    }
);

const calles = L.tileLayer(
    "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
        attribution: "&copy; OpenStreetMap contributors",
        maxZoom: 19
    }
);

// ===================================================
// 3. CONTROL DE CAPAS
// ===================================================

const controlCapas = L.control.layers({

    "Imagen satelital": satelite,
    "Mapa topográfico": topografico,
    "Mapa de calles": calles

}, {}, {
    collapsed: false
}).addTo(mapa);

L.control.scale({
    metric: true,
    imperial: false
}).addTo(mapa);

// ===================================================
// 4. CONFIGURACIÓN DE CAPAS
// ===================================================

const capas = [

    ["concesion_joyadelorienteii", "Concesión minera", "#F5C451", true],

    ["area_implantacion_", "Área de implantación", "#2DD4BF", true],

    ["infraestructura_operativa", "Infraestructura operativa", "#F4A261", false],

    ["sensibilidad_biotica", "Sensibilidad biótica", "#4CAF50", false],

    ["red_hidrica_1", "Red hídrica", "#60A5FA", true],

    ["via_l", "Vías de acceso", "#FFFFFF", true],

    ["monitoreo_calidad_agua", "Monitoreo de agua", "#38BDF8", true],

    ["monitoreo_calidad_del_aire", "Monitoreo de aire", "#C084FC", true],

    ["monitoreo_calidad_suelo", "Monitoreo de suelo", "#D4A373", true],

    ["monitoreo_muestreo_de_ruido", "Monitoreo de ruido", "#F87171", true]

];

// ===================================================
// 5. SIMBOLOGÍA CARTOGRÁFICA
// ===================================================

function obtenerEstilo(archivo, color, entidad) {

    // CONCESIÓN MINERA

    if (archivo === "concesion_joyadelorienteii") {

        return {
            color: color,
            weight: 3,
            opacity: 1,
            fillOpacity: 0
        };

    }

    // ÁREA DE IMPLANTACIÓN

    if (archivo === "area_implantacion_") {

        return {
            color: color,
            weight: 2,
            dashArray: "7, 5",
            fillColor: color,
            fillOpacity: 0.03
        };

    }

    // INFRAESTRUCTURA OPERATIVA

    if (archivo === "infraestructura_operativa") {

        return {
            color: "#FFD180",
            weight: 1.5,
            fillColor: color,
            fillOpacity: 0.50
        };

    }

    // RED HÍDRICA

    if (archivo === "red_hidrica_1") {

        return {
            color: color,
            weight: 1.8,
            opacity: 0.95
        };

    }

    // VÍAS DE ACCESO

    if (archivo === "via_l") {

        return {
            color: color,
            weight: 2,
            dashArray: "6, 5",
            opacity: 0.90
        };

    }

    // SENSIBILIDAD BIÓTICA

    if (archivo === "sensibilidad_biotica") {

        const categoria = String(
            entidad.properties?.SENSIBILID ?? ""
        ).trim().toUpperCase();

        const colores = {
            "SENSIBILIDAD BAJA": "#4CAF50",
            "SENSIBILIDAD MEDIA": "#FFEB3B",
            "SENSIBILIDAD ALTA": "#F44336"
        };

        const colorFinal = colores[categoria] || "#9E9E9E";

        return {
            color: colorFinal,
            weight: 1.2,
            fillColor: colorFinal,
            fillOpacity: 0.45
        };

    }

    // PUNTOS DE MONITOREO

    return {
        color: "#FFFFFF",
        weight: 1.8,
        fillColor: color,
        fillOpacity: 1
    };

}

// ===================================================
// 6. LEYENDA CARTOGRÁFICA
// ===================================================

function obtenerSimbolo(archivo, color) {

    // PUNTOS DE MONITOREO

    if (archivo.startsWith("monitoreo_")) {

        return `
        <span style="
            display:inline-block;
            width:12px;
            height:12px;
            background:${color};
            border:1.5px solid white;
            box-shadow:0 0 0 1px #888;
            border-radius:50%;
            margin-right:7px;">
        </span>`;

    }

    // RED HÍDRICA

    if (archivo === "red_hidrica_1") {

        return `
        <span style="
            display:inline-block;
            width:19px;
            border-top:3px solid ${color};
            vertical-align:middle;
            margin-right:7px;">
        </span>`;

    }

    // VÍAS DE ACCESO

    if (archivo === "via_l") {

        return `
        <span style="
            display:inline-block;
            width:19px;
            border-top:2px dashed #777;
            vertical-align:middle;
            margin-right:7px;">
        </span>`;

    }

    // CONCESIÓN MINERA

    if (archivo === "concesion_joyadelorienteii") {

        return `
        <span style="
            display:inline-block;
            width:14px;
            height:12px;
            border:2px solid ${color};
            background:transparent;
            margin-right:7px;">
        </span>`;

    }

    // ÁREA DE IMPLANTACIÓN

    if (archivo === "area_implantacion_") {

        return `
        <span style="
            display:inline-block;
            width:14px;
            height:12px;
            border:2px dashed ${color};
            background:transparent;
            margin-right:7px;">
        </span>`;

    }

    // SENSIBILIDAD BIÓTICA

    if (archivo === "sensibilidad_biotica") {

        return `
        <span style="
            display:inline-block;
            width:24px;
            height:12px;
            background:linear-gradient(
                to right,
                #4CAF50 33%,
                #FFEB3B 33% 66%,
                #F44336 66%
            );
            border-radius:3px;
            margin-right:7px;">
        </span>`;

    }

    // POLÍGONOS

    return `
    <span style="
        display:inline-block;
        width:14px;
        height:12px;
        background:${color};
        border:1px solid #888;
        border-radius:2px;
        margin-right:7px;">
    </span>`;

}

// ===================================================
// 7. CARGAR INFORMACIÓN GEOGRÁFICA
// ===================================================

async function cargarCapa(archivo, nombre, color, visible) {

    try {

        const respuesta = await fetch(`datos/${archivo}.geojson`);

        if (!respuesta.ok) {
            throw new Error(`HTTP ${respuesta.status}`);
        }

        const datos = await respuesta.json();

        const capa = L.geoJSON(datos, {

            style: function (entidad) {

                return obtenerEstilo(archivo, color, entidad);

            },

            // SÍMBOLOS DE MONITOREO

            pointToLayer: function (entidad, coordenadas) {

                return L.circleMarker(coordenadas, {
                    radius: 6,
                    color: "#FFFFFF",
                    weight: 1.8,
                    fillColor: color,
                    fillOpacity: 1
                });

            },

            // VENTANAS DE CONSULTA

            onEachFeature: function (entidad, elemento) {

                const contenido = document.createElement("div");

                const titulo = document.createElement("h3");

                titulo.textContent = nombre;

                contenido.appendChild(titulo);

                for (const [campo, valor] of
                    Object.entries(entidad.properties || {})) {

                    const fila = document.createElement("div");

                    fila.textContent = `${campo}: ${valor ?? ""}`;

                    contenido.appendChild(fila);

                }

                elemento.bindPopup(contenido);

            }

        });

        // INCORPORAR SIMBOLOGÍA AL SELECTOR

        controlCapas.addOverlay(
            capa,
            obtenerSimbolo(archivo, color) + nombre
        );

        if (visible) {
            capa.addTo(mapa);
        }

        // ZOOM AUTOMÁTICO

        if (archivo === "concesion_joyadelorienteii") {

            if (capa.getBounds().isValid()) {

                mapa.fitBounds(capa.getBounds(), {
                    padding: [40, 40]
                });

            }

        }

        // FILTRO DE SENSIBILIDAD

        if (archivo === "sensibilidad_biotica") {

            configurarFiltroSensibilidad(datos, capa);

        }

        console.log("Capa cargada correctamente:", nombre);

    } catch (error) {

        console.error("Error al cargar:", archivo, error);

    }

}

// ===================================================
// 8. FILTRO DINÁMICO DE SENSIBILIDAD
// ===================================================

function configurarFiltroSensibilidad(datos, capa) {

    const selector = document.getElementById("filtroSensibilidad");

    const resultado = document.getElementById("resultadoSensibilidad");

    if (!selector || !resultado) {

        console.error("No se encontraron los elementos del filtro");

        return;

    }

    function obtenerCategoria(entidad) {

        return String(
            entidad.properties?.SENSIBILID ?? ""
        ).trim().toUpperCase();

    }

    const categorias = [...new Set(

        datos.features
            .map(obtenerCategoria)
            .filter(Boolean)

    )].sort();

    selector.innerHTML = "";

    selector.add(new Option("Todas las categorías", ""));

    categorias.forEach(categoria => {

        selector.add(new Option(categoria, categoria));

    });

    selector.addEventListener("change", function () {

        const seleccion = selector.value;

        const filtrados = datos.features.filter(entidad =>

            seleccion === "" ||
            obtenerCategoria(entidad) === seleccion

        );

        mapa.closePopup();

        capa.clearLayers();

        capa.addData({
            type: "FeatureCollection",
            features: filtrados
        });

        if (!mapa.hasLayer(capa)) {

            capa.addTo(mapa);

        }

        const superficie = turf.area({
            type: "FeatureCollection",
            features: filtrados
        }) / 10000;

        const superficieTotal = turf.area(datos) / 10000;

        const porcentaje = superficieTotal > 0
            ? (superficie / superficieTotal) * 100
            : 0;

        resultado.innerHTML = `
            <strong>RESULTADOS DEL FILTRO</strong><br><br>
            Entidades: ${filtrados.length}<br>
            Superficie: ${superficie.toFixed(2)} ha<br>
            Porcentaje: ${porcentaje.toFixed(2)} %
        `;

    });

}

// ===================================================
// 9. INICIAR GEOPORTAL
// ===================================================

async function iniciarGeoportal() {

    for (const configuracion of capas) {

        await cargarCapa(...configuracion);

    }

    console.log("GEOPORTAL INICIADO");

}

iniciarGeoportal();