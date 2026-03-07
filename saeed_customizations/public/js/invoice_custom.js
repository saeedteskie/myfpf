frappe.views.ListView = class CustomSalesInvoiceListView extends frappe.views.ListView {
    onload() {
        super.onload();
        if (this.doctype === 'Sales Invoice') {
            frappe.msgprint('Hello from Sales Invoice ListView');
        }
    }
};
