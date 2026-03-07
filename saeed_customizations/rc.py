import frappe
from ringcentral import SDK
import json
import frappe

@frappe.whitelist()
def rc_request(endpoint, queryParams = {}, request = "get"):
    extension_id = "336148032";
  
    sdk = SDK(frappe.conf.ringcentral_client_id, frappe.conf.ringcentral_client_secret, 'https://platform.ringcentral.com')
    platform = sdk.platform()
    platform.login(jwt=frappe.conf.ringcentral_jwt)
    if request == "get":
        resp = platform.get(endpoint, queryParams)
    else:
        resp = platform.post(endpoint, queryParams)
    return resp

@frappe.whitelist()
def find_phone_number(phone_numbers = None, phone_number = None):
    if phone_number:
        test_numbers = [phone_number]
    elif phone_numbers:
        test_numbers = json.loads(phone_numbers);
    
    response_list = {};
    
    for test_number in test_numbers:
        test_number = str(test_number);
        response_list[test_number] = {
            "linked_documents": []
        }
        potential_contacts = frappe.get_all("Contact Phone", 
            fields=["parent", "phone"], 
            filters={
                "custom_standarized_number": ["like", "%" + test_number[-10:] + "%"]
            },
            page_length=20);
        
        for potential_contact in potential_contacts:
            linked_documents = frappe.get_all("Dynamic Link", filters={"parent": potential_contact.parent}, fields=["name", "parent", "link_doctype", "link_name", "link_title"]);
            for link in linked_documents:
                link["url"] = frappe.get_doc(link.link_doctype, link.link_name).get_url()
                link["phone"] = potential_contact.phone
                response_list[test_number]["linked_documents"].append(link)
    
    return response_list;
    # print(response_list)
