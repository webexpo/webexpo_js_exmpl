$(document).ready(function() {
  zygotine.SEG.setDataEntries(true)
  zygotine.SEG.initDataEntries()
  zygotine.SEG.setDataVal({
    obsValues: ["24.7", "64.1", "13.8", "43.7", "19.9", "133", "32.1", "15", "53.7"],
    oel: "100"
  })
  
  let model = new zygotine.SEG.Model()
  model.validate()
  if (!model.hasError) {
    model.doCalculation()
    let result = model.result
    let numRes = zygotine.X.getNumericalResult(model.logN,
                                               result.chains.muSample.data,
                                               result.chains.sdSample.data,
                                               model.oel,
                                               model.confidenceLevelForCredibileInterval,
                                               model.fracThreshold,
                                               model.percOfInterest)
    console.log(numRes.gMean.q)
  }
})