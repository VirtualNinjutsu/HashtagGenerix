import { Plugin, MarkdownView, App, getAllTags, TFile } from 'obsidian';
import { spawn } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

export default class HashtagGenerix extends Plugin {
    onload() {
        // Загрузка переменных окружения из файла .env
        console.log("Плагин включен!");

        this.addCommand({
            id: 'generate-hashtags',
            name: 'Generate Hashtags',
            callback: () => {
                const view = this.app.workspace.getActiveViewOfType(MarkdownView);
                if (!view) {
                    console.log('Заметка не открыта');
                    return;
                }

                // Получение выделенного текста и тегов
                const editor = view.editor;
                const selectedText = editor.getSelection();
                const tags = this.getExistingHashtags();
                console.log(`Выделенный текст: ${selectedText}`);
                console.log(`Теги: ${tags}`);

                // Определение путей к файлам из переменных окружения
                const textFilePath = path.resolve('PATH_YOUR_FOLDER/text.json');
                const tagsFilePath = path.resolve('PATH_YOUR_FOLDER/tag_list.json');

                // Сохранение selectedText в text.json
                fs.writeFileSync(textFilePath, JSON.stringify({ text: selectedText }, null, 2));
                console.log(`Содержимое selectedText сохранено в ${textFilePath}`);

                // Сохранение tags в tag_list.json
                fs.writeFileSync(tagsFilePath, JSON.stringify({ tags: tags }, null, 2));
                console.log(`Содержимое tags сохранено в ${tagsFilePath}`);

                // Определение путей к Python интерпретатору и скрипту из переменных окружения
                const pythonPath = path.resolve('PATH_YOUR_FOLDER/venv/Scripts/python.exe');
                const scriptPath = path.resolve('PATH_YOUR_FOLDER/analyzer.py');
                console.log(`Путь к Python интерпретатору: ${pythonPath}`);
                console.log(`Путь к Python скрипту: ${scriptPath}`);

                const pythonProcess = spawn(pythonPath, [scriptPath], {
                    shell: true
                });

                let stdout = '';
                let stderr = '';

                pythonProcess.stdout.on('data', (data) => {
                    stdout += data;
                });

                pythonProcess.stderr.on('data', (data) => {
                    stderr += data;
                });

                pythonProcess.on('close', (code) => {
                    if (code !== 0) {
                        console.error(`Ошибка выполнения команды: ${stderr}`);
                        return;
                    }

                    try {
                        const result = JSON.parse(stdout);
                        console.log(`Результат: ${JSON.stringify(result)}`);
                    
                    } catch (parseError: any) {
                        console.error(`Ошибка парсинга результата: ${parseError.message}`);
                    }
                });

                pythonProcess.on('error', (error) => {
                    console.error(`Ошибка запуска процесса: ${error.message}`);
                });
            }
        });
    }

    getExistingHashtags(): string[] {
        const files = this.app.vault.getMarkdownFiles();
        const allTags = new Set<string>();

        for (const file of files) {
            const fileTags = getFileTags(this.app, file as TFile);
            fileTags.forEach(tag => allTags.add(tag));
        }

        return Array.from(allTags);
    }
}

export function uniqueArray(array: any[]) {
    return [...new Set(array)];
}

export function getFileTags(app: App, file: TFile) {
    const cache = app.metadataCache.getFileCache(file);
    const tags: string[] = cache ? uniqueArray(getAllTags(cache) || []) : []; 
    
    tags.forEach((tag: string, index) => {
        tags[index] = tag.replace("#", "");
    });
    return tags;
}