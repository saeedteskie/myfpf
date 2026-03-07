frappe.views.calendar["Event"] = {
    onload: function(calendar_view) {
        console.log("Calendar View Loaded");
    },
    refresh: function(calendar_view) {
        console.log("Calendar View Refreshed");
    }
};
