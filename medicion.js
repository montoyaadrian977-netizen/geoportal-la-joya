// ===================================================
// HERRAMIENTAS DE MEDICION GEOGRAFICA
// ===================================================

(() => {

    let modoMedicion = null;
    let puntosMedicion = [];

    const capaMedicion = L.featureGroup().addTo(mapa);

    const resultadoMedicion =
        document.getElementById("resultadoMedicion");

    // INICIAR MEDICION

    function iniciarMedicion(modo) {

        if (typeof bufferActivo !== "undefined") {
            bufferActivo = false;
        }

        modoMedicion = modo;
        puntosMedicion = [];

        capaMedicion.clearLayers();

        mapa.closePopup();

mapa.getContainer().classList.add("modo-medicion");

mapa.getContainer().style.cursor = "crosshair";

        resultadoMedicion.textContent =
            "Seleccione puntos sobre el mapa.";
    }

    document.getElementById("medirDistancia").onclick = () => {
        iniciarMedicion("distancia");
    };

    document.getElementById("medirSuperficie").onclick = () => {
        iniciarMedicion("superficie");
    };

    // CAPTURAR PUNTOS DEL MAPA

    mapa.on("click", function (e) {

        if (!modoMedicion) return;

        puntosMedicion.push([
            e.latlng.lat,
            e.latlng.lng
        ]);

        actualizarMedicion();

    });

    // DIBUJAR Y CALCULAR RESULTADOS

    function actualizarMedicion() {

        capaMedicion.clearLayers();

        for (const punto of puntosMedicion) {

            L.circleMarker(punto, {
                radius: 5,
                color: "#ffffff",
                fillColor: "#ff9800",
                fillOpacity: 1,
                weight: 2,
                interactive: false
            }).addTo(capaMedicion);

        }

        resultadoMedicion.textContent =
            `Puntos seleccionados: ${puntosMedicion.length}`;

        if (puntosMedicion.length < 2) return;

        const coordenadas = puntosMedicion.map(
            punto => [punto[1], punto[0]]
        );

        // MEDICION DE DISTANCIAS

        if (modoMedicion === "distancia") {

            L.polyline(puntosMedicion, {
                color: "#ffff00",
                weight: 4,
                interactive: false
            }).addTo(capaMedicion);

            const linea = turf.lineString(coordenadas);

            const km = turf.length(linea, {
                units: "kilometers"
            });

            resultadoMedicion.innerHTML = `
                <strong>Distancia total</strong><br>
                ${(km * 1000).toFixed(2)} m<br>
                ${km.toFixed(3)} km
            `;
        }

        // MEDICION DE SUPERFICIES

        if (modoMedicion === "superficie") {

            if (puntosMedicion.length < 3) {

                resultadoMedicion.textContent =
                    "Seleccione al menos tres puntos.";

                return;
            }

            L.polygon(puntosMedicion, {
                color: "#ffff00",
                weight: 3,
                fillColor: "#ff9800",
                fillOpacity: 0.35,
                interactive: false
            }).addTo(capaMedicion);

            const anillo = [
                ...coordenadas,
                coordenadas[0]
            ];

            const poligono = turf.polygon([anillo]);

            const superficie = turf.area(poligono);

            const perimetro = turf.length(
                turf.lineString(anillo),
                { units: "kilometers" }
            ) * 1000;

            resultadoMedicion.innerHTML = `
                <strong>Superficie calculada</strong><br>
                Área: ${superficie.toFixed(2)} m²<br>
                Área: ${(superficie / 10000).toFixed(4)} ha<br>
                Perímetro: ${perimetro.toFixed(2)} m
            `;
        }

    }

    // FINALIZAR MEDICION

    document.getElementById("finalizarMedicion").onclick =
        function () {

            if (!modoMedicion) return;

            const minimo =
                modoMedicion === "superficie" ? 3 : 2;

            if (puntosMedicion.length < minimo) {
                alert("Seleccione más puntos.");
                return;
            }

            modoMedicion = null;

            mapa.getContainer().classList.remove("modo-medicion");

mapa.getContainer().style.cursor = "";

        };

    // DESHACER ULTIMO PUNTO

    document.getElementById("deshacerMedicion").onclick =
        function () {

            if (!modoMedicion) return;

            puntosMedicion.pop();
            actualizarMedicion();

        };

    // LIMPIAR MEDICION

    function limpiar() {

        capaMedicion.clearLayers();

        puntosMedicion = [];
        modoMedicion = null;

        mapa.getContainer().classList.remove("modo-medicion");

mapa.getContainer().style.cursor = "";

        resultadoMedicion.textContent = "";

    }

    document.getElementById("limpiarMedicion").onclick =
        limpiar;

    // EVITAR CONFLICTOS CON LA HERRAMIENTA BUFFER

    document.getElementById("crearBuffer")
        ?.addEventListener("click", function () {

            if (modoMedicion) limpiar();

        }, true);

})();