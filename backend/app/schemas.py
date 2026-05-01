from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field

from .models import Priority, Role, TaskStatus


class UserCreate(BaseModel):
    name: str = Field(min_length=1)
    email: EmailStr
    password: str = Field(min_length=6)
    role: Role = Role.MEMBER


class UserLogin(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1)


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    email: EmailStr
    role: Role
    created_at: datetime
    updated_at: datetime


class TokenResponse(BaseModel):
    user: UserOut
    token: str


class ProjectCreate(BaseModel):
    name: str = Field(min_length=1)
    description: Optional[str] = None


class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None


class AddMemberRequest(BaseModel):
    userId: Optional[str] = None
    email: Optional[EmailStr] = None


class TaskCreate(BaseModel):
    title: str = Field(min_length=1)
    description: Optional[str] = None
    status: TaskStatus = TaskStatus.TODO
    priority: Priority = Priority.MEDIUM
    dueDate: Optional[datetime] = None
    projectId: str
    assigneeId: str


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[TaskStatus] = None
    priority: Optional[Priority] = None
    dueDate: Optional[datetime] = None
    projectId: Optional[str] = None
    assigneeId: Optional[str] = None
