// --- RETÓRICA EXCEL ENGINE (excel.js - ES5 COMPATIBLE Y MULTILENGUAJE) ---
var RetoricaExcel = {
    activeMode: false,

    // Diccionario de funciones contables/matemáticas en 13 idiomas
    i18nFuncs: {
        es: { SUM: "SUMA", AVERAGE: "PROMEDIO", SQRT: "RAIZ", IVA: "IVA", SUB: "RESTA", MULT: "MULT", DIV: "DIV" },
        en: { SUM: "SUM", AVERAGE: "AVERAGE", SQRT: "SQRT", IVA: "VAT", SUB: "SUB", MULT: "MULTIPLY", DIV: "DIVIDE" },
        fr: { SUM: "SOMME", AVERAGE: "MOYENNE", SQRT: "RACINE", IVA: "TVA", SUB: "SOUSTRAIRE", MULT: "MULTIPLIER", DIV: "DIVISER" },
        de: { SUM: "SUMME", AVERAGE: "MITTELWERT", SQRT: "WURZEL", IVA: "MWST", SUB: "SUB", MULT: "MULT", DIV: "DIV" },
        it: { SUM: "SOMMA", AVERAGE: "MEDIA", SQRT: "RADQ", IVA: "IVA", SUB: "SOTTRAI", MULT: "MOLT", DIV: "DIV" },
        pt: { SUM: "SOMA", AVERAGE: "MEDA", SQRT: "RAIZ", IVA: "IVA", SUB: "SUB", MULT: "MULT", DIV: "DIV" },
        ru: { SUM: "СУММ", AVERAGE: "СРЗНАЧ", SQRT: "КОРЕНЬ", IVA: "НДС", SUB: "ВЫЧЕТ", MULT: "УМНОЖ", DIV: "DEL" },
        zh: { SUM: "求和", AVERAGE: "平均值", SQRT: "平方根", IVA: "增值税", SUB: "减", MULT: "乘", DIV: "除" },
        ja: { SUM: "サム", AVERAGE: "アベレージ", SQRT: "ルート", IVA: "消費税", SUB: "サブ", MULT: "マルチ", DIV: "ディブ" },
        ko: { SUM: "합계", AVERAGE: "평균", SQRT: "제곱근", IVA: "부가세", SUB: "빼기", MULT: "곱하기", DIV: "나누기" },
        ar: { SUM: "مجموع", AVERAGE: "متوسط", SQRT: "جذر", IVA: "قيمة_مضافة", SUB: "طرح", MULT: "ضرب", DIV: "قسمة" },
        hi: { SUM: "조합", AVERAGE: "औसत", SQRT: "वर्गमूल", IVA: "जीएसटी", SUB: "घटाव", MULT: "गुणा", DIV: "भाग" },
        tr: { SUM: "TOPLA", AVERAGE: "ORTALAMA", SQRT: "KAREKÖK", IVA: "KDV", SUB: "ÇIKAR", MULT: "ÇARP", DIV: "BÖL" }
    },

    toggleExcelMode: function() {
        this.activeMode = !this.activeMode;
        var toolbar = document.getElementById('accordion-excel-toolbar');
        var btn = document.getElementById('btn-toggle-excel');

        if (this.activeMode) {
            if (toolbar) toolbar.classList.remove('accordion-closed');
            if (btn) btn.classList.add('active');
            this.buildGrid(10, 5);
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
        html += '<thead><tr style="background:var(--bg-sidebar); text-align:center;"><th>#</th>';
        
        for (var c = 0; c < cols; c++) {
            var colName = String.fromCharCode(65 + c);
            html += '<th style="padding:4px; border:1px solid var(--border);">' + colName + '</th>';
        }
        html += '</tr></thead><tbody>';

        for (var r = 1; r <= rows; r++) {
            html += '<tr><td style="background:var(--bg-sidebar); font-weight:bold; text-align:center; width:30px; border:1px solid var(--border);">' + r + '</td>';
            for (var c = 0; c < cols; c++) {
                var cellId = String.fromCharCode(65 + c) + r;
                html += '<td contenteditable="true" data-cell="' + cellId + '" onblur="RetoricaExcel.evalCell(this)" style="padding:6px; min-width:60px; border:1px solid var(--border); outline:none;"></td>';
            }
            html += '</tr>';
        }
        html += 'tbody></table>';

        editor.innerHTML = html;
    },

    addRow: function() {
        var table = document.getElementById('retorica-excel-table');
        if (!table) return;
        var tbody = table.querySelector('tbody');
        var cols = table.querySelector('thead tr').children.length - 1;
        var r = tbody.children.length + 1;

        var tr = document.createElement('tr');
        var html = '<td style="background:var(--bg-sidebar); font-weight:bold; text-align:center; width:30px; border:1px solid var(--border);">' + r + '</td>';
        for (var c = 0; c < cols; c++) {
            var cellId = String.fromCharCode(65 + c) + r;
            html += '<td contenteditable="true" data-cell="' + cellId + '" onblur="RetoricaExcel.evalCell(this)" style="padding:6px; min-width:60px; border:1px solid var(--border); outline:none;"></td>';
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
        th.style.cssText = "padding:4px; border:1px solid var(--border);";
        th.innerText = newColLetter;
        headerTr.appendChild(th);

        var rows = table.querySelectorAll('tbody tr');
        for (var r = 0; r < rows.length; r++) {
            var rNum = r + 1;
            var cellId = newColLetter + rNum;
            var td = document.createElement('td');
            td.setAttribute('contenteditable', 'true');
            td.setAttribute('data-cell', cellId);
            td.setAttribute('onblur', 'RetoricaExcel.evalCell(this)');
            td.style.cssText = "padding:6px; min-width:60px; border:1px solid var(--border); outline:none;";
            rows[r].appendChild(td);
        }
    },

    delRow: function() {
        var table = document.getElementById('retorica-excel-table');
        if (!table) return;
        var tbody = table.querySelector('tbody');
        if (tbody.children.length > 1) {
            tbody.removeChild(tbody.lastChild);
        }
    },

    delCol: function() {
        var table = document.getElementById('retorica-excel-table');
        if (!table) return;
        var headerTr = table.querySelector('thead tr');
        if (headerTr.children.length > 2) {
            headerTr.removeChild(headerTr.lastChild);
            var rows = table.querySelectorAll('tbody tr');
            for (var r = 0; r < rows.length; r++) {
                rows[r].removeChild(rows[r].lastChild);
            }
        }
    },

    getVal: function(cellRef) {
        var td = document.querySelector('td[data-cell="' + cellRef.toUpperCase() + '"]');
        if (!td) return 0;
        var val = parseFloat(td.getAttribute('data-formula-val') || td.innerText || 0);
        return isNaN(val) ? 0 : val;
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
            // Normalización de funciones según idioma
            expr = expr.replace(new RegExp(map.SUM + '\\((.*?)\\)', 'g'), function(m, arg) {
                var parts = arg.split(':');
                if (parts.length === 2) {
                    var start = parts[0].trim(), end = parts[1].trim();
                    var col = start.charAt(0);
                    var rStart = parseInt(start.substring(1)), rEnd = parseInt(end.substring(1));
                    var total = 0;
                    for (var i = rStart; i <= rEnd; i++) {
                        total += RetoricaExcel.getVal(col + i);
                    }
                    return total;
                }
                return 0;
            });

            // Reemplazo de referencias relativas A1, B2...
            expr = expr.replace(/[A-Z][0-9]+/g, function(ref) {
                return RetoricaExcel.getVal(ref);
            });

            // Soporte para porcentajes e IVA (SAT/Hacienda)
            expr = expr.replace(/([0-9.]+)\s*%/g, "($1/100)");
            expr = expr.replace(new RegExp(map.IVA, 'g'), "0.16");
            expr = expr.replace(new RegExp(map.SQRT + '\\((.*?)\\)', 'g'), "Math.sqrt($1)");

            var result = eval(expr);
            td.setAttribute('data-formula-val', result);
            td.innerText = result;
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

    exportXLSX: function() {
        var table = document.getElementById('retorica-excel-table');
        if (!table || typeof XLSX === 'undefined') {
            if (typeof RetoricaUI !== 'undefined') RetoricaUI.notify("Error: No se encontró la tabla o librería SheetJS");
            return;
        }
        var wb = XLSX.utils.table_to_book(table, { sheet: "Lista Precios" });
        var title = document.getElementById('editor-title').value.trim() || "Lista_Precios_Retorica";
        XLSX.writeFile(wb, title + ".xlsx");
        if (typeof RetoricaUI !== 'undefined') RetoricaUI.notify("Excel (.xlsx) exportado ✓");
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
        var title = document.getElementById('editor-title').value.trim() || "Lista_Precios_Lotus";
        saveAs(blob, title + ".csv");
        if (typeof RetoricaUI !== 'undefined') RetoricaUI.notify("CSV / Lotus exportado ✓");
    }
};
