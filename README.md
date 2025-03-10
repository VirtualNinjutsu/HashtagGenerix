# HashtagGenerix

![Version](https://img.shields.io/badge/version-0.1.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## Описание (RU)

HashtagGenerix — это плагин для Obsidian, который автоматически подбирает теги из уже существующего списка для выделенного текста.

На данный момент проект находится в стадии разработки и не имеет удобного интерфейса. Репозиторий опубликован на GitHub для ознакомления и отслеживания изменений.

### Установка

1. **Клонирование репозитория:**

   ```sh
   git clone https://github.com/VirtualNinjutsu/HashtagGenerix.git
   ```

2. **Настройка виртуального окружения (Python):**

   ```sh
   python -m venv venv
   myenv\Scripts\activate  # Windows
   source myenv/bin/activate  # macOS/Linux
   ```

3. **Установка зависимостей Python:**

   ```sh
   pip install -r requirements.txt
   ```

4. **Установка зависимостей TypeScript:**

   ```sh
   npm install
   ```

### Использование

1. В файле `main.ts` замените `PATH_YOUR_FOLDER` на путь к вашей папке с проектом:

   - строка 29
   - строка 30
   - строка 41
   - строка 42

2. **Компиляция TypeScript в JavaScript:**

   ```sh
   tsc --project tsconfig.json
   ```

3. **Создайте папку** `HashtagGenerix` в каталоге Obsidian (`./.obsidian/plugins`).

4. **Переместите в неё файлы:**

   - `main.js`
   - `manifest.json`

5. **Включите плагин** в Obsidian, выделите нужный кусок текста и выполните команду (Ctrl + P) `HashtagGenerix: Generate Hashtag`.

6. **Результаты работы плагина** можно увидеть в консоли разработчика (Ctrl + Shift + I).

### Автор

- **VirtualNinjutsu**

---

## Description (EN)

HashtagGenerix is a plugin for Obsidian that automatically selects tags from an existing list for the selected text.

The project is currently under development and does not yet have a user-friendly interface. It is published on GitHub for informational purposes and commit tracking.

### Installation

1. **Clone the repository:**

   ```sh
   git clone https://github.com/VirtualNinjutsu/HashtagGenerix.git
   ```

2. **Set up a virtual environment (Python):**

   ```sh
   python -m venv myenv
   myenv\Scripts\activate  # Windows
   source myenv/bin/activate  # macOS/Linux
   ```

3. **Install Python dependencies:**

   ```sh
   pip install -r requirements.txt
   ```

4. **Install TypeScript dependencies:**

   ```sh
   npm install
   ```

### Usage

1. Replace `PATH_YOUR_FOLDER` in `main.ts` with your project folder path (lines 29, 30, 41, 42).
2. **Compile TypeScript to JavaScript:**
   ```sh
   tsc --project tsconfig.json
   ```
3. **Create a folder** named `HashtagGenerix` in the Obsidian plugins directory (`./.obsidian/plugins`).
4. **Move the following files into the folder:**
   - `main.js`
   - `manifest.json`
5. **Enable the plugin** in Obsidian and run the command (Ctrl + P) `HashtagGenerix: Generate Hashtag`.
6. **Check the output** in the developer console (Ctrl + Shift + I).

### Contribution

Feel free to contribute by submitting issues or pull requests. Any feedback is appreciated!

### Author

- **VirtualNinjutsu**


