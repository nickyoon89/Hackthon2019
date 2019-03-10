var employees = new Array();
var departments = new Array();
var curLocation = new Array();
var city;
var fingerPrint;

var fs = require('fs');
var usb= require('usb');
var os=require('os');
var cities = require('cities');

var exports = module.exports = {};
var sab = new SharedArrayBuffer(1024);
var int32 = new Int32Array(sab);

exports.initialize = function() {
    fs.readFile('data/logInfo.json', 'utf-8', (err, data) => {employees = JSON.parse(data);});
    fs.readFile('data/userInfo.json', 'utf-8', (err, data) => {departments = JSON.parse(data);});
    fs.readFile('data/curLoc.json', 'utf-8', (err, data) => {curLocation = JSON.parse(data);});
    if (fs.existsSync('D:/fingerPrint.json')) {
        fs.readFile('D:/fingerPrint.json', 'utf-8', (err, data) => {fingerPrint = JSON.parse(data);});
    }
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

exports.getAllLocation = function(){
    return new Promise((resolve, reject) => {
        resolve(curLocation);
        if(curLocation.length == 0)
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

//valid accounts
exports.checkUser = function (userData) {
    let nowDate = new Date()
    nowDate.setHours(nowDate.getHours()-4);
    nowDate=nowDate.
                toISOString().
                replace(/T/, ' ').      // replace T with a space
                replace(/\..+/, '')     // delete the dot and everything after
    let computerName = os.hostname();
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
                    if(computerName==i.deviceId){ 
                        var connected = usb.findByIds(i.bndId, i.usbId);
                        if (connected == undefined) { reject("No Proper Validator Detected"); }
                        else{
                        //Atomics.wait(int32, 0, 0, 3000);
                        if (fingerPrint.detectedFingerPrint!=i.fingerprt) { 
                            reject("Fingerprint Not Matched")
                        } 
                        else{                    
                            curLocation.map((j)=>{
                                if(j.usbId==i.usbId){
                                    if(cities.gpsLookup(j.lat,j.lon).city == i.addressCity & cities.gpsLookup(j.lat,j.lon).state_abbr == i.addressState){
                                        employees[employees.length] = {
                                            "employeeNum": userData.userName,
                                            "firstName": i.firstName,
                                            "lastName": i.lastName,
                                            "fLogin": nowDate,
                                            "addressCity": i.addressCity,
                                            "addressState": i.addressState,
                                            "machineName": os.hostname()
                                        }
                                        fs.writeFile('data/logInfo.json', JSON.stringify(employees), function (err) {
                                        });
                                        resolve(i);
                                    }
                                    city = cities.gpsLookup(j.lat,j.lon).city;                                
                                }  
                            })  
                        }
                        reject(city + " is Not Athorized Area");
                        }                      
                    }
                    else{
                        reject("Device: " + computerName+" is Not registered");
                    } 
                }
                else{
                    reject("Certificate Expired: " + i.expireDate);
                }
            }              
        }
    })    
    reject("Unable to find user: " + userData.userName);
})};

