"use strict"

let postabular = require("postabular")
let _ = require("lodash")
let fs = require("fs")

module.exports = postabular.plugin('column-type', function(tabular, result) {
    tabular.meta["visualization_hint"] = {}
    tabular.eachColumn((col, colIdx) => {
        let counter = {}
        col.eachCell((cell) => {
            if (_.isUndefined(counter[cell.value])) { counter[cell.value] = 0 }
            counter[cell.value] += 1
        })

        if (_.keys(counter).length < Math.ceil(tabular.size().row * 0.05)) {
            tabular.meta["visualization_hint"][colIdx] = "small key space"
        }
    })

    console.log(tabular.meta)

    _.forEach(tabular.meta["visualization_hint"], (hint, colIdx) => {
        if (hint === "small key space") {
            let counter = {}
            // generate counting visualization
            tabular.getColumn(colIdx).eachCell((cell) => {
                if (_.isUndefined(counter[cell.value])) { counter[cell.value] = 0 }
                counter[cell.value] += 1
            })
            let data = _.sortBy(_.keys(counter).map((k) => { return [k, counter[k]] }), (x) => { return x[1] })

            let render_data = {
                  labels: _.map(data, x => x[0]),
                  datasets: [{
                    label: "My First dataset",
                    fillColor: "rgba(220,220,220,0.2)",
                    strokeColor: "rgba(220,220,220,1)",
                    pointColor: "rgba(220,220,220,1)",
                    pointStrokeColor: "#fff",
                    pointHighlightFill: "#fff",
                    pointHighlightStroke: "rgba(220,220,220,1)",
                    data: _.map(data, x => x[1])
                  }]
            }
            let tmpl = fs.readFileSync('small_key_space_counting.html').toString()
            fs.writeFileSync(`small_key_space_${colIdx}.html`, _.template(tmpl)({data: JSON.stringify(render_data), header: JSON.stringify(tabular.getHeader(colIdx).value)}))
        }
    })
})
