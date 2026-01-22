from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
from datetime import datetime, timezone
import uuid

router = APIRouter(prefix="/complaints", tags=["complaints"])

# In-memory database reference (will be set from server.py)
db = None

def set_db(database):
    global db
    db = database

# Models
class ComplaintHistory(BaseModel):
    action: str
    timestamp: str
    user: str
    details: str

class ComplaintBase(BaseModel):
    customer_name: str = Field(alias="customerName")
    customer_phone: Optional[str] = Field(default=None, alias="customerPhone")
    customer_account_number: Optional[str] = Field(default=None, alias="customerAccountNumber")
    customer_id: Optional[str] = Field(default=None, alias="customerId")
    category: str
    priority: str = "Medium"
    channel: str = "Walk-in"
    subject: Optional[str] = None
    description: Optional[str] = None
    related_transaction: Optional[str] = Field(default=None, alias="relatedTransaction")
    assigned_to: Optional[str] = Field(default=None, alias="assignedTo")
    assigned_to_name: Optional[str] = Field(default=None, alias="assignedToName")
    
    model_config = ConfigDict(populate_by_name=True)

class ComplaintCreate(ComplaintBase):
    created_by: Optional[str] = Field(default=None, alias="createdBy")
    created_by_name: Optional[str] = Field(default=None, alias="createdByName")

class ComplaintUpdate(BaseModel):
    status: Optional[str] = None
    priority: Optional[str] = None
    assigned_to: Optional[str] = Field(default=None, alias="assignedTo")
    assigned_to_name: Optional[str] = Field(default=None, alias="assignedToName")
    resolution: Optional[str] = None
    escalated_to: Optional[str] = Field(default=None, alias="escalatedTo")
    escalation_reason: Optional[str] = Field(default=None, alias="escalationReason")
    
    model_config = ConfigDict(populate_by_name=True)

class Complaint(BaseModel):
    model_config = ConfigDict(extra="ignore", populate_by_name=True)
    
    id: str
    ticket_number: str = Field(alias="ticketNumber")
    customer_name: str = Field(alias="customerName")
    customer_phone: Optional[str] = Field(default=None, alias="customerPhone")
    customer_account_number: Optional[str] = Field(default=None, alias="customerAccountNumber")
    customer_id: Optional[str] = Field(default=None, alias="customerId")
    category: str
    priority: str
    channel: str
    subject: Optional[str] = None
    description: Optional[str] = None
    related_transaction: Optional[str] = Field(default=None, alias="relatedTransaction")
    status: str
    assigned_to: Optional[str] = Field(default=None, alias="assignedTo")
    assigned_to_name: Optional[str] = Field(default=None, alias="assignedToName")
    escalated_to: Optional[str] = Field(default=None, alias="escalatedTo")
    escalation_reason: Optional[str] = Field(default=None, alias="escalationReason")
    resolution: Optional[str] = None
    resolved_at: Optional[str] = Field(default=None, alias="resolvedAt")
    sla_deadline: str = Field(alias="slaDeadline")
    created_at: str = Field(alias="createdAt")
    updated_at: str = Field(alias="updatedAt")
    created_by: Optional[str] = Field(default=None, alias="createdBy")
    created_by_name: Optional[str] = Field(default=None, alias="createdByName")
    history: List[ComplaintHistory] = []

class ActionRequest(BaseModel):
    action: str
    user: str
    user_name: str = Field(alias="userName")
    details: Optional[str] = None
    assigned_to: Optional[str] = Field(default=None, alias="assignedTo")
    assigned_to_name: Optional[str] = Field(default=None, alias="assignedToName")
    resolution: Optional[str] = None
    escalated_to: Optional[str] = Field(default=None, alias="escalatedTo")
    escalation_reason: Optional[str] = Field(default=None, alias="escalationReason")
    
    model_config = ConfigDict(populate_by_name=True)

# Helper functions
def get_ticket_number():
    """Generate a sequential ticket number"""
    import asyncio
    return f"TKT-{str(uuid.uuid4())[:8].upper()}"

def calculate_sla_deadline(priority: str) -> str:
    """Calculate SLA deadline based on priority"""
    sla_hours = {
        "Low": 72,
        "Medium": 48,
        "High": 24,
        "Critical": 4
    }
    hours = sla_hours.get(priority, 48)
    deadline = datetime.now(timezone.utc)
    from datetime import timedelta
    deadline = deadline + timedelta(hours=hours)
    return deadline.isoformat()

# Routes
@router.get("/", response_model=List[Complaint])
async def get_all_complaints():
    """Get all complaints"""
    complaints = await db.complaints.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return complaints

@router.get("/{complaint_id}", response_model=Complaint)
async def get_complaint(complaint_id: str):
    """Get a single complaint by ID"""
    complaint = await db.complaints.find_one({"id": complaint_id}, {"_id": 0})
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
    return complaint

@router.post("/", response_model=Complaint, status_code=status.HTTP_201_CREATED)
async def create_complaint(complaint_data: ComplaintCreate):
    """Create a new complaint"""
    now = datetime.now(timezone.utc).isoformat()
    
    # Get next ticket number
    count = await db.complaints.count_documents({})
    ticket_number = f"TKT-{str(count + 1).zfill(6)}"
    
    complaint = {
        "id": f"CMP{uuid.uuid4().hex[:12].upper()}",
        "ticket_number": ticket_number,
        "customer_name": complaint_data.customer_name,
        "customer_phone": complaint_data.customer_phone,
        "customer_account_number": complaint_data.customer_account_number,
        "customer_id": complaint_data.customer_id,
        "category": complaint_data.category,
        "priority": complaint_data.priority,
        "channel": complaint_data.channel,
        "subject": complaint_data.subject,
        "description": complaint_data.description,
        "related_transaction": complaint_data.related_transaction,
        "status": "Open",
        "assigned_to": complaint_data.assigned_to,
        "assigned_to_name": complaint_data.assigned_to_name,
        "escalated_to": None,
        "escalation_reason": None,
        "resolution": None,
        "resolved_at": None,
        "sla_deadline": calculate_sla_deadline(complaint_data.priority),
        "created_at": now,
        "updated_at": now,
        "created_by": complaint_data.created_by,
        "created_by_name": complaint_data.created_by_name,
        "history": [{
            "action": "Created",
            "timestamp": now,
            "user": complaint_data.created_by_name or "System",
            "details": "Complaint created"
        }]
    }
    
    await db.complaints.insert_one(complaint)
    
    # Remove MongoDB _id before returning
    complaint.pop("_id", None)
    return complaint

@router.patch("/{complaint_id}", response_model=Complaint)
async def update_complaint(complaint_id: str, updates: ComplaintUpdate):
    """Update a complaint"""
    complaint = await db.complaints.find_one({"id": complaint_id})
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
    
    update_dict = {}
    if updates.status:
        update_dict["status"] = updates.status
    if updates.priority:
        update_dict["priority"] = updates.priority
        update_dict["sla_deadline"] = calculate_sla_deadline(updates.priority)
    if updates.assigned_to:
        update_dict["assigned_to"] = updates.assigned_to
    if updates.assigned_to_name:
        update_dict["assigned_to_name"] = updates.assigned_to_name
    if updates.resolution:
        update_dict["resolution"] = updates.resolution
    if updates.escalated_to:
        update_dict["escalated_to"] = updates.escalated_to
    if updates.escalation_reason:
        update_dict["escalation_reason"] = updates.escalation_reason
    
    update_dict["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    await db.complaints.update_one(
        {"id": complaint_id},
        {"$set": update_dict}
    )
    
    updated = await db.complaints.find_one({"id": complaint_id}, {"_id": 0})
    return updated

@router.post("/{complaint_id}/action", response_model=Complaint)
async def perform_action(complaint_id: str, action: ActionRequest):
    """Perform an action on a complaint (assign, escalate, resolve, close, reopen, add note)"""
    complaint = await db.complaints.find_one({"id": complaint_id})
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
    
    now = datetime.now(timezone.utc).isoformat()
    update_dict = {"updated_at": now}
    
    history_entry = {
        "action": action.action,
        "timestamp": now,
        "user": action.user_name,
        "details": action.details or f"{action.action} performed"
    }
    
    if action.action == "Assign":
        update_dict["assigned_to"] = action.assigned_to
        update_dict["assigned_to_name"] = action.assigned_to_name
        if complaint.get("status") == "Open":
            update_dict["status"] = "In Progress"
        history_entry["details"] = f"Assigned to {action.assigned_to_name}"
    
    elif action.action == "Start Working":
        update_dict["status"] = "In Progress"
        update_dict["assigned_to"] = action.user
        update_dict["assigned_to_name"] = action.user_name
        history_entry["details"] = f"{action.user_name} started working on this complaint"
    
    elif action.action == "Escalate":
        update_dict["status"] = "Escalated"
        update_dict["escalated_to"] = action.escalated_to
        update_dict["escalation_reason"] = action.escalation_reason
        history_entry["details"] = f"Escalated to {action.escalated_to}. Reason: {action.escalation_reason}"
    
    elif action.action == "Resolve":
        update_dict["status"] = "Resolved"
        update_dict["resolution"] = action.resolution
        update_dict["resolved_at"] = now
        history_entry["details"] = f"Resolved: {action.resolution}"
    
    elif action.action == "Close":
        update_dict["status"] = "Closed"
        history_entry["details"] = "Complaint closed"
    
    elif action.action == "Reopen":
        update_dict["status"] = "Open"
        update_dict["resolved_at"] = None
        update_dict["resolution"] = None
        update_dict["sla_deadline"] = calculate_sla_deadline(complaint.get("priority", "Medium"))
        history_entry["details"] = f"Reopened: {action.details}"
    
    elif action.action == "Note Added":
        history_entry["details"] = action.details
    
    await db.complaints.update_one(
        {"id": complaint_id},
        {
            "$set": update_dict,
            "$push": {"history": history_entry}
        }
    )
    
    updated = await db.complaints.find_one({"id": complaint_id}, {"_id": 0})
    return updated

@router.get("/status/{status}", response_model=List[Complaint])
async def get_complaints_by_status(status: str):
    """Get complaints by status"""
    complaints = await db.complaints.find(
        {"status": status}, 
        {"_id": 0}
    ).sort("created_at", -1).to_list(1000)
    return complaints

@router.get("/assignee/{user_id}", response_model=List[Complaint])
async def get_complaints_by_assignee(user_id: str):
    """Get complaints assigned to a specific user"""
    complaints = await db.complaints.find(
        {"assigned_to": user_id}, 
        {"_id": 0}
    ).sort("created_at", -1).to_list(1000)
    return complaints

@router.get("/analytics/summary")
async def get_analytics():
    """Get complaint analytics summary"""
    total = await db.complaints.count_documents({})
    
    pipeline = [
        {"$group": {"_id": "$status", "count": {"$sum": 1}}}
    ]
    status_counts = await db.complaints.aggregate(pipeline).to_list(100)
    by_status = {item["_id"]: item["count"] for item in status_counts}
    
    pipeline = [
        {"$group": {"_id": "$category", "count": {"$sum": 1}}}
    ]
    category_counts = await db.complaints.aggregate(pipeline).to_list(100)
    by_category = {item["_id"]: item["count"] for item in category_counts}
    
    pipeline = [
        {"$group": {"_id": "$priority", "count": {"$sum": 1}}}
    ]
    priority_counts = await db.complaints.aggregate(pipeline).to_list(100)
    by_priority = {item["_id"]: item["count"] for item in priority_counts}
    
    return {
        "total": total,
        "open": by_status.get("Open", 0),
        "inProgress": by_status.get("In Progress", 0),
        "escalated": by_status.get("Escalated", 0),
        "resolved": by_status.get("Resolved", 0),
        "closed": by_status.get("Closed", 0),
        "byCategory": by_category,
        "byPriority": by_priority,
        "byStatus": by_status
    }

@router.delete("/{complaint_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_complaint(complaint_id: str):
    """Delete a complaint"""
    result = await db.complaints.delete_one({"id": complaint_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Complaint not found")
    return None
