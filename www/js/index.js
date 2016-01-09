// (c) 2014 Don Coleman
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.0000dfb1-0000-1000-8000-00805f9b34fb

/* global mainPage, deviceList, refreshButton */
/* global detailPage, resultDiv, messageInput, sendButton, disconnectButton */
/* global ble, cordova  */
/* jshint browser: true , devel: true*/
'use strict';

// ASCII only
function bytesToString(buffer) {
    return String.fromCharCode.apply(null, new Uint8Array(buffer));
}

// ASCII only
function stringToBytes(string) {
    var array = new Uint8Array(string.length);
    for (var i = 0, l = string.length; i < l; i++) {
        array[i] = string.charCodeAt(i);
    }
    return array.buffer;
}

// this is RedBear Lab's UART service
var redbear = {
   
    serviceUUID: "dfb0",
    txCharacteristic: "dfb1", // transmit is from the phone's perspective
    rxCharacteristic: "dfb1"

};

var app = {
    initialize: function() {
        this.bindEvents();
        detailPage.hidden = true;
    },

    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
        refreshButton.addEventListener('touchstart', this.refreshDeviceList, false);
        sendButton.addEventListener('click', this.sendData, false);
        disconnectButton.addEventListener('touchstart', this.disconnect, false);
        deviceList.addEventListener('touchstart', this.connect, false); // assume not scrolling
    },

    onDeviceReady: function() {
        app.refreshDeviceList();
    },

    refreshDeviceList: function() {
        console.log('Scanning starts...');
        deviceList.innerHTML = ''; // empties the list
        
        if (cordova.platformId === 'android') { // Android filtering is broken
            console.log('Android device found');
            ble.scan([], 2, app.onDiscoverDevice, app.onError);
        } else {
            console.log('iOs device found');
            ble.scan([redbear.serviceUUID], 2, app.onDiscoverDevice, app.onError);
        }
    },

    onDiscoverDevice: function(device) {
        
        var listItem = document.createElement('li'),
            html = '<b>' + device.name + '</b><br/><b>Device id</b>: ' + device.id;
        
        listItem.dataset.deviceId = device.id;
        listItem.innerHTML = html;
        deviceList.appendChild(listItem);
    },

    connect: function(e) {

        var deviceId = e.target.dataset.deviceId;
        
        var onConnect = function(device) {
                // subscribe for incoming data                
                sendButton.dataset.deviceId = deviceId;
                disconnectButton.dataset.deviceId = deviceId;
                app.showDetailPage();
            };
        ble.connect(deviceId, onConnect, app.onError);
    },

    onData: function(data) { // data received from Arduino
        console.log(data);
        resultDiv.innerHTML = resultDiv.innerHTML + "Received: " + bytesToString(data) + "<br/>";
        resultDiv.scrollTop = resultDiv.scrollHeight;
    },
    
    sendData: function(event) { // send data to Arduino

        var success = function(data) {
            console.log("success");
            resultDiv.innerHTML = resultDiv.innerHTML + "Sent: " + messageInput.value + "<br/>";
            resultDiv.scrollTop = resultDiv.scrollHeight;
        };

        var failure = function() {
            alert("Failed writing data to the redbear hardware");
        };

        var readsuccess = function(data) {
            alert('hello');
            resultDiv.innerHTML = resultDiv.innerHTML + "Read: " + bytesToString(data) + "<br/>";
            resultDiv.scrollTop = resultDiv.scrollHeight;  
        };

        console.log('Sending data');
        var data = stringToBytes(messageInput.value);
        var deviceId = event.target.dataset.deviceId;
        
        ble.write(deviceId, redbear.serviceUUID, redbear.txCharacteristic, data, success, app.onError);
        //ble.read(deviceId, redbear.serviceUUID, redbear.txCharacteristic, readsuccess, app.onError);
        ble.startNotification(deviceId, redbear.serviceUUID, redbear.txCharacteristic, readsucess, app.onError);
        
    },

    disconnect: function(event) {
        var deviceId = event.target.dataset.deviceId;
        ble.disconnect(deviceId, app.showMainPage, app.onError);
    },

    showMainPage: function() {
        mainPage.hidden = false;
        detailPage.hidden = true;
    },

    showDetailPage: function() {
        mainPage.hidden = true;
        detailPage.hidden = false;
    },
    
    onError: function(reason) {
        alert("ERROR: " + reason); // real apps should use notification.alert
    }
};
