import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        fallbackLng: 'en',
        debug: false,
        interpolation: {
            escapeValue: false,
        },
        resources: {
            en: {
                translation: {
                    common: {
                        settings: 'Settings',
                        copy: 'Copy',
                        copied: 'Copied',
                        characters: 'Chars',
                        tone: 'Tone',
                    },
                    translator: {
                        placeholder: 'Start typing here...',
                        translating: 'Translating',
                    },
                    dashboard: {
                        title: 'TypeTrans - Write & Translate',
                        instructions: {
                            title: 'Instructions',
                            step1: 'Select any text',
                            step2: 'Press Alt + T shortcut',
                            step3: 'View translation in the popup',
                            step4: 'Click "Copy" to copy translation',
                        },
                        languages: {
                            title: 'Supported Languages',
                            zh: 'Chinese (ZH)',
                            en: 'English (EN)',
                            ja: 'Japanese (JA)',
                        },
                        note: {
                            title: 'Note:',
                            body: 'Please configure Zhipu AI API Key in settings to use translation.',
                        },
                    },
                    settings: {
                        title: 'Translation Settings',
                        engine: {
                            label: 'Translation Engine',
                            zhipu: 'Zhipu AI (GLM)',
                            tencent: 'Tencent Cloud (TMT)',
                        },
                        apiKey: {
                            label: 'API Key',
                            placeholder: 'Enter your Zhipu AI API Key',
                            note: 'API Key is saved locally and only used for translation API.',
                        },
                        tencent: {
                            secretId: 'Secret ID',
                            secretKey: 'Secret Key',
                            region: 'Region',
                            placeholderId: 'Enter Tencent Cloud Secret ID',
                            placeholderKey: 'Enter Tencent Cloud Secret Key',
                            note: 'Credentials are saved locally and used for TMT API.',
                        },
                        status: {
                            loading: 'Reading configuration...',
                            saved: 'Saved',
                        },
                        save: 'Save',
                        saving: 'Saving...',
                    },
                    tones: {
                        Formal: {
                            label: 'Formal',
                            description: 'Professional & Polite',
                        },
                        Casual: {
                            label: 'Casual',
                            description: 'Daily & Natural',
                        },
                        Academic: {
                            label: 'Academic',
                            description: 'Rigorous & Objective',
                        },
                        Creative: {
                            label: 'Creative',
                            description: 'Vivid & Expressive',
                        },
                    },
                    navigation: {
                        general: 'General',
                        serviceSettings: 'Service Settings',
                        shortcutSettings: 'Shortcut Settings',
                    },
                    about: {
                        title: 'About TypeTrans',
                        description: 'A lightweight cross-platform real-time translation desktop tool.',
                        usage: {
                            title: 'How to Use',
                            step1: 'Select any text in any application',
                            step2: 'Press the global shortcut Alt + T',
                            step3: 'View translation in the floating window',
                            step4: 'Click Copy to copy the translation',
                        },
                        features: {
                            title: 'Features',
                            globalShortcut: 'Global keyboard shortcut support',
                            smartText: 'Smart selected text capture',
                            floatingWindow: 'Elegant borderless floating window',
                            multiLanguage: 'Support for Chinese, English, Japanese, and more',
                            realtime: 'Real-time AI-powered translation',
                            quickCopy: 'One-click copy translation results',
                        },
                    },
                    modelSettings: {
                        title: 'Translation Settings',
                        description: 'Configure translation engine and API settings.',
                    },
                    shortcutSettings: {
                        title: 'Shortcut Settings',
                        description: 'Customize global keyboard shortcuts for quick translation.',
                        currentShortcut: 'Current Shortcut',
                        placeholder: 'Press keys to set shortcut...',
                        save: 'Save Shortcut',
                    },
                    general: {
                        title: 'General Settings',
                        language: 'Language',
                        theme: {
                            label: 'Theme',
                            light: 'Light',
                            dark: 'Dark',
                            system: 'System',
                        },
                    },
                },
            },
            zh: {
                translation: {
                    common: {
                        settings: '设置',
                        copy: '复制',
                        copied: '已复制',
                        characters: '字符',
                        tone: '语气',
                    },
                    translator: {
                        placeholder: '在此开始输入...',
                        translating: '翻译中',
                    },
                    dashboard: {
                        title: 'TypeTrans - 边写边译',
                        instructions: {
                            title: '使用说明',
                            step1: '选中任意文本',
                            step2: '按下 Alt + T 快捷键',
                            step3: '在弹出的窗口中查看翻译结果',
                            step4: '点击复制按钮获取译文',
                        },
                        languages: {
                            title: '支持的语言',
                            zh: '中文 (ZH)',
                            en: '英文 (EN)',
                            ja: '日文 (JA)',
                        },
                        note: {
                            title: '注意:',
                            body: '请在设置中配置 智谱 AI API Key 以使用翻译功能。',
                        },
                    },
                    settings: {
                        title: '翻译设置',
                        engine: {
                            label: '翻译引擎',
                            zhipu: '智谱 AI (GLM)',
                            tencent: '腾讯云 (TMT)',
                        },
                        apiKey: {
                            label: 'API Key',
                            placeholder: '请输入你的智谱 AI API Key',
                            note: 'API Key 将保存在本机配置文件中，仅用于调用智谱 AI 接口。',
                        },
                        tencent: {
                            secretId: 'Secret ID',
                            secretKey: 'Secret Key',
                            region: '地域',
                            placeholderId: '请输入腾讯云 Secret ID',
                            placeholderKey: '请输入腾讯云 Secret Key',
                            note: '密钥将保存在本机配置文件中，仅用于调用机器翻译接口。',
                        },
                        status: {
                            loading: '正在读取配置...',
                            saved: '已保存',
                        },
                        save: '保存',
                        saving: '保存中...',
                    },
                    tones: {
                        Formal: {
                            label: '正式',
                            description: '专业得体',
                        },
                        Casual: {
                            label: '随意',
                            description: '日常自然',
                        },
                        Academic: {
                            label: '学术',
                            description: '严谨客观',
                        },
                        Creative: {
                            label: '创意',
                            description: '生动张力',
                        },
                    },
                    navigation: {
                        general: '通用设置',
                        serviceSettings: '服务设置',
                        shortcutSettings: '快捷键设置',
                    },
                    general: {
                        title: '通用设置',
                        language: '语言',
                        theme: {
                            label: '主题',
                            light: '浅色',
                            dark: '深色',
                            system: '系统',
                        },
                    },
                },
            },
        },
    });

export default i18n;
