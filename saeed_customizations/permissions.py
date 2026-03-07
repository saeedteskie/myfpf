def event_has_permission(doc, user=None, permission_type=None):
    # # when reading a document allow if event is Public
    # if permission_type == "read" and doc.event_type == "Public":
    #     return True

    # # when writing a document allow if event owned by user
    # if permission_type == "write" and doc.owner == user:
    #     return True
    if permission_type == "read" and doc.event_type == "Private":
        employee_name = frappe.db.get_value("Employee", {"user_id": user}, "name");
        
        if employee_name:
            particpants = frappe.get_all("Event Participants", 
                filters={
                    "parent": doc.name
                },
                fields = ["reference_docname"],
                pluck='reference_docname'
            )
            if employee_name in particpants:
                return True;
            else:
                return False;

# def event_get_permission_query_conditions(user):
#     return True;
