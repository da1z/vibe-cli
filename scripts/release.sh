#!/usr/bin/env bash
VERSION=$(node -p "require('./package.json').version")
TAG="v$VERSION"

echo "Creating GitHub release for $TAG"

git tag -a "$TAG" -m "$TAG"
git push origin "$TAG"

gh release create "$TAG" --title "$TAG" --generate-notes --verify-tag
