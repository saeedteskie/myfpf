import concurrent.futures
import requests
import frappe

@frappe.whitelist()
def make_get_request_with_timeout(url, params=None, headers=None, timeout_seconds=10):
    """
    Drop-in replacement for frappe.make_get_request with a hard timeout.
    
    Args:
        url (str): The URL to fetch.
        params (dict): Query parameters (mirrors frappe.make_get_request's `params`).
        headers (dict): Request headers.
        timeout_seconds (int): Hard timeout for the entire request.
    
    Returns:
        dict: Parsed JSON response, same as frappe.make_get_request.
    
    Raises:
        frappe.ValidationError: If the request times out or fails.
    """

    def _do_request():
        response = requests.get(url, params=params or {}, headers=headers or {})
        response.raise_for_status()
        return response.json()

    with concurrent.futures.ThreadPoolExecutor(max_workers=1) as executor:
        future = executor.submit(_do_request)

        try:
            return future.result(timeout=timeout_seconds)

        except concurrent.futures.TimeoutError:
            future.cancel()
            frappe.log_error(
                f"GET request to {url} timed out after {timeout_seconds}s",
                "Request Timeout"
            )
            frappe.throw(
                f"Request timed out after {timeout_seconds} seconds.",
                frappe.ValidationError
            )

        except requests.exceptions.HTTPError as e:
            frappe.log_error(str(e), "HTTP Error")
            frappe.throw(f"HTTP error: {e.response.status_code}", frappe.ValidationError)

        except Exception as e:
            frappe.log_error(str(e), "Request Error")
            frappe.throw(f"Request failed: {str(e)}", frappe.ValidationError)
