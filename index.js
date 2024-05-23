const scrapeMercadoLibre = require('./botMercadoLibre');
const scrapeAlkosto = require('./botAlkosto');
const scrapeExito = require('./botExito');
const scrapeFalabella = require('./botFalabella')
const scrapeOlimpica = require("./botOlimpica")
const express = require('express');
const path = require('path');

const app = express();
const port = 3000;
app.use(express.static(path.join(__dirname, 'assets')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'))
})

app.get('/search', async (req, res) => {
    try {
        const searchValue = req.query.productSearch
        const store = req.query.store; // Nuevo: recupera la tienda seleccionada

        let results = '';
        if (!store || store === 'MercadoLibre') {
            results += await scrapeMercadoLibre(searchValue);
        }
        if (!store || store === 'Alkosto') {
            results += await scrapeAlkosto(searchValue);
        }
        if (!store || store === 'Falabella') {
            results += await scrapeFalabella(searchValue);
        }
        if (!store || store === 'Exito') {
            results += await scrapeExito(searchValue);
        }
        if (!store || store === 'Olimpica') {
            results += await scrapeOlimpica(searchValue);
        }

        const indexScript = `
            <script>
                function filterResults() {
                    const selectedStore = document.getElementById('storeFilter').value;
                    const productList = document.querySelector('.productList');

                    // Ocultar todos los resultados
                    const results = document.querySelectorAll('.results');
                    results.forEach(result => {
                        result.style.display = 'none';
                    });

                    // Mostrar solo los resultados de la tienda seleccionada
                    const selectedResults = document.querySelectorAll(\`.results[data-store="\${selectedStore}"]\`);
                    selectedResults.forEach(result => {
                        result.style.display = 'block';
                    });
                }

                // Función para enviar la solicitud de búsqueda al servidor
                async function searchProducts() {
                    const productSearch = document.getElementById('productSearch').value;
                    const storeFilter = document.getElementById('storeFilter').value;

                    const url = \`/search?productSearch=\${productSearch}&store=\${storeFilter}\`;

                    try {
                        const response = await fetch(url);
                        const html = await response.text();
                        document.querySelector('.productList').innerHTML = html;
                    } catch (error) {
                        console.error('Error fetching search results:', error);
                    }
                }

                // Asignar el evento click al botón de búsqueda
                document.querySelector('button[type="submit"]').addEventListener('click', function(event) {
                    event.preventDefault(); // Evitar que el formulario se envíe automáticamente
                    searchProducts(); // Llamar a la función de búsqueda
                });

                // Asignar el evento change al filtro de tiendas
                document.getElementById('storeFilter').addEventListener('change', filterResults);
            </script>
        `;

        res.send(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Price Hive</title>
                <link rel="stylesheet" href="./css/main.css">
            </head>
            <body>
                <div id="mainApp">
                    <header>
                        <div class = "branding">
                            <img src="./img/icon_watermark.webp" alt="Logo" width="100" height="100">
                            <h1>Price Hive</h1>    
                        </div>
                        <form method="GET">
                            <input type="search" name="productSearch" id="productSearch" placeholder="Buscar productos">
                            <button type="submit">Buscar</button>
                        </form>
                    </header>
                    <div class="contentDisplay">
                        <div class="btn-container">
                            <button id="decreasePrice">-</button>
                            <input type="text" id="priceInput" placeholder="Precio máximo">
                            <button id="increasePrice">+</button>
                            <button id="priceFilter">Filtrar por precio</button>
                            <select id="storeFilter">
                                <option>Filtrar por mercado</option>
                                <option value="MercadoLibre">MercadoLibre</option>
                                <option value="Alkosto">Alkosto</option>
                                <option value="Falabella">Falabella</option>
                                <option value="Exito">Exito</option>
                                <option value="Olimpica">Olimpica</option>
                            </select>
                        </div>
                        <div class="productList">
                            <div id="emptyPlaceholder" class="emptyPlaceholder">
                                ${results}
                            </div>
                        </div>
                        <div class="pageNavigation"></div>
                    </div>
                </div>
                ${indexScript}
            </body>
            </html>
        `);
    } catch (error) {
        res.status(500).send({ msg: 'Error occurred while scraping.', error: error.message });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
