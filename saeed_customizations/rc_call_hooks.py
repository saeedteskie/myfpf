import frappe

def after_save_rc_call(doc, method):
    # Your custom logic here
    # frappe.logger().info(f"rc_call saved with ID: {doc.name}")
    frappe.publish_realtime('sales_center_rc_call_socket', {'rc_call': doc, "method": method});
    # frappe.msgprint("Hi there");
    # print("hello");
