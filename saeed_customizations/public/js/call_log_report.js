frappe.query_reports["Call Log"] = {
  filters: [
    {
      fieldname: "user", label: "User", fieldtype: "Link", options: "User"
    },
    {
      fieldname: "from_date", label: __("From Date"), fieldtype: "Date",
      reqd: 1
    },
    {
      fieldname: "to_date", label: __("To Date"), fieldtype: "Date",
      reqd: 1
    },
    
  ],
  onload(report) {
    // add an action button to visit ToDo List View
    // console.log("Script is here");
  },
  formatter(value, row, column, data, default_formatter) {
    if (column.fieldname == "actions") {
        const button_html = `<button style="background-color: #f4f4f4;" class="btn btn-default btn-xs" onclick="frappe.query_reports['Call Log'].listen_to_recording('${data.name}')">Listen</button>`;
        value = button_html;
    }
    return default_formatter(value, row, column, data);
    
    
  },
  listen_to_recording(call_name) {
    console.log("triggered data" + call_name);
    frappe.call({
          method: 'frappe.client.get',
          args: {
              doctype: 'rc_call',
              name: call_name
          },
          callback: function(call_details) {
              console.log("call_details", call_details.message)
              if (call_details.message && call_details.message.recording_id) {
                  frappe.msgprint(`
                    <div>
                        <audio controls autoplay>
                            <source src="https://erp.helpmobility.ca/api/method/rc?type=get_recording_by_id&recording_id=` + call_details.message.recording_id + `" type="audio/mpeg">
                        </audio>
                    </div>
                    `)
              }else{
                frappe.msgprint("Recording not found;")
              }
          }
      });
    

  },
};
