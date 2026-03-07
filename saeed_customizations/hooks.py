
app_name = "saeed_customizations"
app_title = "Saeed Customizations"
app_publisher = "Saeed"
app_description = "Saeed"
app_email = "st@helpmobility.ca"
app_license = "mit"

asset_version = "1.2.37";

app_include_js = [
    "assets/saeed_customizations/js/desk.js?version=" + asset_version, 
    "assets/saeed_customizations/js/dispatch_orders_experience_follow_up.js?version=" + asset_version,
    "assets/saeed_customizations/js/call_log_report.js?version=" + asset_version
]
app_include_css = [
    "assets/saeed_customizations/css/desk.css?version=" + asset_version, 
    "assets/saeed_customizations/css/rc.css?version=" + asset_version
]

doctype_calendar_js = {"doctype" : "assets/saeed_customizations/js/events_calendar.js"}

has_permission = {
    "Event": "saeed_customizations.permissions.event_has_permission",
}

doc_events = {
    "rc_call": {
        "on_update": "saeed_customizations.rc_call_hooks.after_save_rc_call"
    },
    "Lead": {
        "after_save": "saeed_customizations.lead_hooks.after_lead_save"
    }

}
