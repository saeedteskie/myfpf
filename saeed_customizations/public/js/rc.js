var rc_contact_card_call_details;

$("body").append( '<div class="rc_contact_card"> <div class="rc_contact_header"><span>Call with </span><span class="rc_contact_caller_number"></span></div> <div class="rc_contact_body"> <div class="rc_alert_box"></div> <form id="rc_call_log_quick_form" class="awesomplete"> <input type="text" class="input-with-feedback form-control" name="rc_contact_name" id="rc_contact_name" placeholder="Contact Name"> <select class="input-with-feedback form-control ellipsis" name="rc_call_purpose" id="rc_call_purpose"> <option>Sales</option> <option>Rent</option> <option>Administrative</option> </select> <select class="input-with-feedback form-control ellipsis" name="rc_call_result" id="rc_call_result"> <option>Opportunity</option> <option>Transferred</option> <option>Follow Up</option> <option>Other</option> </select> <textarea id="rc_contact_call_description" class="input-with-feedback form-control ellipsis" name="rc_contact_call_description" placeholder="Call Description" rows="4" cols="50"></textarea> <input class="btn btn-primary btn-sm primary-action" style="display: inline-block; background-color: #1e6821;" type="submit" value="Log call"> <button id="rc_close" class="btn rc_close" style="display: inline-block; border: 1px solid #1e6821; color: #1e6821; font-weight: 400;">Close</button> </form> <div name="rc_contact_name"></div> <div name="rc_contact_phone"></div> <!--<a href="#" name="rc_contact_link_info">Contact Details</a>--> </div> </div>' );

$(".rc_contact_header").on( "click", function() {
  $(".rc_contact_body").toggle("slow");
});

$("#rc_close").click(function() {
  $(".rc_contact_card").hide();
  event.preventDefault();
});

(function() {
    var rcs = document.createElement("script");
    var clientId = "0dIUsmFhAuGdas7ZR0G3KM";
    var appServer = "https://platform.ringcentral.com"
    var redirectUri = "https://apps.ringcentral.com/integration/ringcentral-embeddable/2.x/redirect.html"
    rcs.src = "https://apps.ringcentral.com/integration/ringcentral-embeddable/latest/adapter.js?disableContacts=1&disableMeeting=1&disconnectInactiveWebphone=1&defaultAutoLogCallEnabled=0&clientId="+clientId+"&appServer="+appServer+"&redirectUri="+redirectUri;
    var rcs0 = document.getElementsByTagName("script")[0];
    rcs0.parentNode.insertBefore(rcs, rcs0);
    
    
  })();


function logCall(data, call_management_details) {
    let date = new Date(data.startTime);

    let formatted_date = date.getFullYear() + "-" +
        String(date.getMonth() + 1).padStart(2, '0') + "-" +
        String(date.getDate()).padStart(2, '0') + " " +
        String(date.getHours()).padStart(2, '0') + ":" +
        String(date.getMinutes()).padStart(2, '0');
    
    posted_args = {
        "direction": data.call.direction,
        "from_phone_number": data.call.from.phoneNumber,
        "to_phone_number": data.call.to.phoneNumber,
        "party_id": data.call.partyId,
        "telephony_session_id": data.call.telephonySessionId,
        "call_owner": frappe.user.name,
        "start_time_unformatted": formatDateTimeFromTimestamp(data.call.startTime),
		"duration": data.call.duration / 60,
		"session_id": data.call.sessionId,
		"result": data.call.result
    }
    
    if(call_management_details.found_latest_action.related_doctype !== undefined && call_management_details.found_latest_action.related_doctype != "") {
        posted_args["party_type"] = call_management_details.found_latest_action.related_doctype;
    }
    
    if(call_management_details.found_latest_action.related_name !== undefined && call_management_details.found_latest_action.related_name != "") {
        posted_args["related_party"] = call_management_details.found_latest_action.related_name;
    }
    
    if(call_management_details.found_latest_action.details.doctype !== undefined && call_management_details.found_latest_action.details.doctype != "") {
        posted_args["related_document_type"] = call_management_details.found_latest_action.details.doctype;
    }
    
    if(call_management_details.found_latest_action.details.name !== undefined && call_management_details.found_latest_action.details.name != "") {
        posted_args["related_document"] = call_management_details.found_latest_action.details.name;
    }
    
    console.log("posted_args", posted_args)
    frappe.new_doc("Call", posted_args);
    session_im_logging = ""
}
function formatDateTimeFromTimestamp(timestamp) {
    const date = new Date(Number(timestamp)); // Ensure it's treated as a number
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Month is zero-indexed
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}`;
}

var registered = false;
window.addEventListener('message', function (e) {
  const data = e.data;
  // Register when widget is loaded
  if (data && data.type === 'rc-login-status-notify' && registered === false) {
    registered = true;
    document.querySelector("#rc-widget-adapter-frame").contentWindow.postMessage({
		type: 'rc-adapter-register-third-party-service',
		service: {
			name: 'Help Mobility',
			contactMatchPath: '/contacts/match',
			viewMatchedContactPath: '/contacts/view',
			contactMatchTtl: 2 * 60 * 60 * 1000, // optional, contact match data cache deleted time in seconds, default is 2 hours, supported from v1.10.2
			contactNoMatchTtl: 5 * 60 * 1000, // optional, contact match data expired in seconds, will re-match at next match trigger, default is 5 minutes, from v1.10.2	  
			callLoggerPath: '/callLogger',
    		callLoggerTitle: 'Log Call',
			callLogEntityMatcherPath: '/callLogger/match',
		}
	  }, '*');
  }
});
window.addEventListener('message', function (e) {
	var data = e.data;
	if (data && data.type === 'rc-post-message-request') {
	  if (data.path === '/callLogger/match') {
		// add your codes here to reponse match result
		console.log("Existing notes request.");
		// console.log("data.bodydata.body", data.body)
		// console.log(data); // get call session id list in here
		// response to widget
		frappe.call({
			method: 'rc_logs_sync', // path to the server-side method
			args: {
				session_ids: data.body.sessionIds,
				call_details: unlogged_sessions_call_details
			},
			callback: function(response) {
				console.log("rc_logs_sync response", response.response_list)
				matched_logs = response.response_list;
        		document.querySelector("#rc-widget-adapter-frame").contentWindow.postMessage({
        		  type: 'rc-post-message-response',
        		  responseId: data.requestId,
        		  response: {
        			data: matched_logs
        		  },
        		}, '*');
			}
		});
		
	  }
	}
  });

session_im_logging = "";
var unlogged_sessions_call_details = [];
window.addEventListener('message', async function (e) {
  const data = e.data;
  if (data && data.type === 'rc-webphone-connection-status-notify' && data.connectionStatus == "connectionStatus-connected") {
    try {
            const PER_PAGE = 100; // Number of calls per page
            const PAGE_NUMBER = 1; // Starting page number
            const { calls, hasMore } = await RCAdapter.getUnloggedCalls(PER_PAGE, PAGE_NUMBER);
            
            
            if(calls.length > 0) {
                to_double_check_sessions = [];
				to_double_check_call_details = [];
                // frappe.show_alert('You have ' + calls.length + " calls that have not been logged.", 20);

                calls.forEach(function(call_details) {
					// console.log("unlogged_call call_details", call_details);
					to_double_check_sessions.push(call_details.sessionId)
					call_details.startTime = formatDateTimeFromTimestamp(call_details.startTime);
					unlogged_sessions_call_details.push(call_details)
                });
                
                document.querySelector("#rc-widget-adapter-frame").contentWindow.postMessage({
                  type: 'rc-adapter-trigger-call-logger-match',
				sessionIds: to_double_check_sessions,
                }, '*');

            }
            
            
        } catch (error) {
            console.error("Error fetching unlogged calls:", error);
        }
  }
});




window.addEventListener('message', function (e) {
	var data = e.data;
	
	////// This event is the response to "Log Call" button on the call history page
	if (data && data.type === 'rc-post-message-request') {
		if (data.path === '/callLogger' && data.body.triggerType != undefined && data.body.triggerType == "createLog") {
    		if(session_im_logging == "" || session_im_logging != data.body.call.sessionId) {
    		    session_im_logging = data.body.call.sessionId
    		    frappe.call({
        			method: 'call_management', // path to the server-side method
        			args: {
        				type: data.body.call.direction,
        				call_from: data.body.call.from.phoneNumber,
        				call_to: data.body.call.to.phoneNumber,
        				partyId: data.body.call.partyId,
        				sessionId: data.body.call.sessionId,
        				action: "fetch_info"
        			},
        			callback: function(response) {
        				call_management_details = response;
        				logCall(data.body, call_management_details);
        			}
        		});
    		}
    		
    		// response to widget
    		document.querySelector("#rc-widget-adapter-frame").contentWindow.postMessage({
    			type: 'rc-post-message-response',
    			responseId: data.requestId,
    			response: { data: 'ok' },
    		}, '*');
		}
	}
});

window.addEventListener('message', function (e) {
	var data = e.data;
	if (data && data.type === 'rc-post-message-request') {
		if (data.path === '/contacts/match') {
    		console.log("Trying to match contacts of incoming call"); // include phone number array that need to match
    		console.log(data.body.phoneNumbers); // include phone number array that need to match
    		frappe.call({
    			method: 'rc_contacts_sync', // path to the server-side method
    			args: {
    				phone_numbers: data.body.phoneNumbers
    			},
    			callback: function(response) {
    				console.log("rc_contacts_sync response", response.response_list)
    				matched_contacts = response.response_list;
            		document.querySelector("#rc-widget-adapter-frame").contentWindow.postMessage({
            			type: 'rc-post-message-response',
            			responseId: data.requestId,
            			response: {
            			    data: matched_contacts
            			},
            		}, '*');
    			}
    		});
    		
		}
	}
});
//////////////////////////////////////////////////////// //////////////////////////////////////////////////////// //////////////////////////////////////////////////////// 
//////////////////////////////////////////////////////// Response to Contact Details Page //////////////////////////////////////////////////////// 
//////////////////////////////////////////////////////// //////////////////////////////////////////////////////// //////////////////////////////////////////////////////// 
window.addEventListener('message', function (e) {
  var data = e.data;
  if (data && data.type === 'rc-post-message-request') {
    if (data.path === '/contacts/view') {
      window.open("https://erp.helpmobility.ca/app/contact/" + data.body.id,'_blank');
      
      document.querySelector("#rc-widget-adapter-frame").contentWindow.postMessage({
        type: 'rc-post-message-response',
        responseId: data.requestId,
        response: 'ok',
      }, '*');
    }
  }
});

//////////////////////////////////////////////////////// //////////////////////////////////////////////////////// //////////////////////////////////////////////////////// 
//////////////////////////////////////////////////////// When Call Is Answered //////////////////////////////////////////////////////// 
//////////////////////////////////////////////////////// //////////////////////////////////////////////////////// //////////////////////////////////////////////////////// 
window.addEventListener('message', (e) => {
	const data = e.data;
	switch (data.type) {
		case 'rc-active-call-notify':
    		if(data.call.telephonyStatus == "CallConnected") {
    		    console.log("datadatadatadata", data)
    		    rc_contact_card_call_details = data.call;
    		    if(rc_contact_card_call_details.direction == "Inbound") {
    		        $(".rc_contact_caller_number").text(rc_contact_card_call_details.from.phoneNumber);
    		    }else{
    		        $(".rc_contact_caller_number").text(rc_contact_card_call_details.to.phoneNumber);
    		    }
		        
		        $("#rc_contact_name").val("");
		        $("#rc_call_purpose").val("Sales");
		        $("#rc_call_result").val("Opportunity");
		        $("#rc_contact_call_description").val("");
			$(".rc_alert_box").text("");
			$(".rc_contact_card").show("slow");
			$(".rc_alert_box").hide();
    		}
    		break;
    		
    	case 'rc-call-end-notify':
    	    $(".rc_alert_box").text("Call has ended. It is best practice to log the call details immediately to avoid missing critical information.");
    	    $(".rc_alert_box").show();
    	    $(".rc_contact_body").show("slow");

    		break;
		default:
		    break;
	}
  
    
});


$( "#rc_call_log_quick_form" ).on( "submit", function( event ) {
  console.log("rc_contact_card_call_details", rc_contact_card_call_details);
  console.log($('#rc_contact_call_description').val())
  console.log($('#rc_call_purpose').val())
  console.log($('#rc_call_result').val())
  frappe.call({
		method: 'call_management', // path to the server-side method
		args: {
			type: rc_contact_card_call_details.direction,
			call_from: rc_contact_card_call_details.from.phoneNumber,
			call_to: rc_contact_card_call_details.to.phoneNumber,
			partyId: rc_contact_card_call_details.partyId,
			session_id: rc_contact_card_call_details.sessionId,
			telephony_session_id: rc_contact_card_call_details.telephonySessionId,
			start_time: formatDateTimeFromTimestamp(rc_contact_card_call_details.startTime),
			result: rc_contact_card_call_details.result,
			call_description: $('#rc_contact_call_description').val(),
			call_purpose: $('#rc_call_purpose').val(),
			call_result: $('#rc_call_result').val(),
			action: "rc_log_form"
		},
		callback: function(response) {
			console.log("Auto Log Function response: ", response);
			$(".rc_contact_card").hide("slow");
			frappe.show_alert('Call has been logged. Thank you!', 10);
			
		}
	});
  event.preventDefault();
});
