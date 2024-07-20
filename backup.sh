#!/bin/bash

set -e

# Check if required environment variables are set
if [ -z "$BACKUP_SOURCE" ]; then
  echo "Error: BACKUP_SOURCE environment variable is not defined."
  exit 1
fi

if [ -z "$BACKUP_DESTINATION" ]; then
  echo "Error: BACKUP_DESTINATION environment variable is not defined."
  exit 1
fi

if [ -z "$BACKUP_METRIC_NAMESPACE" ]; then
  echo "Error: BACKUP_METRIC_NAMESPACE environment variable is not defined."
  exit 1
fi

start_time_ms=$(date +%s%3N)

rclone copy --fast-list -v "$BACKUP_SOURCE" "$BACKUP_DESTINATION"

end_time_ms=$(date +%s%3N)
duration_ms=$((end_time_ms - start_time_ms))

if ! aws sts get-caller-identity &> /dev/null; then
  echo "Error: AWS configuration is invalid or credentials are not provided."
  exit 1
fi

aws cloudwatch put-metric-data \
    --namespace "$BACKUP_METRIC_NAMESPACE" \
    --metric-name BackupDuration \
    --value "$duration_ms" \
    --unit Milliseconds
