-- Seed brands from hardcoded data
INSERT OR REPLACE INTO brands (id, name, slug, colors, fonts, logos, backgrounds, watermark, default_text_color, default_overlay, created_at, updated_at) VALUES
('goha', 'GOHA', 'goha',
 '{"primary":"#1a1a3e","secondary":"#FFD700","accent":"#FF6B35","text_light":"#FFFFFF","text_dark":"#1a1a3e"}',
 '{"heading":"Montserrat","body":"Be Vietnam Pro"}',
 '[{"id":"main","url":"/brands/goha/logos/goha-logo-write.png","name":"GOHA White"}]',
 '[{"url":"/brands/goha/bg/default-background.png","tags":["tech","ai"],"name":"Agency Default"},{"url":"https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&q=80","tags":["tech","ai"],"name":"Matrix Code"}]',
 NULL, '#FFFFFF', 'dark', datetime('now'), datetime('now')),

('tonyfriends', 'Tony''s Friends', 'tonyfriends',
 '{"primary":"#2D3436","secondary":"#00B894","accent":"#FDCB6E","text_light":"#FFFFFF","text_dark":"#2D3436"}',
 '{"heading":"Montserrat","body":"Be Vietnam Pro"}',
 '[]',
 '[{"url":"https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800&q=80","tags":["team","meeting"],"name":"Team Meeting"}]',
 NULL, '#FFFFFF', 'medium', datetime('now'), datetime('now')),

('vibery', 'Vibery', 'vibery',
 '{"primary":"#6C5CE7","secondary":"#A29BFE","accent":"#FD79A8","text_light":"#FFFFFF","text_dark":"#2D3436"}',
 '{"heading":"Montserrat","body":"Be Vietnam Pro"}',
 '[]',
 '[{"url":"https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=800&q=80","tags":["gradient","purple"],"name":"Purple Gradient"}]',
 NULL, '#FFFFFF', 'dark', datetime('now'), datetime('now'));

-- Seed default templates
INSERT OR REPLACE INTO templates (id, name, brand, layout, size, params, auto_feature_image, created_at) VALUES
('agency-default', 'Agency Default', 'goha', 'agency-split', 'agency-wide',
 '{"title":"Your Headline Here","subtitle":"Supporting text goes here","bg_color":"#0f1629","bg_image":"/brands/goha/bg/default-background.png","title_color":"#FFD700","subtitle_color":"#FFFFFF","logo":"/brands/goha/logos/goha-logo-write.png","feature_image":"/brands/goha/feature-image.png"}',
 1, datetime('now')),

('overlay-dark', 'Dark Overlay', 'goha', 'overlay-center', 'fb-post',
 '{"overlay":"dark","title_color":"#FFFFFF","subtitle_color":"#CCCCCC"}',
 0, datetime('now')),

('split-modern', 'Modern Split', 'vibery', 'split-left', 'yt-thumbnail',
 '{"bg_color":"#6C5CE7","title_color":"#FFFFFF","subtitle_color":"#A29BFE"}',
 1, datetime('now'));
