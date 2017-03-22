var ProblemModel = require("../models/problem-model")

var getProblems = function() {
  return new Promise( (resolve,reject) => {
  //  resolve(problems);
    ProblemModel.find({}, function(err, problems){
      if(err){
        reject(err);
      }else {
        resolve(problems);
      }
    })
})
}


var getProblem = function(id) {
  return new Promise( (resolve,reject) => {
  ProblemModel.findOne({id: id}, function(err, problem){
    if(err){
      reject(err);
    }else {
      resolve(problem);
    }
  })
})
}

var addProblem = function(newProblem) {
  return new Promise((resolve, reject) => {
    ProblemModel.findOne({name: newProblem.name}, function(err, problem){
      if(problem){
        reject("Problem already exists!");
      }else {
        ProblemModel.count({}, function(err, number) {
          newProblem.id = number + 1;
          var mongoProblem = new ProblemModel(newProblem);
          mongoProblem.save();
          resolve(newProblem);
        })
      }
    })
  })
}
module.exports = {
  getProblems: getProblems,
  getProblem: getProblem,
  addProblem: addProblem
}
