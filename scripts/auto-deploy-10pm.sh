#!/bin/bash

# ChonCance Auto Deploy Script
# Runs every day at 10 PM

# Set project directory
PROJECT_DIR="/Users/gangseungsig/Documents/GitHub/choncance"
LOG_DIR="$PROJECT_DIR/logs"
LOG_FILE="$LOG_DIR/auto-deploy-$(date +%Y%m%d).log"

# Create log directory if it doesn't exist
mkdir -p "$LOG_DIR"

# Function to log messages
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

log "========================================="
log "Starting automatic deployment at 10 PM"
log "========================================="

# Change to project directory
cd "$PROJECT_DIR" || {
    log "ERROR: Failed to change to project directory"
    exit 1
}

# Check if there are any changes to commit
log "Checking for changes..."
if [[ -n $(git status --porcelain) ]]; then
    log "Changes detected. Committing..."

    # Add all changes
    git add .

    # Create commit with timestamp
    COMMIT_MSG="Auto-deploy: Daily update at $(date '+%Y-%m-%d %H:%M:%S')"
    git commit -m "$COMMIT_MSG"

    log "Committed: $COMMIT_MSG"
else
    log "No changes to commit"
fi

# Pull latest changes from remote
log "Pulling latest changes from remote..."
git pull origin main

# Push changes
log "Pushing changes to remote..."
if git push origin main; then
    log "Successfully pushed to remote"
else
    log "ERROR: Failed to push to remote"
    exit 1
fi

# Run deployment script
log "Running deployment script..."
if bash "$PROJECT_DIR/deploy.sh" >> "$LOG_FILE" 2>&1; then
    log "Deployment completed successfully"
else
    log "ERROR: Deployment failed"
    exit 1
fi

log "========================================="
log "Auto-deployment completed"
log "========================================="

# Keep only last 7 days of logs
find "$LOG_DIR" -name "auto-deploy-*.log" -mtime +7 -delete

exit 0
