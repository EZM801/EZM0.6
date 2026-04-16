#!/usr/bin/env sh
set -eu

if [ "${CODEBUILD_BUILD_SUCCEEDING:-0}" != "1" ]; then
  echo "Skipping post-build script because a previous phase failed."
  exit 0
fi

echo "Post-build script executed successfully."
