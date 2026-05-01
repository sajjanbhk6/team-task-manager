from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload

from ..database import get_db
from ..dependencies import get_current_user, require_admin
from ..models import Project, ProjectMember, Role, Task, User
from ..schemas import TaskCreate, TaskUpdate
from ..serializers import task_to_dict
from ..utils import new_id

router = APIRouter(prefix="/api/tasks", tags=["tasks"])


def task_query(db: Session):
    return db.query(Task).options(
        joinedload(Task.project),
        joinedload(Task.assignee),
        joinedload(Task.created_by),
    )


def is_project_member(db: Session, project_id: str, user_id: str) -> bool:
    return (
        db.query(ProjectMember)
        .filter(ProjectMember.project_id == project_id, ProjectMember.user_id == user_id)
        .first()
        is not None
    )


@router.post("", status_code=status.HTTP_201_CREATED)
def create_task(payload: TaskCreate, current_user: User = Depends(require_admin), db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == payload.projectId).first()

    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    assignee = db.query(User).filter(User.id == payload.assigneeId).first()

    if not assignee:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Assignee not found")

    if not is_project_member(db, payload.projectId, payload.assigneeId):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Assignee must be a member of the project")

    task = Task(
        id=new_id(),
        title=payload.title.strip(),
        description=payload.description.strip() if payload.description else None,
        status=payload.status,
        priority=payload.priority,
        due_date=payload.dueDate,
        project_id=payload.projectId,
        assignee_id=payload.assigneeId,
        created_by_id=current_user.id,
    )
    db.add(task)
    db.commit()
    task = task_query(db).filter(Task.id == task.id).first()

    return {"task": task_to_dict(task)}


@router.get("")
def get_tasks(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    query = task_query(db)

    if current_user.role != Role.ADMIN:
        query = query.filter(Task.assignee_id == current_user.id)

    tasks = query.order_by(Task.created_at.desc()).all()
    return {"tasks": [task_to_dict(task) for task in tasks]}


@router.get("/{task_id}")
def get_task(task_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    task = task_query(db).filter(Task.id == task_id).first()

    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")

    if current_user.role != Role.ADMIN and task.assignee_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You do not have access to this task")

    return {"task": task_to_dict(task)}


@router.put("/{task_id}")
def update_task(task_id: str, payload: TaskUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    task = db.query(Task).filter(Task.id == task_id).first()

    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")

    payload_data = payload.model_dump(exclude_unset=True)

    if current_user.role != Role.ADMIN:
        if task.assignee_id != current_user.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You can update only your assigned tasks")

        if set(payload_data.keys()) != {"status"}:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Members can update only task status")

        task.status = payload.status
        db.commit()
        task = task_query(db).filter(Task.id == task_id).first()
        return {"task": task_to_dict(task)}

    if "title" in payload_data:
        if not payload.title or not payload.title.strip():
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Task title cannot be empty")
        task.title = payload.title.strip()

    if "description" in payload_data:
        task.description = payload.description.strip() if payload.description else None

    if "status" in payload_data:
        task.status = payload.status

    if "priority" in payload_data:
        task.priority = payload.priority

    final_project_id = payload.projectId or task.project_id
    final_assignee_id = payload.assigneeId or task.assignee_id

    if payload.projectId:
        project = db.query(Project).filter(Project.id == payload.projectId).first()
        if not project:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    if payload.assigneeId:
        assignee = db.query(User).filter(User.id == payload.assigneeId).first()
        if not assignee:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Assignee not found")

    if (payload.projectId or payload.assigneeId) and not is_project_member(db, final_project_id, final_assignee_id):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Assignee must be a member of the project")

    if "dueDate" in payload_data:
        task.due_date = payload.dueDate

    if payload.projectId:
        task.project_id = payload.projectId

    if payload.assigneeId:
        task.assignee_id = payload.assigneeId

    db.commit()
    task = task_query(db).filter(Task.id == task_id).first()

    return {"task": task_to_dict(task)}


@router.delete("/{task_id}")
def delete_task(task_id: str, current_user: User = Depends(require_admin), db: Session = Depends(get_db)):
    task = db.query(Task).filter(Task.id == task_id).first()

    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")

    db.delete(task)
    db.commit()
    return {"message": "Task deleted successfully"}
