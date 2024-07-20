FROM alpine:latest

# coreutil is required for nanoseconds support in date command
RUN apk --no-cache add \
	aws-cli \
	bash \
	coreutils \
	rclone

# Check if date command supports nanoseconds
RUN nanotime=$(date +%s%N) && \
    if [ ${#nanotime} -le 10 ]; then \
      echo "Error: date command does not support nanoseconds or is not behaving properly."; \
      exit 1; \
    fi

# Set default environment variables
ENV BACKUP_SOURCE=/data/ \
		BACKUP_METRIC_NAMESPACE=Unraid

COPY backup.sh /

ENTRYPOINT [ "rclone" ]

ENV XDG_CONFIG_HOME=/config
