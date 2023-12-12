
// Init
(function() {
    document.body.onload = generateGrid;
    // document.getElementById("printMatrix").onclick = printMatrix;
    // document.getElementById("toggleResult").onclick = () => Table.toggleContent(document.getElementsByClassName("C")[0]);
})();

function printElement(e) {
    let cloned = e.cloneNode(true);
    document.body.appendChild(cloned);
    cloned.classList.add("printable");
    window.print();
    document.body.removeChild(cloned);
}

function printMatrix() {
    const matrix = document.getElementsByClassName("matrix-multiplication")[0];
    printElement(matrix);
}

function generateGrid() {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);

    let A = urlParams.get('A').split(',').map((i => parseInt(i)));
    let B = urlParams.get('B').split(',').map((i => parseInt(i)));
    let hide = urlParams.get('hide');
    let fill = urlParams.get('fill');
    let seed = urlParams.get('seed')

    let fillFunction = fillFunctions[fill](seed);
    let matrices = {
        A: Matrix.new(A[0], A[1], fillFunction), 
        B: Matrix.new(B[0], B[1], fillFunction),
        C: {}
    }
    matrices['C'] = Matrix.multiply(matrices['A'], matrices['B'])

    let displayDiv = document.getElementById("wrapper");
    displayDiv.innerHTML = "";

    let wrapper = document.createElement("div");
    wrapper.className = "matrix-multiplication";
    for (const key in matrices) {
        let X = document.createElement("div");
        X.className = key;
        X.appendChild(Table.new(matrices[key], "matrix-table"))
        wrapper.appendChild(X);
    }

    displayDiv.appendChild(wrapper)

    hide.split('').filter(param => "ABC".includes(param)).forEach(toHide => Table.toggleContent(document.getElementsByClassName(toHide)[0]))
}

function seededRandom(seed) {
    seed = String(seed).split("").reduce((acc, curr) => acc + curr.charCodeAt(0), 0)
    return () => {
        // Constants for the LCG algorithm
        const a = 1664525;
        const c = 1013904223;
        const m = 2 ** 32;

        // Update the seed and return a value between 0 and 1
        seed = (a * seed + c) % m;
        return seed / m;
    }
}

const fillFunctions = {
    random : (seed) => {
        let random = seed ? seededRandom(seed) : Math.random
        return () => Math.floor(random()*10)
    },
    index : () => (r, c) => r + c + 1 
}

const Matrix = {
    new : function(cols, rows, fill = (row, col) => 0) {
        return [...Array(rows)].map((_, row) => 
            [...Array(cols)].map((_, col) => fill(row, col)));
    },

    transpose : function(matrix) {
        return this.new(matrix[0].length, matrix.length, (row, col) => matrix[col][row])
    },

    multiply : function(matrixA, matrixB) {
        let matrixCalcMapping;
        if (matrixA[0].length !== matrixB.length) {
            matrixCalcMapping = () => undefined
        }
        else {
            matrixCalcMapping = (row, col) => [...matrixA[row].keys()]
                .reduce((acc, curr) => acc + matrixA[row][curr]*matrixB[curr][col], 0);
        }    

        return this.new(matrixB[0].length, matrixA.length, matrixCalcMapping);
    }
}

const Table = {
    new : function(matrix, className = "") {
        let table = document.createElement("table");
        table.className = className
        for (const row of matrix) {
            let tableRow = document.createElement("tr");
            for (const value of row) {
                let tableData = document.createElement("td");
                tableData.dataset.value = value;
                tableData.innerHTML = value;
                tableRow.appendChild(tableData);
            }
        table.appendChild(tableRow);
        }
        return table;
    },
    toggleContent : function(table) {
        table.querySelectorAll("td")
            .forEach(td => td.innerHTML == "" ? td.innerHTML = td.dataset.value : td.innerHTML = "");
    }
}
