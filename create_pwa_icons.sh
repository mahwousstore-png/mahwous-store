#!/bin/bash

# إنشاء أيقونات PWA من الشعار الموجود
cd /home/ubuntu/mahwous_final/public

# إنشاء أيقونة 192x192
convert -size 192x192 xc:"#D4AF37" -fill black -font Arial-Bold -pointsize 80 -gravity center -annotate +0+0 "M" pwa-192x192.png

# إنشاء أيقونة 512x512
convert -size 512x512 xc:"#D4AF37" -fill black -font Arial-Bold -pointsize 200 -gravity center -annotate +0+0 "M" pwa-512x512.png

echo "✅ تم إنشاء أيقونات PWA بنجاح!"
