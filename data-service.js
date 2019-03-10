var employees = new Array();
var departments = new Array();

var fs = require('fs');
var usb= require('usb');
const os=require('os');
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
    let nowDate = new Date().toISOString().
        replace(/T/, ' ').      // replace T with a space
        replace(/\..+/, '')     // delete the dot and everything after
    return new Promise((resolve, reject) => {
    departments.map((i)=>{
        if(i.userName==userData.userName){
            if (userData.password != i.password)
                reject("Incorrect password: " + userData.userName);
            else{
                let exp = new Date(i.expireDate);
                let today=new Date();
                if(exp>=today)
                {
                    employees[employees.length] = {
                        "employeeNum": userData.userName,
                        "firstName": i.firstName,
                        "lastName": i.lastName,
                        "fLogin": nowDate,
                        "v": "LLW3.1.3",
                        "addressStreet": "8 Arapahoe Park",
                        "addressCity": "New York",
                        "addressState": "NY",
                        "addressPostal": "20719",
                        "ipAddress": "74.12.103.238",
                        "isManager": true,
                        "employeeManagerNum": null,
                        "machineName": os.hostname(),
                        "isp": "Bell Canada",
                        "hireDate": "4/30/2014",
                    }
                    fs.writeFile('data/employees.json', JSON.stringify(employees), function (err) {
                        if (err) return console.log(err);
                    });
                    // Ideally should be both variables stored in user data
                    var connected = usb.findByIds(1256, i.usbId)
                    // If device is not found for given user reject
                    //if (connected == undefined) { reject("usb not connected") }
                    resolve(i);
                }
                else{
                    reject("Certificate Expired: " + i.expireDate);
                }
            }              
        }
    })    
    reject("Unable to find user: " + userData.userName);
})};
