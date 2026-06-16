---
title: {{ replace .TranslationBaseName "-" " " | title }}
date: {{ .Date }}
draft: true
categories:
  -
tags:
  -
# 特色图：把名为 featured-image.jpg 的图片放文章目录（与 index.md 同级）即可自动显示在文章顶部和列表卡片
# 列表卡片预览图（可选）：放 featured-image-preview.jpg，会优先用于列表卡片封面
resources:
  - name: featured-image
    src: featured-image.jpg
  - name: featured-image-preview
    src: featured-image-preview.jpg
---

<!--more-->
