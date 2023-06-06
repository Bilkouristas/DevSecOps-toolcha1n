#!/bin/sh

url=https://github.com/zaproxy/zaproxy/releases/download/v2.9.0/ZAP_2.9.0_Crossplatform.zip

# Linux
wget -c $url -O temp.zip
unzip temp.zip
# rm temp.zip

# Windows
# Download ZAP from `url` and extract it in the current directory.