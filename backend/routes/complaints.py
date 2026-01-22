from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone, timedelta
import uuid

router = APIRouter(prefix="/complaints", tags=["complaints"])

# In-memory database reference (will be set from server.py)
db = None

def set_db(database):
    global db
    db = database

# Models - Using simple dict-like structure for flexibility
class ComplaintCreate(BaseModel):
    customerName: str
    customerPhone: Optional[str] = None
    customerAccountNumber: Optional[str] = None
    customerId: Optional[str] = None
    category: str
    priority: str = "Medium"
    channel: str = "Walk-in"
    subject: Optional[str] = None
    description: Optional[str] = None
    relatedTransaction: Optional[str] = None
    assignedTo: Optional[str] = None
    assignedToName: Optional[str] = None
    createdBy: Optional[str] = None
    createdByName: Optional[str] = None

class ComplaintUpdate(BaseModel):
    status: Optional[str] = None
    priority: Optional[str] = None
    assignedTo: Optional[str] = None
    assignedToName: Optional[str] = None
    resolution: Optional[str] = None
    escalatedTo: Optional[str] = None
    escalationReason: Optional[str] = None

class ActionRequest(BaseModel):
    action: str
    user: str
    userName: str
    details: Optional[str] = None
    assignedTo: Optional[str] = None
    assignedToName: Optional[str] = None
    resolution: Optional[str] = None
    escalatedTo: Optional[str] = None
    escalationReason: Optional[str] = None

# Helper functions
def calculate_sla_deadline(priority: str) -> str:
    """Calculate SLA deadline based on priority"""
    sla_hours = {
        "Low": 72,
        "Medium": 48,
        "High": 24,
        "Critical": 4
    }
    hours = sla_hours.get(priority, 48)
    deadline = datetime.now(timezone.utc) + timedelta(hours=hours)
    return deadline.isoformat()

# Routes
@router.get("/")
async def get_all_complaints():
    """Get all complaints"""
    complaints = await db.complaints.find({}, {"_id": 0}).sort("createdAt", -1).to_list(1000)
    return complaints

@router.get("/analytics/summary")
async def get_analytics():
    """Get complaint analytics summary"""
    total = await db.complaints.count_documents({})
    
    pipeline = [
        {"$group": {"_id": "$status", "count": {"$sum": 1}}}
    ]
    status_counts = await db.complaints.aggregate(pipeline).to_list(100)
    by_status = {item["_id"]: item["count"] for item in status_counts if item["_id"]}
    
    pipeline = [
        {"$group": {"_id": "$category", "count": {"$sum": 1}}}
    ]
    category_counts = await db.complaints.aggregate(pipeline).to_list(100)
    by_category = {item["_id"]: item["count"] for item in category_counts if item["_id"]}
    
    pipeline = [
        {"$group": {"_id": "$priority", "count": {"$sum": 1}}}
    ]
    priority_counts = await db.complaints.aggregate(pipeline).to_list(100)
    by_priority = {item["_id"]: item["count"] for item in priority_counts if item["_id"]}
    
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

@router.get("/status/{status}")
async def get_complaints_by_status(status: str):
    """Get complaints by status"""
    complaints = await db.complaints.find(
        {"status": status}, 
        {"_id": 0}
    ).sort("createdAt", -1).to_list(1000)
    return complaints

@router.get("/assignee/{user_id}")
async def get_complaints_by_assignee(user_id: str):
    """Get complaints assigned to a specific user"""
    complaints = await db.complaints.find(
        {"assignedTo": user_id}, 
        {"_id": 0}
    ).sort("createdAt", -1).to_list(1000)
    return complaints

@router.get("/{complaint_id}")
async def get_complaint(complaint_id: str):
    """Get a single complaint by ID"""
    complaint = await db.complaints.find_one({"id": complaint_id}, {"_id": 0})
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
    return complaint

@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_complaint(complaint_data: ComplaintCreate):
    """Create a new complaint"""
    now = datetime.now(timezone.utc).isoformat()
    
    # Get next ticket number
    count = await db.complaints.count_documents({})
    ticket_number = f"TKT-{str(count + 1).zfill(6)}"
    
    complaint = {
        "id": f"CMP{uuid.uuid4().hex[:12].upper()}",
        "ticketNumber": ticket_number,
        "customerName": complaint_data.customerName,
        "customerPhone": complaint_data.customerPhone,
        "customerAccountNumber": complaint_data.customerAccountNumber,
        "customerId": complaint_data.customerId,
        "category": complaint_data.category,
        "priority": complaint_data.priority,
        "channel": complaint_data.channel,
        "subject": complaint_data.subject,
        "description": complaint_data.description,
        "relatedTransaction": complaint_data.relatedTransaction,
        "status": "Open",
        "assignedTo": complaint_data.assignedTo,
        "assignedToName": complaint_data.assignedToName,
        "escalatedTo": None,
        "escalationReason": None,
        "resolution": None,
        "resolvedAt": None,
        "slaDeadline": calculate_sla_deadline(complaint_data.priority),
        "createdAt": now,
        "updatedAt": now,
        "createdBy": complaint_data.createdBy,
        "createdByName": complaint_data.createdByName,
        "history": [{
            "action": "Created",
            "timestamp": now,
            "user": complaint_data.createdByName or "System",
            "details": "Complaint created"
        }]
    }
    
    await db.complaints.insert_one(complaint)
    
    # Remove MongoDB _id before returning
    complaint.pop("_id", None)
    return complaint

@router.patch("/{complaint_id}")
async def update_complaint(complaint_id: str, updates: ComplaintUpdate):
    """Update a complaint"""
    complaint = await db.complaints.find_one({"id": complaint_id})
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
    
    update_dict = {"updatedAt": datetime.now(timezone.utc).isoformat()}
    
    if updates.status:
        update_dict["status"] = updates.status
    if updates.priority:
        update_dict["priority"] = updates.priority
        update_dict["slaDeadline"] = calculate_sla_deadline(updates.priority)
    if updates.assignedTo:
        update_dict["assignedTo"] = updates.assignedTo
    if updates.assignedToName:
        update_dict["assignedToName"] = updates.assignedToName
    if updates.resolution:
        update_dict["resolution"] = updates.resolution
    if updates.escalatedTo:
        update_dict["escalatedTo"] = updates.escalatedTo
    if updates.escalationReason:
        update_dict["escalationReason"] = updates.escalationReason
    
    await db.complaints.update_one(
        {"id": complaint_id},
        {"$set": update_dict}
    )
    
    updated = await db.complaints.find_one({"id": complaint_id}, {"_id": 0})
    return updated

@router.post("/{complaint_id}/action")
async def perform_action(complaint_id: str, action: ActionRequest):
    """Perform an action on a complaint (assign, escalate, resolve, close, reopen, add note)"""
    complaint = await db.complaints.find_one({"id": complaint_id})
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
    
    now = datetime.now(timezone.utc).isoformat()
    update_dict = {"updatedAt": now}
    
    history_entry = {
        "action": action.action,
        "timestamp": now,
        "user": action.userName,
        "details": action.details or f"{action.action} performed"
    }
    
    if action.action == "Assign":
        update_dict["assignedTo"] = action.assignedTo
        update_dict["assignedToName"] = action.assignedToName
        if complaint.get("status") == "Open":
            update_dict["status"] = "In Progress"
        history_entry["details"] = f"Assigned to {action.assignedToName}"
    
    elif action.action == "Start Working":
        update_dict["status"] = "In Progress"
        update_dict["assignedTo"] = action.user
        update_dict["assignedToName"] = action.userName
        history_entry["details"] = f"{action.userName} started working on this complaint"
    
    elif action.action == "Escalate":
        update_dict["status"] = "Escalated"
        update_dict["escalatedTo"] = action.escalatedTo
        update_dict["escalationReason"] = action.escalationReason
        history_entry["details"] = f"Escalated to {action.escalatedTo}. Reason: {action.escalationReason}"
    
    elif action.action == "Resolve":
        update_dict["status"] = "Resolved"
        update_dict["resolution"] = action.resolution
        update_dict["resolvedAt"] = now
        history_entry["details"] = f"Resolved: {action.resolution}"
    
    elif action.action == "Close":
        update_dict["status"] = "Closed"
        history_entry["details"] = "Complaint closed"
    
    elif action.action == "Reopen":
        update_dict["status"] = "Open"
        update_dict["resolvedAt"] = None
        update_dict["resolution"] = None
        update_dict["slaDeadline"] = calculate_sla_deadline(complaint.get("priority", "Medium"))
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

@router.delete("/{complaint_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_complaint(complaint_id: str):
    """Delete a complaint"""
    result = await db.complaints.delete_one({"id": complaint_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Complaint not found")
    return None
