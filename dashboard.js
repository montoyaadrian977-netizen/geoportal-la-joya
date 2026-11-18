console.log("DASHBOARD AMBIENTAL ACTIVADO");

// ===================================================
// 1. CARGAR INFORMACION GEOGRAFICA
// ===================================================

async function obtenerDatos(archivo) {

    const respuesta = await fetch(`datos/${archivo}.geojson`);

    if (!respuesta.ok) {
        throw new Error(`No se pudo cargar ${archivo}`);
    }

    return await respuesta.json();
}

// ===================================================
// 2. CALCULAR SUPERFICIES EN HECTAREAS
// ===================================================

async function calcularSuperficie(archivo, elemento) {

    try {

        const datos = await obtenerDatos(archivo);

        const hectareas = turf.area(datos) / 10000;

        document.getElementById(elemento).textContent =
            hectareas.toFixed(2) + " ha";

        console.log(archivo, hectareas, "ha");

    } catch (error) {
        console.error(error);
    }

}

// ===================================================
// 3. CONTABILIZAR PUNTOS DE MONITOREO
// ===================================================

async function contarMonitoreos(archivo, elemento) {

    try {

        const datos = await obtenerDatos(archivo);

        const total = datos.features.reduce((suma, entidad) => {

            if (entidad.geometry?.type === "Point") {
                return suma + 1;
            }

            if (entidad.geometry?.type === "MultiPoint") {
                return suma + entidad.geometry.coordinates.length;
            }

            return suma;

        }, 0);

        document.getElementById(elemento).textContent = total;

        console.log(archivo, total, "puntos");

    } catch (error) {
        console.error(error);
    }

}

// ===================================================
// 4. INDICADORES DE SUPERFICIE
// ===================================================

calcularSuperficie(
    "concesion_joyadelorienteii",
    "superficie-concesion"
);

calcularSuperficie(
    "area_implantacion_",
    "superficie-implantacion"
);

// ===================================================
// 5. INDICADORES DE MONITOREO AMBIENTAL
// ===================================================

contarMonitoreos(
    "monitoreo_calidad_agua",
    "total-agua"
);

contarMonitoreos(
    "monitoreo_calidad_del_aire",
    "total-aire"
);

contarMonitoreos(
    "monitoreo_calidad_suelo",
    "total-suelo"
);

contarMonitoreos(
    "monitoreo_muestreo_de_ruido",
    "total-ruido"
);
// ===================================================
// GRÁFICO ESTADÍSTICO DE MONITOREOS
// ===================================================

async function generarGrafico() {

    const archivos = [
        "monitoreo_calidad_agua",
        "monitoreo_calidad_del_aire",
        "monitoreo_calidad_suelo",
        "monitoreo_muestreo_de_ruido"
    ];

    const cantidades = await Promise.all(
        archivos.map(async archivo => {

            const datos = await obtenerDatos(archivo);

            return datos.features.reduce((total, entidad) => {

                if (entidad.geometry?.type === "Point") {
                    return total + 1;
                }

                if (entidad.geometry?.type === "MultiPoint") {
                    return total + entidad.geometry.coordinates.length;
                }

                return total;

            }, 0);

        })
    );

    new Chart(document.getElementById("graficoMonitoreos"), {

        type: "bar",

        data: {
            labels: ["Agua", "Aire", "Suelo", "Ruido"],

            datasets: [{
                label: "Puntos de monitoreo",
                data: cantidades,

                backgroundColor: [
                    "#2196F3",
                    "#9C27B0",
                    "#795548",
                    "#F44336"
                ],

                borderRadius: 6
            }]
        },

        options: {
            responsive: true,

            plugins: {
                legend: {
                    display: false
                }
            },

            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });

}

generarGrafico().catch(console.error);
// ===================================================
// GRÁFICO DE SENSIBILIDAD BIÓTICA
// ===================================================

async function graficarSensibilidad() {

    const datos = await obtenerDatos("sensibilidad_biotica");

    const superficies = {
        "SENSIBILIDAD BAJA": 0,
        "SENSIBILIDAD MEDIA": 0,
        "SENSIBILIDAD ALTA": 0
    };

    datos.features.forEach(entidad => {

        const categoria = String(
            entidad.properties?.SENSIBILID ?? ""
        ).trim().toUpperCase();

        if (Object.hasOwn(superficies, categoria)) {

            superficies[categoria] += turf.area(entidad) / 10000;

        }

    });

    new Chart(document.getElementById("graficoSensibilidad"), {

        type: "doughnut",

        data: {

            labels: ["Baja", "Media", "Alta"],

            datasets: [{

                data: Object.values(superficies),

                backgroundColor: [
                    "#4CAF50",
                    "#FFEB3B",
                    "#F44336"
                ],

                borderColor: "#FFFFFF",
                borderWidth: 3

            }]

        },

        options: {

            responsive: true,

            cutout: "55%",

            plugins: {

                legend: {
                    position: "bottom"
                },

                tooltip: {

                    callbacks: {

                        label: function(context) {

                            const valor = context.raw;

                            const total = context.dataset.data.reduce(
                                (a, b) => a + b, 0
                            );

                            const porcentaje = total > 0
                                ? (valor / total) * 100
                                : 0;

                            return `${context.label}: ${valor.toFixed(2)} ha (${porcentaje.toFixed(2)} %)`;

                        }

                    }

                }

            }

        }

    });

}

graficarSensibilidad().catch(console.error);