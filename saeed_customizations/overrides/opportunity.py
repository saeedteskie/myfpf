import frappe
from frappe.model.document import Document

class CustomOpportunity(Document):
    def onload(self):
        """Automatically append related Event names when Opportunity is loaded."""
        print("testing, hello world!");
        events = [1,2,3,4]

        # Add events to the document as a list of event names
        self.set_onload("events", events)
