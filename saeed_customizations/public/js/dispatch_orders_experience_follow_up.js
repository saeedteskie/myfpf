frappe.query_reports["Dispatch Orders Experience Follow Up"] = {
  filters: [],
  onload(report) {
    // add an action button to visit ToDo List View
    // console.log("Script is here");
  },
  formatter(value, row, column, data, default_formatter) {
    if (column.fieldname == "actions") {
        const button_html = `<button style="background-color: #f4f4f4;" class="btn btn-default btn-xs" onclick="frappe.query_reports['Dispatch Orders Experience Follow Up'].experience_record('${data.dispatch_id}')">Complete Experience Record</button>`;
        value = button_html;
    }
    return default_formatter(value, row, column, data);
    
    
  },
  experience_record(order_id) {
    // console.log("triggered data" + order_id);
    frappe.call({
          method: 'frappe.client.get',
          args: {
              doctype: 'Dispatch Order',
              name: order_id
          },
          callback: function(dispatch_details) {
              console.log("dispatch_details", dispatch_details.message)
              if (dispatch_details.message) {
                  frappe.new_doc('Experience Record', {
                      party_type: 'Customer',
                      party: dispatch_details.message.customer,
                      mode: 'Experience Follow Up',
                      received_by: frappe.session.user
                  }).then(new_doc => {
                      new_row = cur_frm.add_child('related_sales_documents');
                      new_row.sales_document_type = 'Dispatch Order';
                      new_row.sales_document = order_id;

                      new_row = cur_frm.add_child('related_sales_documents');
                      new_row.sales_document_type = dispatch_details.message.document_type;
                      new_row.sales_document = dispatch_details.message.document_id;
                    
                      cur_frm.refresh_field('related_sales_documents');
                  });
              }
          }
      });
    

  },
};
