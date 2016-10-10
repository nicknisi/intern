#!/bin/bash

# find all of the deleted files in the commit history
# this is assuming that all of the TS conversion work
# is squashed into a single commit
files=()
srcfiles=()
for jsfile in $( git diff-tree --name-only --no-commit-id --diff-filter=D -r @ ); do
	tsfile=${jsfile%.js}.ts

	# don't do anything with .d.ts file deletions
	if [ ${jsfile: -5} == ".d.ts" ]; then
		echo "skipping ${jsfile}"
		continue
	fi

	# make sure the appropriate directories exist
	mkdir -p $( dirname $jsfile )

	if [ -f $tsfile ]; then
		# the file exists where it is... rename it to .js
		echo "mv $tsfile $jsfile"
		mv "$tsfile" "$jsfile"
		files+=("$jsfile")
	elif [ -f "src/${tsfile}" ]; then
		# this file was moved into a src/ directory. Move it out and rename it
		echo "mv src/$tsfile $jsfile"
		mv "src/$tsfile" "$jsfile"
		srcfiles+=("$jsfile")
	fi
done

git add .
git commit --amend --no-edit --no-verify

for file in ${files[@]}; do
	tsfile=${file%.js}.ts
	echo "git mv $file $tsfile"
	git mv "$file" "$tsfile"
done

mkdir -p "src"

# these files need to be moved into the src/ directory
for file in ${srcfiles[@]}; do
	tsfile=${file%.js}.ts
	echo "git mv $file src/$tsfile"
	git mv "$file" "src/$tsfile"
done

git commit --no-verify -m "TypeScript conversion"
