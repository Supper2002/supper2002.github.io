#!/bin/bash
cd /Users/supper/个人/my-blog
echo "正在下载 FixIt 主题..."

# 尝试多个镜像下载 zip
MIRRORS=(
  "https://ghproxy.net/https://github.com/hugo-fixit/FixIt/archive/refs/heads/master.zip"
  "https://mirror.ghproxy.com/https://github.com/hugo-fixit/FixIt/archive/refs/heads/master.zip"
  "https://github.com/hugo-fixit/FixIt/archive/refs/heads/master.zip"
)

for url in "${MIRRORS[@]}"; do
  echo "尝试: $url"
  if curl -L -o /tmp/fixit.zip "$url" --connect-timeout 10 -s; then
    if [ -f /tmp/fixit.zip ] && [ -s /tmp/fixit.zip ]; then
      echo "下载成功，正在解压..."
      unzip -q /tmp/fixit.zip -d /tmp/fixit-tmp
      rm -rf themes/FixIt
      mv /tmp/fixit-tmp/FixIt-master themes/FixIt
      rm -rf /tmp/fixit.zip /tmp/fixit-tmp
      echo "FixIt 主题安装成功!"
      exit 0
    fi
  fi
  echo "失败，尝试下一个..."
  rm -f /tmp/fixit.zip
done

echo "所有镜像都失败了"
echo "如果你有 VPN/翻墙工具，请开启后运行:"
echo "  curl -L -o /tmp/fixit.zip https://github.com/hugo-fixit/FixIt/archive/refs/heads/master.zip"
echo "  unzip /tmp/fixit.zip -d /tmp/fixit-tmp"
echo "  mv /tmp/fixit-tmp/FixIt-master /Users/supper/个人/my-blog/themes/FixIt"
