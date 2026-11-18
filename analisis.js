// ===================================================
// ANÁLISIS ESPACIAL - GEOPORTAL LA JOYA
// ===================================================

let bufferActivo = false;

const capaBuffer = L.featureGroup().addTo(mapa);
const resultadoBuffer = document.getElementById("resultadoBuffer");

// 1. ACTIVAR BUFFER

document.getElementById("crearBuffer").onclick = function () {

    bufferActivo = true;

    mapa.closePopup();

    mapa.getContainer().classList.add("modo-medicion");
    mapa.getContainer().style.cursor = "crosshair";

    resultadoBuffer.textContent = "Seleccione un punto en el mapa.";

    console.log("BUFFER ACTIVADO");

};

// 2. GENERAR BUFFER

mapa.on("click", function (e) {

    if (!bufferActivo) return;

    const distancia = Number(
        document.getElementById("distanciaBuffer").value
    );

    if (!Number.isFinite(distancia) || distancia <= 0) {
        alert("Ingrese una distancia válida.");
        return;
    }

    capaBuffer.clearLayers();

    const punto = turf.point([
        e.latlng.lng,
        e.latlng.lat
    ]);

    const buffer = turf.buffer(punto, distancia / 1000, {
        units: "kilometers",
        steps: 64
    });

    L.geoJSON(buffer, {
        interactive: false,
        style: {
            color: "#FFFF00",
            weight: 3,
            fillColor: "#FF9800",
            fillOpacity: 0.30
        }
    }).addTo(capaBuffer);

    L.circleMarker(e.latlng, {
        radius: 6,
        color: "#FFFFFF",
        fillColor: "#FF9800",
        fillOpacity: 1,
        interactive: false
    }).addTo(capaBuffer);

    const superficie = turf.area(buffer) / 10000;

    resultadoBuffer.innerHTML = `
        <strong>RESULTADOS DEL BUFFER</strong><br><br>
        Radio: ${distancia} m<br>
        Superficie: ${superficie.toFixed(2)} ha<br>
        Latitud: ${e.latlng.lat.toFixed(6)}<br>
        Longitud: ${e.latlng.lng.toFixed(6)}<br>
    `;

    bufferActivo = false;

    mapa.getContainer().classList.remove("modo-medicion");
    mapa.getContainer().style.cursor = "";

    analizarIntersecciones(buffer);

});

// 3. CONSULTAS ESPACIALES

async function analizarIntersecciones(buffer) {

    const capasAnalisis = [
        ["monitoreo_calidad_agua", "Monitoreos de agua", true],
        ["monitoreo_calidad_del_aire", "Monitoreos de aire", true],
        ["monitoreo_calidad_suelo", "Monitoreos de suelo", true],
        ["monitoreo_muestreo_de_ruido", "Monitoreos de ruido", true],
        ["red_hidrica_1", "Entidades hídricas", false],
        ["via_l", "Entidades viales", false],
        ["infraestructura_operativa", "Infraestructuras", false],
        ["sensibilidad_biotica", "Zonas sensibles", false]
    ];

    const panel = document.createElement("div");
    panel.textContent = "Analizando intersecciones...";
    resultadoBuffer.appendChild(panel);

    const resultados = await Promise.all(

        capasAnalisis.map(async ([archivo, nombre, esPunto]) => {

            try {

                const respuesta = await fetch(
                    `datos/${archivo}.geojson`
                );

                if (!respuesta.ok) {
                    throw new Error("Error al cargar la capa");
                }

                const datos = await respuesta.json();

                let cantidad = 0;

                if (esPunto) {

                    turf.flattenEach(datos, entidad => {

                        if (
                            entidad.geometry?.type === "Point" &&
                            turf.booleanPointInPolygon(entidad, buffer)
                        ) {
                            cantidad++;
                        }

                    });

                } else {

                    cantidad = datos.features.filter(entidad =>
                        entidad.geometry &&
                        turf.booleanIntersects(entidad, buffer)
                    ).length;

                }

                return `${nombre}: <strong>${cantidad}</strong><br>`;

            } catch (error) {

                console.error(error);

                return `${nombre}: No disponible<br>`;

            }

        })

    );

    panel.innerHTML = `
        <hr>
        <strong>INTERSECCIÓN DE CAPAS</strong><br><br>
        ${resultados.join("")}
    `;

}

// 4. LIMPIAR BUFFER

document.getElementById("limpiarBuffer").onclick = function () {

    capaBuffer.clearLayers();

    if (bufferActivo) {
        mapa.getContainer().classList.remove("modo-medicion");
        mapa.getContainer().style.cursor = "";
    }

    bufferActivo = false;

    resultadoBuffer.textContent = "";

};

console.log("HERRAMIENTAS DE ANÁLISIS ESPACIAL ACTIVADAS");