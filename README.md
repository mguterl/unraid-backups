# Unraid Backups

This project is designed to automate the backup of critical files from my Unraid server to Backblaze B2, using Docker and rclone. Additionally, it emits a custom AWS CloudWatch metric to monitor the duration of the backup process and sets up an alarm for failed backups.

## Rationale

I chose to use Docker for this project because it integrates seamlessly with Unraid, making it easy to manage and deploy the backup script. Docker is necessary because I need access to rclone and the AWS CLI, both of which cannot be easily installed in the Unraid server environment. The User Scripts plugin in Unraid is used to schedule the backups, as it offers a straightforward and reliable way to handle periodic tasks.

## Usage

### rclone.conf

To configure rclone on Unraid, map `/mnt/user/appdata/rclone` to `/config/rclone`. This allows rclone to access its configuration file stored in the specified directory.

### /data/

Any paths mounted inside the `/data/` directory will be included in the backup. Ensure all critical files and directories you want to back up are mapped here.

### Environment Variables

Set the following environment variables to configure the backup and AWS integration:

- `BACKUP_DESTINATION` - Specifies the backup destination as defined in `rclone.conf`.
- `AWS_ACCESS_KEY_ID` (Required)
- `AWS_SECRET_ACCESS_KEY` (Required)
- `AWS_DEFAULT_REGION` (Required)
- `METRIC_NAMESPACE` (Optional, Default: Unraid) - Namespace for the CloudWatch metric.

### Schedule

Backups are scheduled externally using the Unraid User Scripts plugin. This allows flexibility in setting the frequency and timing of backups without modifying the Docker container itself.

```bash
#!/bin/bash
set -e

docker exec unraid-backups /backup.sh
```

## Metrics

The project emits a custom AWS CloudWatch metric to monitor the duration of the backup process. This metric is named `BackupDuration` and is emitted to the specified namespace (default: Unraid).

## Docker

To build and push the Docker image for this project, use the following commands:

```bash
docker build --platform linux/amd64 -t mguterl/unraid-backups .
docker push mguterl/unraid-backups:latest
```

## AWS CDK

The AWS Cloud Development Kit (CDK) is used to set up the necessary AWS resources for monitoring the backup process. This includes:

- Creates a user with IAM permissions to publish CloudWatch metrics.
- Generates an access key for the user.
- Sets up an alarm to trigger if a backup metric is not emitted within a specified period.

### Set email address for alerts

```bash
aws ssm put-parameter --name "/unraid/backups/email" --value "user@example.com" --type String
```

### CDK Commands

- `npm run build` - Compile TypeScript to JavaScript.
- `npm run watch` - Watch for changes and recompile automatically.
- `npm run test` - Run unit tests using Jest.
- `npx cdk deploy` - Deploy the stack to your default AWS account and region.
- `npx cdk diff` - Compare the deployed stack with the current state.
- `npx cdk synth` - Generate the CloudFormation template.
