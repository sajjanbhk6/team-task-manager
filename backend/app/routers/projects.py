from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload

from ..database import get_db
from ..dependencies import get_current_user, require_admin
from ..models import Project, ProjectMember, Role, User
from ..schemas import AddMemberRequest, ProjectCreate, ProjectUpdate
from ..serializers import member_to_dict, project_to_dict
from ..utils import new_id

router = APIRouter(prefix="/api/projects", tags=["projects"])


def project_query(db: Session):
    return db.query(Project).options(
        joinedload(Project.owner),
        joinedload(Project.members).joinedload(ProjectMember.user),
        joinedload(Project.tasks),
    )


def is_project_member(db: Session, project_id: str, user_id: str) -> bool:
    return (
        db.query(ProjectMember)
        .filter(ProjectMember.project_id == project_id, ProjectMember.user_id == user_id)
        .first()
        is not None
    )


@router.post("", status_code=status.HTTP_201_CREATED)
def create_project(payload: ProjectCreate, current_user: User = Depends(require_admin), db: Session = Depends(get_db)):
    project = Project(
        id=new_id(),
        name=payload.name.strip(),
        description=payload.description.strip() if payload.description else None,
        owner_id=current_user.id,
    )
    db.add(project)
    db.commit()
    project = project_query(db).filter(Project.id == project.id).first()

    return {"project": project_to_dict(project, current_user)}


@router.get("")
def get_projects(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    query = project_query(db)

    if current_user.role != Role.ADMIN:
        query = query.join(ProjectMember).filter(ProjectMember.user_id == current_user.id)

    projects = query.order_by(Project.created_at.desc()).all()
    return {"projects": [project_to_dict(project, current_user) for project in projects]}


@router.get("/{project_id}")
def get_project(project_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    project = project_query(db).filter(Project.id == project_id).first()

    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    if current_user.role != Role.ADMIN and not is_project_member(db, project_id, current_user.id):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You do not have access to this project")

    return {"project": project_to_dict(project, current_user)}


@router.put("/{project_id}")
def update_project(
    project_id: str,
    payload: ProjectUpdate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    project = db.query(Project).filter(Project.id == project_id).first()

    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    if payload.name is not None:
        if not payload.name.strip():
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Project name cannot be empty")
        project.name = payload.name.strip()

    if payload.description is not None:
        project.description = payload.description.strip() or None

    db.commit()
    project = project_query(db).filter(Project.id == project_id).first()
    return {"project": project_to_dict(project, current_user)}


@router.delete("/{project_id}")
def delete_project(project_id: str, current_user: User = Depends(require_admin), db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()

    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    db.delete(project)
    db.commit()
    return {"message": "Project deleted successfully"}


@router.post("/{project_id}/members", status_code=status.HTTP_201_CREATED)
def add_project_member(
    project_id: str,
    payload: AddMemberRequest,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    project = db.query(Project).filter(Project.id == project_id).first()

    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    if not payload.userId and not payload.email:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User ID or email is required")

    user_query = db.query(User)
    user = user_query.filter(User.id == payload.userId).first() if payload.userId else user_query.filter(User.email == payload.email.lower()).first()

    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    if is_project_member(db, project_id, user.id):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="User is already a project member")

    member = ProjectMember(id=new_id(), project_id=project_id, user_id=user.id)
    db.add(member)
    db.commit()
    member = (
        db.query(ProjectMember)
        .options(joinedload(ProjectMember.user))
        .filter(ProjectMember.id == member.id)
        .first()
    )

    return {"member": member_to_dict(member)}
