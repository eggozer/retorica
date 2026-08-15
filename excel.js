// --- RETÓRICA EXCEL ENGINE (excel.js - ES5 COMPATIBLE Y MULTILENGUAJE) ---
var RetoricaExcel = {
    activeMode: false,
    chartInstance: null,

    // Diccionario de funciones contables/matemáticas en 13 idiomas
    i18nFuncs: {
        es: { SUM: "SUMA", AVERAGE: "PROMEDIO", SQRT: "RAIZ", IVA: "IVA" },
        en: { SUM: "SUM", AVERAGE: "AVERAGE", SQRT: "SQRT", IVA: "VAT" },
        fr: { SUM: "SOMME", AVERAGE: "MOYENNE", SQRT: "RACINE", IVA: "TVA" },
        de: { SUM: "SUMME", AVERAGE: "MITTELWERT", SQRT: "WURZEL", IVA: "MWST" },
        it: { SUM: "SOMMA", AVERAGE: "MEDIA", SQRT: "RADQ", IVA: "IVA" },
        pt: { SUM: "SOMA", AVERAGE: "MEDA", SQRT: "RAIZ", IVA: "IVA" },
        ru: { SUM: "СУММ", AVERAGE: "СРЗNAЧ", SQRT: "КОРЕНЬ", IVA: "НДС" },
        zh: { SUM: "求和", AVERAGE: "平均值", SQRT: "平方根", IVA: "增值税" },
        ja: { SUM: "サム", AVERAGE: "アベレージ", SQRT: "ルート", IVA: "消費税" },
        ko: { SUM: "합계", AVERAGE: "평균", SQRT: "제곱근", IVA: "부가세" },
        ar: { SUM: "مجموع", AVERAGE: "متوسط", SQRT: "جذر", IVA: "قيمة_مضافة" },
        hi: { SUM: "조합", AVERAGE: "औसत", SQRT: "वर्गमूल", IVA: "जीएसटी" },
        tr: { SUM: "TOPLA", AVERAGE: "ORTALAMA", SQRT: "KAREKÖK", IVA: "KDV" }
    },

    toggleExcelMode: function() {
        this.activeMode = !this.activeMode;
        var toolbar = document.getElementById('accordion-excel-toolbar');
        var btn = document.getElementById('btn-toggle-excel');
        var editor = document.getElementById('editor-body');

        if (this.activeMode) {
            if (toolbar) toolbar.classList.remove('accordion-closed');
            if (btn) btn.classList.add('active');

            // Preservar contenido existente si hay una tabla cargada desde PDF
            if (editor && !editor.querySelector('table')) {
                this.buildGrid(10, 5);
            }
            if (typeof RetoricaUI !== 'undefined') RetoricaUI.notify("Modo Excel Activo");
        } else {
            if (toolbar) toolbar.classList.add('accordion-closed');
            if (btn) btn.classList.remove('active');
            if (typeof RetoricaUI !== 'undefined') RetoricaUI.notify("Modo Texto Activo");
        }
    },

    buildGrid: function(rows, cols) {
        var editor = document.getElementById('editor-body');
        if (!editor) return;

        var html = '<table id="retorica-excel-table" style="width:100%; border-collapse:collapse; margin:10px 0; font-size:0.85rem;" border="1">';
        html += '<thead><tr style="background:var(--bg-sidebar, #f0f0f0); text-align:center;"><th>#</th>';
        
        for (var c = 0; c < cols; c++) {
            var colName = String.fromCharCode(65 + c);
            html += '<th style="padding:4px; border:1px solid #ccc;">' + colName + '</th>';
        }
        html += '</tr></thead><tbody>';

        for (var r = 1; r <= rows; r++) {
            html += '<tr><td style="background:var(--bg-sidebar, #f0f0f0); font-weight:bold; text-align:center; width:30px; border:1px solid #ccc;">' + r + '</td>';
            for (var c = 0; c < cols; c++) {
                var cellId = String.fromCharCode(65 + c) + r;
                html += '<td contenteditable="true" data-cell="' + cellId + '" onblur="RetoricaExcel.evalCell(this)" style="padding:6px; min-width:60px; border:1px solid #ccc; outline:none;"></td>';
            }
            html += '</tr>';
        }
        html += '</tbody></table>';

        editor.innerHTML = html;
    },

    // Limpieza estricta de números con comas de millar (ej: "2,290.03" -> 2290.03)
    parseFormattedNumber: function(valStr) {
        if (!valStr) return 0;
        var clean = valStr.toString().replace(/,/g, '').trim();
        var num = parseFloat(clean);
        return isNaN(num) ? 0 : num;
    },

    getVal: function(cellRef) {
        var td = document.querySelector('td[data-cell="' + cellRef.toUpperCase() + '"]');
        if (!td) return 0;
        if (td.hasAttribute('data-formula-val')) {
            return parseFloat(td.getAttribute('data-formula-val')) || 0;
        }
        return this.parseFormattedNumber(td.innerText);
    },

    evalCell: function(td) {
        var raw = (td.innerText || "").trim();
        if (raw.indexOf('=') !== 0) {
            td.removeAttribute('data-formula-val');
            return;
        }

        var expr = raw.substring(1).toUpperCase();
        var lang = (typeof RetoricaI18n !== 'undefined') ? RetoricaI18n.currentLang : 'es';
        var map = this.i18nFuncs[lang] || this.i18nFuncs['es'];

        try {
            // Evaluación de Rangos de Suma: =SUMA(C1:C10) o =SUM(C1:C10)
            var sumReg = new RegExp('(' + map.SUM + '|SUM)\\(([A-Z][0-9]+):([A-Z][0-9]+)\\)', 'g');
            expr = expr.replace(sumReg, function(m, fName, start, end) {
                var col = start.charAt(0);
                var rStart = parseInt(start.substring(1)), rEnd = parseInt(end.substring(1));
                var total = 0;
                for (var i = rStart; i <= rEnd; i++) {
                    total += RetoricaExcel.getVal(col + i);
                }
                return total;
            });

            // Reemplazo de referencias relativas A1, B2...
            expr = expr.replace(/[A-Z][0-9]+/g, function(ref) {
                return RetoricaExcel.getVal(ref);
            });

            // Soporte para porcentajes e IVA
            expr = expr.replace(/([0-9.]+)\s*%/g, "($1/100)");
            expr = expr.replace(new RegExp(map.IVA, 'g'), "0.16");

            var result = eval(expr);
            if (!isNaN(result)) {
                td.setAttribute('data-formula-val', result);
                td.innerText = Number(result).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            }
        } catch (e) {
            td.innerText = "#ERR";
        }
    },

    recalculate: function() {
        var cells = document.querySelectorAll('td[data-cell]');
        for (var i = 0; i < cells.length; i++) {
            this.evalCell(cells[i]);
        }
    },

    openChartModal: function() {
        var table = document.getElementById('retorica-excel-table');
        if (!table) {
            if (typeof RetoricaUI !== 'undefined') RetoricaUI.notify("No hay tabla activa para graficar");
            return;
        }

        var modal = document.getElementById('excel-chart-modal');
        if (modal) modal.style.display = 'flex';

        var labels = [];
        var data = [];
        var rows = table.querySelectorAll('tbody tr');

        for (var i = 0; i < Math.min(rows.length, 12); i++) {
            var cols = rows[i].querySelectorAll('td[data-cell]');
            if (cols.length >= 2) {
                var labelText = cols[1].innerText.trim() || ("Item " + (i + 1));
                var valTd = cols[cols.length - 1];
                var val = this.parseFormattedNumber(valTd.innerText);
                
                labels.push(labelText.substring(0, 15));
                data.push(val);
            }
        }

        var ctx = document.getElementById('retorica-chart-canvas').getContext('2d');
        if (this.chartInstance) this.chartInstance.destroy();

        this.chartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Precios / Valores',
                    data: data,
                    backgroundColor: 'rgba(54, 162, 235, 0.6)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    yAxes: [{ ticks: { beginAtZero: true } }]
                }
            }
        });
    },

    closeChartModal: function() {
        var modal = document.getElementById('excel-chart-modal');
        if (modal) modal.style.display = 'none';
    },

    addRow: function() {
        var table = document.getElementById('retorica-excel-table');
        if (!table) return;
        var tbody = table.querySelector('tbody');
        var cols = table.querySelector('thead tr').children.length - 1;
        var r = tbody.children.length + 1;

        var tr = document.createElement('tr');
        var html = '<td style="background:var(--bg-sidebar, #f0f0f0); font-weight:bold; text-align:center; width:30px; border:1px solid #ccc;">' + r + '</td>';
        for (var c = 0; c < cols; c++) {
            var cellId = String.fromCharCode(65 + c) + r;
            html += '<td contenteditable="true" data-cell="' + cellId + '" onblur="RetoricaExcel.evalCell(this)" style="padding:6px; min-width:60px; border:1px solid #ccc; outline:none;"></td>';
        }
        tr.innerHTML = html;
        tbody.appendChild(tr);
    },

    addCol: function() {
        var table = document.getElementById('retorica-excel-table');
        if (!table) return;
        var headerTr = table.querySelector('thead tr');
        var cols = headerTr.children.length - 1;
        var newColLetter = String.fromCharCode(65 + cols);

        var th = document.createElement('th');
        th.style.cssText = "padding:4px; border:1px solid #ccc;";
        th.innerText = newColLetter;
        headerTr.appendChild(th);

        var rows = table.querySelectorAll('tbody tr');
        for (var r = 0; r < rows.length; r++) {
            var cellId = newColLetter + (r + 1);
            var td = document.createElement('td');
            td.setAttribute('contenteditable', 'true');
            td.setAttribute('data-cell', cellId);
            td.setAttribute('onblur', 'RetoricaExcel.evalCell(this)');
            td.style.cssText = "padding:6px; min-width:60px; border:1px solid #ccc; outline:none;";
            rows[r].appendChild(td);
        }
    },

    delRow: function() {
        var table = document.getElementById('retorica-excel-table');
        if (!table) return;
        var tbody = table.querySelector('tbody');
        if (tbody.children.length > 1) tbody.removeChild(tbody.lastChild);
    },

    delCol: function() {
        var table = document.getElementById('retorica-excel-table');
        if (!table) return;
        var headerTr = table.querySelector('thead tr');
        if (headerTr.children.length > 2) {
            headerTr.removeChild(headerTr.lastChild);
            var rows = table.querySelectorAll('tbody tr');
            for (var r = 0; r < rows.length; r++) rows[r].removeChild(rows[r].lastChild);
        }
    },

    exportXLSX: function() {
        var table = document.getElementById('retorica-excel-table');
        if (!table || typeof XLSX === 'undefined') return;
        var wb = XLSX.utils.table_to_book(table, { sheet: "Lista Precios" });
        var title = (document.getElementById('editor-title') || {}).value || "Lista_Precios_Retorica";
        XLSX.writeFile(wb, title + ".xlsx");
    },

    exportCSV: function() {
        var table = document.getElementById('retorica-excel-table');
        if (!table) return;
        var csv = [];
        var rows = table.querySelectorAll('tr');
        for (var i = 0; i < rows.length; i++) {
            var row = [], cols = rows[i].querySelectorAll('td, th');
            for (var j = 1; j < cols.length; j++) {
                row.push('"' + (cols[j].innerText || "").replace(/"/g, '""') + '"');
            }
            csv.push(row.join(","));
        }
        var blob = new Blob([csv.join("\n")], { type: "text/csv;charset=utf-8;" });
        if (typeof saveAs !== 'undefined') saveAs(blob, "Lista_Precios.csv");
    }
};
