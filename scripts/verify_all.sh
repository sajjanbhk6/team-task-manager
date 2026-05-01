#!/usr/bin/env bash

set -u

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LOG_DIR="$ROOT_DIR/verification-logs"
RUN_ID="$(date +%Y%m%d-%H%M%S)"
RUN_LOG_DIR="$LOG_DIR/$RUN_ID"

FRONTEND_URL="${FRONTEND_URL:-https://frontend-production-d08f.up.railway.app}"
BACKEND_URL="${BACKEND_URL:-https://backend-production-f6a9.up.railway.app}"
API_URL="${API_URL:-$BACKEND_URL/api}"
DEMO_ADMIN_EMAIL="${DEMO_ADMIN_EMAIL:-admin@demo.com}"
DEMO_MEMBER_EMAIL="${DEMO_MEMBER_EMAIL:-member@demo.com}"
DEMO_PASSWORD="${DEMO_PASSWORD:-password123}"

PASS_COUNT=0
FAIL_COUNT=0
WARN_COUNT=0

mkdir -p "$RUN_LOG_DIR"

print_header() {
  printf '\n== %s ==\n' "$1"
}

pass() {
  PASS_COUNT=$((PASS_COUNT + 1))
  printf '[PASS] %s\n' "$1"
}

fail() {
  FAIL_COUNT=$((FAIL_COUNT + 1))
  printf '[FAIL] %s\n' "$1"
  printf '       log: %s\n' "$2"
}

warn() {
  WARN_COUNT=$((WARN_COUNT + 1))
  printf '[WARN] %s\n' "$1"
  if [ "${2:-}" != "" ]; then
    printf '       log: %s\n' "$2"
  fi
}

run_check() {
  local name="$1"
  local log_name="$2"
  shift 2
  local log_file="$RUN_LOG_DIR/$log_name.log"

  printf '\n[RUN] %s\n' "$name"
  if "$@" >"$log_file" 2>&1; then
    pass "$name"
    return 0
  fi

  fail "$name" "$log_file"
  return 1
}

write_json_value_script() {
  cat > "$RUN_LOG_DIR/json_value.py" <<'PY'
import json
import sys

path = sys.argv[1]
key_path = sys.argv[2].split(".")

with open(path, "r", encoding="utf-8") as file:
    data = json.load(file)

value = data
for key in key_path:
    value = value[key]

print(value)
PY
}

http_status() {
  local url="$1"
  local output_file="$2"
  curl -sS -o "$output_file" -w "%{http_code}" "$url"
}

require_command() {
  local command_name="$1"
  local log_file="$RUN_LOG_DIR/command-$command_name.log"

  if command -v "$command_name" >"$log_file" 2>&1; then
    pass "Command available: $command_name"
    return 0
  fi

  fail "Command available: $command_name" "$log_file"
  return 1
}

check_frontend_live() {
  local body_file="$RUN_LOG_DIR/frontend-body.html"
  local status
  status="$(http_status "$FRONTEND_URL" "$body_file")"
  printf 'status=%s\nurl=%s\n' "$status" "$FRONTEND_URL"
  test "$status" = "200"
}

check_backend_health() {
  local body_file="$RUN_LOG_DIR/backend-health.json"
  local status
  status="$(http_status "$BACKEND_URL/health" "$body_file")"
  printf 'status=%s\nurl=%s\nbody=%s\n' "$status" "$BACKEND_URL/health" "$(cat "$body_file")"
  test "$status" = "200"
  grep -q '"status":"ok"' "$body_file"
}

check_backend_root_expected_404() {
  local body_file="$RUN_LOG_DIR/backend-root.json"
  local status
  status="$(http_status "$BACKEND_URL" "$body_file")"
  printf 'status=%s\nurl=%s\nbody=%s\n' "$status" "$BACKEND_URL" "$(cat "$body_file")"
  test "$status" = "404"
  grep -q 'Not Found' "$body_file"
}

check_frontend_build() {
  cd "$ROOT_DIR/frontend" && npm run build
}

check_frontend_lint() {
  cd "$ROOT_DIR/frontend" && npm run lint
}

check_backend_compile() {
  cd "$ROOT_DIR" && python3 -m compileall backend/app backend/main.py
}

check_demo_login() {
  local role="$1"
  local email="$2"
  local output_file="$RUN_LOG_DIR/login-$role.json"

  curl -sS -X POST "$API_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$email\",\"password\":\"$DEMO_PASSWORD\"}" > "$output_file"

  python3 "$RUN_LOG_DIR/json_value.py" "$output_file" "user.email" | grep -qx "$email"
  python3 "$RUN_LOG_DIR/json_value.py" "$output_file" "token" | grep -q '.'
}

check_live_api_flow() {
  local log_file="$RUN_LOG_DIR/live-api-flow-details.log"
  local stamp admin_email member_email password
  local admin_signup member_signup admin_token member_token member_id
  local status project project_id task task_id dashboard

  stamp="$(date +%s)"
  admin_email="verify-admin-$stamp@example.com"
  member_email="verify-member-$stamp@example.com"
  password="password123"

  {
    printf 'api=%s\n' "$API_URL"
    printf 'admin_email=%s\n' "$admin_email"
    printf 'member_email=%s\n' "$member_email"
  } > "$log_file"

  admin_signup="$RUN_LOG_DIR/api-admin-signup.json"
  member_signup="$RUN_LOG_DIR/api-member-signup.json"

  curl -sS -X POST "$API_URL/auth/signup" \
    -H "Content-Type: application/json" \
    -d "{\"name\":\"Verify Admin\",\"email\":\"$admin_email\",\"password\":\"$password\",\"role\":\"ADMIN\"}" > "$admin_signup"

  curl -sS -X POST "$API_URL/auth/signup" \
    -H "Content-Type: application/json" \
    -d "{\"name\":\"Verify Member\",\"email\":\"$member_email\",\"password\":\"$password\",\"role\":\"MEMBER\"}" > "$member_signup"

  admin_token="$(python3 "$RUN_LOG_DIR/json_value.py" "$admin_signup" "token")"
  member_token="$(python3 "$RUN_LOG_DIR/json_value.py" "$member_signup" "token")"
  member_id="$(python3 "$RUN_LOG_DIR/json_value.py" "$member_signup" "user.id")"

  status="$(http_status "$API_URL/dashboard" "$RUN_LOG_DIR/api-unauth-dashboard.json")"
  printf 'unauth_dashboard_status=%s\n' "$status" >> "$log_file"
  test "$status" = "401"

  status="$(curl -sS -o "$RUN_LOG_DIR/api-member-create-project.json" -w "%{http_code}" \
    -X POST "$API_URL/projects" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $member_token" \
    -d '{"name":"Should Fail","description":"Member RBAC check"}')"
  printf 'member_create_project_status=%s\n' "$status" >> "$log_file"
  test "$status" = "403"

  project="$RUN_LOG_DIR/api-create-project.json"
  curl -sS -X POST "$API_URL/projects" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $admin_token" \
    -d "{\"name\":\"Verify Project $stamp\",\"description\":\"Live verification project\"}" > "$project"
  project_id="$(python3 "$RUN_LOG_DIR/json_value.py" "$project" "project.id")"
  printf 'project_id=%s\n' "$project_id" >> "$log_file"

  status="$(curl -sS -o "$RUN_LOG_DIR/api-add-member.json" -w "%{http_code}" \
    -X POST "$API_URL/projects/$project_id/members" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $admin_token" \
    -d "{\"email\":\"$member_email\"}")"
  printf 'add_member_status=%s\n' "$status" >> "$log_file"
  test "$status" = "201"

  task="$RUN_LOG_DIR/api-create-task.json"
  curl -sS -X POST "$API_URL/tasks" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $admin_token" \
    -d "{\"title\":\"Verify Task $stamp\",\"description\":\"Live verification task\",\"status\":\"TODO\",\"priority\":\"HIGH\",\"dueDate\":null,\"projectId\":\"$project_id\",\"assigneeId\":\"$member_id\"}" > "$task"
  task_id="$(python3 "$RUN_LOG_DIR/json_value.py" "$task" "task.id")"
  printf 'task_id=%s\n' "$task_id" >> "$log_file"

  status="$(curl -sS -o "$RUN_LOG_DIR/api-member-projects.json" -w "%{http_code}" \
    "$API_URL/projects" \
    -H "Authorization: Bearer $member_token")"
  printf 'member_projects_status=%s\n' "$status" >> "$log_file"
  test "$status" = "200"

  status="$(curl -sS -o "$RUN_LOG_DIR/api-member-tasks.json" -w "%{http_code}" \
    "$API_URL/tasks" \
    -H "Authorization: Bearer $member_token")"
  printf 'member_tasks_status=%s\n' "$status" >> "$log_file"
  test "$status" = "200"

  status="$(curl -sS -o "$RUN_LOG_DIR/api-member-update-task.json" -w "%{http_code}" \
    -X PUT "$API_URL/tasks/$task_id" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $member_token" \
    -d '{"status":"IN_PROGRESS"}')"
  printf 'member_update_status=%s\n' "$status" >> "$log_file"
  test "$status" = "200"

  status="$(curl -sS -o "$RUN_LOG_DIR/api-member-forbidden-update.json" -w "%{http_code}" \
    -X PUT "$API_URL/tasks/$task_id" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $member_token" \
    -d '{"title":"Forbidden title","status":"DONE"}')"
  printf 'member_forbidden_update_status=%s\n' "$status" >> "$log_file"
  test "$status" = "403"

  dashboard="$RUN_LOG_DIR/api-admin-dashboard.json"
  status="$(curl -sS -o "$dashboard" -w "%{http_code}" \
    "$API_URL/dashboard" \
    -H "Authorization: Bearer $admin_token")"
  printf 'admin_dashboard_status=%s\n' "$status" >> "$log_file"
  printf 'admin_dashboard_body=%s\n' "$(cat "$dashboard")" >> "$log_file"
  test "$status" = "200"
  python3 "$RUN_LOG_DIR/json_value.py" "$dashboard" "totalTasks" >/dev/null
  python3 "$RUN_LOG_DIR/json_value.py" "$dashboard" "overdueTasks" >/dev/null
}

check_readme_submission_fields() {
  local log_file="$RUN_LOG_DIR/readme-fields-details.log"
  local failed=0

  for label in "Live URL:" "Backend URL:" "Demo Admin Credentials:" "Demo Member Credentials:"; do
    if rg -q -- "$label .+" "$ROOT_DIR/README.md"; then
      printf 'present=%s\n' "$label" >> "$log_file"
    else
      printf 'missing_or_empty=%s\n' "$label" >> "$log_file"
      failed=1
    fi
  done

  for label in "GitHub Repo:" "Demo Video:"; do
    if rg -q -- "$label .+" "$ROOT_DIR/README.md"; then
      printf 'present=%s\n' "$label" >> "$log_file"
    else
      printf 'missing_or_empty=%s\n' "$label" >> "$log_file"
      failed=1
    fi
  done

  test "$failed" = "0"
}

check_docs_exist() {
  test -f "$ROOT_DIR/README.md"
  test -f "$ROOT_DIR/whole_process.md"
  test -f "$ROOT_DIR/testing.md"
  test -f "$ROOT_DIR/Script.md"
}

check_git_remote() {
  git -C "$ROOT_DIR" remote -v | tee "$RUN_LOG_DIR/git-remote-output.txt"
  test -s "$RUN_LOG_DIR/git-remote-output.txt"
}

check_git_worktree_notes() {
  git -C "$ROOT_DIR" status --short | tee "$RUN_LOG_DIR/git-status-output.txt"
  if rg -q "Screenshot .*\\.png" "$RUN_LOG_DIR/git-status-output.txt"; then
    printf 'Screenshot files are present in git status. Decide whether to keep or remove them before pushing.\n'
    return 2
  fi
  return 0
}

check_railway_status_optional() {
  local log_file="$RUN_LOG_DIR/railway-status.log"

  if ! npx @railway/cli whoami > "$log_file" 2>&1; then
    cat "$log_file"
    return 2
  fi

  npx @railway/cli service status --service backend >> "$log_file" 2>&1 || return 1
  npx @railway/cli service status --service frontend >> "$log_file" 2>&1 || return 1
  cat "$log_file"
  rg -q "Status: SUCCESS" "$log_file"
}

handle_optional_check() {
  local name="$1"
  local log_name="$2"
  shift 2
  local log_file="$RUN_LOG_DIR/$log_name.log"

  printf '\n[RUN] %s\n' "$name"
  "$@" >"$log_file" 2>&1
  local status=$?

  if [ "$status" = "0" ]; then
    pass "$name"
    return 0
  fi

  if [ "$status" = "2" ]; then
    warn "$name" "$log_file"
    return 0
  fi

  fail "$name" "$log_file"
  return 1
}

main() {
  print_header "Team Task Manager Verification"
  printf 'root=%s\n' "$ROOT_DIR"
  printf 'logs=%s\n' "$RUN_LOG_DIR"
  printf 'frontend=%s\n' "$FRONTEND_URL"
  printf 'backend=%s\n' "$BACKEND_URL"
  printf 'api=%s\n' "$API_URL"

  write_json_value_script

  print_header "Required Commands"
  require_command curl || true
  require_command python3 || true
  require_command npm || true
  require_command npx || true
  require_command git || true

  print_header "Live URLs"
  run_check "Frontend live URL returns 200" "frontend-live" check_frontend_live || true
  run_check "Backend /health returns ok" "backend-health" check_backend_health || true
  run_check "Backend root returns expected 404" "backend-root-404" check_backend_root_expected_404 || true

  print_header "Local Code Checks"
  run_check "Frontend production build" "frontend-build" check_frontend_build || true
  run_check "Frontend lint" "frontend-lint" check_frontend_lint || true
  run_check "Backend Python compile" "backend-compile" check_backend_compile || true

  print_header "Demo Credentials"
  run_check "Demo Admin login works" "demo-admin-login" check_demo_login admin "$DEMO_ADMIN_EMAIL" || true
  run_check "Demo Member login works" "demo-member-login" check_demo_login member "$DEMO_MEMBER_EMAIL" || true

  print_header "Live API Flow"
  run_check "Full live API auth/RBAC/project/task/dashboard flow" "live-api-flow" check_live_api_flow || true

  print_header "Documentation and Submission"
  run_check "Required documentation files exist" "docs-exist" check_docs_exist || true
  run_check "README submission fields are filled" "readme-fields" check_readme_submission_fields || true
  run_check "GitHub remote exists" "git-remote" check_git_remote || true
  handle_optional_check "Git worktree has no screenshot warning" "git-worktree-notes" check_git_worktree_notes || true

  print_header "Railway CLI Optional Check"
  handle_optional_check "Railway CLI authenticated and services successful" "railway-status" check_railway_status_optional || true

  print_header "Summary"
  printf 'PASS=%s\n' "$PASS_COUNT"
  printf 'FAIL=%s\n' "$FAIL_COUNT"
  printf 'WARN=%s\n' "$WARN_COUNT"
  printf 'LOG_DIR=%s\n' "$RUN_LOG_DIR"

  if [ "$FAIL_COUNT" -gt 0 ]; then
    printf '\nVerification failed. Open the listed log files for exact failure output.\n'
    exit 1
  fi

  if [ "$WARN_COUNT" -gt 0 ]; then
    printf '\nVerification passed with warnings. Review warning logs before final submission.\n'
    exit 0
  fi

  printf '\nVerification passed.\n'
}

main "$@"
