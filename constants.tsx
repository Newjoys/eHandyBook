
import React from 'react';
import { Template } from './types';

export const TEMPLATES: Template[] = [
  {
    type: 'text',
    name: '文本框',
    icon: '✍️',
    props: [
      { key: 'text', label: '文本内容', type: 'text', def: '点击此处编辑文字' },
      { key: 'fontSize', label: '字号', type: 'range', min: 12, max: 120, def: 24, unit: 'px' },
      { key: 'width', label: '框体宽度', type: 'range', min: 50, max: 800, def: 200, unit: 'px' },
      { key: 'padding', label: '内边距', type: 'range', min: 0, max: 60, def: 12, unit: 'px' },
      { key: 'color', label: '文字颜色', type: 'color', def: '#1e293b' },
      { key: 'bgColor', label: '背景颜色', type: 'color', def: '#ffffff00' },
      { 
        key: 'bgPattern', 
        label: '背景花纹', 
        type: 'select', 
        def: 'none',
        options: [
          { label: '无花纹', value: 'none' },
          { label: '复古牛皮纸', value: 'kraft' },
          { label: '噪点纹理', value: 'noise' },
          { label: '旧报纸感', value: 'newspaper' },
          { label: '极简方格', value: 'grid' }
        ]
      },
      { key: 'borderColor', label: '边框颜色', type: 'color', def: '#cbd5e1' },
      { key: 'borderWidth', label: '边框粗细', type: 'range', min: 0, max: 20, def: 0, unit: 'px' },
      { key: 'borderRadius', label: '圆角大小', type: 'range', min: 0, max: 100, def: 0, unit: 'px' },
      { 
        key: 'borderStyle', 
        label: '边框类型', 
        type: 'select', 
        def: 'solid',
        options: [
          { label: '实线', value: 'solid' },
          { label: '虚线', value: 'dashed' },
          { label: '点线', value: 'dotted' },
          { label: '双实线', value: 'double' }
        ]
      },
      { 
        key: 'fontFamily', 
        label: '字体', 
        type: 'select', 
        def: 'Outfit',
        options: [
          { label: '现代无衬线', value: 'Outfit' },
          { label: '手写风格', value: 'Shadows Into Light' },
          { label: '极简等宽', value: 'Space Mono' },
          { label: '系统默认', value: 'sans-serif' }
        ]
      }
    ]
  },
  {
    type: 'sticker',
    name: '可爱贴纸',
    icon: '🎨',
    props: [
      { 
        key: 'sticker', 
        label: '内置贴纸', 
        type: 'select', 
        def: '✨',
        options: [
          { label: '星星', value: '✨' },
          { label: '爱心', value: '❤️' },
          { label: '彩虹', value: '🌈' },
          { label: '云朵', value: '☁️' },
          { label: '相机', value: '📸' },
          { label: '花朵', value: '🌸' },
          { label: '太阳', value: '☀️' },
          { label: '咖啡', value: '☕' },
          { label: '小火苗', value: '🔥' }
        ]
      },
      { key: 'size', label: '贴纸大小', type: 'range', min: 20, max: 500, def: 60, unit: 'px' },
      { key: 'rotate', label: '旋转角度', type: 'range', min: -180, max: 180, def: 0, unit: '°' }
    ]
  },
  {
    type: 'filmroll',
    name: '复古胶卷',
    icon: '🎞️',
    props: [
      { key: 'width', label: '宽度', type: 'range', min: 60, max: 200, def: 96, unit: 'px' },
      { key: 'height', label: '高度', type: 'range', min: 100, max: 400, def: 160, unit: 'px' },
      { key: 'color', label: '胶卷壳颜色', type: 'color', def: '#FFB800' },
      { key: 'title', label: '主文字', type: 'text', def: 'KODAK 400' },
      { key: 'subtitle', label: '副文字', type: 'text', def: '35mm color film' },
      { key: 'images', label: '图片列表', type: 'text', def: '' }
    ]
  },
  {
    type: 'envelope',
    name: '逻辑信封',
    icon: '💌',
    props: [
      { key: 'w', label: '宽度', type: 'range', min: 150, max: 600, def: 240, unit: 'px' },
      { key: 'h', label: '高度', type: 'range', min: 100, max: 400, def: 160, unit: 'px' },
      { key: 'color', label: '主题颜色', type: 'color', def: '#E5D3B3' },
      { key: 'letterText', label: '信件内容', type: 'text', def: '亲爱的创作者：\n\n每一行代码都是一首诗。' },
      { key: 'fontSize', label: '信件字号', type: 'range', min: 10, max: 40, def: 14, unit: 'px' },
      { key: 'textColor', label: '信件颜色', type: 'color', def: '#444444' },
      { 
        key: 'fontFamily', 
        label: '信件字体', 
        type: 'select', 
        def: 'Shadows Into Light',
        options: [
          { label: '手写风格', value: 'Shadows Into Light' },
          { label: '现代无衬线', value: 'Outfit' },
          { label: '极简等宽', value: 'Space Mono' }
        ]
      }
    ]
  },
  {
    type: 'record',
    name: '黑胶唱片机',
    icon: '📻',
    props: [
      { key: 'width', label: '宽度', type: 'range', min: 150, max: 600, def: 208, unit: 'px' },
      { key: 'height', label: '高度', type: 'range', min: 120, max: 500, def: 176, unit: 'px' },
      { key: 'color', label: '机身颜色', type: 'color', def: '#2d3436' },
      { key: 'title', label: '唱片标题', type: 'text', def: 'My Favorite Song' },
      { key: 'audioUrl', label: '音频链接', type: 'text', def: 'https://assets.mixkit.co/active_storage/sfx/123/123-preview.mp3' }
    ]
  },
  {
    type: 'drawer',
    name: '侧推盒子',
    icon: '🥡',
    props: [
      { key: 'width', label: '宽度', type: 'range', min: 100, max: 600, def: 192, unit: 'px' },
      { key: 'height', label: '高度', type: 'range', min: 60, max: 400, def: 112, unit: 'px' },
      { key: 'color', label: '盒子颜色', type: 'color', def: '#F8F9FA' },
      { key: 'title', label: '标签文字', type: 'text', def: '私密收藏' }
    ]
  },
  {
    type: 'flipbox',
    name: '3D 翻盖盒',
    icon: '💎',
    props: [
      { key: 'width', label: '宽度', type: 'range', min: 80, max: 600, def: 160, unit: 'px' },
      { key: 'height', label: '高度', type: 'range', min: 80, max: 600, def: 160, unit: 'px' },
      { key: 'color', label: '主色调', type: 'color', def: '#4dabf7' },
      { key: 'title', label: '顶部文字', type: 'text', def: '点击开启惊喜' }
    ]
  },
  {
    type: 'news',
    name: '折叠报纸',
    icon: '📰',
    props: [
      { key: 'width', label: '展开宽度', type: 'range', min: 150, max: 800, def: 256, unit: 'px' },
      { key: 'height', label: '展开高度', type: 'range', min: 150, max: 800, def: 320, unit: 'px' },
      { key: 'title', label: '报纸头条', type: 'text', def: '今日头条：美好生活' }
    ]
  },
  {
    type: 'accordion',
    name: '风琴相册',
    icon: '🎹',
    props: [
      { key: 'width', label: '基础宽度', type: 'range', min: 100, max: 600, def: 192, unit: 'px' },
      { key: 'height', label: '高度', type: 'range', min: 80, max: 500, def: 128, unit: 'px' },
      { key: 'title', label: '相册名称', type: 'text', def: '2024 回忆录' }
    ]
  },
  {
    type: 'wanted',
    name: '通缉令',
    icon: '🤠',
    props: [
      { key: 'width', label: '宽度', type: 'range', min: 100, max: 600, def: 192, unit: 'px' },
      { key: 'height', label: '高度', type: 'range', min: 150, max: 800, def: 256, unit: 'px' },
      { key: 'title', label: '悬赏金额', type: 'text', def: '赏金 $100,000' }
    ]
  },
  {
    type: 'suit',
    name: '拉杆箱',
    icon: '🧳',
    props: [
      { key: 'width', label: '宽度', type: 'range', min: 100, max: 600, def: 192, unit: 'px' },
      { key: 'height', label: '高度', type: 'range', min: 150, max: 800, def: 224, unit: 'px' },
      { key: 'color', label: '箱体颜色', type: 'color', def: '#1971c2' },
      { key: 'title', label: '行李吊牌', type: 'text', def: '去巴黎旅行' }
    ]
  },
  {
    type: 'window',
    name: '神秘窗户',
    icon: '🪟',
    props: [
      { key: 'width', label: '宽度', type: 'range', min: 100, max: 600, def: 192, unit: 'px' },
      { key: 'height', label: '高度', type: 'range', min: 100, max: 600, def: 192, unit: 'px' },
      { key: 'color', label: '窗框颜色', type: 'color', def: '#868e96' }
    ]
  },
  {
    type: 'polaroid',
    name: '悬挂拍立得',
    icon: '📸',
    props: [
      { key: 'width', label: '宽度', type: 'range', min: 80, max: 500, def: 128, unit: 'px' },
      { key: 'title', label: '照片说明', type: 'text', def: '那天的阳光真好' }
    ]
  }
];

export const getIcon = (icon: string, size = 24) => {
  return <span style={{ fontSize: `${size}px` }}>{icon}</span>;
};
