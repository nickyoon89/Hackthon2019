var employees = new Array();
var departments = new Array();

var fs = require('fs');
var exports = module.exports = {};

exports.initialize = function() {
    fs.readFile('data/employees.json', 'utf-8', (err, data) => {employees = JSON.parse(data);});
    fs.readFile('data/departments.json', 'utf-8', (err, data) => {departments = JSON.parse(data);});

    return new Promise((resolve, reject) => {
        resolve("Init Success");
        reject("unable to read data");
    });
};

exports.getAllEmployees = function(){
    return new Promise((resolve, reject) => {
        resolve(employees);
        if(employees.length == 0)
        reject("no results returned");
    });
};

exports.getDepartments = function(){
    return new Promise((resolve, reject) => {
        resolve(departments);
        if (departments.length == 0)
        reject("no results returned");
    });

};  

exports.getEmployeesByStatus = function(status){
    return new Promise((resolve, reject) => {
        let filteredEmployees = employees.filter(employees => employees.status == status);
        resolve(filteredEmployees);
        if(filteredEmployees.length == 0)
        reject("no results returned");
    });
}
exports.updateEmployee = function(employeeData){
    return new Promise((resolve, reject) => {
        employeeData.isManager = (employeeData.isManager) ? true : false;
        return new Promise((resolve, reject) => {
            employees.forEach(employee => {
                if (employee.employeeNum == employeeData.employeeNum) {
                    employees.splice(employeeData.employeeNum - 1, 1, employeeData);
                }
            });
            resolve();
        });
    });
};

//valid accounts
exports.checkUser = function (userData) {
    return new Promise((resolve, reject) => {
    departments.map((i)=>{
        if(i.userName===userData.userName){
        if (i.length === 0) {
            reject("Unable to find user: " + userData.userName);
        } else {
            if (userData.password != i.password)
                reject("Incorrect password: " + userData.userName);
            else
                resolve(i);
        }
    }
        else{reject("Unable to find user: " + userData.userName); }
    
    })
    .catch(() => reject("Unable to find user: " + userData.userName));
    
})};

