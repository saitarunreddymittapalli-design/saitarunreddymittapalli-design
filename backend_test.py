import requests
import sys
import json
from datetime import datetime

class FNOLAPITester:
    def __init__(self, base_url="https://fnol-automation-test.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []
        self.results = {}

    def run_test(self, name, method, endpoint, expected_status=200, data=None, validate_response=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=30)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=30)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=30)

            success = response.status_code == expected_status
            
            if success:
                try:
                    response_data = response.json()
                    if validate_response and not validate_response(response_data):
                        success = False
                        print(f"❌ Failed - Response validation failed")
                        self.failed_tests.append(f"{name}: Response validation failed")
                    else:
                        self.tests_passed += 1
                        print(f"✅ Passed - Status: {response.status_code}")
                        if len(str(response_data)) > 200:
                            print(f"   Response: {str(response_data)[:200]}...")
                        else:
                            print(f"   Response: {response_data}")
                except json.JSONDecodeError:
                    success = False
                    print(f"❌ Failed - Invalid JSON response")
                    self.failed_tests.append(f"{name}: Invalid JSON response")
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                print(f"   Response: {response.text[:200]}...")
                self.failed_tests.append(f"{name}: Expected {expected_status}, got {response.status_code}")

            self.results[name] = {
                "status": "PASS" if success else "FAIL",
                "status_code": response.status_code,
                "expected_status": expected_status,
                "response_size": len(response.text) if response.text else 0
            }

            return success, response.json() if success and response.text else {}

        except requests.exceptions.Timeout:
            print(f"❌ Failed - Request timeout")
            self.failed_tests.append(f"{name}: Request timeout")
            self.results[name] = {"status": "FAIL", "error": "Timeout"}
            return False, {}
        except requests.exceptions.ConnectionError:
            print(f"❌ Failed - Connection error")
            self.failed_tests.append(f"{name}: Connection error")
            self.results[name] = {"status": "FAIL", "error": "Connection error"}
            return False, {}
        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            self.failed_tests.append(f"{name}: {str(e)}")
            self.results[name] = {"status": "FAIL", "error": str(e)}
            return False, {}

    def validate_kpi_metrics(self, data):
        """Validate KPI metrics response structure"""
        required_fields = ['avg_resolution_time', 'auto_route_success_rate', 'escalation_rate', 
                          'total_claims', 'open_claims', 'closed_claims', 'escalated_claims']
        return all(field in data for field in required_fields)

    def validate_claims_list(self, data):
        """Validate claims list response"""
        if not isinstance(data, list) or len(data) == 0:
            return False
        
        # Check first claim has required fields
        claim = data[0]
        required_fields = ['id', 'claim_number', 'policyholder', 'policy_number', 
                          'date_filed', 'claim_type', 'status', 'amount']
        return all(field in claim for field in required_fields)

    def validate_trend_analysis(self, data):
        """Validate trend analysis response structure"""
        required_keys = ['by_day_of_week', 'by_claim_type', 'by_status', 'by_region', 'timeline']
        return all(key in data for key in required_keys)

    def validate_test_scripts(self, data):
        """Validate test scripts response"""
        if not isinstance(data, list) or len(data) == 0:
            return False
        
        script = data[0]
        required_fields = ['id', 'script_id', 'title', 'description', 'steps', 'expected_result', 'status']
        return all(field in script for field in required_fields)

    def validate_defects(self, data):
        """Validate defects response"""
        if not isinstance(data, list):
            return False
        
        if len(data) > 0:
            defect = data[0]
            required_fields = ['id', 'defect_id', 'title', 'description', 'severity', 'status']
            return all(field in defect for field in required_fields)
        return True

    def validate_risks(self, data):
        """Validate risks response"""
        if not isinstance(data, list) or len(data) == 0:
            return False
        
        risk = data[0]
        required_fields = ['id', 'risk_id', 'title', 'description', 'probability', 'impact', 'status']
        return all(field in risk for field in required_fields)

    def validate_brd(self, data):
        """Validate BRD response"""
        required_fields = ['title', 'version', 'date', 'project', 'sections']
        return all(field in data for field in required_fields)

    def validate_use_cases(self, data):
        """Validate use cases response"""
        if 'use_cases' not in data:
            return False
        
        use_cases = data['use_cases']
        if not isinstance(use_cases, list) or len(use_cases) == 0:
            return False
        
        use_case = use_cases[0]
        required_fields = ['id', 'title', 'actor', 'precondition', 'scenario', 'postcondition']
        return all(field in use_case for field in required_fields)

def main():
    print("🚀 Starting FNOL Workflow Optimization API Tests")
    print("=" * 60)
    
    tester = FNOLAPITester()
    
    # Test root endpoint
    tester.run_test("API Root", "GET", "", 200, 
                   validate_response=lambda x: "message" in x)
    
    # Test KPI metrics
    tester.run_test("KPI Metrics", "GET", "kpi-metrics", 200,
                   validate_response=tester.validate_kpi_metrics)
    
    # Test claims endpoints
    tester.run_test("Get Claims", "GET", "claims", 200,
                   validate_response=tester.validate_claims_list)
    
    tester.run_test("Claims Trend Analysis", "GET", "claims/trend-analysis", 200,
                   validate_response=tester.validate_trend_analysis)
    
    # Test UAT endpoints
    tester.run_test("Test Scripts", "GET", "test-scripts", 200,
                   validate_response=tester.validate_test_scripts)
    
    tester.run_test("Defects", "GET", "defects", 200,
                   validate_response=tester.validate_defects)
    
    # Test risks endpoint
    tester.run_test("Risks", "GET", "risks", 200,
                   validate_response=tester.validate_risks)
    
    # Test business requirements endpoints
    tester.run_test("BRD Document", "GET", "brd", 200,
                   validate_response=tester.validate_brd)
    
    tester.run_test("Use Cases", "GET", "use-cases", 200,
                   validate_response=tester.validate_use_cases)
    
    # Test creating a new claim
    new_claim_data = {
        "policyholder": "Test User",
        "policy_number": "TEST-123456",
        "claim_type": "Collision",
        "amount": 5000.00,
        "zip_code": "10001"
    }
    
    success, claim_response = tester.run_test("Create Claim", "POST", "claims", 200, 
                                            data=new_claim_data,
                                            validate_response=lambda x: "claim_number" in x)
    
    # Test updating test script status if we have scripts
    if success:
        # Try to update a test script
        update_data = {
            "status": "Pass",
            "tested_by": "API Test",
            "notes": "Automated test execution"
        }
        tester.run_test("Update Test Script", "PUT", "test-scripts/UAT-001", 200, 
                       data=update_data)
    
    # Test creating a defect
    defect_data = {
        "title": "API Test Defect",
        "description": "This is a test defect created by automated testing",
        "severity": "Low",
        "reported_by": "API Tester"
    }
    
    tester.run_test("Create Defect", "POST", "defects", 200,
                   data=defect_data,
                   validate_response=lambda x: "defect_id" in x)
    
    # Print final results
    print("\n" + "=" * 60)
    print("📊 TEST SUMMARY")
    print("=" * 60)
    print(f"Total Tests: {tester.tests_run}")
    print(f"Passed: {tester.tests_passed}")
    print(f"Failed: {len(tester.failed_tests)}")
    print(f"Success Rate: {(tester.tests_passed/tester.tests_run*100):.1f}%")
    
    if tester.failed_tests:
        print(f"\n❌ FAILED TESTS:")
        for failure in tester.failed_tests:
            print(f"   • {failure}")
    
    print(f"\n📋 DETAILED RESULTS:")
    for test_name, result in tester.results.items():
        status_icon = "✅" if result["status"] == "PASS" else "❌"
        print(f"   {status_icon} {test_name}: {result['status']}")
    
    return 0 if len(tester.failed_tests) == 0 else 1

if __name__ == "__main__":
    sys.exit(main())