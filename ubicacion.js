// ===================================================
// SISTEMA DE GEOLOCALIZACION GPS
// ===================================================

const capaGPS = L.featureGroup().addTo(mapa);

const resultadoGPS = document.getElementById("resultadoGPS");

document.getElementById("miUbicacion").onclick = function () {

    if (!navigator.geolocation) {
        resultadoGPS.textContent = "GPS no disponible.";
        return;
    }

    resultadoGPS.textContent = "Obteniendo ubicación...";

    navigator.geolocation.getCurrentPosition(

        async function (posicion) {

            const latitud = posicion.coords.latitude;
            const longitud = posicion.coords.longitude;
            const precision = posicion.coords.accuracy;

            capaGPS.clearLayers();

            // MARCADOR DE UBICACION

            L.circleMarker([latitud, longitud], {
                radius: 9,
                color: "#ffffff",
                weight: 3,
                fillColor: "#007bff",
                fillOpacity: 1
            })
            .bindPopup("Mi ubicación actual")
            .addTo(capaGPS);

            // CIRCULO DE PRECISION GPS

            L.circle([latitud, longitud], {
                radius: precision,
                color: "#007bff",
                fillOpacity: 0.15,
                interactive: false
            }).addTo(capaGPS);

            mapa.setView([latitud, longitud], 17);

            resultadoGPS.innerHTML = `
                <strong>Ubicación actual</strong><br>
                Latitud: ${latitud.toFixed(6)}<br>
                Longitud: ${longitud.toFixed(6)}<br>
                Precisión: ±${precision.toFixed(1)} m<br>
            `;

            // ANALISIS RESPECTO A LA CONCESION

            try {

                const respuesta = await fetch(
                    "datos/concesion_joyadelorienteii.geojson"
                );

                if (!respuesta.ok) {
                    throw new Error("No se pudo cargar la concesión");
                }

                const concesion = await respuesta.json();

                const punto = turf.point([longitud, latitud]);

                let dentro = false;
                let distancia = Infinity;

                turf.flattenEach(concesion, function (poligono) {

                    if (poligono.geometry?.type !== "Polygon") return;

                    if (turf.booleanPointInPolygon(punto, poligono)) {
                        dentro = true;
                    }

                    for (const anillo of poligono.geometry.coordinates) {

                        const limite = turf.lineString(anillo);

                        const metros = turf.pointToLineDistance(
                            punto,
                            limite,
                            { units: "kilometers" }
                        ) * 1000;

                        distancia = Math.min(distancia, metros);
                    }

                });

                if (!Number.isFinite(distancia)) {
                    throw new Error("No hay polígonos válidos");
                }

                resultadoGPS.innerHTML += `
                    <hr>
                    <strong>Relación con el proyecto</strong><br>

                    Estado: ${dentro ? "Dentro" : "Fuera"}
                    de la concesión<br>

                    Distancia al límite:
                    ${distancia.toFixed(2)} m<br>

                    ${distancia <= precision
                        ? "Advertencia: ubicación cercana al límite, considerando la precisión GPS."
                        : ""}
                `;

            } catch (error) {

                resultadoGPS.innerHTML +=
                    "<br>No se pudo analizar la concesión.";

                console.error(error);

            }

        },

        function (error) {

            resultadoGPS.textContent =
                "No se pudo obtener la ubicación: " + error.message;

        },

        {
            enableHighAccuracy: true,
            timeout: 20000,
            maximumAge: 0
        }

    );

};

// LIMPIAR UBICACION

document.getElementById("limpiarUbicacion").onclick = function () {

    capaGPS.clearLayers();

    resultadoGPS.textContent = "";

};