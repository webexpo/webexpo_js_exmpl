var tableObj
var entries

$(document).ready(function() {
  $reportTable = $('#reportTable')
  let tableNos = [3,4]
  tableNos.forEach(function(i) {
    $('#table2Display').append($(`<option value=${i}>`).append(`Table ${i}`))
  })
})

function drawTable()
{
  $('#loader').show()
  resetTable()
  let tableType = $('#table2Display').val()
  switch(tableType) {
    case '3' :
      tableObj = new Table3()
      break
    case '4' :
      tableObj = new Table4()
      break
  }
  setTimeout( function() { tableObj.draw() }, 50)
}
 
function resetTable()
{
  $(".table-div").hide()
  $reportTable.find('th:not(:first)').remove()
  $reportTable.find('tbody tr').remove()
}

function showEstimateWInterval(res, numDigitsAfterDecimal = 1)
{
  return `${res.q[1].toFixed(numDigitsAfterDecimal)} [${res.q[0].toFixed(numDigitsAfterDecimal)} - ${res.q[2].toFixed(numDigitsAfterDecimal)}]`
}