#!/bin/bash

# Kill any process using port 4000
kill -9 $(lsof -t -i:4000)

# Install the required Ruby gems
bundle install

# Serve the Jekyll site
bundle exec jekyll serve --trace --incremental