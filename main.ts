import { Plugin, MarkdownView, App, getAllTags, TFile } from 'obsidian';
import { spawn } from 'child_process';
import * as path from 'path';

export default class HashtagGenerix extends Plugin {
    onload() {
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

                const editor = view.editor;
                const selectedText = editor.getSelection();
                const tags = this.getExistingHashtags();
                console.log(`Выделенный текст: ${selectedText}`);
                console.log(`Теги: ${tags}`);

                const pythonPath = path.resolve('D:\\Projects\\HashtagGenerix\\venv\\Scripts\\python.exe');
                const scriptPath = path.resolve('D:\\Projects\\HashtagGenerix\\analyzer.py');
                console.log(`Путь к Python интерпретатору: ${pythonPath}`);
                console.log(`Путь к Python скрипту: ${scriptPath}`);

                // Используем JSON.stringify для безопасного формирования аргументов
                const textArg = JSON.stringify(selectedText);
                const tagsArg = JSON.stringify(tags);

                // Формируем команду
                const args = [scriptPath, textArg, tagsArg];
                console.log(`Аргументы для Python: ${args}`);

                const pythonProcess = spawn(pythonPath, args, {
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
                        // Здесь вы можете обработать результат, например, вставить теги в заметку
                        const tagsString = result.matching_tags.map((tag: string) => `#${tag}`).join(' ');
                        editor.replaceSelection(tagsString);
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
    const tags: string[] = cache ? uniqueArray(getAllTags(cache) || []) : []; // If a tag is defined multiple times in the same file, getTags() returns it multiple times, so use uniqueArray() to iron out duplicates.

    // Remove preceding hash characters. E.g. #tag becomes tag
    tags.forEach((tag: string, index) => {
        tags[index] = tag.replace("#", "");
    });
    return tags;
}