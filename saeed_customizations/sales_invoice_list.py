import frappe

def get_context(context):
    current_user = frappe.session.user
    user_ids = [current_user]

    # Fetch users reporting to the current user
    employees = frappe.get_all('Employee', filters={'reports_to': current_user}, fields=['user_id'])
    for employee in employees:
        user_ids.append(employee.user_id)

    # Fetch Sales Invoices created by the current user or users reporting to them
    invoices = frappe.get_all('Sales Invoice', filters={'owner': ['in', user_ids]}, fields=['name', 'posting_date', 'customer', 'grand_total', 'owner'])

    context.invoices = invoices
    frappe.msgprint(f"Filtered {len(invoices)} invoices for user {current_user}")
