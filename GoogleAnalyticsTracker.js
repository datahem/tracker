/*
* Copyright (c) 2020 Robert Sahlin
*
* Use of this software is governed by the Business Source License included
* in the LICENSE file.
*
* Description: Custom task to copy GA payload and send to DataHem endpoints.
* Setup in Google Tag Manager (GTM):
* 1. Create a variable in google tag manager and name it "GA CustomTask"
* 2. Change the endpoints variable below to your collector endpoint, use comma separated string if you have more than one endpoint.
* 3. Set field for the Google Analytics Settings variable (in GTM) with field name "customTask" and value "{{GA CustomTask}}" 
* 4. Create version and publish it in GTM
*/

function() {
	return function(model) {
		
	    var globalSendTaskName = '_' + model.get('trackingId') + '_sendHitTask';
	    var originalSendHitTask = window[globalSendTaskName] = window[globalSendTaskName] || model.get('sendHitTask');
	    var endpoints = 'https://<collector host>/optimize/latency/topic'; // <-- Use comma separated string
      
	    model.set('sendHitTask', function(sendModel) {
	      var payload = sendModel.get('hitPayload');
          var body = {};
          body['payload'] = payload;
          try{
            originalSendHitTask(sendModel);
          }catch(e){
            console.log("error on payload");
            console.log(e);
          }          
	      	var i, len, endpointsArr = endpoints.split(",");
			for (len = endpointsArr.length, i=0; i<len; ++i) {
	      		var path = ((endpointsArr[i].substr(-1) !== '/') ? endpointsArr[i] + '/' : endpointsArr[i])
                var topic = model.get('trackingId').replace(/\W/g, '').toLowerCase();
	      		if(!navigator.sendBeacon(path + topic, JSON.stringify(body))){
                   	var beacon = document.createElement("img");
            		beacon.src = path.split('/')[2] + topic + '&' + payload;
		  	  	}
			}
		});
	};
}