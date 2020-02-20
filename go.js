var tableObj
var entries
var lastNumRes
var tableClasses = [
  Table3,
  Table4,
  Table6,
  Table7,
  Table8,
  TableC2,
  TableC3
]

$(document).ready(function() {
  $reportTable = $('#reportTable')
  
  for ( var i = 0; i < tableClasses.length; i++ ) {
    $('#table2Display').append($(`<option value=${i}>`).append(`Table ${tableClasses[i].name.replace(/[A-Z][a-z]+/, "")}`))
  }
})

function drawTable()
{
  $('#loader').show()
  resetTable()
  let tableType = $('#table2Display').val()
  var tableObj = new tableClasses[tableType]()
  setTimeout( function() { tableObj.draw() }, 50)
}
 
function resetTable()
{
  $(".table-div").hide()
  $reportTable.find('th:not(:first)').remove()
  $reportTable.find('tbody tr').remove()
}

function showEstimateWInterval(res, numDigitsAfterDecimal = 1, appendRisk = false)
{
  return `${res.q[1].toFixed(numDigitsAfterDecimal)} [${res.q[0].toFixed(numDigitsAfterDecimal)} - ${res.q[2].toFixed(numDigitsAfterDecimal)}]${appendRisk ? ` Overexposure risk: ${showRisk(res)}` : ""}`
}

function showRisk(res, idx = undefined) {
  if ( res.q.length == 3 ) {
    let risk = typeof idx === 'undefined' ? res.risk : res.risk[idx]
    return `${risk.toFixed(1)}%`
  } else {
     return res.risk
  }
}

function findExposerWorkers(workerResults)
{
  let minGm = Number.POSITIVE_INFINITY
  let leastExposed = null
  let maxGm = Number.NEGATIVE_INFINITY
  let mostExposed = null
  for ( var wid in workerResults ) {
    var gm = workerResults[wid].gMean.q[1]
    if ( gm < minGm ) {
      minGm = gm
      leastExposed = wid
    } else
    if ( gm > maxGm ) {
      maxGm = gm
      mostExposed = wid
    }
  }
  return { leastExposed, mostExposed }
}