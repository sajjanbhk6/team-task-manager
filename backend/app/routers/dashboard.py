from datetime import datetime, timezone

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..database import get_db
from ..dependencies import get_current_user
from ..models import Project, ProjectMember, Role, Task, TaskStatus, User

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@router.get("")
def get_dashboard(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    task_query = db.query(Task)
    project_query = db.query(Project)

    if current_user.role != Role.ADMIN:
        task_query = task_query.filter(Task.assignee_id == current_user.id)
        project_query = project_query.join(ProjectMember).filter(ProjectMember.user_id == current_user.id)

    total_tasks = task_query.count()
    todo_tasks = task_query.filter(Task.status == TaskStatus.TODO).count()
    in_progress_tasks = task_query.filter(Task.status == TaskStatus.IN_PROGRESS).count()
    done_tasks = task_query.filter(Task.status == TaskStatus.DONE).count()
    overdue_tasks = task_query.filter(
        Task.due_date < datetime.now(timezone.utc),
        Task.status != TaskStatus.DONE,
    ).count()
    total_projects = project_query.count()

    return {
        "totalTasks": total_tasks,
        "todoTasks": todo_tasks,
        "inProgressTasks": in_progress_tasks,
        "doneTasks": done_tasks,
        "overdueTasks": overdue_tasks,
        "totalProjects": total_projects,
    }
