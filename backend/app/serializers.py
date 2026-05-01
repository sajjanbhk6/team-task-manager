def user_to_dict(user):
    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "role": user.role.value,
        "createdAt": user.created_at,
        "updatedAt": user.updated_at,
    }


def member_to_dict(member):
    return {
        "id": member.id,
        "projectId": member.project_id,
        "userId": member.user_id,
        "createdAt": member.created_at,
        "user": user_to_dict(member.user),
    }


def project_to_dict(project, current_user=None):
    tasks = project.tasks
    if current_user and current_user.role.value != "ADMIN":
        tasks = [task for task in tasks if task.assignee_id == current_user.id]

    return {
        "id": project.id,
        "name": project.name,
        "description": project.description,
        "ownerId": project.owner_id,
        "createdAt": project.created_at,
        "updatedAt": project.updated_at,
        "owner": user_to_dict(project.owner),
        "members": [member_to_dict(member) for member in project.members],
        "tasks": [task_to_dict(task) for task in tasks],
    }


def task_to_dict(task):
    return {
        "id": task.id,
        "title": task.title,
        "description": task.description,
        "status": task.status.value,
        "priority": task.priority.value,
        "dueDate": task.due_date,
        "projectId": task.project_id,
        "assigneeId": task.assignee_id,
        "createdById": task.created_by_id,
        "createdAt": task.created_at,
        "updatedAt": task.updated_at,
        "project": {
            "id": task.project.id,
            "name": task.project.name,
            "description": task.project.description,
            "ownerId": task.project.owner_id,
            "createdAt": task.project.created_at,
            "updatedAt": task.project.updated_at,
        },
        "assignee": user_to_dict(task.assignee),
        "createdBy": user_to_dict(task.created_by),
    }
