from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import random

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# ============= Models =============

class Claim(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    claim_number: str
    policyholder: str
    policy_number: str
    date_filed: str
    claim_type: str  # Collision, Windshield, Theft, Comprehensive, Liability
    status: str  # Open, Closed, Escalated, In Review
    amount: float
    auto_routed: bool
    zip_code: str
    region: str
    adjuster_assigned: Optional[str] = None
    resolution_time_hours: Optional[float] = None
    day_of_week: str
    risk_level: str  # Low, Medium, High

class ClaimCreate(BaseModel):
    policyholder: str
    policy_number: str
    claim_type: str
    amount: float
    zip_code: str

class KPIMetrics(BaseModel):
    avg_resolution_time: float
    auto_route_success_rate: float
    escalation_rate: float
    total_claims: int
    open_claims: int
    closed_claims: int
    escalated_claims: int

class TestScript(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    script_id: str
    title: str
    description: str
    steps: List[str]
    expected_result: str
    status: str  # Not Started, Pass, Fail
    tested_by: Optional[str] = None
    tested_date: Optional[str] = None
    notes: Optional[str] = None

class TestScriptUpdate(BaseModel):
    status: str
    tested_by: Optional[str] = None
    notes: Optional[str] = None

class Defect(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    defect_id: str
    title: str
    description: str
    severity: str  # Critical, High, Medium, Low
    status: str  # Open, In Progress, Resolved, Closed
    reported_by: str
    assigned_to: Optional[str] = None
    reported_date: str
    resolved_date: Optional[str] = None
    test_script_id: Optional[str] = None

class DefectCreate(BaseModel):
    title: str
    description: str
    severity: str
    reported_by: str
    test_script_id: Optional[str] = None

class Risk(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    risk_id: str
    title: str
    description: str
    probability: str  # High, Medium, Low
    impact: str  # High, Medium, Low
    mitigation_steps: List[str]
    contingency_plan: str
    owner: str
    status: str  # Active, Mitigated, Occurred

# ============= Seed Data Function =============

async def seed_mock_data():
    # Check if data already exists
    claims_count = await db.claims.count_documents({})
    if claims_count > 0:
        return
    
    # Generate 60 mock claims
    claim_types = ["Collision", "Windshield", "Theft", "Comprehensive", "Liability"]
    statuses = ["Open", "Closed", "Escalated", "In Review"]
    regions = ["Northeast", "Southeast", "Midwest", "Southwest", "West"]
    adjusters = ["John Smith", "Maria Garcia", "David Kim", "Sarah Johnson", "Michael Brown"]
    days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    risk_levels = ["Low", "Medium", "High"]
    
    first_names = ["James", "Mary", "Robert", "Patricia", "Michael", "Jennifer", "William", "Linda", 
                   "David", "Elizabeth", "Richard", "Barbara", "Joseph", "Susan", "Thomas", "Jessica",
                   "Charles", "Sarah", "Christopher", "Karen", "Daniel", "Nancy", "Matthew", "Lisa"]
    last_names = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis",
                  "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson",
                  "Thomas", "Taylor", "Moore", "Jackson", "Martin", "Lee", "Perez", "Thompson", "White"]
    
    claims = []
    base_date = datetime.now(timezone.utc) - timedelta(days=30)
    
    for i in range(60):
        day_offset = random.randint(0, 30)
        claim_date = base_date + timedelta(days=day_offset)
        day_of_week = days[claim_date.weekday()]
        
        status = random.choices(statuses, weights=[30, 45, 15, 10])[0]
        auto_routed = random.random() > 0.15  # 85% auto-routed
        
        resolution_time = None
        if status == "Closed":
            resolution_time = random.uniform(2, 72) if auto_routed else random.uniform(24, 168)
        
        claim_type = random.choice(claim_types)
        amount = random.uniform(500, 25000) if claim_type != "Windshield" else random.uniform(200, 800)
        
        risk_level = "Low" if amount < 5000 else ("Medium" if amount < 15000 else "High")
        
        claim = {
            "id": str(uuid.uuid4()),
            "claim_number": f"CLM-2024-{str(i+1001).zfill(5)}",
            "policyholder": f"{random.choice(first_names)} {random.choice(last_names)}",
            "policy_number": f"POL-{random.randint(100000, 999999)}",
            "date_filed": claim_date.strftime("%Y-%m-%d"),
            "claim_type": claim_type,
            "status": status,
            "amount": round(amount, 2),
            "auto_routed": auto_routed,
            "zip_code": f"{random.randint(10000, 99999)}",
            "region": random.choice(regions),
            "adjuster_assigned": random.choice(adjusters) if status != "Open" else None,
            "resolution_time_hours": round(resolution_time, 1) if resolution_time else None,
            "day_of_week": day_of_week,
            "risk_level": risk_level
        }
        claims.append(claim)
    
    await db.claims.insert_many(claims)
    
    # Seed UAT Test Scripts
    test_scripts = [
        {
            "id": str(uuid.uuid4()),
            "script_id": "UAT-001",
            "title": "Login as Call Center Rep",
            "description": "Verify call center representative can successfully log into the system",
            "steps": [
                "Navigate to login page",
                "Enter valid username and password",
                "Click 'Login' button",
                "Verify dashboard loads successfully"
            ],
            "expected_result": "User is logged in and redirected to the main dashboard",
            "status": "Pass",
            "tested_by": "QA Team",
            "tested_date": datetime.now(timezone.utc).strftime("%Y-%m-%d"),
            "notes": "Completed successfully"
        },
        {
            "id": str(uuid.uuid4()),
            "script_id": "UAT-002",
            "title": "Auto-Route Windshield Claim",
            "description": "Verify windshield claims are automatically routed to Glass Repair department",
            "steps": [
                "Log in as Call Center Rep",
                "Input mock claim data for a broken windshield",
                "Submit the claim",
                "Verify system routes ticket to Glass Repair department"
            ],
            "expected_result": "Claim is automatically assigned to Glass Repair queue within 2 minutes",
            "status": "Pass",
            "tested_by": "QA Team",
            "tested_date": datetime.now(timezone.utc).strftime("%Y-%m-%d"),
            "notes": "Routed correctly in 45 seconds"
        },
        {
            "id": str(uuid.uuid4()),
            "script_id": "UAT-003",
            "title": "High-Value Claim Escalation",
            "description": "Verify claims over $15,000 are flagged for manual review",
            "steps": [
                "Create a new claim with amount > $15,000",
                "Submit the claim",
                "Verify claim is flagged as 'High Risk'",
                "Verify claim appears in supervisor review queue"
            ],
            "expected_result": "Claim is correctly flagged and routed to supervisor queue",
            "status": "Not Started",
            "tested_by": None,
            "tested_date": None,
            "notes": None
        },
        {
            "id": str(uuid.uuid4()),
            "script_id": "UAT-004",
            "title": "Regional Adjuster Assignment",
            "description": "Verify claims are assigned to nearest regional adjuster based on zip code",
            "steps": [
                "Input a claim with zip code 10001 (Northeast)",
                "Submit the claim",
                "Verify adjuster assigned is from Northeast region",
                "Check assignment timestamp is within 2 minutes"
            ],
            "expected_result": "Correct regional adjuster assigned within SLA timeframe",
            "status": "Fail",
            "tested_by": "Operations Team",
            "tested_date": datetime.now(timezone.utc).strftime("%Y-%m-%d"),
            "notes": "Assignment took 5 minutes - exceeds 2 minute SLA"
        },
        {
            "id": str(uuid.uuid4()),
            "script_id": "UAT-005",
            "title": "Low Risk Auto-Approval",
            "description": "Verify minor fender-bender claims under $2,000 receive automated approval",
            "steps": [
                "Submit claim via mobile app",
                "Set claim type as 'Collision'",
                "Set amount under $2,000",
                "Verify system flags as 'Low Risk'",
                "Check for automated approval email"
            ],
            "expected_result": "Claim bypasses manual review and customer receives approval email",
            "status": "Not Started",
            "tested_by": None,
            "tested_date": None,
            "notes": None
        },
        {
            "id": str(uuid.uuid4()),
            "script_id": "UAT-006",
            "title": "Duplicate Claim Detection",
            "description": "Verify system detects and flags potential duplicate claims",
            "steps": [
                "Submit a claim for policyholder John Doe",
                "Submit another claim with same policy number within 24 hours",
                "Verify system flags potential duplicate",
                "Check alert is sent to fraud team"
            ],
            "expected_result": "Duplicate claim is flagged and routed for review",
            "status": "Not Started",
            "tested_by": None,
            "tested_date": None,
            "notes": None
        },
        {
            "id": str(uuid.uuid4()),
            "script_id": "UAT-007",
            "title": "KPI Dashboard Load",
            "description": "Verify KPI dashboard displays accurate real-time metrics",
            "steps": [
                "Navigate to KPI Dashboard",
                "Verify Average Resolution Time is calculated correctly",
                "Verify Auto-Route Success Rate matches database",
                "Verify Escalation Rate is accurate",
                "Check dashboard refresh interval"
            ],
            "expected_result": "All KPIs display accurate data within 5% margin of error",
            "status": "Pass",
            "tested_by": "Analytics Team",
            "tested_date": datetime.now(timezone.utc).strftime("%Y-%m-%d"),
            "notes": "All metrics verified against database"
        },
        {
            "id": str(uuid.uuid4()),
            "script_id": "UAT-008",
            "title": "System Failover Test",
            "description": "Verify system handles automated routing failure gracefully",
            "steps": [
                "Simulate routing engine failure",
                "Submit new claim",
                "Verify claim enters manual queue",
                "Check alert notification sent to IT team",
                "Verify no data loss occurred"
            ],
            "expected_result": "Claims gracefully fall back to manual processing",
            "status": "Not Started",
            "tested_by": None,
            "tested_date": None,
            "notes": None
        }
    ]
    
    await db.test_scripts.insert_many(test_scripts)
    
    # Seed Defects
    defects = [
        {
            "id": str(uuid.uuid4()),
            "defect_id": "DEF-001",
            "title": "Regional Assignment Exceeds SLA",
            "description": "Adjuster assignment for Northeast region taking 5+ minutes instead of 2 minute SLA",
            "severity": "High",
            "status": "In Progress",
            "reported_by": "Operations Team",
            "assigned_to": "Development Team",
            "reported_date": datetime.now(timezone.utc).strftime("%Y-%m-%d"),
            "resolved_date": None,
            "test_script_id": "UAT-004"
        },
        {
            "id": str(uuid.uuid4()),
            "defect_id": "DEF-002",
            "title": "Email Template Formatting Issue",
            "description": "Auto-approval emails showing HTML tags in plain text clients",
            "severity": "Low",
            "status": "Open",
            "reported_by": "QA Team",
            "assigned_to": None,
            "reported_date": datetime.now(timezone.utc).strftime("%Y-%m-%d"),
            "resolved_date": None,
            "test_script_id": None
        }
    ]
    
    await db.defects.insert_many(defects)
    
    # Seed Risks
    risks = [
        {
            "id": str(uuid.uuid4()),
            "risk_id": "RISK-001",
            "title": "Automated System Downtime",
            "description": "The automated routing system may experience unplanned downtime during peak hours",
            "probability": "Medium",
            "impact": "High",
            "mitigation_steps": [
                "Implement redundant routing servers",
                "Set up real-time monitoring alerts",
                "Create automated failover procedures",
                "Schedule maintenance during off-peak hours"
            ],
            "contingency_plan": "Immediately activate manual routing queue. Notify all call center staff via mass email and Slack. Assign additional supervisors to handle overflow. Track all manually processed claims for later system verification.",
            "owner": "IT Operations",
            "status": "Active"
        },
        {
            "id": str(uuid.uuid4()),
            "risk_id": "RISK-002",
            "title": "Staff Training Gap",
            "description": "Call center staff may not fully understand the new software interface and routing logic",
            "probability": "High",
            "impact": "Medium",
            "mitigation_steps": [
                "Conduct mandatory training sessions for all staff",
                "Create quick reference guides and video tutorials",
                "Establish a dedicated support hotline for the first month",
                "Implement a buddy system pairing new users with power users"
            ],
            "contingency_plan": "Deploy floor support team to provide real-time assistance. Schedule emergency training sessions. Temporarily increase call handling time allowance by 30%. Create expedited feedback channel for common issues.",
            "owner": "Training Department",
            "status": "Active"
        },
        {
            "id": str(uuid.uuid4()),
            "risk_id": "RISK-003",
            "title": "Data Migration Errors",
            "description": "Historical claims data may not map correctly to the new system schema",
            "probability": "Low",
            "impact": "High",
            "mitigation_steps": [
                "Perform comprehensive data validation before migration",
                "Run parallel systems for 2 weeks post-launch",
                "Create data reconciliation reports",
                "Maintain backup of legacy system"
            ],
            "contingency_plan": "Halt migration immediately if error rate exceeds 1%. Restore from last known good backup. Engage data engineering team for emergency remediation. Extend parallel run period as needed.",
            "owner": "Data Engineering",
            "status": "Mitigated"
        }
    ]
    
    await db.risks.insert_many(risks)

# ============= API Endpoints =============

@api_router.get("/")
async def root():
    return {"message": "FNOL Workflow Optimization API"}

# Claims Endpoints
@api_router.get("/claims", response_model=List[Claim])
async def get_claims():
    await seed_mock_data()
    claims = await db.claims.find({}, {"_id": 0}).to_list(1000)
    return claims

@api_router.post("/claims", response_model=Claim)
async def create_claim(claim_data: ClaimCreate):
    regions_map = {
        "1": "Northeast", "2": "Northeast", "3": "Southeast", "4": "Southeast",
        "5": "Midwest", "6": "Midwest", "7": "Southwest", "8": "Southwest",
        "9": "West", "0": "West"
    }
    
    # Determine auto-routing and risk level
    auto_routed = claim_data.amount < 15000
    risk_level = "Low" if claim_data.amount < 5000 else ("Medium" if claim_data.amount < 15000 else "High")
    region = regions_map.get(claim_data.zip_code[0], "Unknown")
    
    claim_count = await db.claims.count_documents({})
    claim_number = f"CLM-2024-{str(claim_count + 2000).zfill(5)}"
    
    claim = Claim(
        claim_number=claim_number,
        policyholder=claim_data.policyholder,
        policy_number=claim_data.policy_number,
        date_filed=datetime.now(timezone.utc).strftime("%Y-%m-%d"),
        claim_type=claim_data.claim_type,
        status="Open" if auto_routed else "In Review",
        amount=claim_data.amount,
        auto_routed=auto_routed,
        zip_code=claim_data.zip_code,
        region=region,
        day_of_week=datetime.now(timezone.utc).strftime("%A"),
        risk_level=risk_level
    )
    
    await db.claims.insert_one(claim.model_dump())
    return claim

@api_router.get("/kpi-metrics", response_model=KPIMetrics)
async def get_kpi_metrics():
    await seed_mock_data()
    claims = await db.claims.find({}, {"_id": 0}).to_list(1000)
    
    total_claims = len(claims)
    open_claims = len([c for c in claims if c["status"] == "Open"])
    closed_claims = len([c for c in claims if c["status"] == "Closed"])
    escalated_claims = len([c for c in claims if c["status"] == "Escalated"])
    
    # Calculate average resolution time for closed claims
    resolution_times = [c["resolution_time_hours"] for c in claims if c.get("resolution_time_hours")]
    avg_resolution = sum(resolution_times) / len(resolution_times) if resolution_times else 0
    
    # Calculate auto-route success rate
    auto_routed_count = len([c for c in claims if c["auto_routed"]])
    auto_route_rate = (auto_routed_count / total_claims * 100) if total_claims > 0 else 0
    
    # Calculate escalation rate
    escalation_rate = (escalated_claims / total_claims * 100) if total_claims > 0 else 0
    
    return KPIMetrics(
        avg_resolution_time=round(avg_resolution, 1),
        auto_route_success_rate=round(auto_route_rate, 1),
        escalation_rate=round(escalation_rate, 1),
        total_claims=total_claims,
        open_claims=open_claims,
        closed_claims=closed_claims,
        escalated_claims=escalated_claims
    )

@api_router.get("/claims/trend-analysis")
async def get_trend_analysis():
    await seed_mock_data()
    claims = await db.claims.find({}, {"_id": 0}).to_list(1000)
    
    # Group by day of week
    day_counts = {}
    for claim in claims:
        day = claim["day_of_week"]
        day_counts[day] = day_counts.get(day, 0) + 1
    
    # Group by claim type
    type_counts = {}
    for claim in claims:
        ctype = claim["claim_type"]
        type_counts[ctype] = type_counts.get(ctype, 0) + 1
    
    # Group by status
    status_counts = {}
    for claim in claims:
        status = claim["status"]
        status_counts[status] = status_counts.get(status, 0) + 1
    
    # Group by region
    region_counts = {}
    for claim in claims:
        region = claim["region"]
        region_counts[region] = region_counts.get(region, 0) + 1
    
    # Group by date for timeline
    date_counts = {}
    for claim in claims:
        date = claim["date_filed"]
        date_counts[date] = date_counts.get(date, 0) + 1
    
    # Sort timeline by date
    timeline = [{"date": k, "count": v} for k, v in sorted(date_counts.items())]
    
    return {
        "by_day_of_week": [{"day": k, "count": v} for k, v in day_counts.items()],
        "by_claim_type": [{"type": k, "count": v} for k, v in type_counts.items()],
        "by_status": [{"status": k, "count": v} for k, v in status_counts.items()],
        "by_region": [{"region": k, "count": v} for k, v in region_counts.items()],
        "timeline": timeline
    }

# Test Scripts Endpoints
@api_router.get("/test-scripts", response_model=List[TestScript])
async def get_test_scripts():
    await seed_mock_data()
    scripts = await db.test_scripts.find({}, {"_id": 0}).to_list(100)
    return scripts

@api_router.put("/test-scripts/{script_id}")
async def update_test_script(script_id: str, update: TestScriptUpdate):
    update_data = {
        "status": update.status,
        "tested_date": datetime.now(timezone.utc).strftime("%Y-%m-%d")
    }
    if update.tested_by:
        update_data["tested_by"] = update.tested_by
    if update.notes:
        update_data["notes"] = update.notes
    
    result = await db.test_scripts.update_one(
        {"script_id": script_id},
        {"$set": update_data}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Test script not found")
    
    return {"message": "Test script updated successfully"}

# Defects Endpoints
@api_router.get("/defects", response_model=List[Defect])
async def get_defects():
    await seed_mock_data()
    defects = await db.defects.find({}, {"_id": 0}).to_list(100)
    return defects

@api_router.post("/defects", response_model=Defect)
async def create_defect(defect_data: DefectCreate):
    defect_count = await db.defects.count_documents({})
    defect_id = f"DEF-{str(defect_count + 1).zfill(3)}"
    
    defect = Defect(
        defect_id=defect_id,
        title=defect_data.title,
        description=defect_data.description,
        severity=defect_data.severity,
        status="Open",
        reported_by=defect_data.reported_by,
        reported_date=datetime.now(timezone.utc).strftime("%Y-%m-%d"),
        test_script_id=defect_data.test_script_id
    )
    
    await db.defects.insert_one(defect.model_dump())
    return defect

@api_router.put("/defects/{defect_id}/status")
async def update_defect_status(defect_id: str, status: str):
    update_data = {"status": status}
    if status in ["Resolved", "Closed"]:
        update_data["resolved_date"] = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    
    result = await db.defects.update_one(
        {"defect_id": defect_id},
        {"$set": update_data}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Defect not found")
    
    return {"message": "Defect status updated successfully"}

# Risks Endpoints
@api_router.get("/risks", response_model=List[Risk])
async def get_risks():
    await seed_mock_data()
    risks = await db.risks.find({}, {"_id": 0}).to_list(100)
    return risks

# Business Requirements Document
@api_router.get("/brd")
async def get_brd():
    return {
        "title": "Business Requirements Document",
        "version": "1.0",
        "date": "January 2026",
        "project": "Auto Claims FNOL Workflow Automation",
        "sections": [
            {
                "title": "1. Executive Summary",
                "content": "This document outlines the business requirements for implementing an automated routing system for auto insurance claims at Mapfre. The system will replace the current manual routing process to reduce ticket backlog, improve resolution times, and enhance customer satisfaction."
            },
            {
                "title": "2. Business Objectives",
                "requirements": [
                    "Reduce average ticket resolution time by 40%",
                    "Achieve 85%+ automatic routing success rate",
                    "Decrease call center escalation rate to below 15%",
                    "Improve customer satisfaction scores by 20%"
                ]
            },
            {
                "title": "3. Functional Requirements",
                "requirements": [
                    "FR-001: The system must automatically read the customer's zip code and assign the claim ticket to the nearest regional adjuster within 2 minutes.",
                    "FR-002: The system must categorize claims by type (Collision, Windshield, Theft, Comprehensive, Liability) and route to appropriate department.",
                    "FR-003: Claims under $2,000 marked as 'Low Risk' should bypass manual review and receive automated approval.",
                    "FR-004: High-value claims (>$15,000) must be flagged for supervisor review before processing.",
                    "FR-005: The system must detect potential duplicate claims within a 24-hour window and flag for fraud review.",
                    "FR-006: Real-time KPI dashboard must display resolution times, routing success rates, and escalation metrics."
                ]
            },
            {
                "title": "4. Non-Functional Requirements",
                "requirements": [
                    "NFR-001: System must maintain 99.9% uptime during business hours.",
                    "NFR-002: All claim assignments must complete within 2 minutes of submission.",
                    "NFR-003: System must handle up to 1,000 concurrent claim submissions.",
                    "NFR-004: All data must be encrypted at rest and in transit.",
                    "NFR-005: System must integrate with existing CRM and policy management systems."
                ]
            },
            {
                "title": "5. Acceptance Criteria",
                "requirements": [
                    "All UAT test scripts must pass with 95% success rate",
                    "No critical or high-severity defects at go-live",
                    "Staff training completion rate of 100%",
                    "Parallel run period of 2 weeks without data discrepancies"
                ]
            }
        ]
    }

# Use Cases
@api_router.get("/use-cases")
async def get_use_cases():
    return {
        "use_cases": [
            {
                "id": "UC-001",
                "title": "Low-Risk Claim Auto-Approval",
                "actor": "Policyholder",
                "precondition": "Policyholder has an active auto insurance policy",
                "scenario": "A policyholder submits a claim for a minor fender-bender via the mobile app. The claim amount is $1,200. The system flags it as 'Low Risk,' bypasses the manual review queue, and sends an automated approval email to the customer within 15 minutes.",
                "postcondition": "Claim is approved and customer receives confirmation email",
                "success_criteria": "No manual intervention required; customer notified within SLA"
            },
            {
                "id": "UC-002",
                "title": "Regional Adjuster Assignment",
                "actor": "Call Center Representative",
                "precondition": "Customer calls to report a claim",
                "scenario": "A call center representative enters a new collision claim for a customer in zip code 10001 (Northeast region). The system automatically identifies the nearest regional adjuster based on the zip code and assigns the claim within 2 minutes. The adjuster receives a notification and the customer is informed of their assigned contact.",
                "postcondition": "Claim is assigned to appropriate regional adjuster",
                "success_criteria": "Assignment completed within 2-minute SLA; correct region match"
            },
            {
                "id": "UC-003",
                "title": "High-Value Claim Escalation",
                "actor": "System/Supervisor",
                "precondition": "Claim submission with amount exceeding $15,000",
                "scenario": "A customer submits a comprehensive claim for $22,000 due to vehicle theft. The system automatically flags the claim as 'High Risk' and routes it to the supervisor review queue instead of auto-approving. The supervisor receives an urgent notification and the claim appears in their priority dashboard.",
                "postcondition": "Claim is queued for supervisor manual review",
                "success_criteria": "High-value claim correctly identified and escalated"
            }
        ]
    }

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
