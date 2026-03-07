import frappe

def after_lead_save(doc, method):
    frappe.publish_realtime('new_lead_added_sales_center', data={"doc": doc})
